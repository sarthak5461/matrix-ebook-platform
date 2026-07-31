import { buildEmailLayout } from "./layout";

export function buildResetPasswordTemplate({ name, resetLink }) {
  return buildEmailLayout({
    title: "Reset Your Password",

    heading: `Hello ${name},`,

    content: `
<p>
We received a request to reset your password for your
<strong>Matrix Structural Analysis</strong> account.
</p>

<p>
If you requested this password reset, click the button below to choose a new password.
</p>

<p>
This password reset link will expire in
<strong>1 hour</strong>.
</p>

<p>
If you did not request a password reset, you can safely ignore this email.
Your password will remain unchanged.
</p>
`,

    buttonText: "Reset Password",

    buttonUrl: resetLink,
  });
}
