import { sendEmail } from "./sendEmail";
import { buildWelcomeTemplate } from "./templates/welcome";

export async function sendWelcomeEmail({ email, name, dashboardUrl }) {
  return sendEmail({
    to: email,
    subject: "Welcome to Matrix Structural Analysis",
    html: buildWelcomeTemplate({
      name,
      dashboardUrl,
    }),
  });
}
