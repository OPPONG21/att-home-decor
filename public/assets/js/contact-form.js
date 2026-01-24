/**
 * Contact Form Handler
 * Handles quick inquiry form with validation and WhatsApp redirect
 */

(function() {
    'use strict';

    function initContactForm() {
        const form = document.getElementById('quickContactForm');
        if (!form) return;

        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const messageInput = document.getElementById('contactMessage');
        const statusEl = document.getElementById('contactFormStatus');
        const nameError = document.getElementById('name-error');
        const emailError = document.getElementById('email-error');
        const messageError = document.getElementById('message-error');

        if (!nameInput || !emailInput || !messageInput) return;

        /**
         * Validate form fields
         */
        function validateField(input, errorEl) {
            let isValid = true;
            let errorMessage = '';

            // Remove previous error styling
            input.setAttribute('aria-invalid', 'false');

            if (input.required && !input.value.trim()) {
                isValid = false;
                if (input.type === 'email') {
                    errorMessage = 'Please enter your email address';
                } else if (input.id === 'contactName') {
                    errorMessage = 'Please enter your name';
                } else if (input.id === 'contactMessage') {
                    errorMessage = 'Please enter your message';
                }
            } else if (input.type === 'email' && input.value.trim() && !input.validity.valid) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            } else if (input.id === 'contactMessage' && input.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters';
            }

            if (errorEl) {
                errorEl.textContent = errorMessage;
            }
            input.setAttribute('aria-invalid', !isValid ? 'true' : 'false');

            return isValid;
        }

        /**
         * Validate entire form
         */
        function validateForm() {
            const nameValid = validateField(nameInput, nameError);
            const emailValid = validateField(emailInput, emailError);
            const messageValid = validateField(messageInput, messageError);

            return nameValid && emailValid && messageValid;
        }

        // Real-time validation on blur
        nameInput.addEventListener('blur', () => validateField(nameInput, nameError));
        emailInput.addEventListener('blur', () => validateField(emailInput, emailError));
        messageInput.addEventListener('blur', () => validateField(messageInput, messageError));

        // Clear errors on input
        [nameInput, emailInput, messageInput].forEach(input => {
            input.addEventListener('input', () => {
                if (input.getAttribute('aria-invalid') === 'true') {
                    validateField(input, 
                        input === nameInput ? nameError : 
                        input === emailInput ? emailError : messageError
                    );
                }
            });
        });

        /**
         * Format message for WhatsApp
         */
        function formatWhatsAppMessage(name, email, message) {
            return `Hello! I'm ${name} (${email}).\n\n${message}`;
        }

        /**
         * Handle form submission
         */
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Clear previous status
            if (statusEl) {
                statusEl.textContent = '';
                statusEl.className = '';
            }

            // Validate form
            if (!validateForm()) {
                if (statusEl) {
                    statusEl.textContent = 'Please fix the errors above';
                    statusEl.style.color = 'var(--error-color, #ef4444)';
                }
                // Focus first invalid field
                if (nameInput.getAttribute('aria-invalid') === 'true') {
                    nameInput.focus();
                } else if (emailInput.getAttribute('aria-invalid') === 'true') {
                    emailInput.focus();
                } else if (messageInput.getAttribute('aria-invalid') === 'true') {
                    messageInput.focus();
                }
                return;
            }

            // Get form values
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            // Create WhatsApp URL with pre-filled message
            const whatsappMessage = encodeURIComponent(formatWhatsAppMessage(name, email, message));
            const whatsappUrl = `https://wa.me/233540460532?text=${whatsappMessage}`;

            // Show success message
            if (statusEl) {
                statusEl.textContent = 'Redirecting to WhatsApp...';
                statusEl.style.color = 'var(--success-color, #10b981)';
            }

            // Redirect to WhatsApp after brief delay
            setTimeout(() => {
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                
                // Clear form after redirect
                form.reset();
                if (statusEl) {
                    statusEl.textContent = 'Form submitted! Check your WhatsApp.';
                    statusEl.style.color = 'var(--success-color, #10b981)';
                }
            }, 500);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }
})();
