import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "express-flash";
import pgPromise from "pg-promise";
import WaitersRoutes from "./routes/waitersRoutes.js";
import WaitersData from "./database.js";
import Waiters from "./waiters.js";

const pgp = pgPromise();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://coder:pg123@localhost:5432/waiters_availability";

const config = {
  connectionString: DATABASE_URL,
};

if (process.env.NODE_ENV == "production") {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

const db = pgp(config);

const app = express();

app.use(
  session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static("public"));
//factory functions
const waiters = Waiters();
const waitersData = WaitersData(db);
const waitersRoutes = WaitersRoutes(waiters, waitersData);

app.get("/", waitersRoutes.defaultEntry);
app.post("/waiters", waitersRoutes.nameEntry);
app.get("/login", waitersRoutes.showLogin);
app.get("/days", waitersRoutes.schedulePage);
app.post("/login", waitersRoutes.viewSchedule);
app.get("/waiters/:username", waitersRoutes.chooseDays);
app.post("/waiters/:username", waitersRoutes.submitSchedule);
app.post("/update", waitersRoutes.updateWaiter);
app.post("/delete", waitersRoutes.deleteWaiter);
app.get("/clear", waitersRoutes.clearSchedule);

//PORT
var PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("app started on port: ", PORT);
});
