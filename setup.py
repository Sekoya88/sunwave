import os
import platform
import subprocess
import sys
import webbrowser

print("=== SunWave - Installation des dépendances ===")

# Détection du système d'exploitation
os_name = platform.system()
print(f"Système détecté: {os_name}")

# Installation des dépendances Python
print("\nInstallation des dépendances Python...")
try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("✓ Dépendances Python installées avec succès.")
except subprocess.CalledProcessError:
    print("❌ Erreur lors de l'installation des dépendances Python.")
    print("Veuillez installer manuellement les dépendances : pip install -r requirements.txt")

# Vérification de l'installation de wkhtmltopdf
def check_wkhtmltopdf():
    """Vérifie si wkhtmltopdf est installé et accessible."""
    wkhtmltopdf_paths = []
    
    if os_name == "Windows":
        # Chemins communs d'installation sur Windows
        program_files_paths = [
            r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe',
            r'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe',
            r'C:\wkhtmltopdf\bin\wkhtmltopdf.exe',
            r'C:\Program Files\wkhtmltopdf\wkhtmltopdf.exe',
            r'C:\Program Files (x86)\wkhtmltopdf\wkhtmltopdf.exe'
        ]
        
        # Vérifier les chemins d'installation courants
        for path in program_files_paths:
            if os.path.exists(path):
                return True
        
        # Vérifier dans le PATH
        try:
            subprocess.check_call(['wkhtmltopdf', '-V'], 
                                stdout=subprocess.DEVNULL, 
                                stderr=subprocess.DEVNULL)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    else:
        # Linux/Mac
        try:
            subprocess.check_call(['wkhtmltopdf', '-V'], 
                                stdout=subprocess.DEVNULL, 
                                stderr=subprocess.DEVNULL)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

print("\nVérification de wkhtmltopdf...")
if check_wkhtmltopdf():
    print("✓ wkhtmltopdf est installé et fonctionnel.")
else:
    print("❌ wkhtmltopdf n'est pas installé ou n'est pas accessible.")
    
    # Proposer l'installation ou d'ouvrir le site de téléchargement
    print("\nwkhtmltopdf est nécessaire pour générer les rapports PDF.")
    
    if os_name == "Windows":
        download_url = "https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.msvc2015-win64.exe"
        print(f"Voulez-vous ouvrir la page de téléchargement de wkhtmltopdf ? (O/N)")
        choice = input().strip().lower()
        if choice == 'o':
            print(f"Ouverture du navigateur pour télécharger wkhtmltopdf...")
            webbrowser.open(download_url)
            print("Après l'installation, veuillez redémarrer l'application.")
    elif os_name == "Darwin":  # macOS
        print("Pour installer wkhtmltopdf sur macOS, utilisez Homebrew:")
        print("  brew install wkhtmltopdf")
        print("Ou téléchargez-le depuis: https://wkhtmltopdf.org/downloads.html")
    else:  # Linux
        print("Pour installer wkhtmltopdf sur Linux, utilisez la commande appropriée:")
        print("  Ubuntu/Debian: sudo apt-get install wkhtmltopdf")
        print("  Fedora/CentOS: sudo dnf install wkhtmltopdf")
        print("  Arch Linux: sudo pacman -S wkhtmltopdf")
        print("Ou téléchargez-le depuis: https://wkhtmltopdf.org/downloads.html")

print("\n=== Installation terminée ===")
print("Pour lancer l'application, exécutez: python app.py")
input("Appuyez sur Entrée pour quitter...") 