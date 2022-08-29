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
  async function nameEntry(req, res) {
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
  }
  async function chooseDays(req, res) {
    // await waitersData.scheduleView();
    res.render("schedule", {
      waiterName: waiters.waiterName(),
      weekDays: await waitersData.populateDays(),
      selectedDays: await waitersData.checkedDays(userName),
      daysState: await waitersData.compareDays(days),
    });
  }
  async function submitSchedule(req, res) {
    let username = req.params.username;
    let selectedDays = req.body.day;

    await waitersData.scheduleName(username, selectedDays);
    res.redirect("/waiters/" + username);
  }
  function showLogin(req, res) {
    res.render("admin");
  }
  async function schedulePage(req, res) {
    await waitersData.scheduleList();
    res.render("days", {
      list: await waitersData.scheduleList(),
    });
  }
  function viewSchedule(req, res) {
    res.redirect("/days");
  }
  async function updateWaiter(req, res) {
    let waiterName = req.body.updtname;
    let currentDay = req.body.currentDay;
    let newDay = req.body.newDay;
    await waitersData.moveWaiter(waiterName, currentDay, newDay);
    res.redirect("/days");
  }
  async function deleteWaiter(req, res) {
    let waiterName = req.body.deletename;
    let currentDay = req.body.currentDay;
    await waitersData.removeWaiter(waiterName, currentDay);
    res.redirect("/days");
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
  };
}
