/**
 * RCR Groups - Main Interactive Script
 * Handles catalog filters, checkout modal, FAQ accordion, mobile menu, and Razorpay flow
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = mobileToggle.querySelector('span');
      if (icon) {
        icon.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
      }
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other items
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Template Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const templateCards = document.querySelectorAll('.template-card');

  if (filterBtns.length > 0 && templateCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        templateCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Modals (Checkout & Preview)
  const checkoutModal = document.getElementById('checkoutModal');
  const previewModal = document.getElementById('previewModal');

  window.openCheckout = function(title, price, id) {
    if (!checkoutModal) return;
    document.getElementById('checkoutItemTitle').textContent = title;
    document.getElementById('checkoutItemPrice').textContent = '₹' + price;
    document.getElementById('checkoutTotal').textContent = '₹' + price;
    document.getElementById('checkoutItemId').value = id || 'tpl-default';
    checkoutModal.classList.add('active');
  };

  window.closeCheckout = function() {
    if (checkoutModal) checkoutModal.classList.remove('active');
  };

  window.openPreview = function(title, previewUrl, desc) {
    if (!previewModal) return;
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewDesc').textContent = desc || 'Interactive responsive preview for ' + title;
    const frame = document.getElementById('previewFrame');
    if (frame && previewUrl) {
      frame.src = previewUrl;
    }
    previewModal.classList.add('active');
  };

  window.closePreview = function() {
    if (previewModal) {
      previewModal.classList.remove('active');
      const frame = document.getElementById('previewFrame');
      if (frame) frame.src = 'about:blank';
    }
  };

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (checkoutModal && e.target === checkoutModal) closeCheckout();
    if (previewModal && e.target === previewModal) closePreview();
  });

  // Initialize Cashfree SDK in production mode
  function getCashfreeInstance() {
    if (typeof window.Cashfree !== 'undefined') {
      try {
        return window.Cashfree({ mode: "production" });
      } catch (e) {
        console.error("Cashfree initialization error:", e);
      }
    }
    return null;
  }

  // Handle Checkout Form Submission (Cashfree Payment Gateway)
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Proceed to Pay';

      const name = document.getElementById('custName').value.trim();
      const email = document.getElementById('custEmail').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const itemTitle = document.getElementById('checkoutItemTitle').textContent.trim();
      const amountText = document.getElementById('checkoutItemPrice').textContent;
      const itemIdInput = document.getElementById('checkoutItemId');
      const templateId = itemIdInput ? itemIdInput.value : 'tpl-default';

      if (!name || !email || !phone) {
        showToast('Please fill all required details to proceed to Cashfree.', 'warning');
        return;
      }

      // Parse numerical price
      const numericAmount = parseFloat(amountText.replace(/[^0-9.]/g, ''));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        showToast('Invalid template price.', 'warning');
        return;
      }

      // Show processing state on button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round"></circle>
          </svg>
          Connecting to Cashfree Gateway...
        `;
      }

      try {
        showToast('Creating secure order with Cashfree...', 'info');

        const response = await fetch('api/create-order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            template_id: templateId,
            template_title: itemTitle,
            amount: numericAmount
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.payment_session_id) {
          throw new Error(data.message || 'Failed to initiate Cashfree payment session.');
        }

        // Get Cashfree SDK instance
        let cf = getCashfreeInstance();
        if (!cf) {
          // Wait briefly in case SDK is still initializing
          await new Promise(resolve => setTimeout(resolve, 600));
          cf = getCashfreeInstance();
        }

        if (cf) {
          showToast('Opening Cashfree Secure Checkout...');
          closeCheckout();
          // Launch Cashfree Dropin / Redirection
          cf.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
          });
        } else {
          throw new Error('Cashfree Payment SDK not loaded. Please disable any script blockers and reload the page.');
        }
      } catch (err) {
        console.error('Payment Error:', err);
        showToast(err.message || 'Payment initiation failed. Please try again.', 'warning');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // Handle Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to RCR Groups support team. We will get back to you within 24 hours.');
      contactForm.reset();
    });
  }
});

// Toast notification helper
function showToast(message, type = 'success') {
  let toast = document.getElementById('toastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMsg';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #10b981;">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}
