document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("scanBtn");
  const form = document.getElementById("scanForm");
  form.addEventListener("submit", function () {
    btn.classList.add("loading");
    btn.textContent = "Scanning...";
    // Clear previous results immediately after submit
    const result = document.getElementById("result");
    result.textContent = "";
  });
});
