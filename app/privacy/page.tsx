import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="mt-4 text-slate-700">
          This Privacy Policy describes how Quick Services collects, uses, and protects your information.
        </p>

        <section className="mt-6 space-y-3 text-slate-700">
          <h2 className="text-xl font-medium text-slate-900">1. Information</h2>
          <p>
            We may collect account details you provide (e.g., name, email, mobile).
          </p>

          <h2 className="text-xl font-medium text-slate-900">2. Usage</h2>
          <p>
            We use information to operate the service, manage accounts, and communicate with you.
          </p>

          <h2 className="text-xl font-medium text-slate-900">3. Security</h2>
          <p>
            We implement reasonable security measures to protect your data.
          </p>
        </section>

        <p className="mt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} Quick Services. All rights reserved.
        </p>
      </div>
    </main>
  );
}

