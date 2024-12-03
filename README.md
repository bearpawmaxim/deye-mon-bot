## Before start ##

1. register deye account at [developer.deyecloud.com](https://developer.deyecloud.com/) 
2. register deye application
3. create a telegram bot using `@botfather`
4. execute `cp .env.sample .env`
5. fill in the `.env` file with the deye account, application id and secret and telegram bot token information
6. in `.env` file, fill in the `TG_HOOK_BASE_URL` setting with the url accessible from the internet

## To start locally ##
execute `cd front-end`, `pip install -r requirements.txt` and `python run.py`

## To deploy ##
1. in `.env` file, set `DEBUG` to `False`
2. execute `sudo docker compose up -d`
