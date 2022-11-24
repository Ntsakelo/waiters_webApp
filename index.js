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

app.get("/register", waitersRoutes.registration);
app.post("/register", waitersRoutes.registerUser);
app.get("/login", waitersRoutes.showLogin);
app.post("/login", waitersRoutes.viewSchedule);
app.post("/waiters", waitersRoutes.nameEntry);
app.use(function (req, res, next) {
  let user = req.session.user;

  if (req.path === "/register" || req.path === "/") {
    next();
  } else {
    if (!user) {
      return res.redirect("/");
    } else if (user) {
      if (req.path === "/days" && !user.email.includes("admin")) {
        res.redirect("/waiters/" + user.firstname);
        return;
      } else if (req.path === "/days" && user.email.includes("admin")) {
        return next();
      }
      next();
    }
  }
});
app.get("/days", waitersRoutes.schedulePage);
app.get("/waiters/:username", waitersRoutes.chooseDays);
app.post("/waiters/:username", waitersRoutes.submitSchedule);
app.post("/update", waitersRoutes.updateWaiter);
app.post("/delete", waitersRoutes.deleteWaiter);
app.get("/clear", waitersRoutes.clearSchedule);
app.get("/logout", waitersRoutes.logOut);

//PORT
var PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("app started on port: ", PORT);
});
