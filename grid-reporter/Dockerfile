FROM python:3.11-slim

WORKDIR /deye-mon-bot-grid-reporter

COPY requirements.txt /deye-mon-bot-grid-reporter/
COPY --from=shared ./python /shared/python

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /deye-mon-bot-grid-reporter/

CMD ["python", "/deye-mon-bot-grid-reporter/run.py"]