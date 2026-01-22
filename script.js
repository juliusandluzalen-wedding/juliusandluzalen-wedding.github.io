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

  const form = document.getElementById('save-the-date-response-form');
  const status = document.getElementById('save-the-date-status');
  const attending = document.getElementById('attending');
  const bringingPlusOne = document.getElementById('bringing_plus_one');
  const additionalGuests = document.getElementById('additional_guests');

  const setHint = (name, msg) => {
    const el = document.querySelector(`[data-hint-for="${name}"]`);
    if (el) el.textContent = msg;
  };

  const setStatus = (msg) => {
    if (status) status.textContent = msg;
  };

  const setConditionalVisible = (key, show) => {
    document.querySelectorAll(`[data-conditional="${key}"]`).forEach((el) => {
      el.classList.toggle('hidden', !show);
    });
  };

  const syncConditionals = () => {
    const attendingVal = (attending?.value || '').toString();
    const yes = attendingVal === 'yes';
    setConditionalVisible('attending-yes', yes);

    const plusOneYes = yes && (bringingPlusOne?.value || '').toString() === 'yes';
    setConditionalVisible('plus-one-name', plusOneYes);

    const extraGuestsYes = yes && (additionalGuests?.value || '').toString() === 'yes';
    setConditionalVisible('additional-guests-count', extraGuestsYes);
  };

  const clearHints = () => {
    ['attending', 'name', 'phone', 'email', 'invitation_preference', 'bringing_plus_one', 'plus_one_name', 'additional_guests', 'additional_guests_count'].forEach((k) =>
      setHint(k, '')
    );
  };

  const validate = (data) => {
    let ok = true;

    clearHints();

    const attendingVal = (data.get('attending') || '').toString();
    if (!attendingVal) {
      setHint('attending', 'Please select yes or no.');
      ok = false;
      return ok;
    }

    if (attendingVal !== 'yes') {
      return ok;
    }

    const name = (data.get('name') || '').toString().trim();
    if (!name) {
      setHint('name', 'Please enter your name.');
      ok = false;
    }

    const invitationPref = (data.get('invitation_preference') || '').toString();
    if (!invitationPref) {
      setHint('invitation_preference', 'Please select how you prefer to receive the invitation.');
      ok = false;
    }

    const phone = (data.get('phone') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();

    if ((invitationPref === 'phone' || invitationPref === 'both') && !phone) {
      setHint('phone', 'Please provide a phone number.');
      ok = false;
    }

    if ((invitationPref === 'email' || invitationPref === 'both') && !email) {
      setHint('email', 'Please provide an email address.');
      ok = false;
    }

    const plusOne = (data.get('bringing_plus_one') || '').toString();
    if (plusOne === 'yes') {
      const plusOneName = (data.get('plus_one_name') || '').toString().trim();
      if (!plusOneName) {
        setHint('plus_one_name', 'Please provide your plus one name.');
        ok = false;
      }
    }

    const extraGuests = (data.get('additional_guests') || '').toString();
    if (!extraGuests) {
      setHint('additional_guests', 'Please select yes or no.');
      ok = false;
    }
    if (extraGuests === 'yes') {
      const n = Number((data.get('additional_guests_count') || '').toString());
      if (!Number.isFinite(n) || n < 1) {
        setHint('additional_guests_count', 'Please enter how many additional guests you need.');
        ok = false;
      }
    }

    return ok;
  };

  const RSVP_STORAGE_KEY = 'wedding_save_the_date_submissions_v1';

  const storeSubmission = (payload) => {
    try {
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        list.push(payload);
        window.localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore storage failures
    }
  };

  const submissionPayloadFromFormData = (data) => {
    const v = (k) => (data.get(k) || '').toString().trim();
    return {
      submitted_at: new Date().toISOString(),
      attending: v('attending'),
      name: v('name'),
      bringing_plus_one: v('bringing_plus_one'),
      plus_one_name: v('plus_one_name'),
      phone: v('phone'),
      email: v('email'),
      invitation_preference: v('invitation_preference'),
      additional_guests: v('additional_guests'),
      additional_guests_count: v('additional_guests_count'),
      accommodations: v('accommodations'),
    };
  };

  const submitToGoogle = async (payload) => {
    // This site is static (GitHub Pages). Writing to a Google Sheet requires either:
    // 1) a Google Form "formResponse" endpoint, or
    // 2) a Google Apps Script Web App endpoint.
    //
    // To enable submission, set one of these (and implement mapping where needed):
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyieWDvZCfcmwhsTiwP1FgIFAdNLk0RUYz2jgsPNxiwZwOYAbC-J2B98mWHKxJf8A/exec';

    if (!GOOGLE_APPS_SCRIPT_WEB_APP_URL) {
      return { ok: false, reason: 'not_configured' };
    }

    const qs = new URLSearchParams(payload).toString();
    const url = `${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?${qs}`;
    const res = await fetch(url, { method: 'GET', mode: 'no-cors' });

    // With no-cors, we can’t read the response, so assume success if no network error
    return { ok: true };
  };

  if (form instanceof HTMLFormElement) {
    syncConditionals();
    attending?.addEventListener('change', syncConditionals);
    bringingPlusOne?.addEventListener('change', syncConditionals);
    additionalGuests?.addEventListener('change', syncConditionals);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      if (!validate(data)) return;

      const payload = submissionPayloadFromFormData(data);
      storeSubmission(payload);

      setStatus('Sending...');

      submitToGoogle(payload)
        .then((result) => {
          if (result.ok) {
            setStatus('Thank you! Your response was submitted.');
            form.reset();
            syncConditionals();
            return;
          }

          setStatus('Thank you! Your response was saved on this device, but Google sync is not yet configured.');
        })
        .catch(() => {
          setStatus('Thank you! Your response was saved on this device, but we could not reach the submission endpoint.');
        });
    });
  }
})();
