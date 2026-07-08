"use client";

import { useRouter } from "next/navigation";

import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import AboutAuthor from "@/components/home/AboutAuthor";
import AboutBook from "@/components/home/AboutBook";
import Benefits from "@/components/home/Benefits";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/home/Footer";

import { useAuth } from "@/hooks/useAuth";

import { handleBuy } from "@/services/payment.service";

export default function HomePage() {
  const { me } = useAuth();
  const router = useRouter();
  const buyBook = () => handleBuy(me, router);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.replace("/");
    router.refresh();
  };

  return (
    <div>
      <Navbar me={me} onBuy={buyBook} onLogout={logout} />
      <Hero onBuy={buyBook} />
      <AboutAuthor />
      <AboutBook />
      <Benefits />
      <Pricing onBuy={buyBook} />
      <Footer />
    </div>
  );
}
