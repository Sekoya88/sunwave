FROM python:3.8-slim

WORKDIR /app

# Installation de wkhtmltopdf et ses dépendances
RUN apt-get update && apt-get install -y \
    wkhtmltopdf \
    xvfb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de l'application
COPY . /app/

# Installation des dépendances
RUN pip install --no-cache-dir -r requirements_prod.txt

# Variables d'environnement
ENV PRODUCTION=true
ENV PORT=5000

# Exposition du port
EXPOSE 5000

# Commande de démarrage
CMD ["gunicorn", "--config", "gunicorn_config.py", "wsgi:app"] 