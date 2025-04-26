/**
 * Enhanced Google Maps fallback script
 * This provides a client-side fallback implementation when the Google Maps JavaScript API cannot be loaded
 */
module.exports = function generateFallbackScript() {
  return `
    console.log('Loading Google Maps enhanced fallback implementation');
    
    // Create a minimal shim for the Google Maps API
    window.google = window.google || {};
    window.google.maps = window.google.maps || {};
    window.google.maps.places = window.google.maps.places || {};
    
    // Mock the Autocomplete constructor
    window.google.maps.places.Autocomplete = function(input, options) {
      console.log('Creating autocomplete for input:', input.id);
      
      this.input = input;
      this.options = options || {};
      this.listeners = {};
      this._setupUI();
      
      // Set up event listeners on the input
      this._setupInputListeners();
      
      console.log('Adding listener for', 'place_changed');
    };
    
    // Add methods to the Autocomplete prototype
    window.google.maps.places.Autocomplete.prototype = {
      // Set up the autocomplete UI elements
      _setupUI: function() {
        // Create container for suggestions that will be positioned below the input
        const suggestionsEl = document.createElement('div');
        suggestionsEl.className = 'maps-autocomplete-suggestions';
        suggestionsEl.style.display = 'none';
        suggestionsEl.style.position = 'fixed';
        suggestionsEl.style.zIndex = '9999';
        suggestionsEl.style.backgroundColor = 'white';
        suggestionsEl.style.border = '1px solid #ccc';
        suggestionsEl.style.borderRadius = '4px';
        suggestionsEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        suggestionsEl.style.maxHeight = '200px';
        suggestionsEl.style.overflowY = 'auto';
        suggestionsEl.style.width = this.input.offsetWidth + 'px';
        
        // Add the suggestions element directly to the body for better positioning
        document.body.appendChild(suggestionsEl);
        
        // Position it based on the input's position
        this._repositionDropdown();
        
        // Add window resize listener to reposition when needed
        window.addEventListener('resize', () => {
          this._repositionDropdown();
        });
        
        this._suggestionsEl = suggestionsEl;
        
        // Add a visible debug info element
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
        this._debugElement.style.maxHeight = '300px';
        this._debugElement.style.overflowY = 'auto';
        document.body.appendChild(this._debugElement);
        
        this._debug("Autocomplete UI initialized for " + (this.input.id || "unnamed input"));
      },
      
      // Set up event listeners on the input element
      _setupInputListeners: function() {
        // Listen for input changes
        this.input.addEventListener('input', () => {
          const value = this.input.value.trim();
          
          if (value.length >= 3) {
            this._fetchSuggestions(value);
          } else {
            this._hideSuggestions();
          }
        });
        
        // Hide suggestions when input loses focus
        // But delay it slightly to allow clicking on suggestions
        this.input.addEventListener('blur', () => {
          setTimeout(() => {
            this._hideSuggestions();
          }, 200);
        });
        
        // Handle keyboard navigation
        this.input.addEventListener('keydown', (e) => {
          if (!this._suggestionsVisible) return;
          
          if (e.key === 'Escape') {
            this._hideSuggestions();
            e.preventDefault();
          }
        });
        
        this._debug("Input listeners setup complete");
      },
      
      // Reposition the dropdown based on input position
      _repositionDropdown: function() {
        if (!this._suggestionsEl || !this.input) return;
        
        const inputRect = this.input.getBoundingClientRect();
        
        // Position relative to viewport, accounting for scroll
        this._suggestionsEl.style.width = inputRect.width + 'px';
        this._suggestionsEl.style.left = inputRect.left + 'px';
        this._suggestionsEl.style.top = (inputRect.bottom + 2) + 'px';
        
        this._debug("Positioned dropdown at: " + inputRect.left + "px, " + inputRect.bottom + "px, width: " + inputRect.width + "px");
      },
      
      // Log debug information
      _debug: function(message) {
        console.log("[Maps Autocomplete] " + message);
        
        // Update debug element
        if (this._debugElement) {
          const timestamp = new Date().toLocaleTimeString();
          this._debugElement.innerHTML += timestamp + ": " + message + "<br>";
          this._debugElement.style.display = 'block';
          
          // Scroll to bottom
          this._debugElement.scrollTop = this._debugElement.scrollHeight;
          
          // Remove old messages to avoid too much content
          if (this._debugElement.innerHTML.split('<br>').length > 20) {
            const lines = this._debugElement.innerHTML.split('<br>');
            this._debugElement.innerHTML = lines.slice(lines.length - 20).join('<br>');
          }
        }
      },
      
      // Fetch address suggestions from the server
      _fetchSuggestions: function(query) {
        this._debug("Fetching suggestions for: '" + query + "'");
        
        // Reposition dropdown in case the input has moved
        this._repositionDropdown();
        
        // Make API call to our server proxy endpoint which will return address suggestions
        fetch('/api/address-suggestions?query=' + encodeURIComponent(query))
          .then(response => response.json())
          .then(data => {
            if (data.predictions && data.predictions.length > 0) {
              this._debug("Received " + data.predictions.length + " suggestions");
              
              // Log the first few predictions for debugging
              if (data.predictions.length > 0) {
                this._debug("First suggestion: '" + data.predictions[0].description + "'");
              }
              
              // Show the suggestions and update positioning
              this._showSuggestions(data.predictions);
              this._repositionDropdown();
            } else {
              this._debug('No suggestions found');
              this._hideSuggestions();
            }
          })
          .catch(err => {
            this._debug("Error fetching suggestions: " + (err.message || "Unknown error"));
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
        const place = {
          formatted_address: suggestion.description,
          name: suggestion.description,
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
            { types: ['administrative_area_level_1'], long_name: '', short_name: '' },
            { types: ['country'], long_name: 'United States', short_name: 'US' }
          ]
        };
        
        // Store the selected place
        this._selectedPlace = place;
        
        // Notify listeners
        if (this.listeners['place_changed']) {
          this.listeners['place_changed'].forEach(fn => fn());
        }
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
            { types: ['administrative_area_level_1'], long_name: '', short_name: '' },
            { types: ['country'], long_name: 'United States', short_name: 'US' }
          ]
        };
      }
    };
    
    // Mark this as our shim implementation
    window.google.maps.places._isShim = true;
    
    // Call initialization function
    if (typeof initGooglePlacesAPI === 'function') {
      console.log('Calling initGooglePlacesAPI from enhanced fallback');
      initGooglePlacesAPI();
    } else if (typeof initializeGooglePlaces === 'function') {
      console.log('Calling initializeGooglePlaces from enhanced fallback');
      initializeGooglePlaces();
    } else {
      console.error('No Maps initialization function found');
    }
  `;
};