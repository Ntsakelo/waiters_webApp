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
  const daySelect = document.querySelectorAll(".daySelect");
  daySelect.forEach((day) => {
    if (day.classList.contains("true")) {
      day.checked = true;
    }
  });
});
