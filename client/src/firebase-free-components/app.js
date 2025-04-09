// Simple JavaScript-only app with no dependencies
console.log("Firebase-free app loading");

// Remove the loading indicator and add our app content
try {
  console.log("Starting Firebase-free app rendering...");
  const rootElement = document.getElementById("root");
  
  if (rootElement) {
    console.log("Root element found, displaying app");
    
    // Add some basic styling
    const styles = document.createElement('style');
    styles.textContent = `
      body {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
        background-color: #f9f9f9;
      }
      
      .app-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      h1 {
        font-size: 36px;
        margin-bottom: 10px;
        color: #2563eb;
      }
      
      .feature-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 40px;
      }
      
      .card {
        background: white;
        border-radius: 8px;
        padding: 25px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      .card h2 {
        margin-top: 0;
        font-size: 20px;
        color: #2563eb;
      }
      
      .nav-links {
        display: flex;
        gap: 15px;
        margin: 20px 0;
      }
      
      .nav-link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .nav-link:hover {
        background-color: rgba(37, 99, 235, 0.1);
      }
    `;
    document.head.appendChild(styles);
    
    // Direct DOM manipulation to avoid React dependencies
    rootElement.innerHTML = `
      <div class="app-container">
        <h1>Stackr Finance</h1>
        <p>Your service provider financial management tool</p>
        
        <div class="nav-links">
          <a href="#" class="nav-link">Dashboard</a>
          <a href="#" class="nav-link">Income Hub</a>
          <a href="#" class="nav-link">Budget Planner</a>
          <a href="#" class="nav-link">Goals</a>
        </div>
        
        <div class="feature-cards">
          <div class="card">
            <h2>Income Management</h2>
            <p>Track and manage your income with our customizable 40/30/30 split system designed specifically for service providers.</p>
          </div>
          
          <div class="card">
            <h2>Budget Planning</h2>
            <p>Create and maintain your budgets with intelligent suggestions based on your spending patterns and income allocation.</p>
          </div>
          
          <div class="card">
            <h2>Financial Goals</h2>
            <p>Set and track your financial goals with progress visualization and smart advice on how to reach them faster.</p>
          </div>
          
          <div class="card">
            <h2>AI-Powered Advice</h2>
            <p>Get personalized financial recommendations based on your unique situation as a service provider.</p>
          </div>
        </div>
      </div>
    `;
    
    console.log("App displayed successfully");
    
    // Hide the error display if it exists
    const errorDisplay = document.getElementById("error-display");
    if (errorDisplay) {
      errorDisplay.style.display = "none";
    }
  } else {
    console.error("Root element not found");
    document.body.innerHTML = "<div style='color:red;padding:20px;'>Error: Root element not found</div>";
  }
} catch (error) {
  console.error("Error rendering app:", error);
  
  // Display error
  const errorDisplay = document.getElementById("error-display");
  const errorMessage = document.getElementById("error-message");
  
  if (errorDisplay && errorMessage) {
    errorDisplay.style.display = "block";
    errorMessage.textContent = error.message || "Unknown error";
  } else {
    document.body.innerHTML = `
      <div style="color:red;padding:20px;">
        <h2>Application Error</h2>
        <p>Sorry, something went wrong while loading the application.</p>
        <pre>${error.message || "Unknown error"}</pre>
      </div>
    `;
  }
}