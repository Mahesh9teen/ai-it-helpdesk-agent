FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./alembic.ini
COPY tests ./tests

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Create startup script that runs migrations then starts uvicorn
RUN echo '#!/bin/bash\nset -e\necho "Running database migrations..."\nalembic upgrade head\necho "Migrations complete. Starting uvicorn..."\nuvicorn app.main:app --host 0.0.0.0 --port 8000' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
