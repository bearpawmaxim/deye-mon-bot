## Before start ##

1. register deye account at [developer.deyecloud.com](https://developer.deyecloud.com/) 
2. register deye application
3. create a telegram bot using `@botfather`
4. execute `cp .env.sample .env`
5. fill in the `.env` file with the deye account, application id and secret
6. in `.env` file, fill in the `TG_HOOK_BASE_URL` setting with the url accessible from the internet

## To start locally ##
1. execute `cd front-end`, `pip install -r requirements.txt` and `python run.py`
2. execute `cd back-end`, `npm i` and `npm run dev`
3. open `http://localhost:5127` in your web-browser

## To deploy in docker ##
0. if there is no `db.sqlite3` file in `back-end` folder, create an empty file
1. in `.env` file, set `DEBUG` to `False`
2. execute `sudo docker compose up -d`
