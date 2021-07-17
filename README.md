# FLXcompass.com API
The FLXcompass.com API has the most comprehensive list of wineries, breweries, and other attractions as well as events for the Finger Lakes region of New York.

## Version 2.0

## Collections
The database collections:
- Attractions
- Products
- Users

## Deployment Steps
1. Rename "config/config.env.env" to "config/config.env" file and update values.
2. Install dependencies by running:
```
npm install
```
3. Run app in either dev or prod mode.
```
# DEV MODE
npm run dev

# PROD MODE
npm start
```

##NOTES ON TICKETMASTER WEBHOOK

As presented, you have cron.sh file you can use to add into your crontab that your machine will execute weekly and call
ticketmaster url to fetch weekly data.
Follow tutorial how to add cron.sh to be executed weekly on [this url](https://help.ubuntu.com/community/CronHowto)

If you want to invoke your own webhook manually you can call [curl localhost:5000/api/v2/webhook/ticketmaster](curl localhost:5000/api/v2/webhook/ticketmaster)

Webhook does automaticly calculate start and end of the current week (monday to sunday), and does read zip codes from _data/zipcodes.json file, and parses and fills data accordingly.

If you want more data to be parsed, fill in zipcodes.json to be read out.


## Notes
JWT secret is password for https://jwt.io/