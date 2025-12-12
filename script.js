const form = document.getElementById('signup-form');

// Get the custom modal elements
const successModal = document.getElementById('success-message');
const closeBtn = successModal.querySelector('.close-btn');

// Function to show the custom modal
function showSuccessModal() {
  successModal.classList.add('active');
}

// Function to hide the custom modal
function hideSuccessModal() {
  successModal.classList.remove('active');
}

// Hide the modal when the close button or overlay is clicked
closeBtn.addEventListener('click', hideSuccessModal);

// Hide the modal when clicking the dark background overlay
successModal.addEventListener('click', (e) => {
  // Only hide if the click is on the overlay (the element that has the 'active' class)
  if (e.target === successModal) {
    hideSuccessModal();
  }
});

form.addEventListener('submit', e => {
  
  e.preventDefault();

  const email = form.email.value;

  // Replace YOUR_FORM_ID and ENTRY_ID with your values
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfpZH-n9uBBIZ6au0P0MN9ZzJZg2T_Y-pczQ-Z4MWSEQjHV1w/formResponse";
  const formData = new FormData();
  formData.append("entry.2055912569", email);
  

  fetch(formUrl, {
    method: "POST",
    body: formData,
    mode: "no-cors"
  }).then(() => {
    showSuccessModal();
    form.reset();
  }).catch(() => {
    console.log("There was a problem submitting your email. Please try again!");
  });
  
  
});
