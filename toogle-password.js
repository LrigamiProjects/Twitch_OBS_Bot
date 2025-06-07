document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      const icon = button.querySelector("span");
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icon.textContent = isPassword ? "visibility" : "visibility_off";
    });
  });
});
