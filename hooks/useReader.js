"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useReaderProtection } from "@/hooks/useReaderProtection";

export function useReader() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  useReaderProtection();
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (!meData.user) {
          router.push("/login?next=/reader");
          return;
        }

        if (!meData.user.purchasedBook) {
          toast.error("Purchase required");
          router.push("/dashboard");
          return;
        }

        setMe(meData.user);

        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");

        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";

        if (!mounted) return;

        setPdfjsLib(pdfjs);

        const infoRes = await fetch("/api/reader/info");
        const infoData = await infoRes.json();

        if (infoData.error) {
          throw new Error(infoData.error);
        }

        setInfo(infoData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  return {
    me,
    info,
    loading,
    pdfjsLib,
  };
}
