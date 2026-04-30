const burger = document.querySelector(".burger");
const menu = document.querySelector(".nav-links");

function closeMenu() {
  menu.classList.remove("open");
}

burger.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("open");
});

// cliquer en dehors du menu pour fermer
document.addEventListener("click", (e) => {
  if (
    menu.classList.contains("open") &&
    !menu.contains(e.target) &&
    !burger.contains(e.target)
  ) {
    closeMenu();
  }
});
