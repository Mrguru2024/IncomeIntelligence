
import { createClient } from '@sanity/client';

const projectId = '5enbinz3';
const dataset = 'production';
const apiVersion = '2024-01-01';
const token = import.meta.env.VITE_SANITY_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token
});
