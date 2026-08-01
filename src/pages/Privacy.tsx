import LegalPage from "@/components/LegalPage";

const Privacy = () => (
  <LegalPage title="Privacy Policy" updated="1 August 2026">
    <section>
      <h2>1. Who we are</h2>
      <p>
        Rapha Telehealth ("we", "us") operates an at-home healthcare marketplace connecting patients
        with verified healthcare professionals. This policy explains what personal data we collect,
        why we collect it, and the choices you have.
      </p>
    </section>

    <section>
      <h2>2. Information we collect</h2>
      <ul>
        <li>Account details: name, phone number, email address and profile photo.</li>
        <li>Patient profiles: age, gender, blood group, allergies, medications, medical history and emergency contact.</li>
        <li>Booking data: appointment dates, symptoms notes, uploaded prescriptions or medical documents.</li>
        <li>Location data: the delivery address and GPS coordinates you provide for a home visit, and a professional's live location while an active visit is in progress.</li>
        <li>Technical data: device, browser and approximate country derived from your IP address.</li>
      </ul>
    </section>

    <section>
      <h2>3. How we use your information</h2>
      <ul>
        <li>To create and secure your account and verify your phone number by SMS.</li>
        <li>To match you with professionals, process bookings and enable in-app messaging.</li>
        <li>To generate optional AI summaries of symptoms or documents you choose to submit.</li>
        <li>To handle payments, receipts and provider earnings.</li>
        <li>To keep the platform safe, detect abuse and meet legal obligations.</li>
      </ul>
    </section>

    <section>
      <h2>4. Health data</h2>
      <p>
        Health information is sensitive. It is stored encrypted at rest, protected by row-level
        access rules, and is only visible to you and the professional assigned to your booking.
        Uploaded documents are held in private storage and are never publicly accessible.
      </p>
    </section>

    <section>
      <h2>5. Sharing</h2>
      <p>
        We share data only with: the professional you book, our infrastructure providers (cloud
        hosting, database, SMS delivery and AI processing), and authorities where required by law.
        We do not sell your personal data and we do not use it for third-party advertising.
      </p>
    </section>

    <section>
      <h2>6. Retention</h2>
      <p>
        Booking and medical records are retained while your account is active and for as long as
        required by applicable healthcare record-keeping rules. One-time verification codes are
        purged automatically. You may request deletion of your account at any time.
      </p>
    </section>

    <section>
      <h2>7. Your rights</h2>
      <p>
        You can access, correct, export or delete your personal data, withdraw consent to location
        sharing, and object to certain processing. Contact us to exercise these rights.
      </p>
    </section>

    <section>
      <h2>8. Contact</h2>
      <p>
        Questions or requests: <a className="text-primary" href="mailto:support@raphatelehealth.com">support@raphatelehealth.com</a>.
      </p>
    </section>
  </LegalPage>
);

export default Privacy;
