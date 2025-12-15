// NEW: Get the Buy Now button and the waitlist modal elements
const buyNowBtn = document.getElementById('buy-now-btn');
const waitlistModal = document.getElementById('waitlist-modal');

// Renamed and updated: Get the waitlist form and success modal elements
const waitlistForm = document.getElementById('waitlist-form');
const successModal = document.getElementById('waitlist-success-message'); 

// Get the close buttons from both modals
const waitlistCloseBtn = waitlistModal.querySelector('.close-btn');
const successCloseBtn = successModal.querySelector('.close-btn');

// --- Modal Functions ---

// Function to show a modal
function showModal(modalElement) {
  modalElement.classList.add('active');
}

// Function to hide a modal
function hideModal(modalElement) {
  modalElement.classList.remove('active');
}

// --- Event Listeners for Opening/Closing Modals ---

// 1. Open the Waitlist Modal when "Buy now" is clicked
if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
        showModal(waitlistModal);
    });
}


// 2. Hide Modals when the close button or overlay is clicked

// Close the Waitlist Modal using its close button
if (waitlistCloseBtn) {
    waitlistCloseBtn.addEventListener('click', () => hideModal(waitlistModal));
}

// Close the Success Modal
if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => hideModal(successModal));
}


// Hide the modal when clicking the dark background overlay for both
[waitlistModal, successModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Only hide if the click is on the overlay
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }
});


// --- Waitlist Form Submission Logic ---
if (waitlistForm) {
    waitlistForm.addEventListener('submit', e => {
      
      e.preventDefault();

      const email = waitlistForm.email.value;

      // Using your existing Google Form details for Clarity
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfpZH-n9uBBIZ6au0P0MN9ZzJZg2T_Y-pczQ-Z4MWSEQjHV1w/formResponse";
      const formData = new FormData();
      formData.append("entry.2055912569", email);

      fetch(formUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors"
      }).then(() => {
        // 1. Hide the waitlist form modal
        hideModal(waitlistModal);
        
        // 2. Show the success message modal
        showModal(successModal);
        
        // 3. Reset the form for the next entry
        waitlistForm.reset();
        
      }).catch(() => {
        console.log("There was a problem submitting your email. Please try again!");
      });
      
    });
}