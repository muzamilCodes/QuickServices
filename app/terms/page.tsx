import React from 'react';

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-slate-900">Terms of Service</h1>
        <p className="mt-4 text-slate-700">
          These Terms of Service govern your use of Quick Services.
        </p>

        <section className="mt-6 space-y-3 text-slate-700">
          <h2 className="text-xl font-medium text-slate-900">1. Acceptance</h2>
          <p>
            By accessing or using the service, you agree to be bound by these terms.
          </p>

          <h2 className="text-xl font-medium text-slate-900">2. Services</h2>
          <p>
            We provide a platform that connects users with providers. Availability may vary.
          </p>

          <h2 className="text-xl font-medium text-slate-900">3. Contact</h2>
          <p>
            If you have questions, contact us through the app.
          </p>
        </section>

        <p className="mt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} Quick Services. All rights reserved.
        </p>
      </div>
    </main>
  );
}

