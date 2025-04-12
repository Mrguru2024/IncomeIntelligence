// GREEN Edition - Simple single-page application with route handling
document.addEventListener("DOMContentLoaded", function() {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element not found");
    return;
  }
  
  // Create app container
  const app = document.createElement("div");
  app.id = "app";
  app.className = "flex flex-col min-h-screen";
  root.appendChild(app);
  
  // Initialize content
  app.innerHTML = `
    <header class="bg-primary text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Stackr Finance</h1>
        <div>
          <button class="px-4 py-2 bg-white text-primary rounded font-medium" id="login-btn">
            Login
          </button>
        </div>
      </div>
    </header>
    <main class="flex-1 p-4">
      <div class="container mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 class="text-2xl font-bold mb-4">Welcome to Stackr Finance</h2>
          <p class="mb-4">Smart income tracking with the 40/30/30 split method</p>
          <div class="animate-pulse inline-block p-4 rounded-lg bg-blue-100 text-blue-800">
            Loading application...
          </div>
        </div>
      </div>
    </main>
  `;
});
