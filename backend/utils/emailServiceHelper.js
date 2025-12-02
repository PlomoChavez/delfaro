const nodemailer = require("nodemailer");
require("dotenv").config();
// Configuración del transporte de correo usando variables de entorno
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // Servicio de correo (por defecto Gmail)
  auth: {
    user: process.env.EMAIL_USER, // Correo electrónico del remitente
    pass: process.env.EMAIL_PASSWORD, // Contraseña o app password del remitente
  },
});

// Función para enviar correos
exports.enviarCorreo = async (params) => {
  try {
    const { to, subject, text, html, attachments } = params; // Asegúrate de incluir attachments

    // Validar campos requeridos
    if (!to || !subject || (!text && !html)) {
      return {
        result: false,
        message: "Faltan campos requeridos para enviar el correo",
      };
    }

    // Configuración del correo
    const mailOptions = {
      from: `"${process.env.EMAIL_TITLE}" <${process.env.EMAIL_USER}>`, // Apodo y correo del remitente
      to, // Dirección del destinatario
      subject, // Asunto del correo
      text, // Texto plano (opcional)
      html, // Contenido HTML (opcional)
      attachments: attachments || [], // Adjuntos (opcional)
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    return {
      result: true,
      message: "Correo enviado con éxito",
      info,
    };
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return {
      result: false,
      message: "Error al enviar el correo: " + error.message,
    };
  }
};
