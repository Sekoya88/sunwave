#!/bin/bash

# Installer wkhtmltopdf et dépendances
apt-get update
apt-get install -y xfonts-75dpi xfonts-base

# Télécharger et installer wkhtmltopdf
wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb
dpkg -i wkhtmltox_0.12.6-1.buster_amd64.deb
apt-get -f install -y

# Installer les dépendances Python
pip install -r requirements_prod.txt

echo "Build terminé avec succès!" 