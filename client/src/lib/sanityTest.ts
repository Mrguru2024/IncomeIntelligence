
import { sanityClient } from './sanity';

export async function testSanityConnection() {
  try {
    // Simple query to test connection
    const result = await sanityClient.fetch('*[_type == "test"][0...1]');
    console.log('Sanity connection successful:', result);
    return true;
  } catch (error) {
    console.error('Sanity connection error:', error);
    return false;
  }
}
