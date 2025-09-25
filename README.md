# Surrogates AI Images

Sistema de descarga y análisis de imágenes usando IA para evaluación de compliance con guías de marca.

## Configuración

1. Copia .env.example a .env:
cp .env.example .env

2. Edita .env con tus API keys reales:
- OPENAI_API_KEY: Tu clave de OpenAI
- UNSPLASH_API_KEY: Tu clave de Unsplash  
- PEXELS_API_KEY: Tu clave de Pexels (opcional)

3. Instala dependencias:
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

4. Ejecuta la aplicación:
Backend: cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
Frontend: cd frontend && npm start

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
