import LegalPage from "@/components/LegalPage";

const About = () => (
  <LegalPage title="About Rapha Telehealth">
    <section>
      <h2>Our mission</h2>
      <p>
        Rapha Telehealth brings quality healthcare to the doorstep. We connect patients with
        verified doctors, nurses, midwives, physiotherapists, caregivers, lab technicians and
        specialists who visit them at home — removing the travel, queues and waiting rooms that keep
        people from getting care in time.
      </p>
    </section>

    <section>
      <h2>How it works</h2>
      <ul>
        <li>Tell us what you need and where you are.</li>
        <li>Browse verified professionals near you, with fees and ratings shown upfront.</li>
        <li>Book a time, track your professional on the way, and chat with them in the app.</li>
        <li>Keep your records, reports and receipts in one place.</li>
      </ul>
    </section>

    <section>
      <h2>Verified professionals only</h2>
      <p>
        Every professional submits their licence, identification and certifications. Profiles are
        reviewed by our team and only become bookable once verification is approved.
      </p>
    </section>

    <section>
      <h2>Get in touch</h2>
      <p>
        We would love to hear from you at{" "}
        <a className="text-primary" href="mailto:support@raphatelehealth.com">support@raphatelehealth.com</a>.
      </p>
    </section>
  </LegalPage>
);

export default About;
