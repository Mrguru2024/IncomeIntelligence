// No dependencies on any libraries - completely self-contained

// Create a simple app with vanilla JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  
  // Create a green-themed header
  const header = document.createElement('header');
  header.style.backgroundColor = '#34A853';
  header.style.color = 'white';
  header.style.padding = '20px';
  header.style.textAlign = 'center';
  
  const logo = document.createElement('h1');
  logo.textContent = 'Stackr Finance';
  logo.style.margin = '0';
  header.appendChild(logo);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'GREEN Edition - 100% Firebase-free';
  subtitle.style.margin = '5px 0 0 0';
  header.appendChild(subtitle);
  
  // Create main content
  const main = document.createElement('main');
  main.style.padding = '40px 20px';
  main.style.maxWidth = '800px';
  main.style.margin = '0 auto';
  main.style.textAlign = 'center';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Welcome to Stackr Finance';
  heading.style.marginBottom = '20px';
  main.appendChild(heading);
  
  const description = document.createElement('p');
  description.textContent = 'This is the GREEN edition of Stackr Finance - a completely Firebase-free version built with vanilla JavaScript.';
  description.style.marginBottom = '30px';
  main.appendChild(description);
  
  // Create a card-like container to showcase the 40/30/30 split
  const splitContainer = document.createElement('div');
  splitContainer.style.backgroundColor = '#f5f5f5';
  splitContainer.style.borderRadius = '8px';
  splitContainer.style.padding = '20px';
  splitContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  splitContainer.style.marginBottom = '30px';
  
  const splitHeading = document.createElement('h3');
  splitHeading.textContent = 'Stackr 40/30/30 Split';
  splitHeading.style.marginTop = '0';
  splitContainer.appendChild(splitHeading);
  
  const splitDesc = document.createElement('p');
  splitDesc.textContent = 'The Stackr method helps you allocate your income:';
  splitContainer.appendChild(splitDesc);
  
  // Create the colored bars to represent the split
  const barContainer = document.createElement('div');
  barContainer.style.display = 'flex';
  barContainer.style.height = '40px';
  barContainer.style.borderRadius = '4px';
  barContainer.style.overflow = 'hidden';
  barContainer.style.marginBottom = '10px';
  
  const needsBar = document.createElement('div');
  needsBar.style.width = '40%';
  needsBar.style.backgroundColor = '#34A853'; // Green
  barContainer.appendChild(needsBar);
  
  const investBar = document.createElement('div');
  investBar.style.width = '30%';
  investBar.style.backgroundColor = '#4285F4'; // Blue
  barContainer.appendChild(investBar);
  
  const savingsBar = document.createElement('div');
  savingsBar.style.width = '30%';
  savingsBar.style.backgroundColor = '#FBBC05'; // Yellow
  barContainer.appendChild(savingsBar);
  
  splitContainer.appendChild(barContainer);
  
  // Create labels for the split sections
  const labelsContainer = document.createElement('div');
  labelsContainer.style.display = 'flex';
  labelsContainer.style.justifyContent = 'space-between';
  
  const needsLabel = document.createElement('div');
  needsLabel.innerHTML = '<strong>40%</strong> Needs';
  needsLabel.style.width = '33%';
  labelsContainer.appendChild(needsLabel);
  
  const investLabel = document.createElement('div');
  investLabel.innerHTML = '<strong>30%</strong> Invest';
  investLabel.style.width = '33%';
  labelsContainer.appendChild(investLabel);
  
  const savingsLabel = document.createElement('div');
  savingsLabel.innerHTML = '<strong>30%</strong> Save';
  savingsLabel.style.width = '33%';
  labelsContainer.appendChild(savingsLabel);
  
  splitContainer.appendChild(labelsContainer);
  main.appendChild(splitContainer);
  
  // Add a button to go back to main app
  const backButton = document.createElement('button');
  backButton.textContent = 'Go Back to Main App';
  backButton.style.backgroundColor = '#34A853';
  backButton.style.color = 'white';
  backButton.style.border = 'none';
  backButton.style.padding = '10px 20px';
  backButton.style.borderRadius = '4px';
  backButton.style.cursor = 'pointer';
  backButton.style.fontSize = '16px';
  backButton.onclick = () => {
    window.location.href = '/';
  };
  main.appendChild(backButton);
  
  // Footer
  const footer = document.createElement('footer');
  footer.style.backgroundColor = '#f5f5f5';
  footer.style.padding = '20px';
  footer.style.textAlign = 'center';
  footer.style.marginTop = '40px';
  
  const footerText = document.createElement('p');
  footerText.textContent = '© ' + new Date().getFullYear() + ' Stackr Finance - GREEN Edition';
  footer.appendChild(footerText);
  
  // Assemble the page
  root.appendChild(header);
  root.appendChild(main);
  root.appendChild(footer);
  
  console.log('GREEN Firebase-free version loaded successfully!');
});