import LegalPage from "@/components/LegalPage";

const Terms = () => (
  <LegalPage title="Terms of Service" updated="1 August 2026">
    <section>
      <h2>1. Agreement</h2>
      <p>
        By creating an account or booking a service on Rapha Telehealth you agree to these terms. If
        you do not agree, please do not use the platform.
      </p>
    </section>

    <section>
      <h2>2. What Rapha Telehealth is</h2>
      <p>
        We are a marketplace that connects patients with independent, licensed healthcare
        professionals who provide care at your home. We are not a healthcare provider and we do not
        practise medicine. The professional you book is solely responsible for the clinical care
        they deliver.
      </p>
    </section>

    <section>
      <h2>3. Not for emergencies</h2>
      <p>
        The platform is not an emergency service. If you are experiencing a medical emergency, call
        your local emergency number or go to the nearest hospital immediately.
      </p>
    </section>

    <section>
      <h2>4. Eligibility and accounts</h2>
      <ul>
        <li>You must be 18 or older to create an account; you may book on behalf of a dependant.</li>
        <li>You must give accurate information and keep your phone number and profile up to date.</li>
        <li>You are responsible for activity that happens under your account.</li>
      </ul>
    </section>

    <section>
      <h2>5. Professionals</h2>
      <p>
        Professionals must submit their licence, identification and certifications. Profiles are
        reviewed and only appear to patients after verification is approved. Professionals must hold
        a valid licence at all times and must notify us if it lapses or is suspended.
      </p>
    </section>

    <section>
      <h2>6. Bookings, fees and cancellations</h2>
      <ul>
        <li>Fees are shown before you confirm a booking; a platform commission may apply to the professional's payout.</li>
        <li>You may reschedule or cancel an upcoming booking from your dashboard.</li>
        <li>Late cancellations or no-shows may incur a charge where stated at booking time.</li>
      </ul>
    </section>

    <section>
      <h2>7. AI features</h2>
      <p>
        AI-generated summaries and suggestions are informational only, may be inaccurate, and are
        never a substitute for a diagnosis by a qualified professional.
      </p>
    </section>

    <section>
      <h2>8. Acceptable use</h2>
      <p>
        Do not misuse the platform: no abusive behaviour, impersonation, fraudulent bookings,
        scraping, attempts to bypass security, or use of the service for anything unlawful.
      </p>
    </section>

    <section>
      <h2>9. Liability</h2>
      <p>
        To the fullest extent permitted by law, Rapha Telehealth is not liable for the clinical acts
        or omissions of independent professionals, or for indirect or consequential losses. Nothing
        in these terms limits liability that cannot lawfully be limited.
      </p>
    </section>

    <section>
      <h2>10. Changes and contact</h2>
      <p>
        We may update these terms and will post the revised date above. Questions:{" "}
        <a className="text-primary" href="mailto:support@raphatelehealth.com">support@raphatelehealth.com</a>.
      </p>
    </section>
  </LegalPage>
);

export default Terms;
