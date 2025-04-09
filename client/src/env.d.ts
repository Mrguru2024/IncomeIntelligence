/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_SANITY_PROJECT_ID: string;
  VITE_SANITY_DATASET: string;
  VITE_SANITY_API_VERSION: string;
  VITE_SANITY_TOKEN: string;
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_STRIPE_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add support for window.env
interface Window {
  env: {
    VITE_SANITY_PROJECT_ID: string;
    VITE_SANITY_DATASET: string;
    VITE_SANITY_API_VERSION: string;
    VITE_STRIPE_PUBLIC_KEY: string;
  };
}