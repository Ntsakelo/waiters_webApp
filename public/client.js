document.addEventListener("DOMContentLoaded", function () {
  let errorMessage = document.querySelector(".errorMsg");
  // let daySelect = document.querySelector(".daySelect");

  if (errorMessage.innerHTML !== "") {
    setTimeout(function () {
      errorMessage.innerHTML = "";
      errorMessage.classList.add("noShow");
    }, 3000);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  let errorMessage = document.querySelector(".err");
  let errorMessage2 = document.querySelector(".err2");
  if (errorMessage.innerHTML.includes("Successfully")) {
    errorMessage.setAttribute("style", "color:green");
  } else {
    errorMessage.setAttribute("style", "color:red");
  }

  if (errorMessage.innerHTML !== "") {
    setTimeout(function () {
      errorMessage.innerHTML = "";
      errorMessage.classList.add("noShow");
    }, 3000);
  }
  if (errorMessage2.innerHTML !== "") {
    setTimeout(function () {
      errorMessage2.innerHTML = "";
      errorMessage2.classList.add("noShow");
    }, 3000);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  let stateMessage = document.querySelector(".state");
  if (stateMessage.innerHTML !== "") {
    setTimeout(function () {
      stateMessage.innerHTML = "";
      stateMessage.classList.add("noShow");
    }, 3000);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  let errorMessage = document.querySelector(".loginMessage");

  if (errorMessage.innerHTML !== "") {
    setTimeout(function () {
      errorMessage.innerHTML = "";
      errorMessage.classList.add("noShow");
    }, 3000);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const daySelect = document.querySelectorAll(".daySelect");
  daySelect.forEach((day) => {
    if (day.classList.contains("true")) {
      day.checked = true;
    }
  });
});
