document.addEventListener('mousemove', function(e) {
  const cursor = document.querySelector('.neon-cursor');
  if (cursor) {
    cursor.style.left = (e.pageX - 9) + 'px';
    cursor.style.top = (e.pageY - 9) + 'px';
  }
});
