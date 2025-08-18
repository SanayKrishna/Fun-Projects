function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createStars() {
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = random(1, 3) + 'px';
    star.style.height = star.style.width;
    star.style.left = random(0, 100) + '%';
    star.style.top = random(0, 100) + '%';
    star.style.animationDelay = random(0, 3) + 's';
    star.style.animationDuration = random(1, 4) + 's';
    document.body.appendChild(star);
  }
}

document.getElementById('loginBtn').addEventListener('click', function(e) {
  e.preventDefault();
  alert('Form submitted! (Demo only)');
});

window.onload = createStars;
