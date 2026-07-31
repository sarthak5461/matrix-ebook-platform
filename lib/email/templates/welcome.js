import { buildEmailLayout } from "./layout";

export function buildWelcomeTemplate({ name, dashboardUrl }) {
  return buildEmailLayout({
    title: "Welcome",
    heading: `Welcome, ${name}! 🎉`,

    content: `
<p>
Thank you for creating your Matrix Structural Analysis account.
</p>

<p>
Your account is now ready.
</p>

<p>
You can now:
</p>

<ul>
<li>Access your dashboard</li>
<li>Purchase the book</li>
<li>Read purchased content</li>
<li>Receive future updates</li>
</ul>

<p>
We're excited to have you as part of our community.
</p>
`,

    buttonText: "Go to Dashboard",

    buttonUrl: dashboardUrl,
  });
}
