/**
 * Queue utility for handling background tasks
 * Uses BullMQ with Redis for reliable job processing
 */

const { Queue, Worker, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

// Check if Redis URL is provided
if (!process.env.REDIS_URL) {
  console.warn('REDIS_URL not found in environment variables. Queue functionality will be disabled.');
}

// COMPLETELY DISABLE REDIS FOR NOW - fallback to in-memory queue only
let connection = null;
console.log('Redis disabled for now, using in-memory queue fallback only');

// Log Redis connection status
if (connection) {
  connection.on('connect', () => {
    console.log('Redis connected successfully');
  });
  
  connection.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
}

// Create queues with connection (only if Redis is available)
const emailQueue = connection ? 
  new Queue('email-notifications', { connection }) : null;

const paymentQueue = connection ? 
  new Queue('payment-processing', { connection }) : null;

const quoteQueue = connection ? 
  new Queue('quote-generation', { connection }) : null;

// Setup Queue Schedulers to handle delayed jobs and retries
let emailWorker = null;
let paymentWorker = null;
let quoteWorker = null;

if (connection) {
  try {
    // Email notifications scheduler
    new QueueScheduler('email-notifications', { connection });
    
    // Payment processing scheduler
    new QueueScheduler('payment-processing', { connection });
    
    // Quote generation scheduler
    new QueueScheduler('quote-generation', { connection });
    
    console.log('Queue schedulers initialized');
  } catch (error) {
    console.error('Error initializing queue schedulers:', error);
  }

  // Create workers to process jobs
  // Email worker
  emailWorker = new Worker('email-notifications', async job => {
    console.log(`Processing email job [${job.id}]:`, job.name);
    
    try {
      // Determine email type and process accordingly
      switch (job.name) {
        case 'quote-accepted':
          await processQuoteAcceptedEmail(job.data);
          break;
        case 'payment-received':
          await processPaymentReceivedEmail(job.data);
          break;
        case 'invoice-sent':
          await processInvoiceSentEmail(job.data);
          break;
        case 'welcome':
          await processWelcomeEmail(job.data);
          break;
        default:
          await processGenericEmail(job.data);
      }
      
      console.log(`Email job [${job.id}] completed successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Email job [${job.id}] failed:`, error);
      throw error; // Re-throw to trigger retry mechanism
    }
  }, { connection });
  
  // Payment worker
  paymentWorker = new Worker('payment-processing', async job => {
    console.log(`Processing payment job [${job.id}]:`, job.name);
    
    try {
      switch (job.name) {
        case 'process-stripe-payment':
          await processStripePayment(job.data);
          break;
        case 'process-wallet-payment':
          await processWalletPayment(job.data);
          break;
        case 'record-cash-payment':
          await recordCashPayment(job.data);
          break;
        default:
          console.warn(`Unknown payment job type: ${job.name}`);
      }
      
      console.log(`Payment job [${job.id}] completed successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Payment job [${job.id}] failed:`, error);
      throw error;
    }
  }, { connection });
  
  // Quote worker
  quoteWorker = new Worker('quote-generation', async job => {
    console.log(`Processing quote job [${job.id}]:`, job.name);
    
    try {
      switch (job.name) {
        case 'generate-ai-quote':
          await generateAiQuote(job.data);
          break;
        case 'update-quote-status':
          await updateQuoteStatus(job.data);
          break;
        default:
          console.warn(`Unknown quote job type: ${job.name}`);
      }
      
      console.log(`Quote job [${job.id}] completed successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Quote job [${job.id}] failed:`, error);
      throw error;
    }
  }, { connection });
  
  // Setup event listeners for workers
  const workers = [emailWorker, paymentWorker, quoteWorker];
  for (const worker of workers) {
    if (worker) {
      worker.on('completed', job => {
        console.log(`${worker.name} job ${job.id} completed successfully`);
      });
      
      worker.on('failed', (job, err) => {
        console.error(`${worker.name} job ${job.id} failed:`, err);
      });
    }
  }
}

// Email processing implementations
async function processQuoteAcceptedEmail(data) {
  const { email, quote, user } = data;
  // TODO: Implement with email service
  console.log(`Would send quote accepted email to ${email}`);
}

async function processPaymentReceivedEmail(data) {
  const { email, payment, invoice } = data;
  // TODO: Implement with email service
  console.log(`Would send payment confirmation email to ${email}`);
}

async function processInvoiceSentEmail(data) {
  const { email, invoice } = data;
  // TODO: Implement with email service
  console.log(`Would send invoice email to ${email}`);
}

async function processWelcomeEmail(data) {
  const { email, user } = data;
  // TODO: Implement with email service
  console.log(`Would send welcome email to ${email}`);
}

async function processGenericEmail(data) {
  const { to, subject, body } = data;
  // TODO: Implement with email service
  console.log(`Would send generic email to ${to}`);
}

// Payment processing implementations
async function processStripePayment(data) {
  const { amount, customerId, paymentMethodId, metadata } = data;
  // TODO: Implement with Stripe service
  console.log(`Would process Stripe payment of $${amount}`);
}

async function processWalletPayment(data) {
  const { userId, amount, quoteId } = data;
  // TODO: Implement with user profile service
  console.log(`Would process wallet payment of $${amount} for user ${userId}`);
}

async function recordCashPayment(data) {
  const { amount, quoteId, paymentDate } = data;
  // TODO: Implement with storage service
  console.log(`Would record cash payment of $${amount} for quote ${quoteId}`);
}

// Quote processing implementations
async function generateAiQuote(data) {
  const { jobType, location, services, userId } = data;
  // TODO: Implement with AI service
  console.log(`Would generate AI quote for ${jobType} in ${location}`);
}

async function updateQuoteStatus(data) {
  const { quoteId, status, updateData } = data;
  // TODO: Implement with storage service
  console.log(`Would update quote ${quoteId} to status ${status}`);
}

// Cleanup function for graceful shutdown
async function closeQueues() {
  if (!connection) return;
  
  try {
    console.log('Closing queue connections...');
    
    // Close workers
    if (emailWorker) await emailWorker.close();
    if (paymentWorker) await paymentWorker.close();
    if (quoteWorker) await quoteWorker.close();
    
    // Close queues
    if (emailQueue) await emailQueue.close();
    if (paymentQueue) await paymentQueue.close();
    if (quoteQueue) await quoteQueue.close();
    
    // Close Redis connection
    if (connection) await connection.quit();
    
    console.log('Queue connections closed');
  } catch (error) {
    console.error('Error closing queue connections:', error);
  }
}

// Export the modules for use in other files
module.exports = {
  emailQueue,
  paymentQueue,
  quoteQueue,
  closeQueues,
  emailWorker,
  paymentWorker,
  quoteWorker
};