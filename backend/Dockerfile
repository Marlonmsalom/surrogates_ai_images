FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY prompts_images.txt /prompts_images.txt
COPY prompts_inspire.txt /prompts_inspire.txt

RUN mkdir -p /app/guides /app/temp_downloads /app/guidelines

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
