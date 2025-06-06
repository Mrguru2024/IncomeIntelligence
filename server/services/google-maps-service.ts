/**
 * Google Maps API service
 * Provides centralized access to Google Maps API functionality
 * and handles validation, caching, and error handling
 */

// Cache API key status to avoid repeated API calls
let keyValidationStatus = {
  lastChecked: 0,
  isValid: false,
  error: null as string | null,
  requiresBilling: false,
  apiResponse: null as any,
};

// Clear the cache after 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

/**
 * Validates the Google Maps API key with a lightweight request
 * @returns Validation result with status and error information
 */
export async function validateGoogleMapsApiKey(): Promise<{
  isValid: boolean;
  errorMessage?: string;
  requiresBilling?: boolean;
  apiResponse?: any;
}> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // If no API key is provided, return error
  if (!apiKey) {
    return {
      isValid: false,
      errorMessage: 'Google Maps API key is not configured',
    };
  }
  
  // Check cache first
  const now = Date.now();
  if (now - keyValidationStatus.lastChecked < CACHE_TTL) {
    return {
      isValid: keyValidationStatus.isValid,
      errorMessage: keyValidationStatus.error || undefined,
      requiresBilling: keyValidationStatus.requiresBilling,
      apiResponse: keyValidationStatus.apiResponse,
    };
  }
  
  try {
    // Make a lightweight geocoding request to test the API key
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${apiKey}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Update cache
    keyValidationStatus.lastChecked = now;
    keyValidationStatus.apiResponse = data;
    
    // Check for API key validity
    if (data.error_message && (data.error_message.includes('API key') || data.status === 'REQUEST_DENIED')) {
      // Check for billing-related errors
      const requiresBilling = data.error_message.includes('billing');
      
      console.error('Google Maps API key validation failed:', data.error_message);
      
      // Update cache with error
      keyValidationStatus.isValid = false;
      keyValidationStatus.error = data.error_message;
      keyValidationStatus.requiresBilling = requiresBilling;
      
      return {
        isValid: false,
        errorMessage: data.error_message,
        requiresBilling,
        apiResponse: data,
      };
    }
    
    // Mark as valid
    console.log('Successfully validated Google Maps API key');
    keyValidationStatus.isValid = true;
    keyValidationStatus.error = null;
    keyValidationStatus.requiresBilling = false;
    
    return {
      isValid: true,
      apiResponse: data,
    };
  } catch (error: any) {
    console.error('Error validating Google Maps API key:', error);
    
    // Update cache with error
    keyValidationStatus.lastChecked = now;
    keyValidationStatus.isValid = false;
    keyValidationStatus.error = error.message;
    keyValidationStatus.requiresBilling = false;
    
    return {
      isValid: false,
      errorMessage: error.message,
    };
  }
}

/**
 * Reset the validation status cache to force a new validation on next call
 */
export function resetGoogleMapsApiKeyValidation(): void {
  keyValidationStatus.lastChecked = 0;
}

/**
 * Checks if billing is properly set up for the Google Maps API
 * @returns Whether billing needs to be enabled
 */
export async function requiresBillingForMapsApi(): Promise<boolean> {
  const result = await validateGoogleMapsApiKey();
  return !!result.requiresBilling;
}

/**
 * Returns the validated Google Maps API key if it's valid
 * @returns The API key or null if invalid
 */
export async function getValidatedMapsApiKey(): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  
  const result = await validateGoogleMapsApiKey();
  return result.isValid ? apiKey : null;
}

/**
 * Get distance and duration between two locations using Google Maps Distance Matrix API
 * @param origin Origin address or coordinates
 * @param destination Destination address or coordinates
 * @returns Distance matrix results with status, distance and duration
 */
export async function getDistanceMatrix(
  origin: string,
  destination: string
): Promise<{
  status: string;
  results?: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    status: string;
  };
  error?: string;
}> {
  try {
    const apiKey = await getValidatedMapsApiKey();
    
    if (!apiKey) {
      return {
        status: 'ERROR',
        error: 'Invalid or missing Google Maps API key'
      };
    }
    
    // Make DistanceMatrix API request
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving&units=imperial&key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Check for API errors
    if (data.status !== 'OK') {
      return {
        status: 'ERROR',
        error: data.error_message || `Distance Matrix API returned status: ${data.status}`
      };
    }
    
    // Check if we have any results
    if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
      return {
        status: 'ERROR',
        error: 'No results found from Distance Matrix API'
      };
    }
    
    const element = data.rows[0].elements[0];
    
    // Check element status
    if (element.status !== 'OK') {
      return {
        status: 'ERROR',
        error: `Element status: ${element.status}`
      };
    }
    
    // Return formatted results
    return {
      status: 'OK',
      results: {
        distance: element.distance,
        duration: element.duration,
        status: 'OK'
      }
    };
  } catch (error: any) {
    console.error('Error getting distance matrix:', error);
    return {
      status: 'ERROR',
      error: error.message || 'Unknown error getting distance matrix'
    };
  }
}