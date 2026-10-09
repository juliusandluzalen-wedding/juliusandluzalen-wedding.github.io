// Wedding Invitation Interactive Script

class WeddingInvitation {
    constructor() {
        this.init();
    }

    init() {
        this.setupEnvelopeInteraction();
        this.setupRSVPHandlers();
        this.setupAnimations();
        this.setupScrollEffects();
        this.setupPrintHandlers();
    }

    // Envelope Seal Interaction
    setupEnvelopeInteraction() {
        const envelopeFlap = document.getElementById('envelopeFlap');
        const envelopeBody = document.querySelector('.envelope-body');
        const seal = document.querySelector('.seal-content');
        
        if (envelopeFlap && envelopeBody && seal) {
            let isOpen = false;

            const openEnvelope = () => {
                if (!isOpen) {
                    envelopeFlap.classList.add('open');
                    envelopeBody.classList.add('revealed');
                    seal.style.transform = 'translateX(-50%) scale(0.8)';
                    seal.style.opacity = '0.7';
                    isOpen = true;
                    
                    // Trigger animations for content
                    this.animateContent();
                    
                    // Add confetti effect
                    this.createConfetti();
                }
            };

            // Click to open envelope
            seal.addEventListener('click', openEnvelope);
            envelopeFlap.addEventListener('click', openEnvelope);

            // Hover effect on seal
            seal.addEventListener('mouseenter', () => {
                if (!isOpen) {
                    seal.style.transform = 'translateX(-50%) scale(1.1)';
                }
            });

            seal.addEventListener('mouseleave', () => {
                if (!isOpen) {
                    seal.style.transform = 'translateX(-50%) scale(1)';
                }
            });
        }
    }

    // Animate content after envelope opens
    animateContent() {
        const elements = document.querySelectorAll('.together-with, .names-section, .save-the-date-text, .formal-invitation, .rsvp-button');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 200 + (index * 150));
        });
    }

    // RSVP Handlers
    setupRSVPHandlers() {
        const rsvpButtons = document.querySelectorAll('.rsvp-button');
        
        rsvpButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const response = button.classList.contains('accept') ? 'accept' : 'decline';
                this.handleRSVP(response);
            });
        });
    }

    handleRSVP(response) {
        // Create modal for RSVP details
        const modal = this.createRSVPModal(response);
        document.body.appendChild(modal);
        
        // Animate modal appearance
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
        
        // Handle form submission
        this.setupRSVPForm(modal, response);
    }

    createRSVPModal(response) {
        const modal = document.createElement('div');
        modal.className = 'rsvp-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-header">
                    <h2>${response === 'accept' ? 'Accepts with Pleasure' : 'Declines with Regret'}</h2>
                </div>
                <div class="modal-body">
                    <form class="rsvp-form">
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone">
                        </div>
                        <div class="form-group">
                            <label for="guests">Number of Guests</label>
                            <select id="guests" name="guests" ${response === 'decline' ? 'disabled' : ''}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="message">Special Message (Optional)</label>
                            <textarea id="message" name="message" rows="3"></textarea>
                        </div>
                        <button type="submit" class="submit-btn">Send RSVP</button>
                    </form>
                </div>
            </div>
        `;
        
        // Add modal styles
        this.addModalStyles();
        
        return modal;
    }

    setupRSVPForm(modal, response) {
        const form = modal.querySelector('.rsvp-form');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRSVP(form, response);
        });
    }

    submitRSVP(form, response) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('RSVP Data:', { ...data, response });
        
        // Show success message
        this.showSuccessMessage(response);
        
        // Close modal
        const modal = document.querySelector('.rsvp-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    }

    showSuccessMessage(response) {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div class="success-content">
                <h3>Thank You!</h3>
                <p>Your RSVP has been received. We look forward to ${response === 'accept' ? 'celebrating with you' : 'seeing you soon'}.</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 4000);
    }

    // Animations
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.invitation-content > div, .wedding-details, .rsvp-section');
        animateElements.forEach(el => observer.observe(el));
    }

    // Scroll Effects
    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            
            // Add parallax effect to decorative elements
            this.applyParallax(currentScrollY);
            
            lastScrollY = currentScrollY;
        });
    }

    applyParallax(scrollY) {
        const parallaxElements = document.querySelectorAll('.decorative-border, .monogram');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    // Confetti Effect
    createConfetti() {
        const colors = ['#c8bf9b', '#bba06c', '#f2f1eb', '#3c3333'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (document.body.contains(confetti)) {
                        document.body.removeChild(confetti);
                    }
                }, 4000);
            }, i * 50);
        }
        
        this.addConfettiStyles();
    }

    // Print Handlers
    setupPrintHandlers() {
        window.addEventListener('beforeprint', () => {
            // Ensure envelope is open for printing
            const envelopeFlap = document.getElementById('envelopeFlap');
            const envelopeBody = document.querySelector('.envelope-body');
            
            if (envelopeFlap && envelopeBody) {
                envelopeFlap.classList.add('open');
                envelopeBody.classList.add('revealed');
            }
        });
    }

    // Modal Styles
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .rsvp-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .rsvp-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
            }
            
            .modal-content {
                position: relative;
                background: white;
                max-width: 500px;
                margin: 50px auto;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: translateY(50px);
                transition: transform 0.3s ease;
            }
            
            .rsvp-modal.show .modal-content {
                transform: translateY(0);
            }
            
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .modal-header h2 {
                font-family: 'Playfair Display', serif;
                color: var(--primary-gold);
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
                color: var(--dark-brown);
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--primary-gold);
                border-radius: 4px;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
            }
            
            .submit-btn {
                background: var(--primary-gold);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Tenor Sans', serif;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: background 0.3s ease;
            }
            
            .submit-btn:hover {
                background: var(--dark-gold);
            }
            
            .success-message {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-gold);
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                z-index: 1001;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            
            .success-message.show {
                opacity: 1;
                transform: translateX(0);
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Confetti Styles
    addConfettiStyles() {
        if (document.getElementById('confetti-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'confetti-styles';
        styles.textContent = `
            .confetti-piece {
                position: fixed;
                width: 8px;
                height: 8px;
                top: -10px;
                z-index: 999;
                animation: confetti-fall linear;
                border-radius: 50%;
            }
            
            @keyframes confetti-fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize the wedding invitation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeddingInvitation();
});

// Global RSVP handler for HTML onclick attributes
function handleRSVP(response) {
    const invitation = new WeddingInvitation();
    invitation.handleRSVP(response);
}
