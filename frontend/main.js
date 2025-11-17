function spinImage(element) {
  element.style.transition = "transform 0.6s ease-in-out";
  element.style.transform = "rotate(-720deg)";
}

function resetSpin(element) {
  element.style.transform = "rotate(0deg)";
}

function increaseSize(element) {
  element.style.transition = "font-size 0.3s ease";
  element.style.fontSize = "1.1rem";
}

function resetSize(element) {
  element.style.fontSize = "1rem";
}