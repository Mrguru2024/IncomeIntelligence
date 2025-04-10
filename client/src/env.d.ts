/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_SANITY_PROJECT_ID: string;
  VITE_SANITY_DATASET: string;
  VITE_SANITY_API_VERSION: string;
  VITE_SANITY_TOKEN: string;
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
  debugLog?: (message: string, isError?: boolean) => void;
}