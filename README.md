# Social Soccer

## 1. About the Project

**Social Soccer** is centralised platform for finding local games of football through geospatial queries and also organising games and finding those crucial players that makes a game of football successful.

### Key Technologies

- **Runtime:** Node.js
- **Framework:** SvelteKit
- **UI Library:** SkeletonUI (with Tailwind CSS)
- **Language:** TypeScript
- **Database:** PostgreSQL with PostGIS (for geospatial/location queries)
- **ORM:** Prisma
- **Integrations:** Google Maps API, Gmail

---

## 2. Prerequisites & Global Setup (Ubuntu)

### Install Node.js

First, ensure your system package list is up to date, then install Node.js and npm:

```bash
sudo apt update
sudo apt install nodejs npm
```

### Install PostgreSQL and the PostGis extension

To install PostgreSQL and PostGis run the following command

```bash
sudo apt install postgresql postgresql-contrib postgis
```

There is an issue when running migrations with Prisma and the shadow database, so it
is vital to have PostGis enabled by default on every instance. To do this, log into the the postgresql instance and run the following command

```bash
\c template1
CREATE EXTENSION postgis;
```

### Install the application 
Download the project on you local machine and navigate in the terminal to the location of this project
When in the directory run the following code
```bash
npm install
```

### Create a .env 
To run the application a .env file needs to be created with the following environment variables

```bash
DATABASE_URL="use your local db connection string"
GOOGLE_APP_PASSWORD="use the app password from google"
FROM_EMAIL="the email that has the app password"
ENCRYPTION_KEY="use an encryption key to encrypt the data"
GOOGLE_MAP_API_KEY="The api key from google maps"
DEPLOYMENT_ENV="dev"
```

To be able to run test you will need to create a .env.test file and repeat the above variables but also add these
```bash
ETHEREAL_EMAIL="test email from ethereal mail"
EMAIL_PASSWORD="ethereal mail password"
DEPLOYMENT_ENV="testing"
```

### Run Database Migrations 
To get the database in sync with the application, you will need to run migrations 
In the directory type
```bash 
npx prisma migrate dev
```

### Running the Application 
To run the application type in the terminal 
```bash
npm run dev
```

### Running tests
To run the test suites type in the terminal 
```bash
npm run test
```