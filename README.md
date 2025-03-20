# SunWave - Optimisation des Centrales Solaires

SunWave est une solution innovante pour optimiser la production d'énergie des centrales solaires en milieu désertique, grâce à un système d'arrosage intelligent qui nettoie et refroidit les panneaux solaires.

## Fonctionnalités

- **Calculateur de gains** : Estimez l'augmentation de production énergétique (jusqu'à +15%)
- **Configurateur de système** : Créez une installation adaptée à vos besoins
- **Rapports PDF** : Générez des rapports détaillés et des devis
- **Interface intuitive** : Visualisez votre installation
- **Économies d'eau** : Système optimisé avec 85% d'eau recyclée

## Installation

### Prérequis

- Python 3.8 ou supérieur
- wkhtmltopdf (nécessaire pour la génération des PDF)

### Installation automatique

1. Clonez ce dépôt :
   ```
   git clone https://github.com/votre-compte/sunwave.git
   cd sunwave
   ```

2. Exécutez le script d'installation :
   ```
   python setup.py
   ```
   Ce script installera les dépendances Python et vérifiera si wkhtmltopdf est correctement installé.

### Installation manuelle

1. Installez les dépendances Python :
   ```
   pip install -r requirements.txt
   ```

2. Installez wkhtmltopdf :
   - **Windows** : Téléchargez et installez depuis [wkhtmltopdf.org](https://wkhtmltopdf.org/downloads.html)
   - **macOS** : `brew install wkhtmltopdf`
   - **Ubuntu/Debian** : `sudo apt-get install wkhtmltopdf`
   - **Fedora/CentOS** : `sudo dnf install wkhtmltopdf`

## Démarrage

Pour lancer l'application :

```
python app.py
```

Ouvrez ensuite votre navigateur à l'adresse : http://127.0.0.1:5000

## Utilisation

### Page d'accueil

La page d'accueil présente les avantages du système et vous permet d'utiliser le calculateur pour estimer les gains potentiels de votre installation.

### Configurateur

Le configurateur vous permet de créer une installation personnalisée :

1. Entrez la surface de votre installation
2. Choisissez le type de panneaux
3. Ajoutez des buses d'arrosage, capteurs, pompes et cuves selon vos besoins
4. Générez un devis PDF détaillé

## Problèmes connus

### Erreur de génération de PDF

Si vous rencontrez l'erreur "wkhtmltopdf n'est pas installé ou introuvable", assurez-vous que :

1. wkhtmltopdf est correctement installé
2. wkhtmltopdf est dans votre PATH système
3. Vous avez redémarré l'application après l'installation

## Contribution

Les contributions sont les bienvenues ! Vous pouvez :

1. Signaler des bugs
2. Proposer des améliorations
3. Soumettre des pull requests

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails. 