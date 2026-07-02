export default function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay)
      return resolve(window.Razorpay);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(window.Razorpay);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}
