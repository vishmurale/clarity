// Page switching (Home / The science)
const views = { home: document.getElementById('home'), science: document.getElementById('science') };
function go(name, scroll) {
  if (!views[name]) name = 'home';
  for (const k in views) views[k].hidden = k !== name;
  document.querySelectorAll('.navlink').forEach(a => {
    if (a.dataset.go === name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (scroll) window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const j = e.target.closest('[data-join]');
  if (j) {
    e.preventDefault();
    go('home', true);
    const n = document.getElementById('name');
    if (n) n.focus({ preventScroll: true });
    return;
  }
  const a = e.target.closest('[data-go]');
  if (a) go(a.dataset.go, true);
});
window.addEventListener('hashchange', () => go(location.hash.slice(1), true));
go(location.hash.slice(1) || 'home', false);

// Waitlist form
const form = document.getElementById('waitlist-form');
const errorEl = document.getElementById('form-error');
const done = document.getElementById('waitlist-done');
const submitBtn = document.getElementById('submit-btn');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
let flavor = '';

form.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const pick = chip.dataset.flavor;
    flavor = flavor === pick ? '' : pick;
    form.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.flavor === flavor)));
  });
});

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  if (!name) return showError('Enter your name.');
  if (!EMAIL_RE.test(email)) return showError('Enter a valid email address, like name@company.com.');
  if (!window.CLARITY_SIGNUP_URL) return showError('Sign-ups are not connected yet. Please try again soon.');
  showError('');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing you up…';
  const body = new URLSearchParams({
    name, email, flavor,
    website: form.website.value, // honeypot, should stay empty
    page: location.href,
  });
  try {
    // Apps Script does not send CORS headers we can read, so the request is sent
    // as a simple no-cors POST. The script de-duplicates by email, so a retry is safe.
    await fetch(window.CLARITY_SIGNUP_URL, { method: 'POST', mode: 'no-cors', body });
    form.hidden = true;
    document.getElementById('done-title').textContent = `You're on the list, ${name}.`;
    document.getElementById('done-body').textContent =
      `We will email ${email} when Batch 01 opens.` + (flavor ? ` We noted ${flavor} as your first pick.` : '');
    done.hidden = false;
  } catch (err) {
    showError('We could not reach the sign-up list. Check your connection and try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign up for Batch 01 access';
  }
});
