import { sendEmail } from "./sendEmail";
import { buildResetPasswordTemplate } from "./templates/reset-password";

export async function sendResetPasswordEmail({ email, name, resetLink }) {
  return sendEmail({
    to: email,
    subject: "Reset your Matrix Structural Analysis password",
    html: buildResetPasswordTemplate({
      name,
      resetLink,
    }),
  });
}
