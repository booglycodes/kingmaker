export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function log(msg) {
  const el = document.getElementById('log');
  if (el) {
    el.textContent += msg + '\n';
    el.scrollTop = el.scrollHeight;
  }
  console.log('[Kingmaker]', msg);
}
