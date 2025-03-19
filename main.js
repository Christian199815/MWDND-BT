// Fix for the multi-step form navigation and field validation

document.addEventListener("DOMContentLoaded", function () {

  document.body.classList.remove('no-js');
  document.body.classList.add('js-enabled');

// Immediately execute the following to handle CSS class setup before showing any content
function setupNoJsCompatibility() {
  // Hide the "verkrijgers-container" if it exists since it's dynamically created with JS
  const verkrijgersContainer = document.getElementById('verkrijgers-container');
  if (verkrijgersContainer) {
    verkrijgersContainer.style.display = 'none';
  }
  
  // Make sure overview-1 is visible in no-JS mode and overview-2 is hidden
  const overview1 = document.getElementById('overview-1');
  const overview2 = document.getElementById('overview-2');
  
  if (document.body.classList.contains('no-js')) {
    // No-JS mode
    if (overview1) {
      overview1.style.display = 'block';
    }
    if (overview2) {
      overview2.style.display = 'none';
    }
    
    // In no-JS mode, we need to show all form sections
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(section => {
      section.style.display = 'block';
    });
  } else {
    // JS mode - show only the first section initially
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach((section, index) => {
      if (index === 0) {
        section.classList.add('active');
        section.style.display = 'block';
      } else {
        section.classList.remove('active');
        section.style.display = 'none';
      }
    });
    
    // In JS mode, hide overview-1 and prepare overview-2
    if (overview1) {
      overview1.style.display = 'none';
    }
    if (overview2) {
      overview2.classList.add('form-section');
      overview2.style.display = 'none';
    }
  }
}

// Execute immediately and also after DOM content is loaded
setupNoJsCompatibility();

  // Show progress bar when JS is enabled
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.display = 'flex';
  }

  // Get all form sections and navigation buttons
  const sections = Array.from(document.querySelectorAll('.form-section'));
  const volgendeLinks = document.querySelectorAll('[id^=volgende]');
  const previousLinks = document.querySelectorAll('.previous-btn');
  const progressSteps = document.querySelectorAll('.progress-step');

  // Function to show a specific section - FIXED to ensure proper display
  function showSection(sectionId) {
    // Get the target section
    const targetSection = document.querySelector(sectionId);
    if (!targetSection) return;

    // Hide ALL sections first with proper display settings
    sections.forEach(section => {
      section.classList.remove('active');
      section.style.display = 'none'; // Explicitly hide every section
    });

    // Also explicitly hide the verkrijgers container if it exists
    const verkrijgersContainer = document.getElementById('verkrijgers-container');
    if (verkrijgersContainer) {
      verkrijgersContainer.classList.remove('active');
      verkrijgersContainer.style.display = 'none';
    }

    // Show the target section with explicit display block
    targetSection.classList.add('active');
    targetSection.style.display = 'block';

    // Update progress indicator
    const stepNum = getStepNumber(sectionId);
    updateProgress(stepNum);

    // Scroll to top of the form/section
    window.scrollTo({
      top: targetSection.offsetTop - 50,
      behavior: 'smooth'
    });
  }

  // Fixed mapping function to ensure correct step tracking
  function getStepNumber(sectionId) {
    const sectionMap = {
      '#deadPerson': 1,
      '#foreignAddress': 2,
      '#verkrijgers-container': 3,
      '#acquirer-1': 3, // Add this mapping
      '#acquirer-2': 3, // Add this mapping
      '#acquirer-3': 3, // Add this mapping
      '#acquirer-4': 3, // Add this mapping
      '#bank-savings-Amount': 4,
      '#overview-1': 5,
      '#overview-2': 5
    };

    return sectionMap[sectionId] || 1;
  }

  // Update progress indicator - fix to ensure correct highlighting
  function updateProgress(step) {
    progressSteps.forEach(progressStep => {
      const stepNum = parseInt(progressStep.dataset.step);
      if (stepNum <= step) {
        progressStep.classList.add('active');
      } else {
        progressStep.classList.remove('active');
      }
    });
  }

  // Fix validation errors with required fields
  function validateSection(section) {
    if (!section) return true;

    const inputs = section.querySelectorAll('input[required]');
    let allValid = true;

    inputs.forEach(input => {
      // Reset custom validity first
      input.setCustomValidity('');

      // If it's empty, mark as invalid
      if (!input.value.trim()) {
        allValid = false;
        input.setCustomValidity('Dit veld is verplicht');

        // Show error message
        const errorMsg = input.nextElementSibling;
        if (errorMsg && (errorMsg.classList.contains('error-message') || errorMsg.classList.contains('error'))) {
          errorMsg.style.display = 'block';
        }
      }
      // If it doesn't match pattern, also mark as invalid
      else if (input.pattern && !new RegExp(input.pattern).test(input.value)) {
        allValid = false;
        input.setCustomValidity('Controleer het formaat');

        // Show error message
        const errorMsg = input.nextElementSibling;
        if (errorMsg && (errorMsg.classList.contains('error-message') || errorMsg.classList.contains('error'))) {
          errorMsg.style.display = 'block';
        }
      } else {
        // Hide error message if valid
        const errorMsg = input.nextElementSibling;
        if (errorMsg && (errorMsg.classList.contains('error-message') || errorMsg.classList.contains('error'))) {
          errorMsg.style.display = 'none';
        }
      }
    });

    return allValid;
  }

  // Handle "Next" button clicks with improved validation
  volgendeLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      const section = this.closest('.form-section');

      // Validate the current section
      if (validateSection(section)) {
        // Save form data before navigating
        saveFormData();

        // Move to next section
        const targetId = this.getAttribute('href');
        showSection(targetId);
      } else {
        alert('Vul alle verplichte velden correct in voordat u verder gaat.');

        // Focus the first invalid field
        const firstInvalid = section.querySelector('input:invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  });

  // Handle "Previous" button clicks with proper data saving
  previousLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      // Save form data before navigating back
      saveFormData();

      const targetId = this.getAttribute('href');
      showSection(targetId);
    });
  });

  // Function to set up the verkrijger section with JavaScript enabled
  function setupVerkrijgerSection() {
    // Store a clone of the first acquirer fieldset for later use
    const acquirerTemplate = document.querySelector('#acquirer-1')?.cloneNode(true);
    if (!acquirerTemplate) return;

    // Create a container for all verkrijger fieldsets if not already present
    let verkrijgersContainer = document.getElementById('verkrijgers-container');

    if (!verkrijgersContainer) {
      verkrijgersContainer = document.createElement('div');
      verkrijgersContainer.id = 'verkrijgers-container';
      verkrijgersContainer.className = 'form-section';

      // Add heading
      const heading = document.createElement('h2');
      heading.textContent = 'Verkrijgers';
      verkrijgersContainer.appendChild(heading);

      // Insert after foreign address
      const foreignAddress = document.getElementById('foreignAddress');
      if (foreignAddress) {
        foreignAddress.parentNode.insertBefore(verkrijgersContainer, foreignAddress.nextSibling);
      } else {
        // Fallback - add to form
        const form = document.getElementById('ns-form');
        if (form) {
          form.appendChild(verkrijgersContainer);
        }
      }
    }

    // Explicitly add the container to the sections collection
    if (!sections.includes(verkrijgersContainer)) {
      sections.push(verkrijgersContainer);
    }

    // Hide all acquirer fieldsets from their original location
    const acquirerFieldsets = document.querySelectorAll('[id^=acquirer-]');
    acquirerFieldsets.forEach(fieldset => {
      fieldset.classList.remove('form-section');
      fieldset.style.display = 'none';
    });

    // Add the first acquirer fieldset to our container
    const firstAcquirer = document.querySelector('#acquirer-1');
    if (firstAcquirer) {
      const clonedFirstAcquirer = firstAcquirer.cloneNode(true);
      clonedFirstAcquirer.style.display = 'block';

      // Remove navigation buttons from acquirer fieldset when JS is enabled
      const navButtons = clonedFirstAcquirer.querySelector('.nav-buttons');
      if (navButtons) {
        navButtons.remove();
      }

      // Make essential inputs required
      const requiredInputs = clonedFirstAcquirer.querySelectorAll('input[type="text"]');
      requiredInputs.forEach(input => {
        if (input.id.includes('-BSN') || input.id.includes('-firstname') || input.id.includes('-lastname')) {
          input.required = true;
        }
      });

      verkrijgersContainer.appendChild(clonedFirstAcquirer);
    }

    // Create "Add Verkrijger" button
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'ns-button add-verkrijger-btn';
    addButton.textContent = '+ Verkrijger';
    addButton.onclick = addNewVerkrijger;
    verkrijgersContainer.appendChild(addButton);

    // Add navigation buttons
    const navButtons = document.createElement('div');
    navButtons.className = 'nav-buttons';

    const prevButton = document.createElement('a');
    prevButton.href = '#foreignAddress';
    prevButton.className = 'ns-button previous-btn';
    prevButton.textContent = 'Vorige';
    prevButton.addEventListener('click', function (e) {
      e.preventDefault();
      saveFormData();
      showSection('#foreignAddress');
    });

    const nextButton = document.createElement('a');
    nextButton.href = '#bank-savings-Amount';
    nextButton.id = 'volgende-verkrijgers';
    nextButton.className = 'ns-button volgende-btn';
    nextButton.textContent = 'Doorgaan';
    nextButton.addEventListener('click', function (e) {
      e.preventDefault();

      // Validate all required fields in the first verkrijger
      const firstVerkrijger = verkrijgersContainer.querySelector('[id^=acquirer-]');
      if (firstVerkrijger && validateSection(firstVerkrijger)) {
        saveFormData();
        showSection('#bank-savings-Amount');
      } else {
        alert('Vul alle verplichte velden correct in voordat u verder gaat.');
      }
    });

    navButtons.appendChild(prevButton);
    navButtons.appendChild(nextButton);
    verkrijgersContainer.appendChild(navButtons);

    // Update navigation links
    const foreignAddressNextBtn = document.querySelector('#foreignAddress .volgende-btn');
    if (foreignAddressNextBtn) {
      foreignAddressNextBtn.setAttribute('href', '#verkrijgers-container');
    }

    const bankPrevBtn = document.querySelector('#bank-savings-Amount .previous-btn');
    if (bankPrevBtn) {
      bankPrevBtn.setAttribute('href', '#verkrijgers-container');
    }
  }

  // Function to add a new verkrijger
  function addNewVerkrijger() {
    const verkrijgersContainer = document.getElementById('verkrijgers-container');
    if (!verkrijgersContainer) return;

    // Clone the first acquirer as template
    const acquirerTemplate = document.querySelector('#acquirer-1');
    if (!acquirerTemplate) return null;

    // Get the current count of verkrijgers
    const currentCount = verkrijgersContainer.querySelectorAll('[id^=acquirer-]').length + 1;

    // Clone the template
    const newAcquirer = acquirerTemplate.cloneNode(true);

    // Update ID and legend
    newAcquirer.id = `acquirer-${currentCount}`;
    const legend = newAcquirer.querySelector('legend');
    if (legend) {
      legend.textContent = `Verkrijger ${currentCount}`;
    }

    // Update all internal IDs to avoid duplicates
    updateElementIds(newAcquirer, currentCount);

    // Make sure it's visible
    newAcquirer.style.display = 'block';

    // Remove navigation buttons if they exist
    const navButtons = newAcquirer.querySelector('.nav-buttons');
    if (navButtons) {
      navButtons.remove();
    }

    // Add remove button
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'ns-button remove-verkrijger-btn';
    removeButton.textContent = 'Verwijderen';
    removeButton.onclick = function () {
      newAcquirer.remove();
      saveFormData();
    };

    newAcquirer.appendChild(removeButton);

    // Insert before the add button
    const addButton = verkrijgersContainer.querySelector('.add-verkrijger-btn');
    if (addButton) {
      verkrijgersContainer.insertBefore(newAcquirer, addButton);
    } else {
      verkrijgersContainer.appendChild(newAcquirer);
    }

    // Save form data
    setTimeout(saveFormData, 100);

    return newAcquirer;
  }

  // Helper function to update IDs in a cloned fieldset
  function updateElementIds(fieldset, index) {
    // Update input IDs and names
    const inputs = fieldset.querySelectorAll('input');
    inputs.forEach(input => {
      if (input.id) {
        input.id = input.id.replace(/a\d+/, `a${index}`);
      }

      if (input.type === 'radio' && input.name) {
        input.name = input.name.replace(/a\d+/, `a${index}`);
      }
    });

    // Update label for attributes
    const labels = fieldset.querySelectorAll('label');
    labels.forEach(label => {
      if (label.htmlFor) {
        label.htmlFor = label.htmlFor.replace(/a\d+/, `a${index}`);
      }
    });

    // Update nested fieldset IDs
    const nestedFieldsets = fieldset.querySelectorAll('fieldset');
    nestedFieldsets.forEach(nestedField => {
      if (nestedField.id) {
        nestedField.id = nestedField.id.replace(/a\d+/, `a${index}`);
      }
    });

    // Update error messages and spans
    const errorMessages = fieldset.querySelectorAll('.error-message, .error');
    errorMessages.forEach(msg => {
      msg.style.display = 'none'; // Reset error display
    });
  }

  // Function to set up overview fieldsets
  function setupOverviewFieldsets() {
    const overview1 = document.getElementById('overview-1');
    const overview2 = document.getElementById('overview-2');

    if (!overview1 || !overview2) return;

    if (document.body.classList.contains('js-enabled')) {
      // Hide overview-1 completely
      overview1.classList.remove('form-section');
      overview1.style.display = 'none';

      // Set up overview-2 as the active overview
      overview2.classList.add('form-section');
      overview2.style.display = 'none'; // Initially hidden

      // Update links to use showSection
      const overviewLinks = overview2.querySelectorAll('a[href^="#"]');
      overviewLinks.forEach(link => {
        const href = link.getAttribute('href');

        link.addEventListener('click', function (e) {
          e.preventDefault();
          saveFormData();
          showSection(href);
        });
      });

      // Update submit button behavior
      const submitBtn = document.querySelector('input[type="submit"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', function (e) {
          e.preventDefault();

          // Perform final validation
          let allValid = true;
          const form = document.getElementById('ns-form');

          if (form) {
            // Check validation of all required fields
            const requiredFields = form.querySelectorAll('input[required]');
            requiredFields.forEach(field => {
              if (!field.checkValidity()) {
                allValid = false;
              }
            });

            if (allValid) {
              alert('Formulier is succesvol verzonden!');
              // In a real app, you'd submit the form here
              // form.submit();
            } else {
              alert('Er zijn nog ongeldige velden in het formulier. Controleer de gegevens en probeer opnieuw.');
            }
          }
        });
      }
    } else {
      // For no-JS, keep overview-1 and hide overview-2
      overview2.style.display = 'none';
    }
  }

  // Helper function to ensure form data is saved correctly
  function saveFormData() {
    try {
      // Create an object to store all form data
      const formData = {
        deadPerson: {},
        foreignAddress: {},
        verkrijgers: [],
        bankSavings: {}
      };

      // Save dead person data
      const deadPersonInputs = document.querySelectorAll('#deadPerson input');
      deadPersonInputs.forEach(input => {
        if (input.type === 'radio') {
          if (input.checked) {
            formData.deadPerson[input.name] = input.id;
          }
        } else {
          formData.deadPerson[input.id] = input.value;
        }
      });

      // Save foreign address data
      const foreignAddressInputs = document.querySelectorAll('#foreignAddress input, #foreignAddress textarea');
      foreignAddressInputs.forEach(input => {
        if (input.type === 'radio') {
          if (input.checked) {
            formData.foreignAddress[input.name] = input.id;
          }
        } else {
          formData.foreignAddress[input.id] = input.value;
        }
      });

      // Save verkrijgers data
      if (document.body.classList.contains('js-enabled')) {
        // Get from the verkrijgers container
        const verkrijgerElements = document.querySelectorAll('#verkrijgers-container [id^=acquirer-]');
        verkrijgerElements.forEach(verkrijger => {
          const verkrijgerData = {};
          const inputs = verkrijger.querySelectorAll('input');

          inputs.forEach(input => {
            if (input.type === 'radio') {
              if (input.checked) {
                verkrijgerData[input.name] = input.id;
              }
            } else {
              verkrijgerData[input.id] = input.value;
            }
          });

          formData.verkrijgers.push(verkrijgerData);
        });
      } else {
        // For no-JS, get from the static fieldsets
        for (let i = 1; i <= 4; i++) {
          const verkrijger = document.getElementById(`acquirer-${i}`);
          if (verkrijger) {
            const verkrijgerData = {};
            const inputs = verkrijger.querySelectorAll('input');

            inputs.forEach(input => {
              if (input.type === 'radio') {
                if (input.checked) {
                  verkrijgerData[input.name] = input.id;
                }
              } else {
                verkrijgerData[input.id] = input.value;
              }
            });

            // Only add verkrijger if it has any data
            if (Object.keys(verkrijgerData).length > 0) {
              formData.verkrijgers.push(verkrijgerData);
            }
          }
        }
      }

      // Save bank savings data
      const bankSavingsInputs = document.querySelectorAll('#bank-savings-Amount input');
      bankSavingsInputs.forEach(input => {
        formData.bankSavings[input.id] = input.value;
      });

      // Save to localStorage
      localStorage.setItem('nsFormData', JSON.stringify(formData));
      console.log('Form data saved successfully');
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }

  // Helper function to load form data from localStorage
  function loadFormData() {
    try {
      const savedData = localStorage.getItem('nsFormData');
      if (!savedData) return;

      const formData = JSON.parse(savedData);
      console.log('Loading saved form data');

      // Load dead person data
      if (formData.deadPerson) {
        Object.entries(formData.deadPerson).forEach(([id, value]) => {
          const input = document.getElementById(id);
          if (input) {
            if (input.type === 'radio') {
              input.checked = true;
            } else {
              input.value = value;
            }
          }
        });
      }

      // Load foreign address data
      if (formData.foreignAddress) {
        Object.entries(formData.foreignAddress).forEach(([id, value]) => {
          const input = document.getElementById(id);
          if (input) {
            if (input.type === 'radio') {
              input.checked = true;
            } else {
              input.value = value;
            }
          }
        });
        // Update address overview if it exists
        updateAddressOverview();
      }

      // Load verkrijgers data
      if (formData.verkrijgers && formData.verkrijgers.length > 0) {
        if (document.body.classList.contains('js-enabled')) {
          // For each verkrijger beyond the first, add a new one
          for (let i = 1; i < formData.verkrijgers.length; i++) {
            addNewVerkrijger();
          }

          // Fill in all the data
          const verkrijgerElements = document.querySelectorAll('#verkrijgers-container [id^=acquirer-]');
          verkrijgerElements.forEach((element, index) => {
            if (index < formData.verkrijgers.length) {
              const verkrijgerData = formData.verkrijgers[index];
              const inputs = element.querySelectorAll('input');

              inputs.forEach(input => {
                const inputId = input.id;
                if (input.type === 'radio') {
                  if (verkrijgerData[input.name] === input.id) {
                    input.checked = true;
                  }
                } else if (inputId in verkrijgerData) {
                  input.value = verkrijgerData[inputId];
                }
              });
            }
          });
        } else {
          // Handle static fieldsets for no-JS mode
          formData.verkrijgers.forEach((verkrijgerData, index) => {
            const verkrijgerId = `acquirer-${index + 1}`;
            const verkrijger = document.getElementById(verkrijgerId);
            if (verkrijger) {
              Object.entries(verkrijgerData).forEach(([id, value]) => {
                const input = verkrijger.querySelector(`#${id}`);
                if (input) {
                  if (input.type === 'radio') {
                    input.checked = true;
                  } else {
                    input.value = value;
                  }
                }
              });
            }
          });
        }
      }

      // Load bank savings data
      if (formData.bankSavings) {
        Object.entries(formData.bankSavings).forEach(([id, value]) => {
          const input = document.getElementById(id);
          if (input) {
            input.value = value;
          }
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  }

  // Update address overview when inputs change
  function updateAddressOverview() {
    const addressOverview = document.getElementById("addressOverview");
    const street = document.getElementById("fa-street");
    const houseNum = document.getElementById("fa-houseNum");
    const postal = document.getElementById("fa-postal");
    const city = document.getElementById("fa-city");
    const countryInput = document.getElementById("fa-country");

    if (!addressOverview || !street || !houseNum || !postal || !city || !countryInput) return;

    // Get the country name
    const countryName = countryInput.value || "";

    // Format the address
    addressOverview.value = `${street.value || ""} ${houseNum.value || ""}
${postal.value || ""} ${city.value || ""}
${countryName}`;
  }

  // Setup custom validation for IBAN
  function setupIBANValidation() {
    const ibanInput = document.getElementById('bsa-IBAN-shared');
    if (!ibanInput) return;

    ibanInput.addEventListener('input', function () {
      // Format IBAN with spaces after every 4 characters
      let value = this.value.replace(/\s+/g, '').toUpperCase();

      if (value.length > 0) {
        value = value.match(/.{1,4}/g).join(' ');
      }

      this.value = value;

      // Basic IBAN validation (length and format)
      if (value.length > 0 && value.length < 15) {
        this.setCustomValidity('IBAN is te kort');
      } else {
        this.setCustomValidity('');
      }
    });
  }
  

  // Fix for currency amount input formatting
  function setupCurrencyInput() {
    const amountInput = document.getElementById('bsa-Amount-shared');
    if (!amountInput) return;

    amountInput.addEventListener('input', function () {
      // Remove non-numeric characters except decimal separator
      let value = this.value.replace(/[^\d,]/g, '');

      // Replace commas with a decimal point for parsing
      value = value.replace(',', '.');

      // Parse as a number
      let numValue = parseFloat(value);

      // Format number if valid
      if (!isNaN(numValue)) {
        // Format with Dutch locale (comma as decimal separator)
        this.value = numValue.toLocaleString('nl-NL', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      } else if (value === '' || value === ',') {
        this.value = '';
      }
    });
  }

  // Function to populate the overview section with form data
  function populateOverview() {
    // Get overview elements
    const deadpersonInfo = document.getElementById("deadperson-info");
    const foreignAdressInfo = document.getElementById("foreignAdress-info");
    const acquirersInfo = document.getElementById("acquirers-info");
    const bankSavingsAmountInfo = document.getElementById("bankSavingsAmount-info");

    // Try to get data from localStorage first
    const savedData = localStorage.getItem('nsFormData');

    if (savedData) {
      const formData = JSON.parse(savedData);

      // Populate dead person info
      if (deadpersonInfo && formData.deadPerson) {
        const firstname = formData.deadPerson["dp-firstname"] || "";
        const between = formData.deadPerson["dp-between"] || "";
        const lastname = formData.deadPerson["dp-lastname"] || "";
        const bsn = formData.deadPerson["dp-BSN"] || "";
        const deathDate = formData.deadPerson["dp-deathDate"] || "";

        deadpersonInfo.innerHTML = `
          <strong>Overledene</strong><br>
          <strong>Naam:</strong> ${firstname} ${between} ${lastname}<br>
          <strong>BSN:</strong> ${bsn}<br>
          <strong>Overlijdensdatum:</strong> ${deathDate}
        `;
      }

      // Populate foreign address info
      if (foreignAdressInfo && formData.foreignAddress) {
        const street = formData.foreignAddress["fa-street"] || "";
        const houseNum = formData.foreignAddress["fa-houseNum"] || "";
        const postal = formData.foreignAddress["fa-postal"] || "";
        const city = formData.foreignAddress["fa-city"] || "";
        const country = formData.foreignAddress["fa-country"] || "";
        const phone = formData.foreignAddress["fa-phoneNum"] || "";
        const email = formData.foreignAddress["fa-email"] || "";

        foreignAdressInfo.innerHTML = `
          <strong>Adres</strong><br>
          <strong>Straat en huisnummer:</strong> ${street} ${houseNum}<br>
          <strong>Postcode en plaats:</strong> ${postal} ${city}<br>
          <strong>Land:</strong> ${country}<br>
          <strong>Telefoon:</strong> ${phone}<br>
          <strong>E-mail:</strong> ${email}
        `;
      }

      // Populate acquirers info
      if (acquirersInfo && formData.verkrijgers && formData.verkrijgers.length > 0) {
        let acquirersHtml = "<strong>Verkrijgers</strong><br>";

        formData.verkrijgers.forEach((verkrijger, index) => {
          // Find keys for this verkrijger (matching pattern a{index+1}-)
          const prefix = `a${index + 1}-`;

          const firstname = verkrijger[`${prefix}firstname`] || "";
          const between = verkrijger[`${prefix}between`] || "";
          const lastname = verkrijger[`${prefix}lastname`] || "";
          const bsn = verkrijger[`${prefix}BSN`] || "";

          // Check for radio button selections
          let wholeAmount = "Nee";
          if (verkrijger[`${prefix}wa-check`] === `${prefix}wa-yes`) {
            wholeAmount = "Ja";
          }

          let portion = "Nee";
          if (verkrijger[`${prefix}p-check`] === `${prefix}p-yes`) {
            portion = "Ja";
          }

          acquirersHtml += `
            <strong>Verkrijger ${index + 1}:</strong> ${firstname} ${between} ${lastname}<br>
            <strong>BSN:</strong> ${bsn}<br>
            <strong>Krijgt het hele vermogen:</strong> ${wholeAmount}<br>
            <strong>Beroep op legitieme portie:</strong> ${portion}<br><br>
          `;
        });

        acquirersInfo.innerHTML = acquirersHtml;
      }

      // Populate bank savings amount info
      if (bankSavingsAmountInfo && formData.bankSavings) {
        const iban = formData.bankSavings["bsa-IBAN-shared"] || "";
        const amount = formData.bankSavings["bsa-Amount-shared"] || "";
        const currency = document.getElementById("currency-symbol")?.textContent || "€";

        bankSavingsAmountInfo.innerHTML = `
          <strong>Bank- en Spaarrekeningen</strong><br>
          <strong>IBAN:</strong> ${iban}<br>
          <strong>Saldo:</strong> ${currency} ${amount}
        `;
      }
    }
  }

  // Initialize form field validation
  function initializeFormValidation() {
    // Setup IBAN validation
    setupIBANValidation();

    // Setup currency input
    setupCurrencyInput();

    // Add handling for BSN (Dutch tax ID) validation to all relevant fields
    const bsnInputs = document.querySelectorAll('[id$="-BSN"]');
    bsnInputs.forEach(input => {
      input.addEventListener('input', function () {
        // Force numbers only
        this.value = this.value.replace(/[^0-9]/g, '');

        // Basic validation
        if (this.value.length > 0 && (this.value.length < 7 || this.value.length > 9)) {
          this.setCustomValidity('BSN moet 7 tot 9 cijfers bevatten');
        } else {
          this.setCustomValidity('');
        }
      });
    });

    // Handle nameDots (formatted initial input)
    const nameDotsInputs = document.querySelectorAll('.nameDots');
    nameDotsInputs.forEach(input => {
      let prevValue = "";

      input.addEventListener('input', function () {
        // Get cursor position before changes
        const cursorPosition = this.selectionStart;
        const isBackspace = prevValue.length > this.value.length;

        // Allow backspacing
        if (isBackspace) {
          prevValue = this.value;
          return;
        }

        // Clean and format the input value
        let value = this.value.replace(/[^A-Za-z\.]/g, "");
        let formattedValue = "";

        for (let i = 0; i < value.length; i++) {
          if (/[A-Za-z]/.test(value[i])) {
            formattedValue += value[i];

            // Add dot after each letter if not already present
            if (i + 1 < value.length) {
              if (value[i + 1] !== ".") {
                formattedValue += ".";
              }
            } else {
              formattedValue += ".";
            }
          }
          // Keep dots that follow a letter
          else if (value[i] === "." && i > 0 && /[A-Za-z]/.test(value[i - 1])) {
            formattedValue += ".";
          }
        }

        //   the input and save current value
        this.value = formattedValue;
        prevValue = formattedValue;

        // Restore cursor position 
        const newCursorPos = Math.min(
          cursorPosition + (formattedValue.length - value.length),
          formattedValue.length
        );
        this.setSelectionRange(newCursorPos, newCursorPos);
      });
    });

    // Add validation for email fields
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
      input.addEventListener('blur', function () {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
          this.setCustomValidity('Voer een geldig e-mailadres in');
        } else {
          this.setCustomValidity('');
        }
      });
    });

    // Add validation for phone number fields
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      // Ensure phone starts with +
      input.addEventListener('focus', function () {
        if (!this.value) {
          this.value = '+';
        }
      });

      // Validate phone format
      input.addEventListener('blur', function () {
        const phoneRegex = /^\+[0-9]{1,4}[0-9]{6,14}$/;
        if (this.value && !phoneRegex.test(this.value)) {
          this.setCustomValidity('Voer een geldig telefoonnummer in (bijv. +31612345678)');
        } else {
          this.setCustomValidity('');
        }
      });
    });

    // Add event listeners for address overview update
    const addressInputs = document.querySelectorAll('#fa-street, #fa-houseNum, #fa-postal, #fa-city, #fa-country');
    addressInputs.forEach(input => {
      input.addEventListener('input', updateAddressOverview);
      input.addEventListener('blur', function () {
        if (this.required && !this.value.trim()) {
          this.setCustomValidity('Dit veld is verplicht');
        } else {
          this.setCustomValidity('');
        }
      });
    });
  }



  // Add event listener to update overview when submitting
  const form = document.getElementById('ns-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Save form data
      saveFormData();

      // Validate the entire form
      if (this.checkValidity()) {
        // Populate overview with current data
        populateOverview();

        // Show the overview section
        if (document.body.classList.contains('js-enabled')) {
          showSection('#overview-2');
          console.log("overview-2 shown");
        }
      } else {
        // Mark the form as submitted to show all validation errors
        this.classList.add('submitted');

        // Alert user
        alert('Er zijn ongeldige velden in het formulier. Controleer de gegevens en probeer opnieuw.');

        // Focus the first invalid field
        const firstInvalid = this.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  }

  // Initialize all functionality
  setupVerkrijgerSection();
  setupOverviewFieldsets();
  initializeFormValidation();

  // Fix to ensure the form starts at the first section
  setTimeout(() => {
    showSection('#deadPerson');
  }, 100);

  // Fix to load any saved form data
  setTimeout(() => {
    loadFormData();
  }, 200);

  // Add event listener to the final submit button
  const finalSubmitBtn = document.getElementById('einde');
  if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Final validation
      const form = document.getElementById('ns-form');
      if (form && form.checkValidity()) {
        alert('Formulier is succesvol verzonden!');
        // form.submit(); // Uncomment in production

        // Clear saved data
        localStorage.removeItem('nsFormData');

        // Reset the form and go back to first step
        form.reset();
        showSection('#deadPerson');
      } else {
        alert('Er zijn nog ongeldige velden. Controleer de gemarkeerde velden.');
      }
    });
  }
});


// Bronvermelding
// Voor 50% van dit bestand heb ik gebruik gemaakt van AI Code
// ik ben nuchter opzoek gegaan met het onderzoeken van wat er mogelijk is in pure html en css,
// en ben voor de enhancements met AI opzoek gegaan naar UX styles om door te zoeken.

