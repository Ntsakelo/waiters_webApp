export default function WaitersData(db) {
  async function checkName(username) {
    try {
      let count = await db.oneOrNone(
        "select count(*) from waiters_names where firstname = $1",
        [username]
      );
      return Number(count.count);
    } catch (err) {
      console.log(err);
    }
  }
  async function retrieveNames() {
    try {
      return await db.manyOrNone("select * from waiters_names");
    } catch (err) {
      console.log(err);
    }
  }
  async function populateDays() {
    try {
      let weeklyDays = [];
      let results = await db.manyOrNone("select week_day from working_days");
      for (let i = 0; i < results.length; i++) {
        weeklyDays.push(results[i].week_day);
      }
      return weeklyDays;
    } catch (err) {
      console.log(err);
    }
  }
  async function getDayId(days) {
    try {
      let idList = [];
      for (let i = 0; i < days.length; i++) {
        let day = days[i];
        let results = await db.manyOrNone(
          "select id from working_days where week_day = $1",
          [day]
        );
        idList.push(results[0].id);
      }

      return idList;
    } catch (err) {
      console.log(err);
    }
  }
  async function checkIfRegistered(firstname, lastname, email) {
    try {
      let results = await db.oneOrNone(
        "select * from waiters_names where firstname = $1 and lastname = $2 and email = $3",
        [firstname, lastname, email]
      );
      return results;
    } catch (err) {
      console.log(err);
    }
  }
  async function registerUser(firstname, lastname, email, password) {
    try {
      if ((firstname, lastname, email, password)) {
        let list = [firstname, lastname, email, password];
        let results = await db.oneOrNone(
          "select count(*) from waiters_names where firstname = $1 and lastname = $2 and email=$3",
          [firstname, lastname, email]
        );
        if (Number(results.count) > 0) {
          return;
        } else {
          await db.none(
            "insert into waiters_names(firstname,lastname,email,password) values($1,$2,$3,$4)",
            list
          );
        }
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function logIn(email) {
    try {
      let results = await db.oneOrNone(
        "select * from waiters_names where email =$1",
        [email]
      );
      return results;
    } catch (err) {
      console.log(err);
    }
  }
  async function checkIfReschedule(username) {
    try {
      let nameId = await db.oneOrNone(
        "select id from waiters_names where firstname = $1",
        [username]
      );
      let results = await db.oneOrNone(
        "select count(*) from waiters_schedule where name_id = $1",
        [nameId.id]
      );
      if (Number(results.count) > 0) {
        await db.none("delete from waiters_schedule where name_id = $1", [
          nameId.id,
        ]);
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function scheduleName(username, days) {
    try {
      let idList = await getDayId(days);
      let nameId = await db.oneOrNone(
        "select id from waiters_names where firstname = $1",
        [username]
      );

      for (let i = 0; i < idList.length; i++) {
        let dayId = idList[i];
        await db.none(
          "insert into waiters_schedule (name_id,day_id) values ($1,$2)",
          [nameId.id, dayId]
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function checkedDays(username) {
    try {
      let weekdays = [];
      let nameCount = await checkName(username);
      if (nameCount > 0) {
        let result = await db.manyOrNone(
          "select id from waiters_names where firstname =$1",
          [username]
        );
        let nameId = result[0].id;
        let daysId = await db.manyOrNone(
          "select day_id from waiters_schedule where name_id = $1",
          [nameId]
        );
        for (let i = 0; i < daysId.length; i++) {
          let currentId = daysId[i].day_id;
          let day = await db.oneOrNone(
            "select week_day from working_days where id = $1",
            [currentId]
          );
          weekdays.push(day.week_day);
        }
      }

      return weekdays;
    } catch (err) {
      console.log(err);
    }
  }

  async function compareDays(selectedDays) {
    try {
      let isCheckedArr = [];
      let allArr = [];
      let weeklyDays = await populateDays();
      weeklyDays.some((val) => {
        isCheckedArr.push(selectedDays.includes(val));
      });
      for (let i = 0; i < weeklyDays.length; i++) {
        let allObject = {};
        allObject["weekDay"] = weeklyDays[i];
        allObject["checkedState"] = isCheckedArr[i];
        allArr.push(allObject);
      }
      return allArr;
    } catch (err) {
      console.log(err);
    }
  }
  async function checkOverBooked() {
    try {
      let weeklyDays = await populateDays();
      let stateList = [];
      for (let i = 0; i < weeklyDays.length; i++) {
        let currentDay = weeklyDays[i];
        let dayId = await currentDayId(currentDay);
        let results = await db.manyOrNone(
          "select firstname,day_id from waiters_names JOIN waiters_schedule ON waiters_names.id = waiters_schedule.name_id where waiters_schedule.day_id =$1",
          [dayId]
        );
        if (results.length < 3) {
          stateList.push("more");
        } else if (results.length === 3) {
          stateList.push("enough");
        } else if (results.length > 3) {
          stateList.push("over");
        }
      }
      return stateList;
    } catch (err) {
      console.log(err);
    }
  }
  async function daysOfSchedule() {
    try {
      let daysArr = [];
      let weeklyDays = await populateDays();
      let dayStatus = await checkOverBooked();
      for (let i = 0; i < weeklyDays.length; i++) {
        let daysObject = {};
        daysObject["day"] = weeklyDays[i];
        daysObject["dayStatus"] = dayStatus[i];
        daysArr.push(daysObject);
      }
      return daysArr;
    } catch (err) {}
  }
  async function scheduleList() {
    try {
      let weeklyDays = await populateDays();

      let scheduleList = [];
      for (let i = 0; i < weeklyDays.length; i++) {
        let testingArr = [];
        let currentDay = weeklyDays[i];
        let dayId = await currentDayId(currentDay);
        let schedObj = {};
        let results = await db.manyOrNone(
          "select firstname,day_id from waiters_names JOIN waiters_schedule ON waiters_names.id = waiters_schedule.name_id where waiters_schedule.day_id =$1",
          [dayId]
        );

        results.forEach((element) => {
          testingArr.push(element.firstname);
        });
        if (schedObj[currentDay] === undefined) {
          schedObj[currentDay] = testingArr;
        }
        scheduleList.push(schedObj);
      }

      return scheduleList;
    } catch (err) {
      console.log(err);
    }
  }
  async function getWaiterId(username) {
    try {
      let results = await db.oneOrNone(
        "select id from waiters_names where firstname = $1",
        [username]
      );
      return results.id;
    } catch (err) {
      console.log(err);
    }
  }
  async function currentDayId(currentDay) {
    let results = await db.oneOrNone(
      "select id from working_days where week_day = $1",
      [currentDay]
    );
    return results.id;
  }
  async function newDayId(newDay) {
    let results = await db.oneOrNone(
      "select id from working_days where week_day = $1",
      [newDay]
    );
    return results.id;
  }
  async function moveWaiter(username, currentDay, newDay) {
    try {
      if (username && currentDay && newDay) {
        let waiterId = await getWaiterId(username);
        let oldDayId = await currentDayId(currentDay);
        let nowDayId = await newDayId(newDay);
        await db.none(
          "update waiters_schedule set day_id = $1 where name_id = $2 and day_id = $3",
          [nowDayId, waiterId, oldDayId]
        );
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function removeWaiter(username, currentDay) {
    try {
      if (username && currentDay) {
        let userCount = await checkName(username);
        if (currentDay === "all" && userCount > 0) {
          await db.none("delete from waiters_names where firstname =$1", [
            username,
          ]);
          return;
        }
        let waiterId = await getWaiterId(username);
        let nowDayId = await currentDayId(currentDay);
        await db.none(
          "delete from waiters_schedule where name_id =$1 and day_id =$2",
          [waiterId, nowDayId]
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function deleteWaiters() {
    try {
      await db.none("delete from waiters_names");
    } catch (err) {
      console.log(err);
    }
  }
  async function checkNameInDay(waiterName, newDay) {
    try {
      let waiterId = await getWaiterId(waiterName);
      let nowDayId = await newDayId(newDay);
      return await db.oneOrNone(
        "select count(*) from waiters_schedule where name_id = $1 and day_id =$2",
        [waiterId, nowDayId]
      );
    } catch (err) {
      console.log(err);
    }
  }

  //return
  return {
    populateDays,
    checkIfRegistered,
    registerUser,
    logIn,
    scheduleName,
    retrieveNames,
    checkedDays,
    checkIfReschedule,
    compareDays,
    scheduleList,
    moveWaiter,
    removeWaiter,
    deleteWaiters,
    checkName,
    checkNameInDay,
    daysOfSchedule,
  };
}
