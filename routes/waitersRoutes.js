import flash from "express-flash";
import bcrypt from "bcrypt";
export default function WaitersRoutes(waiters, waitersData) {
  let days;
  let userName = "";
  function registration(req, res) {
    res.render("register");
  }
  function defaultEntry(req, res) {
    res.render("index", {
      errorStyle: waiters.errorMessage().includes("Perfect")
        ? "successful"
        : "danger",
    });
  }
  async function registerUser(req, res, next) {
    try {
      let firstname = req.body.firstName;
      let lastname = req.body.lastName;
      let email = req.body.email;
      let password = req.body.password;
      let capitalName = firstname.charAt(0).toUpperCase() + firstname.slice(1);
      let capitalLstName = lastname.charAt(0).toUpperCase() + lastname.slice(1);
      if (firstname && lastname && email && password) {
        let results = await waitersData.checkIfRegistered(
          capitalName,
          capitalLstName,
          email
        );
        if (results) {
          req.flash("register", "User already exists");
          return res.redirect("/register");
        } else if (!results) {
          let hashedPassword = await bcrypt.hash(password, 10);
          await waitersData.registerUser(
            capitalName,
            capitalLstName,
            email,
            hashedPassword
          );
          req.flash("register", "Successfully registered");
          res.redirect("/register");
        }
      } else {
        req.flash("register", "Please supply all the details");
        return res.redirect("/register");
      }
    } catch (err) {
      next(err);
    }
  }
  async function nameEntry(req, res, next) {
    try {
      let email = req.body.loginEmail;
      let password = req.body.loginPassword;
      let results = await waitersData.logIn(email);
      if (!password && !email) {
        req.flash("info", "Please enter your login details");
        return res.redirect("/");
      } else if (!results) {
        req.flash("info", "The user does not exist");
        return res.redirect("/");
      } else if (results) {
        let isPassword = await bcrypt.compare(password, results.password);
        if (!isPassword) {
          req.flash("info", "Incorrect login details provided");
          return res.redirect("/");
        } else if (isPassword) {
          req.session.user = results;

          if (results.email === "admin@gmail.com") {
            return res.redirect("/days");
          }
          userName = results.firstname;
          let username = results.firstname;
          days = await waitersData.checkedDays(results.firstname);
          waiters.getName(username);
          res.redirect("/waiters/" + username);
        }
      }
    } catch (err) {
      next(err);
    }
  }
  async function chooseDays(req, res, next) {
    try {
      res.render("schedule", {
        waiterName: waiters.waiterName(),
        weekDays: await waitersData.populateDays(),
        selectedDays: await waitersData.checkedDays(userName),
        daysState: await waitersData.compareDays(days),
      });
    } catch (err) {
      next(err);
    }
  }

  async function submitSchedule(req, res, next) {
    try {
      let username = req.params.username;
      let selectedDays = req.body.day;
      let theType = typeof selectedDays;

      let results = await waitersData.checkedDays(username);
      if (results) {
        await waitersData.checkIfReschedule(username);
      }
      if (!selectedDays) {
        req.flash("schedule", "Please select days below!");
        return res.redirect("/waiters/" + username);
      } else if (selectedDays.length < 3 || theType === "string") {
        req.flash("schedule", "Please select atleast 3 days!");
        return res.redirect("/waiters/" + username);
      } else if (selectedDays.length >= 3) {
        await waitersData.scheduleName(username, selectedDays);
        days = await waitersData.checkedDays(username);
        await waitersData.compareDays(days);
        req.flash("schedule", "Successfully scheduled days");
        res.redirect("/waiters/" + username);
      }
    } catch (err) {
      next(err);
    }
  }

  function showLogin(req, res) {
    res.render("admin");
  }
  async function schedulePage(req, res, next) {
    try {
      res.render("days", {
        list: await waitersData.scheduleList(),
        days: await waitersData.daysOfSchedule(),
      });
    } catch (err) {
      next(err);
    }
  }
  function viewSchedule(req, res) {
    let username = req.body.adminName;
    let password = req.body.password;
    if (username === "coffeeAdmin" && password === "admin271") {
      res.redirect("/days");
    } else if (!username && !password) {
      req.flash("login", "Please enter your username and password!");
      res.redirect("/login");
    } else if (password !== "" && !username) {
      req.flash("login", "Please enter your username!");
      res.redirect("/login");
    } else if (username && !password) {
      req.flash("login", "Please enter your password!");
      res.redirect("/login");
    } else {
      req.flash("login", "incorrect username/password!");
      res.redirect("/login");
    }
  }

  async function updateWaiter(req, res, next) {
    try {
      let name = req.body.updtname;
      let waiterName = name.charAt(0).toUpperCase() + name.slice(1);
      let currentDay = req.body.currentDay;
      let newDay = req.body.newDay;
      if (!waiterName && !currentDay && !newDay) {
        req.flash("update", "No details provided!");
        res.redirect("/days");
      } else if (!waiterName || !currentDay || !newDay) {
        req.flash("update", "Missing some details!");
        res.redirect("/days");
      }
      let checkInNewDay = await waitersData.checkNameInDay(waiterName, newDay);
      let checkInPrevDay = await waitersData.checkNameInDay(
        waiterName,
        currentDay
      );
      let nameCheck = await waitersData.checkName(waiterName);
      if (nameCheck === 0) {
        req.flash("update", `${waiterName} is not in schedule!`);
        waiterName = "";
        currentDay = "";
        newDay = "";
      } else if (Number(checkInPrevDay.count <= 0)) {
        req.flash(
          "update",
          `${waiterName} is not scheduled for ${currentDay}!`
        );
        waiterName = "";
        currentDay = "";
        newDay = "";
      } else if (
        Number(checkInNewDay.count > 0) &&
        Number(checkInPrevDay.count > 0)
      ) {
        req.flash(
          "update",
          `${waiterName} is already scheduled for ${newDay}!`
        );
        waiterName = "";
        currentDay = "";
        newDay = "";
      }

      await waitersData.moveWaiter(waiterName, currentDay, newDay);
      res.redirect("/days");
    } catch (err) {
      next(err);
    }
  }
  async function deleteWaiter(req, res, next) {
    try {
      let name = req.body.deletename;
      let waiterName = name.charAt(0).toUpperCase() + name.slice(1);
      let currentDay = req.body.removeDay;
      if (!waiterName && !currentDay) {
        req.flash("delete", "No details provided!");
        res.redirect("/days");
      } else if (!waiterName || !currentDay) {
        req.flash("delete", "Missing some details!");
        res.redirect("/days");
      }
      let results = await waitersData.checkNameInDay(waiterName, currentDay);
      let nameCheck = await waitersData.checkName(waiterName);
      if (nameCheck > 0 && currentDay !== "all" && Number(results.count <= 0)) {
        req.flash(
          "delete",
          `${waiterName} is not scheduled for ${currentDay}!`
        );
        waiterName = "";
        currentDay = "";
      }
      if (nameCheck === 0) {
        req.flash("delete", `${waiterName} is not in schedule!`);
        waiterName = "";
        currentDay = "";
      }
      await waitersData.removeWaiter(waiterName, currentDay);
      res.redirect("/days");
    } catch (err) {
      next(err);
    }
  }
  async function clearSchedule(req, res, next) {
    try {
      await waitersData.deleteWaiters();
      res.redirect("/days");
    } catch (err) {
      next(err);
    }
  }
  function logOut(req, res, next) {
    try {
      delete req.session.user;
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
  return {
    registration,
    registerUser,
    defaultEntry,
    showLogin,
    nameEntry,
    chooseDays,
    submitSchedule,
    viewSchedule,
    schedulePage,
    updateWaiter,
    deleteWaiter,
    clearSchedule,
    logOut,
  };
}
