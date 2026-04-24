import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { fetchUser } from "@/api/functions/user";

export function OAuthReturn() {
  // const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  // const login = useAuthStore((s) => s.login);
  // const [error, setError] = useState<string | null>(null);

  return (<div>aura</div>)

  useEffect(() => {
    const run = async () => {
      if (searchParams.get("error")) {
        setError("Authentication failed. Please try again.");
        return;
      }

      const token = searchParams.get("token");
      if (!token) {
        setError("Authentication failed: no token received.");
        return;
      }

      const user = await fetchUser(token);
      if (!user) {
        setError("Authentication failed: could not load user.");
        return;
      }

      login(user, token);

      let returnPath = "/";
      try {
        const state = searchParams.get("state");
        const parsed = JSON.parse(state!);
        const url = new URL(parsed?.returnURL ?? "/");
        returnPath = url.pathname + url.search + url.hash;
      } catch {}

      navigate(returnPath, { replace: true });
    };

    run();
  }, []);

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem" }}>
        <p>{error}</p>
        <a href="/">Go back</a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p>Signing in...</p>
    </div>
  );
}
