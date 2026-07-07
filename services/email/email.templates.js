export const getVerificationEmailTemplate = (username, confirmUrl) => `
  <div style="font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333; background-color: #111; color: #eee; border-radius: 10px;">
    <h2 style="color: #74b9ff;">Welcome to the network, ${username}_</h2>
    <p>We need to verify your connection. Click the terminal link below to authenticate your account:</p>
    <a href="${confirmUrl}" style="display: inline-block; background-color: #74b9ff; color: #111; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
      [ VERIFY_ACCOUNT ]
    </a>
    <p style="font-size: 12px; color: #666;">If you did not initiate this request, safely ignore this transmission.</p>
  </div>
`;


export const getWelcomeEmailTemplate = (username) => `
  <div style="font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333; background-color: #111; color: #eee; border-radius: 10px;">
    <h2 style="color: #74b9ff;">Welcome to the network, ${username}_</h2>
    <p>We're thrilled to have you on board! Dive in and explore the features we offer.</p>
    <p style="font-size: 12px; color: #666;">If you have any questions or need assistance, our support team is here to help.</p>
  </div>
`;
// You can add getPasswordResetTemplate, getMissedMessagesTemplate, etc. here later