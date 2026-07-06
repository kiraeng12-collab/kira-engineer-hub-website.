(function(){
  const forms = document.querySelectorAll('[data-enhanced-form]');
  forms.forEach((form) => {
    const status = form.querySelector('[data-form-status]') || form.parentElement.querySelector('[data-form-status]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (status) status.textContent = 'Sending...';
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try {
        const body = new URLSearchParams(new FormData(form));
        const response = await fetch(form.action, {
          method: 'POST',
          body,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'The request could not be sent. Please contact KE@kiraengineerhub.com.');
        form.reset();
        if (status) status.textContent = 'Request received. Reference: ' + data.reference;
      } catch (error) {
        if (status) status.textContent = error.message || 'The request could not be sent. Please contact KE@kiraengineerhub.com.';
      } finally {
        if (button) button.disabled = false;
      }
    });
  });
})();
