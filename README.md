# Surrogates AI Images

Sistema de descarga y análisis de imágenes usando IA para evaluación de compliance con guías de marca.

## Configuración

1. Copia .env.example a .env:
cp .env.example .env

2. Edita .env con tus API keys reales:
- OPENAI_API_KEY: Tu clave de OpenAI
- UNSPLASH_API_KEY: Tu clave de Unsplash  
- PEXELS_API_KEY: Tu clave de Pexels (opcional)

3. back
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

4. front
cd frontend
npm install
npm start

## Funcionalidades

- Descarga de imágenes desde Unsplash
- Subida de guías de marca en PDF
- Análisis automático con IA para compliance de marca
- Ranking de imágenes basado en adherencia a guías
- Interfaz web React con Material-UI

## Estructura del Proyecto

backend/          - API FastAPI
frontend/         - React Application  
data/            - Datos del proyecto
  images/        - Imágenes descargadas
  uploads/       - PDFs de guías subidos
  results/       - Resultados de análisis
.env.example     - Template de configuración

## Variables de Entorno (Recomendado)

Alternativamente, puedes configurar las API keys como variables de entorno del sistema:

Esta opción es más segura y conveniente para desarrollo local.
