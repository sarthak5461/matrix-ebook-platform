import { getTransporter } from "./transporter";

export async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("SMTP not configured");
    return;
  }

  return getTransporter().sendMail({
    from:
      process.env.EMAIL_FROM ||
      `"Matrix Structural Analysis" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
