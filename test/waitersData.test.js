import assert from "assert";
import WaitersData from "../database.js";
import pgPromise from "pg-promise";

const pgp = pgPromise();
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://coder:pg123@localhost:5432/waiters_availability_tests";

const db = pgp({ connectionString });

describe("test the waiters database function", function () {
  beforeEach(async function () {
    try {
      await db.none("delete from waiters_schedule");
      await db.none("delete from waiters_names");
    } catch (err) {
      console.log(err);
    }
  });
  it("should be able to be able to store names into the database", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Ntsakelo", [
        "Monday",
        "Wednesday",
        "Friday",
      ]);
      await waitersData.scheduleName("Kennedy", [
        "Tuesday",
        "Saturday",
        "Sunday",
      ]);
      let results = await waitersData.retrieveNames();

      assert.equal("Ntsakelo", results[0].firstname);
      assert.equal("Kennedy", results[1].firstname);
    } catch (err) {
      console.log(err);
    }
  });
  it("should be able to retrieve the days that a waiter schedule", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Christopher", [
        "Tuesday",
        "Thursday",
        "Saturday",
      ]);
      let results = await waitersData.checkedDays("Christopher");
      assert.deepEqual(["Tuesday", "Thursday", "Saturday"], results);
    } catch (err) {
      console.log(err);
    }
  });
  it("should be able to return all the working days stored in the working_days table", async function () {
    try {
      const waitersData = WaitersData(db);
      let results = await waitersData.populateDays();
      assert.deepEqual(
        [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        results
      );
    } catch (err) {
      console.log(err);
    }
  });
  it("it should return 'true' when a day has been selected", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Precious", [
        "Friday",
        "Saturday",
        "Sunday",
      ]);
      let checkedDays = await waitersData.checkedDays("Precious");
      let results = await waitersData.compareDays(checkedDays);
      assert.equal(true, results[4].checkedState);
    } catch (err) {
      console.log(err);
    }
  });
  it("it should return 'false' when a day has not been selected", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Nthabeleng", [
        "Monday",
        "Wednesday",
        "Thursday",
      ]);
      let checkedDays = await waitersData.checkedDays("Nthabeleng");
      let results = await waitersData.compareDays(checkedDays);
      assert.equal(false, results[1].checkedState);
    } catch (err) {
      console.log(err);
    }
  });
  it("it should return the count of 1 when a name exists in the database", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Comfort", [
        "Monday",
        "Tuesday",
        "Friday",
      ]);
      let count = await waitersData.checkName("Comfort");
      assert.equal(1, count);
    } catch (err) {
      console.log(err);
    }
  });
  it("it should return the count of 0 when a name does not exist in the database", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Kelvin", [
        "Monday",
        "Tuesday",
        "Wednesday",
      ]);
      await waitersData.scheduleName("Lefa", [
        "Monday",
        "Tuesday",
        "Wednesday",
      ]);
      let count = await waitersData.checkName("Ntsakelo");
      assert.equal(0, count);
    } catch (err) {}
  });
  it("it should not be able to schedule a waiter with less than 3 days selected", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Musa", ["Monday", "Friday"]);
      let count = await waitersData.checkName("Musa");
      assert.equal(0, count);
    } catch (err) {
      console.log(err);
    }
  });
  it("it should be able to reschedule a waiter to a different day", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Simphiwe", [
        "Monday",
        "Tuesday",
        "Wednesday",
      ]);
      await waitersData.moveWaiter("Simphiwe", "Monday", "Thursday");
      let results = await waitersData.checkedDays("Simphiwe");
      assert.deepEqual(["Tuesday", "Wednesday", "Thursday"], results);
    } catch (err) {
      console.log(err);
    }
  });
  it("it should be able to remove a waiter from a specific day", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Khathu", [
        "Thursday",
        "Saturday",
        "Sunday",
      ]);
      await waitersData.removeWaiter("Khathu", "Thursday");
      let results = await waitersData.checkedDays("Khathu");
      assert.deepEqual(["Saturday", "Sunday"], results);
    } catch (err) {}
  });
  it("it should be able to remove a waiter from all the scheduled days", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Christopher", [
        "Monday",
        "Tuesday",
        "Friday",
      ]);
      await waitersData.removeWaiter("Christopher", "all");
      let results = await waitersData.checkedDays("Christopher");
      assert.deepEqual([], results);
    } catch (err) {
      console.log(err);
    }
  });
  it("it should be able to clear the schedule", async function () {
    try {
      const waitersData = WaitersData(db);
      await waitersData.scheduleName("Prince", ["Monday", "Friday", "Sunday"]);
      await waitersData.scheduleName("Beauty", [
        "Monday",
        "Wednesday",
        "Saturday",
      ]);
      await waitersData.scheduleName("Mpumie", [
        "Tuesday",
        "Thursday",
        "Friday",
      ]);
      await waitersData.deleteWaiters();
      let scheduleList = await waitersData.scheduleList();
      assert.deepEqual(
        [
          { Monday: [] },
          { Tuesday: [] },
          { Wednesday: [] },
          { Thursday: [] },
          { Friday: [] },

          { Saturday: [] },

          { Sunday: [] },
        ],
        scheduleList
      );
    } catch (err) {
      console.log(err);
    }
  });
  after(function () {
    db.$pool.end;
  });
});
