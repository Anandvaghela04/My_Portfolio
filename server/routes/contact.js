const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // you as sender
      to: process.env.EMAIL_USER,   // you as receiver
      replyTo: `${name} <${email}>`, // reply goes to user's email
      subject: `📬 New Contact Form Submission from ${name}`,
      text: `You received a new message:\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: '✅ Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ error: 'Failed to send email. Try again later.' });
  }
});

module.exports = router;
