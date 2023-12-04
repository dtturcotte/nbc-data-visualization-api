# NBC Data Visualization App API

## Running the app

There are a few moving pieces to demonstrate producing, consuming, and streaming data from multiple sources.

### Credentials

_do_: create google service account, enable gsheets, and add "google_credentials.json" to root/credentials

### Environment variables

_do_: create .env in root from .env-sample, and fill in your values

### Build typescript

_run_: `npm run build`

### Start Redis (for use in passing data between node processes)

_run_: `redis-server`

### Start AWS KCL consumer stream

cd into: `./dist/services/api/awsKCL/consumer`

_run_: `../../../../../node_modules/aws-kcl/bin/kcl-bootstrap --java /usr/bin/java -e -p ./sample.properties`

### Start ngrok

_run_: `/Applications/ngrok http 3010`

### Google Sheets

1. Create Google Sheet
2. Share Google Sheet with your gservices account (e.g., "my-profile@eco-volt-1111111.iam.gserviceaccount.com")
3. Add tab "president_primary_polls_test"
4. Add fields `id` (number), `name` (string), and `value` (number)
5. Add Google Apps Scripts to Google Sheet

-   addOrUpdateRecord.gs: [addOrUpdateRecord Gist](https://gist.github.com/dtturcotte/d56f39599ccdd39c3f59597f417fdce5)
    -   Change "addNewRecord" to true or false, depending on what you want to try
-   onEditWebhook.gs: [onEditWebhook Gist](https://gist.github.com/dtturcotte/e427078e0f65e8634cd1051aa1e044bc)
    -   Change "NGROK_URL_HERE" to your generated ngrok url
    -   Change endpoint to "kinesis" or "db" depending on what you want to try

6. Optional: add timed trigger if you want timed execution of addOrUpdateRecord.gs. Add trigger to "randomIntervalTrigger" function

### Migrate database

_do_: create Postgres database "data_visualization"

_run_: `npm run migrate`

To reset: run `npm run reset`

### Start dev server

_run_: `npm run dev`
