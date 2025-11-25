FROM python:3.10

WORKDIR /deye-mon-bot-sse-api

# set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP run.py
ENV DEBUG True

COPY requirements.txt /deye-mon-bot-sse-api/

# install python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /deye-mon-bot-sse-api/

# gunicorn
CMD ["gunicorn", "-k", "gevent", "--config", "gunicorn-cfg.py", "run:app"]