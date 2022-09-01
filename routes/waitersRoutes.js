import flash from "express-flash";

export default function WaitersRoutes(waiters, waitersData) {
  let days;
  let userName = "";

  function defaultEntry(req, res) {
    res.render("index", {
      errorStyle: waiters.errorMessage().includes("Perfect")
        ? "successful"
        : "danger",
    });
  }
  async function nameEntry(req, res, next) {
    try {
      let waiterName = req.body.name;
      waiters.getName(waiterName);

      req.flash("info", waiters.errorMessage());
      if (waiters.waiterName() === "") {
        res.redirect("/");
        return;
      }
      userName = waiterName;
      days = await waitersData.checkedDays(waiterName);
      res.redirect("/waiters/" + waiterName);
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

      if (!selectedDays) {
        req.flash("schedule", "Please select days below!");
        res.redirect("/waiters/" + username);
      } else if (selectedDays.length < 3 && selectedDays.length >= 1) {
        req.flash("schedule", "Please select atleast 3 days!");
        res.redirect("/waiters/" + username);
      }
      await waitersData.scheduleName(username, selectedDays);
      res.redirect("/waiters/" + username);
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
      let waiterName = req.body.updtname;
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
      if (Number(checkInPrevDay.count < 0) && Number(checkInNewDay.count < 0)) {
        req.flash("update", `${waiterName} is not scheduled for ${newDay}!`);
        waiterName = "";
        currentDay = "";
        newDay = "";
      }
      if (Number(checkInNewDay.count > 0) && Number(checkInPrevDay.count > 0)) {
        req.flash("update", `${waiterName} already scheduled for ${newDay}!`);
        waiterName = "";
        currentDay = "";
        newDay = "";
      }
      if (nameCheck === 0) {
        req.flash("update", `${waiterName} not in schedule!`);
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
      let waiterName = req.body.deletename;
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
        req.flash("delete", "Waiter not scheduled for this day!");
        waiterName = "";
        currentDay = "";
      } else if (nameCheck === 0) {
        req.flash("delete", "Waiter not in schedule!");
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
  return {
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
  };
}
