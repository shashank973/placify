import React, { useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';

const CONTACT_EMAIL = 'srivastavashashank1812@gmail.com';

export default function ContactPage() {
  const [copyStatus, setCopyStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!navigator.clipboard?.writeText) {
      setCopied(false);
      setCopyStatus('Clipboard access is unavailable. Select the email address to copy it.');
      return;
    }

    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setCopyStatus('Email address copied to clipboard.');
    } catch (error) {
      console.error('Unable to copy the contact email:', error);
      setCopied(false);
      setCopyStatus('Could not access the clipboard. Select the email address to copy it.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-indigo-400">We’re here to help</p>
        <h1 className="text-3xl font-bold text-white">Contact Placify</h1>
        <p className="text-sm text-slate-400">
          Questions, feedback, or support requests? Reach us by email.
        </p>
      </header>

      <section className="p-6 sm:p-8 rounded-2xl bg-[#111726] border border-slate-800 space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Mail className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Email us</h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose your mail app or copy the address to use it elsewhere.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block mt-3 text-sm font-semibold text-indigo-400 hover:underline break-all"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Open email app
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-semibold"
          >
            {copied
              ? <Check className="w-4 h-4" aria-hidden="true" />
              : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy email'}
          </button>
        </div>
        {copyStatus && (
          <p role="status" aria-live="polite" className="text-sm text-slate-400">
            {copyStatus}
          </p>
        )}
      </section>
    </div>
  );
}
