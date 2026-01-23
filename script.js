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
    // Validate name before proceeding
    const miniNameInput = miniBox.querySelector('#name');
    const name = (miniNameInput?.value || '').toString().trim();
    
    if (!name) {
      setHint('name', 'Please enter your name');
      miniNameInput?.focus();
      return;
    }
    
    attending.value = 'yes';
    // Copy name from mini box to full form
    const fullNameInput = fullForm.querySelector('#name');
    if (miniNameInput && fullNameInput) {
      fullNameInput.value = miniNameInput.value;
    }
    miniBox.style.display = 'none';
    fullForm.classList.remove('hidden');
    syncConditionals();
  });

  declineBtn?.addEventListener('click', () => {
    // Validate name before proceeding
    const miniNameInput = miniBox.querySelector('#name');
    const name = (miniNameInput?.value || '').toString().trim();
    
    if (!name) {
      setHint('name', 'Please enter your name');
      miniNameInput?.focus();
      return;
    }
    
    attending.value = 'no';
    
    // Create submission payload for declining guest
    const payload = {
      attending: 'no',
      name: name,
      email: '',
      phone: '',
      invitation_preference: '',
      bringing_plus_one: '',
      plus_one_name: '',
      additional_guests: '',
      timestamp: new Date().toISOString()
    };
    
    // Store submission locally
    storeSubmission(payload);
    
    // Submit to Google
    setStatus('Submitting...');
    submitToGoogle(payload)
      .then(() => {
        setStatus('Thank you so much for letting us know. We appreciate you responding to our save-the-date and will miss celebrating with you.');
        // Show thank you message for declining guests in the mini-box
        miniBox.innerHTML = '<p style="font-size: 16px; font-family: Alegreya, serif; color: #333; text-align: center; padding: 20px;">Thank you for letting us know. You\'ll be missed, but we\'re grateful for your warm wishes and support from afar.</p>';
      })
      .catch(() => {
        setStatus('Thank you so much for letting us know. We appreciate you responding to our save-the-date and will miss celebrating with you.');
        // Show thank you message for declining guests in the mini-box
        miniBox.innerHTML = '<p style="font-size: 16px; font-family: Alegreya, serif; color: #333; text-align: center; padding: 20px;">Thank you for letting us know. You\'ll be missed, but we\'re grateful for your warm wishes and support from afar.</p>';
      });
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

    if (invitationPref === 'text' && !phone) {
      setHint('phone', 'Please provide a phone number.');
      ok = false;
    } else if (invitationPref === 'text' && phone) {
      // Validate phone format (numbers only, basic format)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        setHint('phone', 'Please enter a valid phone number (numbers only).');
        ok = false;
      } else if (phone.replace(/\D/g, '').length < 10) {
        setHint('phone', 'Please enter a valid phone number (at least 10 digits).');
        ok = false;
      }
    }

    if (invitationPref === 'email' && !email) {
      setHint('email', 'Please provide an email address.');
      ok = false;
    } else if (invitationPref === 'email' && email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setHint('email', 'Please enter a valid email address.');
        ok = false;
      }
    }

    if (invitationPref === 'both') {
      // Validate both phone and email for "Both" option
      if (!phone) {
        setHint('phone', 'Please provide a phone number.');
        ok = false;
      } else {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone)) {
          setHint('phone', 'Please enter a valid phone number (numbers only).');
          ok = false;
        } else if (phone.replace(/\D/g, '').length < 10) {
          setHint('phone', 'Please enter a valid phone number (at least 10 digits).');
          ok = false;
        }
      }

      if (!email) {
        setHint('email', 'Please provide an email address.');
        ok = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setHint('email', 'Please enter a valid email address.');
          ok = false;
        }
      }
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
    return rebuildAllIndexes();
  };

  const getIndex = () => {
    try {
      const raw = window.localStorage.getItem(RSVP_INDEX_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const getPhoneIndex = () => {
    try {
      const raw = window.localStorage.getItem('wedding_phone_index_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const getEmailIndex = () => {
    try {
      const raw = window.localStorage.getItem('wedding_email_index_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Rebuild all indexes to ensure they're properly structured
  const rebuildAllIndexes = () => {
    try {
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const index = {};
      const phoneIndex = {};
      const emailIndex = {};
      
      list.forEach((entry) => {
        // Index by name+email combination for exact matches
        if (entry.email) {
          const emailKey = `${entry.name.toLowerCase()}|${entry.email.toLowerCase()}`;
          index[emailKey] = entry;
          // Also index by email alone for partial matches
          emailIndex[entry.email.toLowerCase()] = entry;
        }
        // Index by name+phone combination for exact matches
        if (entry.phone) {
          const phoneKey = `${entry.name.toLowerCase()}|${entry.phone.replace(/\D/g, '')}`;
          index[phoneKey] = entry;
          // Also index by phone alone for partial matches
          phoneIndex[entry.phone.replace(/\D/g, '')] = entry;
        }
      });
      
      window.localStorage.setItem(RSVP_INDEX_KEY, JSON.stringify(index));
      window.localStorage.setItem('wedding_phone_index_v1', JSON.stringify(phoneIndex));
      window.localStorage.setItem('wedding_email_index_v1', JSON.stringify(emailIndex));
      return { index, phoneIndex, emailIndex };
    } catch {
      return { index: {}, phoneIndex: {}, emailIndex: {} };
    }
  };

  const showDiscrepancyWarning = (type, contactInfo) => {
    const miniBox = document.querySelector('.mini-box');
    const fullForm = document.getElementById('full-form');
    const formEl = document.getElementById('save-the-date-response-form');
    if (!miniBox) return;

    // Store original content before replacing
    const originalMiniBoxContent = miniBox.innerHTML;
    const originalFullFormContent = fullForm ? fullForm.innerHTML : '';

    const warningMessage = type === 'phone' 
      ? `This phone number (${contactInfo}) is already associated with another response. Please email juliusandluzalen@gmail.com about this discrepancy.`
      : `This email address (${contactInfo}) is already associated with another response. Please email juliusandluzalen@gmail.com about this discrepancy.`;

    const warningHTML = `
      <div style="text-align: center; padding: 20px;">
        <p style="font-size: 16px; font-family: Alegreya, serif; color: #333; margin-bottom: 24px;">${warningMessage}</p>
        <button class="button" style="margin-top: 12px;" id="continue-btn">Continue Anyway</button>
      </div>
    `;

    // Hide form and show warning
    if (formEl) formEl.style.display = 'none';
    if (fullForm) fullForm.classList.add('hidden');
    miniBox.style.display = 'block';
    miniBox.innerHTML = warningHTML;

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        // Restore the original form content
        miniBox.innerHTML = originalMiniBoxContent;
        if (fullForm) {
          fullForm.innerHTML = originalFullFormContent;
        }
        
        // Show the appropriate form section
        if (formEl) formEl.style.display = '';
        syncConditionals();
      });
    }
  };

  const findExistingSubmission = (name, email, phone) => {
    try {
      // Get all submissions and check manually
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      
      console.log('Checking for duplicates. Total submissions:', list.length);
      console.log('Looking for email:', email, 'phone:', phone);
      
      // Check if email exists (regardless of name)
      if (email) {
        const emailMatch = list.find(entry => entry.email && entry.email.toLowerCase() === email.toLowerCase());
        if (emailMatch) {
          console.log('Found email match:', emailMatch);
          return emailMatch;
        }
      }
      
      // Check if phone exists (regardless of name)
      if (phone) {
        const phoneMatch = list.find(entry => entry.phone && entry.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
        if (phoneMatch) {
          console.log('Found phone match:', phoneMatch);
          return phoneMatch;
        }
      }
      
      console.log('No matches found');
      return null;
    } catch (error) {
      console.log('Error in findExistingSubmission:', error);
      return null;
    }
  };

  const showUpdatePrompt = (existing) => {
    // Hide the form to prevent submission
    const formEl = document.getElementById('save-the-date-response-form');
    if (formEl) {
      formEl.style.display = 'none';
    }
    
    // Create a new overlay element to show the message
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    
    const messageBox = document.createElement('div');
    messageBox.style.background = 'white';
    messageBox.style.padding = '40px';
    messageBox.style.borderRadius = '16px';
    messageBox.style.textAlign = 'center';
    messageBox.style.maxWidth = '500px';
    messageBox.style.fontFamily = 'Alegreya, serif';
    messageBox.style.fontSize = '16px';
    messageBox.style.color = '#d4a574';
    messageBox.style.fontWeight = 'normal';
    messageBox.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    
    messageBox.innerHTML = 'This email or phone number seems to already be on our list! If something needs adjusting, please email us at juliusandluzalen@gmail.com and we\'ll take care of it.<br><br><button class="button" onclick="location.reload()">Start Over</button>';
    
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
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
    const nameInput = document.querySelector('#name'); // Get name from anywhere in document
    
    const checkExisting = () => {
      const name = (nameInput?.value || '').toString().trim();
      const email = (emailInput?.value || '').toString().trim();
      const phone = (phoneInput?.value || '').toString().trim();
      
      console.log('checkExisting called - name:', name, 'email:', email, 'phone:', phone);
      
      // Only check if BOTH email AND phone are entered
      if (email && phone) {
        console.log('Both email and phone present, checking for duplicates');
        const existing = findExistingSubmission(name, email, phone);
        if (existing) {
          console.log('Found existing submission, showing message');
          showUpdatePrompt(existing);
        } else {
          console.log('No existing submission found');
        }
      } else {
        console.log('Not both fields present, skipping validation');
      }
    };

    // Only check when both email and phone are entered
    emailInput?.addEventListener('blur', checkExisting);
    phoneInput?.addEventListener('blur', checkExisting);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      
      if (!validate(data)) {
        return;
      }

      const payload = submissionPayloadFromFormData(data);
      storeSubmission(payload);

      setStatus('Sending...');

      submitToGoogle(payload)
        .then((result) => {
          const attending = payload.attending;
          if (attending === 'yes') {
            // Show success message in the full form for accepting guests
            if (fullForm) {
              fullForm.innerHTML = '<p style="font-size: 16px; font-family: Alegreya, serif; color: #333; text-align: center; padding: 20px;">Joyfully accepted indeed! We\'re so excited to celebrate with you. A formal invitation with all the details will be on its way soon.</p>';
            }
          } else {
            setStatus('Thank you so much for letting us know. We appreciate you responding to our save-the-date and will miss celebrating with you.');
          }
          form.reset();
          syncConditionals();
        })
        .catch(() => {
          const attending = payload.attending;
          if (attending === 'yes') {
            // Show success message in the full form for accepting guests
            if (fullForm) {
              fullForm.innerHTML = '<p style="font-size: 16px; font-family: Alegreya, serif; color: #333; text-align: center; padding: 20px;">Joyfully accepted indeed! We\'re so excited to celebrate with you. A formal invitation with all the details will be on its way soon.</p>';
            }
          } else {
            setStatus('Thank you so much for letting us know. We appreciate you responding to our save-the-date and will miss celebrating with you.');
          }
          form.reset();
          syncConditionals();
        });
    });
  }
})();
