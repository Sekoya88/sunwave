from flask import Flask, render_template, request, jsonify, make_response, url_for
from calculator import SolarCalculator
import pdfkit
from datetime import datetime
from math import ceil
import os
import subprocess

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def calculate():
    calculator = SolarCalculator()
    try:
        data = request.json
        nb_panneaux = float(data['nb_panneaux'])
        puissance = float(data['puissance'])
        temperature = float(data['temperature'])
        jours = int(data['jours'])
        
        resultats = calculator.calculer_gains_totaux(
            puissance_kwc=puissance,
            temperature_ambiante=temperature,
            jours_sans_nettoyage=jours,
            nb_panneaux=nb_panneaux
        )
        
        return jsonify({
            'success': True,
            'resultats': {
                'gain_performance': {
                    'percentage': resultats['gain_pourcentage'],
                    'kwh': resultats['gain_production_kwh']
                },
                'consommation_eau': {
                    'total': resultats['consommation_eau_annuelle'],
                    'pourcentage_recycle': 85,
                    'eau_recyclee': resultats['eau_recyclee'],
                    'eau_perdue': resultats['eau_perdue']
                },
                'impact_environmental': {
                    'tonnes_co2': resultats['reduction_co2'],
                    'arbres_equivalents': resultats['equivalent_arbres'],
                    'co2_vie': resultats['reduction_co2_vie']
                },
                'temperatures': {
                    'avant': resultats['temperature_panneaux_avant'],
                    'apres': resultats['temperature_panneaux_apres']
                }
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    try:
        data = request.json
        calculator = SolarCalculator()
        resultats = calculator.calculer_gains_totaux(
            puissance_kwc=float(data['puissance']),
            temperature_ambiante=float(data['temperature']), 
            jours_sans_nettoyage=int(data['jours']),
            nb_panneaux=float(data['nb_panneaux'])
        )

        # Déterminer la date actuelle au format français
        date_actuelle = datetime.now().strftime("%d/%m/%Y")
        
        # Calculer la surface approximative (2m² par panneau)
        surface_approximative = data['nb_panneaux'] * 2
        
        # Extraire les informations client depuis le formulaire ou utiliser des valeurs par défaut
        client_info = {
            'client_name': data.get('client_name', 'Client SunWave'),
            'client_email': data.get('client_email', 'contact@client.fr'),
            'client_phone': data.get('client_phone', '+33 6 00 00 00 00'),
            'client_address': data.get('client_address', 'Paris, France')
        }
        
        # Préparer les données pour le modèle
        template_data = {
            # Informations client
            **client_info,
            
            # Détails du projet
            'project_name': f'Installation {data["nb_panneaux"]} panneaux solaires',
            'generation_date': date_actuelle,
            
            # Configuration
            'config': {
                'surface': surface_approximative,
                'nb_panneaux': data['nb_panneaux'],
                'puissance': data['puissance'],
                'temperature': data['temperature'],
                'jours': data['jours']
            },
            
            # Résultats des calculs
            'resultats': {
                'gain_performance': {
                    'percentage': resultats['gain_pourcentage'],
                    'kwh': resultats['gain_production_kwh'],
                    'kwh_vie': resultats['gain_kwh_vie']
                },
                'consommation_eau': {
                    'total': resultats['consommation_eau_annuelle'],
                    'pourcentage_recycle': 85,
                    'eau_recyclee': resultats['eau_recyclee'],
                    'eau_perdue': resultats['eau_perdue']
                },
                'impact_environmental': {
                    'tonnes_co2': resultats['reduction_co2'],
                    'arbres_equivalents': resultats['equivalent_arbres'],
                    'co2_vie': resultats['reduction_co2_vie']
                },
                'temperatures': {
                    'avant': resultats['temperature_panneaux_avant'],
                    'apres': resultats['temperature_panneaux_apres']
                }
            }
        }

        # Génération du HTML
        html = render_template('report.html', **template_data)

        try:
            # Options PDF optimisées pour la qualité et la fiabilité
            options = {
                'page-size': 'A4',
                'encoding': "UTF-8",
                'margin-top': '10mm',
                'margin-right': '10mm',
                'margin-bottom': '10mm',
                'margin-left': '10mm',
                'enable-local-file-access': None,
                'print-media-type': None,
                'no-outline': None,
                'background': None,
                'dpi': 300,
                'image-quality': 100
            }

            # Tentative de génération avec la configuration par défaut
            try:
                pdf = pdfkit.from_string(html, False, options=options)
                response = make_response(pdf)
                response.headers['Content-Type'] = 'application/pdf'
                response.headers['Content-Disposition'] = 'attachment; filename=rapport-sunwave.pdf'
                return response
            except Exception as e:
                print(f"Erreur avec le chemin par défaut: {str(e)}")
                
                # Liste des chemins possibles pour wkhtmltopdf
                wkhtmltopdf_paths = []
                
                if os.name == 'nt':  # Windows
                    program_files_paths = [
                        r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe',
                        r'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe',
                        r'C:\wkhtmltopdf\bin\wkhtmltopdf.exe',
                        r'C:\Program Files\wkhtmltopdf\wkhtmltopdf.exe',
                        r'C:\Program Files (x86)\wkhtmltopdf\wkhtmltopdf.exe',
                        r'wkhtmltopdf',
                        r'C:\wkhtmltopdf\wkhtmltopdf.exe'
                    ]
                    
                    wkhtmltopdf_paths.extend(program_files_paths)
                else:
                    wkhtmltopdf_paths = [
                        '/usr/bin/wkhtmltopdf',
                        '/usr/local/bin/wkhtmltopdf',
                        'wkhtmltopdf'
                    ]
                
                # Tentative avec les différents chemins possibles
                for wkhtmltopdf_path in wkhtmltopdf_paths:
                    try:
                        config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
                        pdf = pdfkit.from_string(html, False, options=options, configuration=config)
                        
                        response = make_response(pdf)
                        response.headers['Content-Type'] = 'application/pdf'
                        response.headers['Content-Disposition'] = 'attachment; filename=rapport-sunwave.pdf'
                        return response
                    except Exception:
                        continue
                
                # Si toutes les tentatives échouent, utiliser une approche alternative avec subprocess
                try:
                    import tempfile
                    from subprocess import Popen, PIPE
                    
                    # Créer un fichier temporaire pour le HTML
                    with tempfile.NamedTemporaryFile(suffix='.html', delete=False) as f:
                        html_path = f.name
                        f.write(html.encode('utf-8'))
                    
                    # Créer un fichier temporaire pour le PDF
                    pdf_path = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False).name
                    
                    # Construire la commande
                    cmd = ['wkhtmltopdf', '--enable-local-file-access', 
                           '--page-size', 'A4', 
                           '--margin-top', '10mm', 
                           '--margin-right', '10mm', 
                           '--margin-bottom', '10mm', 
                           '--margin-left', '10mm',
                           '--dpi', '300',
                           html_path, pdf_path]
                    
                    # Exécuter la commande
                    process = Popen(cmd, stdout=PIPE, stderr=PIPE)
                    process.communicate()
                    
                    # Lire le fichier PDF généré
                    with open(pdf_path, 'rb') as f:
                        pdf_data = f.read()
                    
                    # Nettoyer les fichiers temporaires
                    os.unlink(html_path)
                    os.unlink(pdf_path)
                    
                    # Retourner le PDF
                    response = make_response(pdf_data)
                    response.headers['Content-Type'] = 'application/pdf'
                    response.headers['Content-Disposition'] = 'attachment; filename=rapport-sunwave.pdf'
                    return response
                    
                except Exception as subproc_error:
                    raise OSError(f"Impossible de générer le PDF: {str(subproc_error)}")
            
            raise OSError("Impossible de générer le PDF avec wkhtmltopdf")

        except Exception as e:
            print(f"Erreur génération PDF: {str(e)}")
            return jsonify({
                'error': f"Impossible de générer le PDF. Veuillez vérifier que wkhtmltopdf est correctement installé."
            }), 500

    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'export du PDF: {str(e)}'}), 500

