FROM python:latest

WORKDIR /deye-mon-bot-api

# set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBUG True

COPY back-end/requirements.txt /deye-mon-bot-api/
COPY python-shared /python-shared

# install python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY back-end/ /deye-mon-bot-api/

# gunicorn
CMD ["uvicorn", "run:app", "--host", "0.0.0.0", "--port", "5005"]