FROM python:3.11-slim

WORKDIR /app

COPY shared/python /shared/python
COPY grid-reporter/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY grid-reporter/main.py ./

CMD ["python", "/app/main.py"]
