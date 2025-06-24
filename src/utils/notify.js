const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporte de correo usando las credenciales de la dueña
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.OWNER_EMAIL,
    pass: process.env.OWNER_EMAIL_PASS
  }
});

// Enviar notificación por correo
async function sendEmail(to, subject, text) {
  if (!process.env.OWNER_EMAIL || !process.env.OWNER_EMAIL_PASS) {
    console.warn('Credenciales de correo no configuradas.');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.OWNER_EMAIL,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error('Error enviando correo:', err);
  }
}

module.exports = { sendEmail };
