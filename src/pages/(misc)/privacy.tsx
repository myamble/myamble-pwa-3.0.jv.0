// src/app/(pages)/(misc)/privacy/page.tsx
export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-4">Last updated: [Current Date]</p>
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, respond to a survey, or contact us for support.
            This may include your name, email address, and any other information
            you choose to provide.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, to communicate with you, and to comply with legal
            obligations.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect the security of your personal information.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">4. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. You may also have the right to restrict or object to
            certain processing of your data.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            5. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact
            us at{" "}
            <a
              href="mailto:privacy@myamble.com"
              className="text-blue-600 hover:underline"
            >
              privacy@myamble.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
