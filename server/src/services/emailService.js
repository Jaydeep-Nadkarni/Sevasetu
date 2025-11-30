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
const emailQueue = new Queue('email', {
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

/**
 * Add email to queue
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} template - Template name (without .hbs)
 * @param {object} data - Data to inject into template
 * @param {object} options - Bull job options (optional)
 */
export const sendEmail = async (to, subject, template, data, options = {}) => {
  // Check if user has opted out of this type of email (if we had types)
  // For now, we assume critical emails or check preferences before calling this function
  
  // In development without Redis, we might want to bypass queue or mock it
  // But per requirements, we use the queue.
  
  try {
    await emailQueue.add({
      to,
      subject,
      template,
      data,
    }, options);
    return true;
  } catch (error) {
    console.error('Error adding email to queue:', error);
    // Fallback to direct send if queue fails (e.g. Redis down)?
    // For now, just log error.
    return false;
  }
};

export default {
  sendEmail,
  emailQueue
};
