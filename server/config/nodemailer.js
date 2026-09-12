import nodemailer from 'nodemailer';

const isConfigured = 
  process.env.SMTP_HOST && 
  process.env.SMTP_PORT && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASS;

let transporter = null;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('Nodemailer SMTP configured.');
} else {
  console.log('SMTP settings missing. Ethereal Test Mailer / Console Logging will be initialized.');
}

/**
 * Send an email using configured SMTP or Ethereal test account.
 * @param {object} options - Email options { to, subject, html, text }
 */
export const sendEmail = async (options) => {
  const fromEmail = process.env.SMTP_FROM || 'noreply@kingsmart.com';
  
  if (isConfigured && transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Kings Mart" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('SMTP email send failed:', error.message);
    }
  }

  // Fallback to Ethereal Email or Console Logger
  try {
    // Dynamically create a test SMTP service account on ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await testTransporter.sendMail({
      from: `"Kings Mart (Mock)" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html
    });

    console.log(`[Email Mock] Sent to: ${options.to}`);
    console.log(`[Email Mock] Subject: ${options.subject}`);
    console.log(`[Email Mock] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  } catch (error) {
    // If offline/Ethereal fails, just print to console
    console.log('\n=========================================');
    console.log(`[EMAIL OFFLINE MOCK LOG]`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || options.html.replace(/<[^>]*>/g, '')}`);
    console.log('=========================================\n');
    return { messageId: `offline_mock_${Date.now()}` };
  }
};

export default sendEmail;
