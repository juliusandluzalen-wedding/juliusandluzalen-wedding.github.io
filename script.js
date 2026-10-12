let guestData = null;
let guestCode = null;

const REFERENCE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEf9X4iekno5UHhVS4EHkd6ou6Dmbz5vp7T-sjRk5xqKRooSU9HxpYuVfKytwEhntx/exec';
const RESPONSE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyKD97SlLHUxVHmouskm9xoN24uGBT2Qvm2TSS6UIelD3l6ofBEfuk0IxuFlFXcld5Y/exec';

console.log('Script loaded, pathname:', window.location.pathname);

// Check if we're on the details page
if (window.location.pathname.includes('details.html')) {
    console.log('On details page, loading guest data');
    loadGuestData();
} else {
    console.log('On index page, initializing code form');
    initializeCodeForm();
}

async function loadGuestData() {
    guestCode = localStorage.getItem('weddingCode');
    console.log('Guest code from localStorage:', guestCode);

    if (!guestCode) {
        console.log('No guest code, redirecting to index');
        window.location.href = 'index.html';
        return;
    }

    try {
        const storedGuestData = localStorage.getItem('guestData');
        if (storedGuestData) {
            guestData = JSON.parse(storedGuestData);
        } else {
            console.log('No guest data in localStorage, redirecting to index');
            window.location.href = 'index.html';
            return;
        }

        console.log('Guest data:', guestData);

        if (!guestData) {
            console.log('Invalid guest code, redirecting to index');
            window.location.href = 'index.html';
            return;
        }

        const firstName = guestData.name.split(' ')[0];
        const guestNameElement = document.getElementById('guestName');
        if (guestNameElement) {
            guestNameElement.textContent = `Hello, ${firstName}!`;
        } else {
            console.error('guestName element not found');
        }

        // Start countdown
        startCountdown();

        // Smooth scroll for navigation
        initSmoothScroll();

        // Check if already submitted RSVP
        const rsvpSubmitted = localStorage.getItem(`rsvpSubmitted_${guestCode}`);
        console.log('RSVP submitted status:', rsvpSubmitted, 'for code:', guestCode);
        if (rsvpSubmitted === 'true') {
            showAlreadySubmittedMessage();
        } else {
            // Initialize RSVP form after guest data is loaded
            initializeRSVPForm();
        }
    } catch (error) {
        console.error('Error loading guest data:', error);
        window.location.href = 'index.html';
    }
}

function initializeCodeForm() {
    const codeForm = document.getElementById('codeForm');
    const codeInput = document.getElementById('codeInput');
    const errorMsg = document.getElementById('errorMsg');

    // Prevent spaces from being entered
    codeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\s/g, '');
    });

    codeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = codeInput.value.trim();

        // Check if code contains spaces
        if (/\s/.test(code)) {
            errorMsg.textContent = 'Code cannot contain spaces. Please remove any spaces.';
            codeInput.value = code.replace(/\s/g, '');
            return;
        }

        try {
            const url = `${REFERENCE_SCRIPT_URL}?action=lookup&code=${encodeURIComponent(code)}&callback=handleLookup`;
            const script = document.createElement('script');
            script.src = url;
            script.onerror = () => {
                errorMsg.textContent = 'Error validating code. Please try again.';
            };
            document.body.appendChild(script);
        } catch (error) {
            console.error('Error validating code:', error);
            errorMsg.textContent = 'Error validating code. Please try again.';
        }
    });
}

// Global callback for JSONP response
window.handleLookup = function(data) {
    console.log('Lookup response:', data);
    const errorMsg = document.getElementById('errorMsg');
    const codeInput = document.getElementById('codeInput');
    const code = codeInput.value.trim();

    if (data.status === 'success' && data.record) {
        guestData = {
            name: data.record.primary_guest,
            numGuests: data.record.max_guests,
            numChildren: data.record.max_children
        };
        localStorage.setItem('weddingCode', code);
        localStorage.setItem('guestData', JSON.stringify(guestData));
        window.location.href = 'details.html';
    } else {
        console.log('Lookup failed. Status:', data.status, 'Record:', data.record);
        errorMsg.textContent = 'Invalid code. Please check your invitation.';
        codeInput.value = '';
    }
};

