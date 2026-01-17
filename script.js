(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');

  const setExpanded = (expanded) => {
    navToggle?.setAttribute('aria-expanded', String(expanded));
    navLinks?.classList.toggle('open', expanded);
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    });

    navLinks.addEventListener('click', (e) => {
      const target = e.target;
      if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('#')) {
        setExpanded(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setExpanded(false);
    });
  }

  const form = document.getElementById('rsvp-form');

  const setHint = (name, msg) => {
    const el = document.querySelector(`[data-hint-for="${name}"]`);
    if (el) el.textContent = msg;
  };

  const validate = (data) => {
    let ok = true;

    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const attendance = (data.get('attendance') || '').toString().trim();

    setHint('name', '');
    setHint('email', '');
    setHint('attendance', '');

    if (!name) {
      setHint('name', 'Please enter your name.');
      ok = false;
    }

    if (!email) {
      setHint('email', 'Please enter your email.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setHint('email', 'Please enter a valid email.');
      ok = false;
    }

    if (!attendance) {
      setHint('attendance', 'Please select an option.');
      ok = false;
    }

    return ok;
  };

  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      if (!validate(data)) return;

      const name = encodeURIComponent((data.get('name') || '').toString().trim());
      const email = encodeURIComponent((data.get('email') || '').toString().trim());
      const attendance = encodeURIComponent((data.get('attendance') || '').toString().trim());
      const notes = encodeURIComponent((data.get('notes') || '').toString().trim());

      const to = 'graceandrob@example.com';
      const subject = encodeURIComponent('Wedding RSVP');
      const body =
        `Name: ${decodeURIComponent(name)}%0D%0A` +
        `Email: ${decodeURIComponent(email)}%0D%0A` +
        `Attendance: ${decodeURIComponent(attendance)}%0D%0A` +
        (notes ? `Notes: ${decodeURIComponent(notes)}%0D%0A` : '');

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
})();
