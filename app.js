const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

const config = require("./config");
const port = process.env.PORT || 3000;

const app = express();

// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// print the requrest log on console
app.use(morgan("dev"));

// set the secret key variable for jwt
app.set("jwt-secret", config.secret);

// index page, just for testing
app.get("/", (req, res) => {
  res.send("Hello JWT");
});

// configure api router
app.use("/api", require("./routes/api"));

// open the server
app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});

// connect to MongoDB server
mongoose.connect(config.mongodbUri, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error);
db.once("open", () => {
  console.log("connected to mongodb server");
});