function showAlreadySubmittedMessage() {
    const rsvpForm = document.getElementById('rsvpForm');
    const successMsg = document.getElementById('successMsg');

    if (rsvpForm) {
        rsvpForm.style.display = 'none';
    }

    if (successMsg) {
        successMsg.textContent = 'Thank you for filling out the form! If you need to make any changes, please email us at juliusandluzalen@gmail.com';
        successMsg.classList.remove('error');
        successMsg.classList.add('success');
        successMsg.style.display = 'block';
    }
}

function initializeRSVPForm() {
    console.log('Initializing RSVP form');
    
    const rsvpForm = document.getElementById('rsvpForm');
    const attendingSelect = document.getElementById('attending');
    const dietarySection = document.getElementById('dietarySection');
    const guestInfoMessage = document.getElementById('guestInfoMessage');
    const additionalGuestsSection = document.getElementById('additionalGuestsSection');
    const childrenSection = document.getElementById('childrenSection');
    const accommodationsSection = document.getElementById('accommodationsSection');
    const summarySection = document.getElementById('summarySection');
    const summaryContent = document.getElementById('summaryContent');
    const confirmBtn = document.getElementById('confirmBtn');
    const editBtn = document.getElementById('editBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!rsvpForm || !attendingSelect) {
        console.error('Required elements not found');
        return;
    }
    
    const numAdditionalGuests = guestData.numGuests - 1;
    console.log('Number of additional guests:', numAdditionalGuests);

    attendingSelect.addEventListener('change', (e) => {
        const attending = e.target.value;
        console.log('Attending changed to:', attending);
        
        if (attending === 'yes') {
            dietarySection.classList.remove('hidden');
            
            // Show guest info message
            let message = `You may bring ${numAdditionalGuests} additional guest(s)`;
            if (guestData.numChildren > 0) {
                message += ` and ${guestData.numChildren} child(ren)`;
            }
            message += '.';
            guestInfoMessage.textContent = message;
            guestInfoMessage.classList.remove('hidden');
            
            // Show additional guests section
            if (numAdditionalGuests > 0) {
                renderAdditionalGuestsFields(numAdditionalGuests);
                additionalGuestsSection.classList.remove('hidden');
            }
            
            // Show children section
            if (guestData.numChildren > 0) {
                renderChildrenFields(guestData.numChildren);
                childrenSection.classList.remove('hidden');
            }
            
            // Show accommodations section
            accommodationsSection.classList.remove('hidden');
            
            // Remove existing review button if any
            const existingReviewBtn = document.getElementById('reviewBtn');
            if (existingReviewBtn) {
                existingReviewBtn.remove();
            }
            
            // Show review button after accommodations
            const reviewBtn = document.createElement('button');
            reviewBtn.type = 'button';
            reviewBtn.textContent = 'Review RSVP';
            reviewBtn.id = 'reviewBtn';
            reviewBtn.className = 'review-btn';
            accommodationsSection.appendChild(reviewBtn);
            
            reviewBtn.addEventListener('click', () => {
                showSummary();
                // Hide form sections
                dietarySection.classList.add('hidden');
                guestInfoMessage.classList.add('hidden');
                additionalGuestsSection.classList.add('hidden');
                childrenSection.classList.add('hidden');
                accommodationsSection.classList.add('hidden');
                reviewBtn.style.display = 'none';
                // Show summary
                summarySection.classList.remove('hidden');
            });
        } else {
            dietarySection.classList.add('hidden');
            guestInfoMessage.classList.add('hidden');
            additionalGuestsSection.classList.add('hidden');
            childrenSection.classList.add('hidden');
            accommodationsSection.classList.add('hidden');
        }
    });

    // Confirm button - submit to Google Sheet
    confirmBtn.addEventListener('click', async () => {
        const rsvpData = collectRSVPData();
        console.log('Collected RSVP data:', rsvpData);
        const success = await submitToGoogleSheet(rsvpData);
        console.log('Submission success:', success);

        const successMsg = document.getElementById('successMsg');
        console.log('Success message element:', successMsg);

        if (success) {
            successMsg.textContent =
                'Thank you for your RSVP! We look forward to celebrating with you. If you need to change your RSVP, please email us at juliusandluzalen@gmail.com';
            successMsg.classList.remove('error');
            successMsg.classList.add('success');
            successMsg.style.display = 'block';
            rsvpForm.style.display = 'none';
            summarySection.classList.add('hidden');
        } else {
            successMsg.textContent =
                'Error submitting RSVP. Please try again or email us at juliusandluzalen@gmail.com';
            successMsg.classList.remove('success');
            successMsg.classList.add('error');
            successMsg.style.display = 'block';
        }
    });

    // Edit button - go back to form
    editBtn.addEventListener('click', () => {
        summarySection.classList.add('hidden');
        dietarySection.classList.remove('hidden');
        guestInfoMessage.classList.remove('hidden');
        additionalGuestsSection.classList.remove('hidden');
        childrenSection.classList.remove('hidden');
        accommodationsSection.classList.remove('hidden');
        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) reviewBtn.style.display = 'block';
    });

    // Submit handler for "No" responses
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const attending = attendingSelect.value;

        if (attending === 'no') {
            const rsvpData = {
                code: guestCode,
                guestName: guestData.name,
                attending: 'no',
                dietaryRestrictions: '',
                accommodations: 'None',
                additionalGuests: [],
                children: []
            };
            const success = await submitToGoogleSheet(rsvpData);

            if (success) {
                document.getElementById('successMsg').textContent =
                    'Thank you for your response. We will miss you! If you need to change your RSVP, please email us at juliusandluzalen@gmail.com';
                rsvpForm.style.display = 'none';
            } else {
                document.getElementById('successMsg').textContent =
                    'Error submitting RSVP. Please try again or email us at juliusandluzalen@gmail.com';
                document.getElementById('successMsg').classList.remove('success');
                document.getElementById('successMsg').classList.add('error');
            }
        }
    });
}

