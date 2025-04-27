// Distance Calculator - A comprehensive distance calculation system with multi-tiered fallbacks
// Part of the Stackr service provider platform

// Expose a simple distance calculation function for testing
window.calculateDistance = async function(origin, destination) {
  if (!origin || !destination) {
    return { 
      status: 'ERROR', 
      error: 'Missing origin or destination' 
    };
  }

  try {
    // Use our server-side API endpoint with comprehensive fallbacks
    const url = `/api/distance-matrix?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calculating distance:', error);
    return { 
      status: 'ERROR', 
      error: error.message || 'Unknown error occurred' 
    };
  }
};

// Simplified distance calculation function that returns just the values
window.getDistanceSimple = async function(origin, destination) {
  try {
    const result = await window.calculateDistance(origin, destination);
    
    if (result.status === 'OK' && result.results && result.results.distance) {
      return {
        distance: result.results.distance.text,
        duration: result.results.duration.text,
        distanceValue: result.results.distance.value,
        durationValue: result.results.duration.value,
        source: result.source
      };
    } else {
      throw new Error(result.error || 'Distance calculation failed');
    }
  } catch (error) {
    console.error('Error getting simple distance:', error);
    return null;
  }
};

// Helper function to convert address to location object
window.parseLocation = function(address) {
  // Extract zip code if present
  const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
  const zip = zipMatch ? zipMatch[0].substring(0, 5) : null;
  
  // Simplified state extraction - this only works for US addresses with format "City, ST"
  const stateMatch = address.match(/,\s*([A-Z]{2})\b/);
  const state = stateMatch ? stateMatch[1] : null;
  
  return {
    address,
    zip,
    state,
    // Simplified city extraction - not accurate for all formats
    city: address.split(',')[0]
  };
};

// Handle updating a form with distance calculation results
window.updateFormWithDistance = async function(form, originField, destField, distanceField, resultContainer) {
  try {
    const origin = form[originField]?.value;
    const destination = form[destField]?.value;
    
    if (!origin || !destination) {
      if (resultContainer) {
        resultContainer.innerHTML = '<p class="error">Please enter both origin and destination addresses</p>';
      }
      return null;
    }
    
    if (resultContainer) {
      resultContainer.innerHTML = '<p>Calculating distance...</p>';
    }
    
    const distanceResult = await window.getDistanceSimple(origin, destination);
    
    if (distanceResult) {
      // Update distance field if provided
      if (form[distanceField]) {
        // Convert meters to miles if needed and round
        const distanceInMiles = distanceResult.distance;
        form[distanceField].value = distanceInMiles;
      }
      
      // Update result container if provided
      if (resultContainer) {
        const sourceBadge = distanceResult.source === 'google-maps-api' 
          ? '<span class="badge badge-success">Google Maps</span>' 
          : '<span class="badge badge-warning">Estimate</span>';
          
        resultContainer.innerHTML = `
          <p>Distance: <strong>${distanceResult.distance}</strong> (${sourceBadge})</p>
          <p>Estimated Travel Time: ${distanceResult.duration}</p>
        `;
      }
      
      return distanceResult;
    } else {
      if (resultContainer) {
        resultContainer.innerHTML = '<p class="error">Failed to calculate distance</p>';
      }
      return null;
    }
  } catch (error) {
    console.error('Error updating form with distance:', error);
    if (resultContainer) {
      resultContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
    return null;
  }
};

console.log('Distance calculator utilities loaded successfully');