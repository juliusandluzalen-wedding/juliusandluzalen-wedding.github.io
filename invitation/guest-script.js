(() => {
  // Get code from session storage
  const code = sessionStorage.getItem('wedding_code');
  
  // Redirect to login if no code
  if (!code) {
    window.location.href = 'index.html';
    return;
  }
  
  // Get guest data
  const guest = typeof getGuestByCode === 'function' ? getGuestByCode(code) : null;
  
  if (!guest) {
    // Invalid code, redirect to login
    sessionStorage.removeItem('wedding_code');
    window.location.href = 'index.html';
    return;
  }
  
  // Populate guest information
  const guestNameEl = document.getElementById('guest-name');
  const invitationMessageEl = document.getElementById('invitation-message');
  const partyTypeTextEl = document.getElementById('party-type-text');
  
  if (guestNameEl) guestNameEl.textContent = guest.mainGuest;
  
  // Generate personalized invitation message
  const invitationMessage = `You are cordially invited to our reception celebration!`;
  if (invitationMessageEl) invitationMessageEl.textContent = invitationMessage;
  
  // Populate reception details
  const receptionTimeEl = document.getElementById('reception-time');
  const receptionVenueEl = document.getElementById('reception-venue');
  const receptionAddressEl = document.getElementById('reception-address');
  const weddingDateEl = document.getElementById('wedding-date');
  
  if (receptionTimeEl) receptionTimeEl.textContent = guest.receptionTime;
  if (receptionVenueEl) receptionVenueEl.textContent = guest.receptionVenue;
  if (receptionAddressEl) receptionAddressEl.textContent = `${guest.address}, ${guest.city}`;
  if (weddingDateEl) weddingDateEl.textContent = guest.date;
  
  // Populate party information
  const partyTypeText = `Your invitation is for ${guest.numGuests} guest${guest.numGuests > 1 ? 's' : ''}`;
  if (partyTypeTextEl) partyTypeTextEl.textContent = partyTypeText;
  
  // Setup RSVP form
  const rsvpForm = document.getElementById('rsvp-form');
  const guestCodeInput = document.getElementById('guest-code');
  const attendingSelect = document.getElementById('attending');
  const guestFormsContainer = document.getElementById('guest-forms-container');
  
  // Set guest code in form
  if (guestCodeInput) guestCodeInput.value = code;
  
  // Generate dynamic guest forms based on numGuests
  const generateGuestForms = () => {
    if (!guestFormsContainer) return;
    
    guestFormsContainer.innerHTML = '';
    
    for (let i = 0; i < guest.numGuests; i++) {
      const guestNumber = i + 1;
      const isMainGuest = i === 0;
      const guestLabel = isMainGuest ? 'Main Guest' : `Guest ${guestNumber}`;
      
      const guestFormDiv = document.createElement('div');
      guestFormDiv.className = 'guest-form-section';
      guestFormDiv.setAttribute('data-guest-index', i);
      guestFormDiv.innerHTML = `
        <div class="guest-form-header">
          <h3>${guestLabel}</h3>
        </div>
        <div class="field">
          <label for="guest_${i}_name">Full Name</label>
          <input 
            type="text" 
            id="guest_${i}_name" 
            name="guest_${i}_name" 
            placeholder="Enter full name"
            ${isMainGuest ? `value="${guest.mainGuest}" readonly` : ''}
            required
          />
          <div class="field-hint" data-hint-for="guest_${i}_name"></div>
        </div>
        <div class="field">
          <label for="guest_${i}_dietary">Dietary Restrictions</label>
          <textarea 
            id="guest_${i}_dietary" 
            name="guest_${i}_dietary" 
            rows="2" 
            placeholder="Any dietary restrictions or allergies?"
          ></textarea>
          <div class="field-hint" data-hint-for="guest_${i}_dietary"></div>
        </div>
        ${!isMainGuest ? `
        <div class="field">
          <label>
            <input type="checkbox" id="guest_${i}_is_child" name="guest_${i}_is_child" />
            Is this guest a child?
          </label>
        </div>
        <div class="field hidden" id="guest_${i}_age_container">
          <label for="guest_${i}_age">Child's Age</label>
          <input 
            type="number" 
            id="guest_${i}_age" 
            name="guest_${i}_age" 
            placeholder="Enter age"
            min="0"
            max="18"
          />
          <div class="field-hint" data-hint-for="guest_${i}_age"></div>
        </div>
        ` : ''}
      `;
      
      guestFormsContainer.appendChild(guestFormDiv);
      
      // Add event listener for child checkbox
      if (!isMainGuest) {
        const childCheckbox = guestFormDiv.querySelector(`#guest_${i}_is_child`);
        const ageContainer = guestFormDiv.querySelector(`#guest_${i}_age_container`);
        
        if (childCheckbox && ageContainer) {
          childCheckbox.addEventListener('change', (e) => {
            ageContainer.classList.toggle('hidden', !e.target.checked);
            if (!e.target.checked) {
              const ageInput = ageContainer.querySelector('input');
              if (ageInput) ageInput.value = '';
            }
          });
        }
      }
    }
  };
  
  // Generate forms initially
  generateGuestForms();
  
  // Conditional field visibility
  const setConditionalVisible = (key, show) => {
    document.querySelectorAll(`[data-conditional="${key}"]`).forEach((el) => {
      el.classList.toggle('hidden', !show);
    });
  };
  
  const syncConditionals = () => {
    const attendingVal = (attendingSelect?.value || '').toString();
    const yes = attendingVal === 'yes';
    setConditionalVisible('attending-yes', yes);
    
    // Show/hide guest forms based on attendance
    if (guestFormsContainer) {
      guestFormsContainer.style.display = yes ? 'block' : 'none';
    }
  };
  
  // Initialize conditionals
  syncConditionals();
  attendingSelect?.addEventListener('change', syncConditionals);
  
  // Form validation and submission
  const setHint = (name, msg) => {
    const el = document.querySelector(`[data-hint-for="${name}"]`);
    if (el) el.textContent = msg;
  };
  
  const setStatus = (msg) => {
    const statusEl = document.getElementById('rsvp-status');
    if (statusEl) statusEl.textContent = msg;
  };
  
  const clearHints = () => {
    document.querySelectorAll('.field-hint').forEach(el => el.textContent = '');
  };
  
  const validate = (data) => {
    let ok = true;
    clearHints();
    
    const attendingVal = (data.get('attending') || '').toString();
    if (!attendingVal) {
      setHint('attending', 'Please select yes or no');
      ok = false;
      return ok;
    }
    
    if (attendingVal !== 'yes') {
      return ok;
    }
    
    // Validate each guest form
    for (let i = 0; i < guest.numGuests; i++) {
      const guestName = (data.get(`guest_${i}_name`) || '').toString().trim();
      if (!guestName) {
        setHint(`guest_${i}_name`, 'Please enter a name');
        ok = false;
      }
      
      // If child checkbox is checked, validate age
      const isChild = data.get(`guest_${i}_is_child`) === 'on';
      if (isChild && i > 0) {
        const age = (data.get(`guest_${i}_age`) || '').toString().trim();
        if (!age) {
          setHint(`guest_${i}_age`, 'Please enter the child\'s age');
          ok = false;
        } else if (parseInt(age) < 0 || parseInt(age) > 18) {
          setHint(`guest_${i}_age`, 'Please enter a valid age (0-18)');
          ok = false;
        }
      }
    }
    
    // Validate email
    const email = (data.get('email') || '').toString().trim();
    if (!email) {
      setHint('email', 'Please provide an email address');
      ok = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setHint('email', 'Please enter a valid email address');
        ok = false;
      }
    }
    
    // Validate phone
    const phone = (data.get('phone') || '').toString().trim();
    if (!phone) {
      setHint('phone', 'Please provide a phone number');
      ok = false;
    } else {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        setHint('phone', 'Please enter a valid phone number');
        ok = false;
      } else if (phone.replace(/\D/g, '').length < 10) {
        setHint('phone', 'Please enter a valid phone number (at least 10 digits)');
        ok = false;
      }
    }
    
    return ok;
  };
  
  const RSVP_STORAGE_KEY = 'wedding_rsvp_submissions_v2';
  
  const storeRSVP = (payload) => {
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
  
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const data = new FormData(rsvpForm);
      
      if (!validate(data)) {
        return;
      }
      
      // Collect guest data
      const guests = [];
      for (let i = 0; i < guest.numGuests; i++) {
        const guestData = {
          name: (data.get(`guest_${i}_name`) || '').toString().trim(),
          dietary: (data.get(`guest_${i}_dietary`) || '').toString().trim(),
          is_child: data.get(`guest_${i}_is_child`) === 'on',
          age: data.get(`guest_${i}_age`) || null
        };
        guests.push(guestData);
      }
      
      const payload = {
        code: code,
        main_guest: guest.mainGuest,
        num_guests: guest.numGuests,
        submitted_at: new Date().toISOString(),
        attending: data.get('attending'),
        guests: guests,
        email: data.get('email') || '',
        phone: data.get('phone') || ''
      };
      
      storeRSVP(payload);
      setStatus('Thank you for your RSVP! We have received your response.');
      
      // Disable form after submission
      rsvpForm.querySelectorAll('button, input, select, textarea').forEach(el => {
        el.disabled = true;
      });
    });
  }
  
  // Mobile navigation toggle (reuse from main script)
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
})();