function collectRSVPData() {
    const numAdditionalGuests = guestData.numGuests - 1;

    const rsvpData = {
        code: guestCode,
        guestName: guestData.name,
        attending: document.getElementById('attending').value,
        dietaryRestrictions: document.getElementById('dietaryRestrictions').value,
        accommodations: document.getElementById('accommodations').value,
        additionalGuests: [],
        children: []
    };

    if (numAdditionalGuests > 0) {
        for (let i = 0; i < numAdditionalGuests; i++) {
            rsvpData.additionalGuests.push({
                name: document.getElementById(`guestName${i}`).value,
                dietaryRestrictions: document.getElementById(`guestDietary${i}`).value
            });
        }
    }

    if (guestData.numChildren > 0) {
        for (let i = 0; i < guestData.numChildren; i++) {
            rsvpData.children.push({
                name: document.getElementById(`childName${i}`).value,
                age: document.getElementById(`childAge${i}`).value,
                dietaryRestrictions: document.getElementById(`childDietary${i}`).value
            });
        }
    }

    return rsvpData;
}

function showSummary() {
    const summaryContent = document.getElementById('summaryContent');
    const rsvpData = collectRSVPData();

    const firstName = guestData.name.split(' ')[0];
    const dietary = rsvpData.dietaryRestrictions || 'None';
    const accommodations = rsvpData.accommodations || 'None';
    const numAdditionalGuests = guestData.numGuests - 1;

    let summary = `<p><strong>Main Guest:</strong> ${firstName}</p>`;
    summary += `<p><strong>Dietary Restrictions:</strong> ${dietary}</p>`;

    if (numAdditionalGuests > 0) {
        summary += `<p><strong>Additional Guests:</strong> ${numAdditionalGuests}</p>`;
        for (let i = 0; i < numAdditionalGuests; i++) {
            const name = rsvpData.additionalGuests[i].name;
            const guestDietary = rsvpData.additionalGuests[i].dietaryRestrictions || 'None';
            summary += `<p>&nbsp;&nbsp;• ${name} - Dietary: ${guestDietary}</p>`;
        }
    }

    if (guestData.numChildren > 0) {
        summary += `<p><strong>Children:</strong> ${guestData.numChildren}</p>`;
        for (let i = 0; i < guestData.numChildren; i++) {
            const name = rsvpData.children[i].name;
            const age = rsvpData.children[i].age;
            const childDietary = rsvpData.children[i].dietaryRestrictions || 'None';
            summary += `<p>&nbsp;&nbsp;• ${name}, Age ${age} - Dietary: ${childDietary}</p>`;
        }
    }

    summary += `<p><strong>Special Accommodations:</strong> ${accommodations}</p>`;

    summaryContent.innerHTML = summary;
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function renderAdditionalGuestsFields(count) {
    const container = document.getElementById('additionalGuestsContainer');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const guestDiv = document.createElement('div');
        guestDiv.className = 'guest-entry';
        guestDiv.innerHTML = `
            <div class="form-group">
                <label>Additional Guest ${i + 1} Name</label>
                <input type="text" id="guestName${i}" placeholder="Name">
            </div>
            <div class="form-group">
                <label>Do they have any food allergies or dietary restrictions?</label>
                <input type="text" id="guestDietary${i}" placeholder="e.g., vegetarian, gluten-free, allergies">
            </div>
        `;
        container.appendChild(guestDiv);
    }
}

