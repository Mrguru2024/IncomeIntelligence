/**
 * Payment scripts proxy routes to handle Content Security Policy restrictions
 * This allows us to proxy external payment scripts through our server
 */

import express, { Router } from 'express';
import https from 'https';

const router = Router();

// Proxy for Stripe.js script
router.get('/stripe', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  
  // Proxy the Stripe.js script
  https.get('https://js.stripe.com/v3/', (stripeRes) => {
    stripeRes.pipe(res);
  }).on('error', (err) => {
    console.error('Error fetching Stripe script:', err);
    res.status(500).send('console.error("Failed to load Stripe.js");');
  });
});

export default router;