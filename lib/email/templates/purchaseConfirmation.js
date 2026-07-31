import { buildEmailLayout } from "./layout";

export function buildPurchaseConfirmationTemplate({
  name,
  bookTitle,
  amount,
  orderId,
  purchaseDate,
  readerUrl,
}) {
  return buildEmailLayout({
    title: "Purchase Confirmed",

    heading: `Thank you for your purchase, ${name}! 🎉`,

    content: `
<p>
Your payment has been successfully received.
</p>

<p>
You now have full access to your purchased book.
</p>

<table style="width:100%;border-collapse:collapse;margin:24px 0;">
  <tr>
    <td style="padding:10px;border:1px solid #e5e7eb;"><strong>Book</strong></td>
    <td style="padding:10px;border:1px solid #e5e7eb;">${bookTitle}</td>
  </tr>

  <tr>
    <td style="padding:10px;border:1px solid #e5e7eb;"><strong>Amount</strong></td>
    <td style="padding:10px;border:1px solid #e5e7eb;">₹${amount}</td>
  </tr>

  <tr>
    <td style="padding:10px;border:1px solid #e5e7eb;"><strong>Order ID</strong></td>
    <td style="padding:10px;border:1px solid #e5e7eb;">${orderId}</td>
  </tr>

  <tr>
    <td style="padding:10px;border:1px solid #e5e7eb;"><strong>Purchase Date</strong></td>
    <td style="padding:10px;border:1px solid #e5e7eb;">${purchaseDate}</td>
  </tr>

  <tr>
    <td style="padding:10px;border:1px solid #e5e7eb;"><strong>Status</strong></td>
    <td style="padding:10px;border:1px solid #e5e7eb;color:#16a34a;font-weight:bold;">
      🟢 Paid
    </td>
  </tr>
</table>

<p>
You can start reading immediately by clicking the button below.
</p>
`,

    buttonText: "Read Your Book",

    buttonUrl: readerUrl,
  });
}