function renderChildrenFields(count) {
    const container = document.getElementById('childrenContainer');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const childDiv = document.createElement('div');
        childDiv.className = 'child-entry';
        childDiv.innerHTML = `
            <div class="form-group">
                <label>Child ${i + 1} Name</label>
                <input type="text" id="childName${i}" placeholder="Name" required>
            </div>
            <div class="form-group">
                <label>Child ${i + 1} Age</label>
                <input type="number" id="childAge${i}" placeholder="Age" min="0" max="18" required oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            </div>
            <div class="form-group">
                <label>Do they have any food allergies or dietary restrictions?</label>
                <input type="text" id="childDietary${i}" placeholder="e.g., vegetarian, gluten-free, allergies">
            </div>
        `;
        container.appendChild(childDiv);
    }
}

async function submitToGoogleSheet(data) {
    try {
        // Convert to form data
        const formData = new FormData();
        formData.append('code', data.code);
        formData.append('guestName', data.guestName);
        formData.append('attending', data.attending);
        formData.append('dietaryRestrictions', data.dietaryRestrictions);
        formData.append('accommodations', data.accommodations || 'None');
        formData.append('additionalGuests', JSON.stringify(data.additionalGuests));
        formData.append('children', JSON.stringify(data.children));
        formData.append('submissionId', Date.now().toString());

        console.log('Submitting RSVP data:', data);

        const response = await fetch(RESPONSE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        console.log('Data submitted to Google Sheet');

        // Mark as submitted in localStorage
        localStorage.setItem(`rsvpSubmitted_${data.code}`, 'true');
        console.log('Set RSVP submitted flag for:', data.code);
        return true;
    } catch (error) {
        console.error('Error submitting to Google Sheet:', error);
        return false;
    }
}

function startCountdown() {
    const weddingDate = new Date('December 24, 2026 12:00:00').getTime();
    const countdownElement = document.getElementById('countdown');
    
    if (!countdownElement) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        if (distance < 0) {
            countdownElement.textContent = 'WEDDING DAY!';
        } else {
            countdownElement.textContent = `${days} DAYS TO GO!`;
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}
