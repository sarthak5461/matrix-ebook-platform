import { toast } from "sonner";
import loadRazorpay from "@/lib/razorpay";

export async function handleBuy(me, router) {
  if (!me) {
    router.push("/login?next=/dashboard&buy=1");
    return;
  }
  if (me.purchasedBook) {
    router.push("/reader");
    return;
  }
  try {
    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
    });
    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error || "Failed");
    if (order.mock) {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: "pay_mock",
          razorpay_signature: "mock",
        }),
      });

      const v = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(v.error || "Verify failed");
      }

      toast.success("Payment successful!");

      setTimeout(() => {
        router.push("/reader");
      }, 700);
    } else {
      // Real Razorpay - lazy load checkout script
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        throw new Error("Unable to load Razorpay.");
      }
      const opts = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Matrix Structural Analysis",
        description: "Lifetime reading access",
        order_id: order.orderId,
        prefill: { name: order.user.name, email: order.user.email },
        theme: { color: "#0f172a" },
        handler: async function (resp) {
          console.log(resp);
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });

          console.log("Verify status:", verifyRes.status);

          const data = await verifyRes.json();
          console.log("Verify response:", data);

          if (verifyRes.ok) {
            toast.success("Payment successful!");
            router.push("/reader");
          } else toast.error("Payment verification failed");
        },
      };
      const razorpay = new Razorpay(opts);

      razorpay.on("payment.failed", function (response) {
        console.log(response);
      });

      razorpay.on("payment.submit", function (response) {
        console.log(response);
      });

      razorpay.on("modal.close", function () {});

      razorpay.open();
    }
  } catch (e) {
    toast.error(e.message || "Something went wrong");
  }
}
