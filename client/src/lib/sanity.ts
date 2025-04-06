
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-03-20',
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export const urlFor = (source: any) => {
  return builder.image(source);
};
