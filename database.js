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
  async function populateDays() {
    try {
      return await db.manyOrNone("select week_day from working_days");
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
  async function scheduleName(username, days) {
    try {
      let idList = await getDayId(days);
      if ((await checkName(username)) > 0) {
        await db.none("delete from waiters_names where firstname = $1", [
          username,
        ]);
      }
      if (idList.length >= 3) {
        await db.none("insert into waiters_names (firstname) values ($1)", [
          username,
        ]);
      } else {
        return;
      }
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
          weekdays.push(day);
        }
      }
      //console.log(weekdays);
      return weekdays;
    } catch (err) {
      console.log(err);
    }
  }

  ///Code refactor this logic
  async function compareDays(selectedDays) {
    //week days => Monday, Tuesday, wednesday, thursday, friday, saturday, sunday
    //selected days => Monday, thursday, saturday;
    try {
      let checkedArr = [];
      let weeklyArr = [];
      let isCheckedArr = [];
      let weeklyDays = await populateDays();
      for (let i = 0; i < weeklyDays.length; i++) {
        weeklyArr.push(weeklyDays[i].week_day);
      }
      for (let i = 0; i < selectedDays.length; i++) {
        checkedArr.push(selectedDays[i].week_day);
      }
      weeklyArr.some((val) => {
        isCheckedArr.push(checkedArr.includes(val));
      });

      let allArr = [];
      for (let i = 0; i < weeklyArr.length; i++) {
        let allObject = {};
        allObject["weekDay"] = weeklyArr[i];
        allObject["checkedState"] = isCheckedArr[i];
        allArr.push(allObject);
      }
      return allArr;
      // return isCheckedArr;
    } catch (err) {
      console.log(err);
    }
  }
  //Join the three tables

  //return
  return {
    populateDays,
    scheduleName,
    checkedDays,
    compareDays,
  };
}
