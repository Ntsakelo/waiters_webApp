export default function Waiters() {
  let userName = "";
  let isValid = "";
  let error = "";
  function getName(val) {
    isValid = "";
    if (val === "") {
      isValid = "empty";
    }
    if (/^([A-Z])\D\w+\D$/.test(val)) {
      userName = val;
    } else {
      userName = "";
    }
  }
  function waiterName() {
    return userName;
  }
  function errorMessage() {
    if (isValid === "empty") {
      error = "Please enter a name";
    } else if (userName === "" && isValid === "") {
      error = "Please enter a valid name!";
    } else if (isValid === "exists") {
      error = "Name already exists";
    } else if (userName !== "") {
      error = "perfect!";
    }
    return error;
  }
  function customError(state) {
    isValid = state;
  }
  return {
    getName,
    waiterName,
    errorMessage,
    customError,
  };
}
