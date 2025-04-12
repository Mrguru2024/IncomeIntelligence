      case 'moneymentor-advanced':
        try {
          console.log('Loading Money Mentor Advanced Module...');
          
          // Define the fallback renderer function 
          const renderFallbackMoneyMentor = () => {
            console.log('Using fallback Money Mentor interface');
            
            // Create main container
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
            
            // Add simple fallback content
            fallbackContainer.innerHTML = `
              <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">Money Mentor</h2>
                <p class="mb-4">Get personalized financial advice powered by AI.</p>
                <div class="animate-pulse inline-block p-4 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Ready to provide financial insights!
                </div>
              </div>
            `;
            
            return fallbackContainer;
          };
          
          // Try loading the module dynamically
          import('../money-mentor.js')
            .then(module => {
              // Create an IIFE to handle async operations
              (async () => {
                try {
                  // Validate user data
                  if (!appState || !appState.user) {
                    throw new Error('User data not available');
                  }
                  
                  // Verify the module has the required function
                  if (typeof module.renderMoneyMentorPage !== 'function') {
                    throw new Error('renderMoneyMentorPage function not found in module');
                  }
                  
                  // Render the page
                  const mentorPage = await module.renderMoneyMentorPage(appState.user.id);
                  
                  // Verify we got a valid DOM element
                  if (!(mentorPage instanceof HTMLElement)) {
                    throw new Error('Invalid return from renderMoneyMentorPage');
                  }
                  
                  // Successfully loaded the module, clear any previous error flag
                  sessionStorage.removeItem('moneyMentorImportFailed');
                  container.appendChild(mentorPage);
                } catch (innerError) {
                  console.error('Error rendering Money Mentor page:', innerError);
                  console.log('Falling back to simplified Money Mentor interface');
                  // Mark as failed in session storage to avoid future attempts
                  sessionStorage.setItem('moneyMentorImportFailed', 'true');
                  container.appendChild(renderFallbackMoneyMentor());
                }
              })();
            })
            .catch(importError => {
              // Instead of logging the error which may be empty, just log a message
              console.log('Unable to load Money Mentor module - using fallback interface');
              
              // Mark as failed in session storage to avoid future attempts
              sessionStorage.setItem('moneyMentorImportFailed', 'true');
              container.appendChild(renderFallbackMoneyMentor());
            });
        } catch (outerError) {
          console.error('Critical error initializing Money Mentor module:', outerError);
          container.appendChild(createErrorMessage('Critical error loading Money Mentor. Please reload the application.'));
        }
        break;