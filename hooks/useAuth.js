import { useEffect, useState } from "react";

export default function useAuth() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  return { me, loading, setMe };
}
