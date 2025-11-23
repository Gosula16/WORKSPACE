// stub - replace with nodemailer/sendgrid config
const User = require('../models/User');

module.exports = {
  sendMail: async ({ to, subject, text, html }) => {
    console.log('sendMail stub ->', to, subject);
    return Promise.resolve();
  },
  sendEmail: async (recipientId, subject, text) => {
    try {
      const user = await User.findById(recipientId);
      if (!user) throw new Error('User not found');
      await this.sendMail({ to: user.email, subject, text });
    } catch (err) {
      console.error('Email send error:', err);
    }
  }
};
