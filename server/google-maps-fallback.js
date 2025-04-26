/**
 * Enhanced Google Maps Fallback Implementation
 * This script generates a client-side fallback for the Google Maps Places Autocomplete API
 * It creates a more reliable dropdown UI with better positioning and visibility
 */

// Function that generates the client-side JavaScript for the fallback
function generateFallbackScript() {
  return `
    console.log('Loading Google Maps enhanced fallback implementation');
    
    // Create needed objects
    window.google = window.google || {};
    window.google.maps = window.google.maps || {};
    window.google.maps.places = {
      Autocomplete: function(input, options) {
        console.log('Creating autocomplete for input:', input.id);
        this.input = input;
        this.options = options || {};
        this.listeners = {};
        this._suggestionsVisible = false;
        this._suggestionsEl = null;
        
        // Create basic autocomplete UI
        this._setupAutocompleteUI(input);
        
        // Listen for input changes
        input.addEventListener('input', () => {
          const query = input.value.trim();
          if (query.length >= 3) {
            this._fetchSuggestions(query);
          } else {
            this._hideSuggestions();
          }
        });
        
        // Handle focus events
        input.addEventListener('focus', () => {
          const query = input.value.trim();
          if (query.length >= 3) {
            this._fetchSuggestions(query);
          }
        });
        
        // Handle document clicks to hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (this._suggestionsEl && !this.input.contains(e.target) && !this._suggestionsEl.contains(e.target)) {
            this._hideSuggestions();
          }
        });
      }
    };
    
    // Add methods
    window.google.maps.places.Autocomplete.prototype = {
      // Set up the autocomplete UI elements
      _setupAutocompleteUI: function(input) {
        // Create container for suggestions that will be positioned below the input
        const suggestionsEl = document.createElement('div');
        suggestionsEl.className = 'maps-autocomplete-suggestions';
        suggestionsEl.style.display = 'none';
        suggestionsEl.style.position = 'fixed'; // Fixed positioning prevents scroll issues
        suggestionsEl.style.zIndex = '9999'; // High z-index to ensure visibility
        suggestionsEl.style.backgroundColor = 'white';
        suggestionsEl.style.border = '1px solid #ccc';
        suggestionsEl.style.borderRadius = '4px';
        suggestionsEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        suggestionsEl.style.maxHeight = '200px';
        suggestionsEl.style.overflowY = 'auto';
        suggestionsEl.style.width = input.offsetWidth + 'px';
        
        // Add the suggestions element directly to the body for better positioning
        document.body.appendChild(suggestionsEl);
        
        // Position it initially 
        this._repositionSuggestions();
        
        // Add window resize listener to ensure proper positioning when window size changes
        window.addEventListener('resize', () => {
          this._repositionSuggestions();
        });
        
        // Add scroll listener to adjust positioning when page scrolls
        window.addEventListener('scroll', () => {
          if (this._suggestionsVisible) {
            this._repositionSuggestions();
          }
        }, true); // Use capture to catch all scroll events
        
        this._suggestionsEl = suggestionsEl;
        
        // Add a debug element to show what's happening
        this._debugElement = document.createElement('div');
        this._debugElement.style.position = 'fixed';
        this._debugElement.style.top = '10px';
        this._debugElement.style.right = '10px';
        this._debugElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this._debugElement.style.color = 'white';
        this._debugElement.style.padding = '10px';
        this._debugElement.style.borderRadius = '5px';
        this._debugElement.style.fontSize = '12px';
        this._debugElement.style.zIndex = '10000';
        this._debugElement.style.display = 'none';
        document.body.appendChild(this._debugElement);
        
        // Log initial setup
        this._logDebug("Autocomplete initialized for input: " + (input.id || "unnamed"));
      },
      
      // Helper to reposition the suggestions dropdown based on input position
      _repositionSuggestions: function() {
        if (!this._suggestionsEl || !this.input) return;
        
        const inputRect = this.input.getBoundingClientRect();
        
        // Position relative to viewport, accounting for scroll
        this._suggestionsEl.style.position = 'fixed';
        this._suggestionsEl.style.width = inputRect.width + 'px';
        this._suggestionsEl.style.left = inputRect.left + 'px';
        this._suggestionsEl.style.top = (inputRect.bottom + 2) + 'px';
        
        // Log positioning for debugging
        this._logDebug("Positioned dropdown at: " + inputRect.left + "px, " + (inputRect.bottom + 2) + "px, width: " + inputRect.width + "px");
      },
      
      // Helper to log debug information
      _logDebug: function(message) {
        console.log("[Maps Autocomplete] " + message);
        
        // Update debug element
        if (this._debugElement) {
          const timestamp = new Date().toLocaleTimeString();
          this._debugElement.innerHTML += timestamp + ": " + message + "<br>";
          this._debugElement.style.display = 'block';
          
          // Scroll to bottom
          this._debugElement.scrollTop = this._debugElement.scrollHeight;
          
          // Remove old messages to avoid too much content
          if (this._debugElement.innerHTML.split('<br>').length > 10) {
            const lines = this._debugElement.innerHTML.split('<br>');
            this._debugElement.innerHTML = lines.slice(lines.length - 10).join('<br>');
          }
        }
      },
      
      // Fetch address suggestions from the server
      _fetchSuggestions: function(query) {
        // Log the query
        this._logDebug("Fetching suggestions for: '" + query + "'");
        
        // Reposition dropdown in case the input has moved
        this._repositionSuggestions();
        
        // Make API call to our server proxy endpoint which will return address suggestions
        fetch('/api/address-suggestions?query=' + encodeURIComponent(query))
          .then(response => response.json())
          .then(data => {
            if (data.predictions && data.predictions.length > 0) {
              this._logDebug("Received " + data.predictions.length + " suggestions");
              
              // Log the first few predictions for debugging
              if (data.predictions.length > 0) {
                this._logDebug("First suggestion: '" + data.predictions[0].description + "'");
              }
              
              // Show the suggestions and update positioning
              this._showSuggestions(data.predictions);
              this._repositionSuggestions();
            } else {
              this._logDebug('No suggestions found');
              this._hideSuggestions();
            }
          })
          .catch(err => {
            this._logDebug("Error fetching suggestions: " + (err.message || "Unknown error"));
            console.error('Error fetching address suggestions:', err);
            // Fallback to local suggestions using basic pattern matching
            this._showLocalSuggestions(query);
          });
      },
      
      // Display suggestions in the dropdown
      _showSuggestions: function(suggestions) {
        if (!this._suggestionsEl) return;
        
        // Clear existing suggestions
        this._suggestionsEl.innerHTML = '';
        
        // Add each suggestion as a div
        suggestions.forEach(suggestion => {
          const suggestionEl = document.createElement('div');
          suggestionEl.className = 'maps-autocomplete-suggestion';
          suggestionEl.style.padding = '8px 12px';
          suggestionEl.style.cursor = 'pointer';
          suggestionEl.style.borderBottom = '1px solid #eee';
          suggestionEl.innerHTML = suggestion.description;
          
          // Handle suggestion click
          suggestionEl.addEventListener('click', () => {
            this.input.value = suggestion.description;
            this._hideSuggestions();
            this._notifyPlaceChanged(suggestion);
          });
          
          // Handle hover
          suggestionEl.addEventListener('mouseenter', () => {
            suggestionEl.style.backgroundColor = '#f5f5f5';
          });
          
          suggestionEl.addEventListener('mouseleave', () => {
            suggestionEl.style.backgroundColor = 'white';
          });
          
          this._suggestionsEl.appendChild(suggestionEl);
        });
        
        // Show the suggestions dropdown
        this._suggestionsEl.style.display = 'block';
        this._suggestionsVisible = true;
        
        // Make sure it's properly positioned
        this._repositionSuggestions();
      },
      
      // Fallback to local suggestions when API fails
      _showLocalSuggestions: function(query) {
        // Create some basic suggestions based on US states
        const suggestions = [
          { description: query + ', CA, USA', place_id: 'ca-' + Date.now() },
          { description: query + ', NY, USA', place_id: 'ny-' + Date.now() },
          { description: query + ', TX, USA', place_id: 'tx-' + Date.now() },
          { description: query + ', FL, USA', place_id: 'fl-' + Date.now() }
        ];
        
        this._showSuggestions(suggestions);
      },
      
      // Hide the suggestions dropdown
      _hideSuggestions: function() {
        if (this._suggestionsEl) {
          this._suggestionsEl.style.display = 'none';
          this._suggestionsVisible = false;
        }
      },
      
      // Notify listeners that a place has been selected
      _notifyPlaceChanged: function(suggestion) {
        // Create a place object similar to what Google Maps would return
        const place = this._createPlaceFromSuggestion(suggestion);
        
        // Store the selected place
        this._selectedPlace = place;
        
        // Notify listeners
        if (this.listeners['place_changed']) {
          this.listeners['place_changed'].forEach(fn => fn());
        }
      },
      
      // Create a place object from a suggestion
      _createPlaceFromSuggestion: function(suggestion) {
        let state = '';
        let address = suggestion.description;
        
        // Try to extract state from the address
        if (address.includes(',')) {
          const parts = address.split(',');
          if (parts.length >= 2) {
            const statePart = parts[1].trim().split(' ')[0].trim();
            if (statePart.length === 2) {
              state = statePart.toUpperCase();
            }
          }
        }
        
        return {
          formatted_address: address,
          name: address,
          place_id: suggestion.place_id || 'place-' + Date.now(),
          geometry: {
            location: {
              lat: () => 37.0902,  // Default center of US
              lng: () => -95.7129
            }
          },
          address_components: [
            { types: ['street_number'], long_name: '', short_name: '' },
            { types: ['route'], long_name: '', short_name: '' },
            { types: ['locality'], long_name: '', short_name: '' },
            { types: ['administrative_area_level_1'], long_name: state, short_name: state },
            { types: ['country'], long_name: 'United States', short_name: 'US' }
          ]
        };
      },
      
      // Standard API methods
      addListener: function(event, callback) {
        console.log('Adding listener for', event);
        this.listeners = this.listeners || {};
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);
        return { remove: function() {} };
      },
      
      getPlace: function() {
        // If we have a selected place from the suggestions, return it
        if (this._selectedPlace) {
          return this._selectedPlace;
        }
        
        // Otherwise create a basic place from the input value
        const address = this.input.value;
        let state = '';
        
        if (address.includes(',')) {
          const parts = address.split(',');
          if (parts.length >= 2) {
            const statePart = parts[1].trim().split(' ')[0].trim();
            if (statePart.length === 2) {
              state = statePart.toUpperCase();
            }
          }
        }
        
        console.log('Fallback returning place data for address:', address);
        
        return {
          formatted_address: address,
          name: address,
          place_id: 'manual-' + Date.now(),
          geometry: {
            location: { 
              lat: () => 37.0902, 
              lng: () => -95.7129 
            }
          },
          address_components: [
            { types: ['street_number'], long_name: '', short_name: '' },
            { types: ['route'], long_name: '', short_name: '' },
            { types: ['locality'], long_name: '', short_name: '' },
            { types: ['administrative_area_level_1'], long_name: state, short_name: state },
            { types: ['country'], long_name: 'United States', short_name: 'US' }
          ]
        };
      }
    };
    
    // Mark this as our shim implementation
    window.google.maps.places._isShim = true;
    
    // Provide better visibility for debugging
    window.logFallbackStatus = function() {
      console.log('Fallback active:', !!window.google.maps.places._isShim);
      console.log('Input element:', window.google.maps.places.Autocomplete.prototype.input);
      console.log('Suggestions element:', window.google.maps.places.Autocomplete.prototype._suggestionsEl);
    };
    
    // Call initialization function if it exists
    if (typeof initGooglePlacesAPI === 'function') {
      console.log('Calling initGooglePlacesAPI from enhanced fallback');
      initGooglePlacesAPI();
    } else if (typeof initializeGooglePlaces === 'function') {
      console.log('Calling initializeGooglePlaces from enhanced fallback');
      initializeGooglePlaces();
    } else {
      console.log('No Maps initialization function found, will initialize when called by application');
    }
  `;
}

// Export for both CommonJS and ES modules
export default generateFallbackScript;