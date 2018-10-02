const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const bearerToken = require("express-bearer-token");

if (!process.env.DB_URI) {
  require("./config/env.js");
}

const port = process.env.PORT || 3001;

const databaseConnectionString =
  "mongodb://" +
  process.env.DB_USERNAME +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_URI;
mongoose.Promise = global.Promise;
mongoose.connect(databaseConnectionString);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bearerToken());
app.use(passport.initialize());

const localSignupStrategy = require("./passport/local-signup");
const localLoginStrategy = require("./passport/local-login");
passport.use("local-signup", localSignupStrategy);
passport.use("local-login", localLoginStrategy);

// set cross origin resource sharing (CORS) policy
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, HEAD, OPTIONS, POST, PUT, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Authorization, Origin, Accept, X-Requested-With, Content-Type, X-Access-Token"
  );
  res.header("Cache-Control", "no-cache");
  next();
});

// static info routes
require("./routes/static.js")(app);

// static api routes
require("./routes/api.js")(app);

// auth routes
require("./routes/auth.js")(app, passport);

// api routes
require("./routes/labs.js")(app);



app.listen(port, () => console.log(`Application listening on port ${port}!`))