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
      let name = req.body.name;
      let waiterName = name.charAt(0).toUpperCase() + name.slice(1);
      waiters.getName(waiterName);

      req.flash("info", waiters.errorMessage());
      if (waiters.waiterName() === "") {
        res.redirect("/");
        return;
      }
      userName = waiterName;
      let username = waiterName;
      days = await waitersData.checkedDays(waiterName);
      res.redirect("/waiters/" + username);
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
      await waitersData.compareDays(selectedDays);
      res.redirect("/waiters/" + username);
    } catch (err) {
      next(err);
    }
  }

  function scheduleSucess(req, res, next) {
    res.render("success", {
      waiterName: userName,
    });
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
  //Updating
  function showUpdate(req, res, next) {
    res.render("update");
  }
  async function updateWaiter(req, res, next) {
    try {
      let waiterName = req.body.updtname;
      let currentDay = req.body.currentDay;
      let newDay = req.body.newDay;
      if (!waiterName && !currentDay && !newDay) {
        req.flash("update", "No details provided!");
        res.redirect("/admin");
      } else if (!waiterName || !currentDay || !newDay) {
        req.flash("update", "Missing some details!");
        res.redirect("/admin");
      }
      let checkInNewDay = await waitersData.checkNameInDay(waiterName, newDay);
      let checkInPrevDay = await waitersData.checkNameInDay(
        waiterName,
        currentDay
      );
      let nameCheck = await waitersData.checkName(waiterName);

      if (Number(checkInPrevDay.count <= 0)) {
        req.flash(
          "update",
          `${waiterName} is not scheduled for ${currentDay}!`
        );
        waiterName = "";
        currentDay = "";
        newDay = "";
      }
      if (Number(checkInNewDay.count > 0) && Number(checkInPrevDay.count > 0)) {
        req.flash(
          "update",
          `${waiterName} is already scheduled for ${newDay}!`
        );
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
      if (
        Number(checkInNewDay.count <= 0) &&
        Number(checkInPrevDay.count > 0)
      ) {
        await waitersData.moveWaiter(waiterName, currentDay, newDay);
        req.flash("update", `Successfully rescheduled ${waiterName}`);
      }
      res.redirect("/admin");
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
        res.redirect("/admin");
      } else if (!waiterName || !currentDay) {
        req.flash("delete", "Missing some details!");
        res.redirect("/admin");
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
      res.redirect("/admin");
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
    showUpdate,
    updateWaiter,
    deleteWaiter,
    clearSchedule,
    scheduleSucess,
  };
}
