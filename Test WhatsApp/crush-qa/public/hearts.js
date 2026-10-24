// Soft floating hearts behind the page.
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var box = document.createElement('div');
  box.className = 'hearts';
  box.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 16; i++) {
    var h = document.createElement('span');
    h.className = 'heart';
    h.textContent = '\u2665';
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = 14 + Math.random() * 28 + 'px';
    h.style.animationDuration = 12 + Math.random() * 14 + 's';
    h.style.animationDelay = -Math.random() * 20 + 's';
    box.appendChild(h);
  }
  document.body.prepend(box);
})();
