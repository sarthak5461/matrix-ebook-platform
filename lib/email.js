import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, html }) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'no-reply@matrix-ebook.com'

  if (!host || !user || !pass) {
    // Fallback: log to console so devs can copy the link during MVP
    console.log('\n==== EMAIL (SMTP not configured) ====')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML:\n', html)
    console.log('===================================\n')
    return { mocked: true }
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass },
  })
  await transporter.sendMail({ from, to, subject, html })
  return { sent: true }
}
