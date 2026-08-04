import { sendEmail } from "./sendEmail";
import { buildPurchaseConfirmationTemplate } from "./templates/purchaseConfirmation";

export async function sendPurchaseConfirmationEmail({
  email,
  name,
  bookTitle,
  amount,
  orderId,
  purchaseDate,
  readerUrl,
}) {
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(purchaseDate));
  return sendEmail({
    to: email,
    subject: "Your Purchase is Confirmed",
    html: buildPurchaseConfirmationTemplate({
      name,
      bookTitle,
      amount,
      orderId,
      purchaseDate: formattedDate,
      readerUrl,
    }),
  });
}
