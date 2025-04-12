/**
 * Money Mentor Module
 * This module provides AI-powered financial advice
 */

/**
 * Render the Money Mentor page
 * @returns {HTMLElement} - The rendered page container
 */
export function renderMoneyMentorPage() {
  // Create main container
  const container = document.createElement('div');
  container.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
  
  // Create header with animated gradient
  const header = document.createElement('div');
  header.className = 'mb-8 text-center relative overflow-hidden rounded-xl p-6';
  header.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed, #2563eb)';
  header.style.backgroundSize = '300% 300%';
  header.style.animation = 'gradient-animation 10s ease infinite';
  
  // Add keyframes for gradient animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gradient-animation {
      0% { background-position: 0% 50% }
      50% { background-position: 100% 50% }
      100% { background-position: 0% 50% }
    }
    @keyframes bubble-animation {
      0% { transform: translateY(0) scale(1); opacity: 0.7; }
      50% { transform: translateY(-20px) scale(1.1); opacity: 0.9; }
      100% { transform: translateY(-40px) scale(1); opacity: 0; }
    }
    .bubble {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      animation: bubble-animation 3s ease-in infinite;
    }
  `;
  document.head.appendChild(style);
  
  // Add decorative bubbles
  for (let i = 0; i < 10; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.width = `${Math.random() * 50 + 10}px`;
    bubble.style.height = bubble.style.width;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.bottom = `${Math.random() * 20}%`;
    bubble.style.animationDelay = `${Math.random() * 3}s`;
    header.appendChild(bubble);
  }
  
  // Header content
  const headerContent = document.createElement('div');
  headerContent.className = 'relative z-10';
  headerContent.innerHTML = `
    <div class="flex items-center justify-center mb-3">
      <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
    </div>
    <h1 class="text-3xl font-bold text-white mb-2">Money Mentor AI</h1>
    <p class="text-white/80">Your intelligent financial guide powered by advanced AI</p>
    <div class="mt-3">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
        <span class="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
        PRO Feature
      </span>
    </div>
  `;
  
  header.appendChild(headerContent);
  
  // Chat interface
  const chatInterface = document.createElement('div');
  chatInterface.className = 'bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700';
  
  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'flex space-x-1 mb-5 border-b border-gray-200 dark:border-gray-700 pb-3';
  
  const modes = [
    { id: 'chat', name: 'Chat', icon: 'message-circle', active: true },
    { id: 'assistant', name: 'Financial Plans', icon: 'pie-chart' },
    { id: 'insights', name: 'Market Insights', icon: 'trending-up' }
  ];
  
  modes.forEach(mode => {
    const tab = document.createElement('button');
    tab.className = `px-4 py-2 rounded-lg text-sm font-medium flex items-center ${mode.active ? 
      'bg-primary/10 text-primary' : 
      'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`;
    
    tab.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
        ${mode.icon === 'message-circle' ? 
          '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>' : 
          mode.icon === 'pie-chart' ? 
          '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>' :
          '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>'}
      </svg>
      ${mode.name}
    `;
    
    tabs.appendChild(tab);
  });
  
  // Message display area
  const messageContainer = document.createElement('div');
  messageContainer.className = 'h-[400px] overflow-y-auto p-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg';
  
  // Welcome message
  const welcomeMessage = document.createElement('div');
  welcomeMessage.className = 'flex p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mb-4 border border-blue-100 dark:border-blue-800';
  
  const welcomeAvatar = document.createElement('div');
  welcomeAvatar.className = 'mr-4 flex-shrink-0';
  welcomeAvatar.innerHTML = `
    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>
  `;
  
  const welcomeContent = document.createElement('div');
  welcomeContent.innerHTML = `
    <div class="flex items-center">
      <p class="font-bold text-blue-800 dark:text-blue-300">Money Mentor AI</p>
      <span class="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">PRO</span>
    </div>
    <div class="mt-1">Hello! I'm your AI-powered financial assistant. I can help you with budgeting, investing, saving strategies, and much more. What would you like to know today?</div>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">${new Date().toLocaleTimeString()} • Powered by Stackr AI</p>
  `;
  
  welcomeMessage.appendChild(welcomeAvatar);
  welcomeMessage.appendChild(welcomeContent);
  messageContainer.appendChild(welcomeMessage);
  
  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'relative';
  inputArea.innerHTML = `
    <textarea 
      class="w-full p-4 pr-16 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-gray-100" 
      placeholder="Ask me anything about your finances..." 
      rows="3"
    ></textarea>
    <button class="absolute right-4 bottom-4 p-2 bg-primary rounded-lg text-white hover:bg-primary-dark transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  `;
  
  // Suggested questions section
  const suggestedQuestions = document.createElement('div');
  suggestedQuestions.className = 'mt-6';
  suggestedQuestions.innerHTML = `
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Popular Questions</h3>
    <div class="flex flex-wrap gap-2">
      <button class="px-3 py-2 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">How do I create a 40/30/30 budget?</button>
      <button class="px-3 py-2 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">Best ways to invest $1000?</button>
      <button class="px-3 py-2 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">How can I reduce expenses?</button>
      <button class="px-3 py-2 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">Emergency fund recommendations?</button>
    </div>
  `;
  
  // Assemble chat interface
  chatInterface.appendChild(tabs);
  chatInterface.appendChild(messageContainer);
  chatInterface.appendChild(inputArea);
  chatInterface.appendChild(suggestedQuestions);
  
  // Assemble main page
  container.appendChild(header);
  container.appendChild(chatInterface);
  
  return container;
}