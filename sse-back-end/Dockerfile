FROM python:latest

WORKDIR /deye-mon-bot-sse-api

# set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP run.py
ENV DEBUG True

COPY sse-back-end/requirements.txt /deye-mon-bot-sse-api/
COPY python-shared /python-shared

# install python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY sse-back-end/ /deye-mon-bot-sse-api/

# gunicorn
CMD ["gunicorn", "-k", "gevent", "--config", "gunicorn-cfg.py", "run:app"]