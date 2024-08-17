// src/app/(pages)/(misc)/about/page.tsx
export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">About MyAmble</h1>
      <p className="mb-4">
        MyAmble is a cutting-edge platform designed to revolutionize social work
        research and practice. Our mission is to empower social workers and
        researchers with powerful tools for creating, distributing, and
        analyzing surveys.
      </p>
      <p className="mb-4">
        Founded in 2023, MyAmble combines the latest in survey technology with
        advanced data analysis capabilities, including AI-powered insights.
        We're committed to improving the efficiency and effectiveness of social
        work research, ultimately contributing to better outcomes for
        communities and individuals.
      </p>
      <h2 className="mb-4 mt-6 text-2xl font-semibold">Our Team</h2>
      <p className="mb-4">
        MyAmble is brought to you by a dedicated team of social work
        professionals, software engineers, and data scientists. Together, we're
        working to bridge the gap between technology and social work practice.
      </p>
      <h2 className="mb-4 mt-6 text-2xl font-semibold">Contact Us</h2>
      <p>
        For any inquiries or support, please reach out to us at{" "}
        <a
          href="mailto:support@myamble.com"
          className="text-blue-600 hover:underline"
        >
          support@myamble.com
        </a>
        .
      </p>
    </div>
  );
}
