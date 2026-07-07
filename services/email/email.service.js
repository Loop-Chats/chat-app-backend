import sgMail from '../../lib/sendgrid.js';
import { getVerificationEmailTemplate } from './email.templates.js';

export const sendVerificationEmail = async (email, username, token) => {
  const confirmUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const html = getVerificationEmailTemplate(username, confirmUrl);

  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify Your Account",
    html
  });
};

export const sendWelcomeEmail = async (email, username) => {
  const html = getWelcomeEmailTemplate(username);

  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Welcome to the Network!",
    html
  });
};