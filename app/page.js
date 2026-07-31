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
import { logout as logoutUser } from "@/services/auth.service";

export default function HomePage() {
  const { me, refreshUser } = useAuth();
  const router = useRouter();
  const buyBook = () => handleBuy(me, router);

  const logout = async () => {
    await logoutUser();
    await refreshUser();
  };

  return (
    <div>
      <Navbar me={me} onBuy={buyBook} onLogout={logout} />
      <Hero onBuy={buyBook} />
      <AboutAuthor />
      <AboutBook />
      <Benefits />
      {!me?.purchasedBook && <Pricing onBuy={buyBook} />}
      <Footer />
    </div>
  );
}
