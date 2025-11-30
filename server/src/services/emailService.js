import Queue from 'bull';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Email Queue
// If REDIS_HOST is not set, we might want to warn or fallback, but for now we assume it's needed for Bull
let emailQueue;
let queueEnabled = true;

try {
  emailQueue = new Queue('email', {
    redis: config.redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    },
  });
  
  // Test Redis connection
  emailQueue.on('error', (error) => {
    console.error('Email queue error (Redis connection failed):', error.message);
    queueEnabled = false;
  });
} catch (error) {
  console.error('Failed to initialize email queue:', error.message);
  queueEnabled = false;
}

// Initialize Transporter
const transporter = nodemailer.createTransport({
  service: config.service,
  auth: config.auth,
});

// Template Cache
const templateCache = {};

/**
 * Compile template with data
 */
const compileTemplate = async (templateName, data) => {
  if (!templateCache[templateName]) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    try {
      const source = await fs.readFile(templatePath, 'utf-8');
      templateCache[templateName] = handlebars.compile(source);
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }
  
  // Add common data
  const commonData = {
    year: new Date().getFullYear(),
    ...data
  };

  return templateCache[templateName](commonData);
};

/**
 * Process email jobs
 */
if (emailQueue) {
  emailQueue.process(async (job) => {
    const { to, subject, template, data } = job.data;

    try {
      console.log(`Processing email job for ${to} (Template: ${template})`);
      
      const html = await compileTemplate(template, data);

      const info = await transporter.sendMail({
        from: config.from,
        to,
        subject,
        html,
      });

      console.log(`Email sent to ${to}: ${info.messageId}`);
      return { messageId: info.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error; // Triggers Bull retry
    }
  });

  // Handle Queue Events
  emailQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed! Result: ${result.messageId}`);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed! Error: ${err.message}`);
  });
}

/**
 * Send email directly without queue (fallback)
 */
const sendEmailDirect = async (to, subject, template, data) => {
  try {
    const html = await compileTemplate(template, data);
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });
    console.log(`Email sent directly to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email directly to ${to}:`, error);
    return false;
  }
};

/**
 * Add email to queue
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} template - Template name (without .hbs)
 * @param {object} data - Data to inject into template
 * @param {object} options - Bull job options (optional)
 */
export const sendEmail = async (to, subject, template, data, options = {}) => {
  // Check if queue is enabled and working
  if (queueEnabled && emailQueue) {
    try {
      await emailQueue.add({
        to,
        subject,
        template,
        data,
      }, options);
      return true;
    } catch (error) {
      console.error('Error adding email to queue, falling back to direct send:', error.message);
      // Fallback to direct send
      return await sendEmailDirect(to, subject, template, data);
    }
  } else {
    // Queue not available, send directly
    console.log('Email queue not available, sending email directly');
    return await sendEmailDirect(to, subject, template, data);
  }
};

export default {
  sendEmail,
  emailQueue
};
