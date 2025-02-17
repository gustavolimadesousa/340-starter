// Enable submit button when form changes
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#updateForm");
  const submitBtn = document.querySelector('button[type="submit"]');

  form.addEventListener("change", () => {
    submitBtn.disabled = false;
  });
});
