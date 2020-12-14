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


## Notes
JWT secret is password for https://jwt.io/