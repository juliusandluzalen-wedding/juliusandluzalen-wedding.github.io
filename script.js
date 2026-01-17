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

  const initCountdown = () => {
    const banners = Array.from(document.querySelectorAll('.save-date'));
    if (banners.length === 0) return;

    const tickers = banners
      .map((banner) => {
        const raw = banner.getAttribute('data-countdown') || '';
        const target = new Date(raw);

        if (Number.isNaN(target.getTime())) {
          banner.style.display = 'none';
          return null;
        }

        const parts = {
          days: banner.querySelector('[data-countdown-part="days"]'),
          hours: banner.querySelector('[data-countdown-part="hours"]'),
          minutes: banner.querySelector('[data-countdown-part="minutes"]'),
          seconds: banner.querySelector('[data-countdown-part="seconds"]'),
        };

        const setText = (key, val) => {
          const el = parts[key];
          if (!el) return;
          el.textContent = String(val).padStart(2, '0');
        };

        const update = () => {
          const now = Date.now();
          const diff = target.getTime() - now;

          if (diff <= 0) {
            banner.classList.add('ended');
            setText('days', 0);
            setText('hours', 0);
            setText('minutes', 0);
            setText('seconds', 0);
            return;
          }

          const totalSeconds = Math.floor(diff / 1000);
          const days = Math.floor(totalSeconds / 86400);
          const hours = Math.floor((totalSeconds % 86400) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = Math.floor(totalSeconds % 60);

          setText('days', days);
          setText('hours', hours);
          setText('minutes', minutes);
          setText('seconds', seconds);
        };

        update();
        return { update };
      })
      .filter(Boolean);

    if (tickers.length === 0) return;
    window.setInterval(() => tickers.forEach((t) => t.update()), 1000);
  };

  initCountdown();

  const form = document.getElementById('rsvp-form');

  const setHint = (name, msg) => {
    const el = document.querySelector(`[data-hint-for="${name}"]`);
    if (el) el.textContent = msg;
  };

  const validate = (data) => {
    let ok = true;

    const name = (data.get('name') || '').toString().trim();

    setHint('name', '');

    if (!name) {
      setHint('name', 'Please enter your name.');
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

      const to = 'graceandrob@example.com';
      const subject = encodeURIComponent('Wedding RSVP');
      const body = `Name: ${decodeURIComponent(name)}%0D%0A`;

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
})();
