(() => {
  const loginForm = document.getElementById('login-form');
  const codeInput = document.getElementById('code');
  const loginError = document.getElementById('login-error');
  
  const setHint = (name, msg) => {
    const el = document.querySelector(`[data-hint-for="${name}"]`);
    if (el) el.textContent = msg;
  };
  
  const showError = (show) => {
    if (loginError) {
      loginError.classList.toggle('hidden', !show);
    }
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    const code = (codeInput?.value || '').toString().trim();
    
    if (!code) {
      setHint('code', 'Please enter your code');
      codeInput?.focus();
      return;
    }
    
    // Validate code exists in guest data
    if (typeof isValidCode === 'function' && isValidCode(code)) {
      // Store code in session storage for the guest page
      sessionStorage.setItem('wedding_code', code);
      // Redirect to guest page
      window.location.href = 'guest.html';
    } else {
      setHint('code', 'Code not found');
      showError(true);
    }
  };
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    
    // Clear error when user starts typing
    codeInput?.addEventListener('input', () => {
      setHint('code', '');
      showError(false);
    });
  }
})();
