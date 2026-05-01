import { Navbar } from "@/components/layout/Navbar/Navbar";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { useEffect } from "react";

export function Privacy() {
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);

  useEffect(() => {
    setNavbarCenter(<></>);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mb-10">Last updated: April 29, 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-semibold mb-2">1. Information We Collect</h2>
            <p>We collect the information your OAuth provider shares on sign-in: your name, email address, and profile picture. We also store your submitted code and results for grading and leaderboard purposes.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">2. How We Use It</h2>
            <p>Your information is used solely to operate the service — authenticating you, running your submissions, and displaying your profile and leaderboard position. We do not sell your data.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">3. Analytics</h2>
            <p>We use Vercel Analytics to collect anonymous page-view data (no cookies, no cross-site tracking). This helps us understand how the site is used in aggregate.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">4. Data Retention</h2>
            <p>Your account data and submissions are retained for as long as your account is active. You may request deletion by contacting us.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">5. Third Parties</h2>
            <p>We use Google OAuth for authentication and Vercel for hosting. These providers have their own privacy policies. We do not share your data with any other third parties.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">6. Security</h2>
            <p>We use HTTPS, hashed credentials, and industry-standard practices to protect your data. No system is perfectly secure — please use a strong, unique password on your OAuth provider account.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">7. Contact</h2>
            <p>Questions or deletion requests? Reach us at <a href="mailto:ulibicalho9@gmail.com" className="text-foreground underline underline-offset-2">ulibicalho9@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
