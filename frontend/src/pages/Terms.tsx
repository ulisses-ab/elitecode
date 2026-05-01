import { Navbar } from "@/components/layout/Navbar/Navbar";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { useEffect } from "react";

export function Terms() {
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);

  useEffect(() => {
    setNavbarCenter(<></>);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mb-10">Last updated: April 29, 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-semibold mb-2">1. Acceptance</h2>
            <p>By accessing or using EliteCode you agree to these Terms. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">2. Use of the Service</h2>
            <p>EliteCode is provided for personal, educational use. You may not use the service to attempt to disrupt, overload, or gain unauthorized access to any system. You are responsible for any code you submit.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">3. Accounts</h2>
            <p>You must authenticate via a supported OAuth provider. You are responsible for keeping your account secure. We reserve the right to suspend accounts that violate these Terms.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">4. Intellectual Property</h2>
            <p>Problem statements, test cases, and runner harnesses are owned by EliteCode. Your submitted solutions remain yours; by submitting you grant us a license to execute and store them for grading purposes.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">5. Disclaimer</h2>
            <p>The service is provided "as is" without warranties of any kind. We do not guarantee uptime, correctness of results, or fitness for any particular purpose.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">6. Changes</h2>
            <p>We may update these Terms at any time. Continued use of the service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">7. Contact</h2>
            <p>Questions? Reach us at <a href="mailto:ulibicalho9@gmail.com" className="text-foreground underline underline-offset-2">ulibicalho9@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
