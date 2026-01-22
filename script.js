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
  const acceptBtn = document.getElementById('accept-btn');
  const declineBtn = document.getElementById('decline-btn');
  const miniBox = document.querySelector('.mini-box');
  const fullForm = document.getElementById('full-form');

  // Handle accept/decline button clicks
  acceptBtn?.addEventListener('click', () => {
    attending.value = 'yes';
    // Copy name from mini box to full form
    const miniNameInput = miniBox.querySelector('#name');
    const fullNameInput = fullForm.querySelector('#name');
    if (miniNameInput && fullNameInput) {
      fullNameInput.value = miniNameInput.value;
    }
    miniBox.style.display = 'none';
    fullForm.classList.remove('hidden');
    syncConditionals();
  });

  declineBtn?.addEventListener('click', () => {
    attending.value = 'no';
    // Copy name from mini box to full form
    const miniNameInput = miniBox.querySelector('#name');
    const fullNameInput = fullForm.querySelector('#name');
    if (miniNameInput && fullNameInput) {
      fullNameInput.value = miniNameInput.value;
    }
    miniBox.style.display = 'none';
    fullForm.classList.remove('hidden');
    syncConditionals();
  });

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

    if (invitationPref === 'phone' && !phone) {
      setHint('phone', 'Please provide a phone number.');
      ok = false;
    }

    if (invitationPref === 'email' && !email) {
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

    return ok;
  };

  const RSVP_STORAGE_KEY = 'wedding_save_the_date_submissions_v1';
  const RSVP_INDEX_KEY = 'wedding_save_the_date_index_v1';

  const buildIndex = () => {
    try {
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const index = {};
      list.forEach((entry) => {
        if (entry.email) index[entry.email.toLowerCase()] = entry;
        if (entry.phone) index[entry.phone.replace(/\D/g, '')] = entry;
      });
      window.localStorage.setItem(RSVP_INDEX_KEY, JSON.stringify(index));
      return index;
    } catch {
      return {};
    }
  };

  const getIndex = () => {
    try {
      const raw = window.localStorage.getItem(RSVP_INDEX_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const findExistingSubmission = (email, phone) => {
    const index = getIndex();
    const key = email ? email.toLowerCase() : phone.replace(/\D/g, '');
    return index[key] || null;
  };

  const showUpdatePrompt = (existing) => {
    const formEl = document.getElementById('save-the-date-response-form');
    const statusEl = document.getElementById('save-the-date-status');
    if (!formEl || !statusEl) return;

    const attendingYes = existing.attending === 'yes';
    const currentStatusText = attendingYes
      ? 'You previously responded that you can attend.'
      : 'You previously responded that you cannot attend.';

    formEl.style.display = 'none';
    statusEl.innerHTML = `
      <div style="text-align:center;">
        <p>${currentStatusText}</p>
        <p>Do you want to update your response?</p>
        <button class="button" style="margin-top:12px;" id="update-response-btn">Update Response</button>
      </div>
    `;

    const updateBtn = document.getElementById('update-response-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        statusEl.innerHTML = '';
        formEl.style.display = '';
        formEl.attending.value = existing.attending;
        formEl.name.value = existing.name || '';
        formEl.email.value = existing.email || '';
        formEl.phone.value = existing.phone || '';
        formEl.invitation_preference.value = existing.invitation_preference || '';
        formEl.bringing_plus_one.value = existing.bringing_plus_one || '';
        formEl.plus_one_name.value = existing.plus_one_name || '';
        syncConditionals();
      });
    }
  };

  const storeSubmission = (payload) => {
    try {
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        list.push(payload);
        window.localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(list));
        buildIndex();
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
      email: v('email'),
      phone: v('phone'),
      invitation_preference: v('invitation_preference'),
      bringing_plus_one: v('bringing_plus_one'),
      plus_one_name: v('plus_one_name'),
    };
  };

  const submitToGoogle = (payload) => {
    // This site is static (GitHub Pages). Writing to a Google Sheet requires either:
    // 1) a Google Form "formResponse" endpoint, or
    // 2) a Google Apps Script Web App endpoint.
    //
    // To enable submission, set one of these (and implement mapping where needed):
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyfxTDPai30EsgkV8AMiPruFb_RKD2YN4RVgwPrZuA5beg_hbs1gv6iJI976KTvRk9-/exec';

    if (!GOOGLE_APPS_SCRIPT_WEB_APP_URL) {
      return Promise.resolve({ ok: false, reason: 'not_configured' });
    }

    const qs = new URLSearchParams(payload).toString();
    const url = `${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?callback=cb_${Date.now()}&${qs}`;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      const callbackName = `cb_${Date.now()}`;
      window[callbackName] = (data) => {
        document.head.removeChild(script);
        delete window[callbackName];
        resolve({ ok: true });
      };
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        resolve({ ok: false, reason: 'network_error' });
      };
      script.src = url;
      document.head.appendChild(script);
    });
  };

  if (form instanceof HTMLFormElement) {
    syncConditionals();
    attending?.addEventListener('change', syncConditionals);
    bringingPlusOne?.addEventListener('change', syncConditionals);
    additionalGuests?.addEventListener('change', syncConditionals);

    // Check for existing submission on load
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const checkExisting = () => {
      const email = (emailInput?.value || '').toString().trim();
      const phone = (phoneInput?.value || '').toString().trim();
      if (email || phone) {
        const existing = findExistingSubmission(email, phone);
        if (existing) {
          showUpdatePrompt(existing);
        }
      }
    };

    emailInput?.addEventListener('blur', checkExisting);
    phoneInput?.addEventListener('blur', checkExisting);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      if (!validate(data)) return;

      const payload = submissionPayloadFromFormData(data);
      storeSubmission(payload);

      setStatus('Sending...');

      submitToGoogle(payload)
        .then((result) => {
          const attending = payload.attending;
          if (attending === 'yes') {
            setStatus('Thank you for responding to our save-the-date — we’re looking forward to celebrating with you!');
          } else {
            setStatus('Thank you so much for letting us know. We appreciate you responding to our save-the-date and will miss celebrating with you.');
          }
          form.reset();
          syncConditionals();
        })
        .catch(() => {
          const attending = payload.attending;
          if (attending === 'yes') {
            setStatus('Thank you for responding to our save-the-date — we’re looking forward to celebrating with you!');
          } else {
            setStatus('Thank you so much for letting us know. We appreciate you responding to our save-the-date and will miss celebrating with you.');
          }
          form.reset();
          syncConditionals();
        });
    });
  }
})();
