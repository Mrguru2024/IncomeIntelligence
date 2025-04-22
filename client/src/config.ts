export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:443',
  clientUrl: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://localhost:3000',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  plaidEnv: process.env.NEXT_PUBLIC_PLAID_ENV || 'sandbox',
  plaidPublicKey: process.env.NEXT_PUBLIC_PLAID_PUBLIC_KEY || '',
}; 