@app.route('/configurateur')
def configurateur():
    return render_template('price_configurator.html')

@app.route('/generate-quote', methods=['POST'])
def generate_quote():
    """Génère un devis PDF basé sur les données de configuration."""
    try:
        data = request.json
        quote_data = data.get('quote', {})
        client_info = data.get('client', {})
        
        if not quote_data:
            return jsonify({'error': 'Données de devis manquantes'}), 400
            
        # Vérification des données client
        if not client_info.get('name'):
            return jsonify({'error': 'Nom du client manquant'}), 400
            
        # Génération du HTML
        html = render_template('quote_template.html', 
                             data=quote_data,
                             client=client_info,
                             date=datetime.now().strftime('%d/%m/%Y'))

        # Approche similaire à export_pdf pour la génération
        try:
            # Options PDF
            options = {
                'page-size': 'A4',
                'encoding': 'UTF-8',
                'margin-top': '10mm',
                'margin-right': '10mm',
                'margin-bottom': '10mm',
                'margin-left': '10mm',
                'enable-local-file-access': None,
                'print-media-type': None,
                'no-outline': None,
                'background': None,
                'dpi': 300,
                'image-quality': 100
            }

            # Essai sans configuration spécifique - utilise le PATH système
            try:
                pdf = pdfkit.from_string(html, False, options=options)
                response = make_response(pdf)
                response.headers['Content-Type'] = 'application/pdf'
                response.headers['Content-Disposition'] = 'attachment; filename=devis-sunwave.pdf'
                return response
            except Exception as e:
                print(f"Erreur avec le chemin par défaut: {str(e)}")
                
                # Si ça échoue, on essaie avec les chemins connus
                wkhtmltopdf_paths = []
                
                if os.name == 'nt':  # Windows
                    # Liste étendue de chemins possibles
                    program_files_paths = [
                        r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe',
                        r'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe',
                        r'C:\wkhtmltopdf\bin\wkhtmltopdf.exe',
                        r'C:\Program Files\wkhtmltopdf\wkhtmltopdf.exe',
                        r'C:\Program Files (x86)\wkhtmltopdf\wkhtmltopdf.exe',
                        r'wkhtmltopdf',  # Essayer la commande directe
                        r'C:\wkhtmltopdf\wkhtmltopdf.exe'
                    ]
                    
                    # Ajouter les chemins de l'utilisateur
                    user_profile = os.environ.get('USERPROFILE', '')
                    if user_profile:
                        program_files_paths.append(os.path.join(user_profile, 'AppData', 'Local', 'wkhtmltopdf', 'bin', 'wkhtmltopdf.exe'))
                        program_files_paths.append(os.path.join(user_profile, 'AppData', 'Local', 'Programs', 'wkhtmltopdf', 'bin', 'wkhtmltopdf.exe'))
                    
                    wkhtmltopdf_paths.extend(program_files_paths)
                    
                    # Chercher dans le PATH système
                    for path in os.environ.get("PATH", "").split(os.pathsep):
                        exe_path = os.path.join(path, 'wkhtmltopdf.exe')
                        if os.path.exists(exe_path):
                            wkhtmltopdf_paths.append(exe_path)
                else:  # Linux/Mac
                    # Chemins communs sur Linux/Mac
                    wkhtmltopdf_paths = [
                        '/usr/bin/wkhtmltopdf',
                        '/usr/local/bin/wkhtmltopdf',
                        'wkhtmltopdf'  # Essayer la commande directe
                    ]
                
                # Imprimer les chemins pour debug
                print(f"Chemins essayés: {wkhtmltopdf_paths}")
                
                # Essayer chaque chemin
                for wkhtmltopdf_path in wkhtmltopdf_paths:
                    try:
                        print(f"Essai avec le chemin: {wkhtmltopdf_path}")
                        config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
                        pdf = pdfkit.from_string(html, False, options=options, configuration=config)
                        
                        response = make_response(pdf)
                        response.headers['Content-Type'] = 'application/pdf'
                        response.headers['Content-Disposition'] = 'attachment; filename=devis-sunwave.pdf'
                        return response
                    except Exception as path_error:
                        print(f"Échec avec {wkhtmltopdf_path}: {str(path_error)}")
                        continue
                
                # Si tous les chemins ont échoué, essayer une dernière approche
                try:
                    from subprocess import Popen, PIPE
                    import tempfile
                    
                    print("Tentative avec subprocess directement")
                    
                    # Créer un fichier temporaire pour le HTML
                    with tempfile.NamedTemporaryFile(suffix='.html', delete=False) as f:
                        html_path = f.name
                        f.write(html.encode('utf-8'))
                    
                    # Créer un fichier temporaire pour le PDF
                    pdf_path = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False).name
                    
                    # Construire la commande avec les options
                    cmd = ['wkhtmltopdf']
                    for k, v in options.items():
                        if v is not None:
                            cmd.append(f'--{k}={v}')
                        else:
                            cmd.append(f'--{k}')
                    cmd.extend([html_path, pdf_path])
                    
                    # Exécuter la commande
                    print(f"Exécution commande: {' '.join(cmd)}")
                    process = Popen(cmd, stdout=PIPE, stderr=PIPE)
                    stdout, stderr = process.communicate()
                    
                    if process.returncode != 0:
                        print(f"Erreur subprocess: {stderr.decode('utf-8')}")
                        raise OSError(f"wkhtmltopdf a échoué: {stderr.decode('utf-8')}")
                    
                    # Lire le fichier PDF généré
                    with open(pdf_path, 'rb') as f:
                        pdf_data = f.read()
                    
                    # Nettoyer les fichiers temporaires
                    os.unlink(html_path)
                    os.unlink(pdf_path)
                    
                    # Retourner le PDF
                    response = make_response(pdf_data)
                    response.headers['Content-Type'] = 'application/pdf'
                    response.headers['Content-Disposition'] = 'attachment; filename=devis-sunwave.pdf'
                    return response
                    
                except Exception as subproc_error:
                    print(f"Erreur subprocess: {str(subproc_error)}")
                    raise OSError(f"Toutes les tentatives ont échoué: {str(subproc_error)}")
            
            # Si toutes les tentatives échouent
            raise OSError("Impossible de générer le PDF avec wkhtmltopdf")

        except Exception as e:
            print(f"Erreur génération PDF: {str(e)}")
            return jsonify({
                'error': f"Impossible de générer le PDF. Veuillez vérifier que wkhtmltopdf est correctement installé. Erreur: {str(e)}"
            }), 500

    except Exception as e:
        print(f"Erreur de génération de devis: {str(e)}")
        return jsonify({'error': f'Erreur lors de la génération du devis: {str(e)}'}), 500

@app.route('/projet-equipe')
def projet_equipe():
    return render_template('projet_equipe.html')

if __name__ == '__main__':
    # Configuration dev par défaut
    debug_mode = True
    host = '127.0.0.1'
    port = 5000
    
    # En production, utilisez les variables d'environnement
    import os
    if os.environ.get('PRODUCTION') == 'true':
        debug_mode = False
        host = '0.0.0.0'  # Écoute sur toutes les interfaces
        port = int(os.environ.get('PORT', 10000))
    
    app.run(debug=debug_mode, host=host, port=port)