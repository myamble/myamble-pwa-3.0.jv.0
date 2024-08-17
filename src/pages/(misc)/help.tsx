// src/app/(pages)/(misc)/help/page.tsx
export default function Help() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Help Center</h1>
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-medium">
                How do I create a survey?
              </h3>
              <p>
                To create a survey, log in to your account, navigate to the
                Survey Builder page, and follow the step-by-step guide to design
                your survey.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">
                Can I collaborate with other researchers?
              </h3>
              <p>
                Yes, MyAmble supports collaboration. You can invite other
                researchers to view or edit your surveys from the Survey Builder
                page.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">
                How secure is my data?
              </h3>
              <p>
                We take data security seriously. All data is encrypted in
                transit and at rest, and we follow industry best practices for
                data protection.
              </p>
            </div>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">Getting Started Guide</h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Sign up for an account</li>
            <li>Verify your email address</li>
            <li>Log in to your dashboard</li>
            <li>Create your first survey using the Survey Builder</li>
            <li>Distribute your survey to participants</li>
            <li>Analyze results using our built-in tools and AI insights</li>
          </ol>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">Contact Support</h2>
          <p>
            If you need further assistance, please don't hesitate to contact our
            support team at{" "}
            <a
              href="mailto:support@myamble.com"
              className="text-blue-600 hover:underline"
            >
              support@myamble.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
