import React from 'react';
import { Link } from 'react-router-dom';

const POLICIES = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'This notice explains what information Placify may handle when you use its placement-preparation features.',
    sections: [
      {
        title: 'Information you provide',
        body: 'Depending on the features you use, this may include account and profile details, your target company, practice and assessment activity, coding submissions, interview answers and transcripts, and resume text or files submitted for analysis.',
      },
      {
        title: 'How information is used',
        body: 'Information is used to operate your account, save progress and interview history, evaluate practice submissions, and provide requested study, resume, or interview assistance.',
      },
      {
        title: 'AI and voice features',
        body: 'When an AI feature is used, the relevant prompt and information you submit may be processed by the AI service configured for this installation. If browser speech recognition is used, your browser’s speech-recognition service converts speech into text. Review the applicable provider’s privacy information before sharing sensitive material.',
      },
      {
        title: 'Storage and retention',
        body: 'Information is stored using the database configured for the installation. This project supports an embedded local datastore and MongoDB. Retention and deletion depend on the deployment and its administrator. Contact us for questions about information associated with your account.',
      },
      {
        title: 'Protect your information',
        body: 'Do not submit passwords, financial details, confidential employer information, or other sensitive material in resumes, code, interview responses, or AI prompts. No online service can guarantee absolute security.',
      },
      {
        title: 'Questions or requests',
        body: 'For privacy questions or requests, contact us using the details on the Contact page.',
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro: 'By using Placify, you agree to use the platform responsibly and for lawful learning and placement-preparation purposes.',
    sections: [
      {
        title: 'Educational use',
        body: 'Practice questions, AI responses, resume feedback, mock interviews, and assessment results are for learning and preparation. They may be incomplete or inaccurate and are not a guarantee of placement, employment, or interview outcomes.',
      },
      {
        title: 'Your account and submissions',
        body: 'Keep your login credentials secure. You are responsible for the material you submit and should only upload resumes, code, and other content that you have permission to use. Avoid sharing confidential or sensitive information.',
      },
      {
        title: 'Acceptable use',
        body: 'Do not use the platform to break laws, disrupt the service, access another person’s account or data, or submit malicious code or content. Do not rely on AI-generated answers without checking them.',
      },
      {
        title: 'Availability and changes',
        body: 'Features, generated content, and availability may change as the project is updated or configured by its operator. The platform is provided for practice and may not be available without interruption.',
      },
      {
        title: 'Contact',
        body: 'If you have questions about these terms, please contact us.',
      },
    ],
  },
};

export default function PolicyPage({ type }) {
  const policy = POLICIES[type];

  return (
    <article className="max-w-3xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{policy.title}</h1>
        <p className="text-sm text-slate-400 leading-relaxed">{policy.intro}</p>
      </header>

      <div className="p-6 sm:p-8 rounded-2xl bg-[#111726] border border-slate-800 divide-y divide-slate-800">
        {policy.sections.map((section) => (
          <section key={section.title} className="py-5 first:pt-0 last:pb-0 space-y-2">
            <h2 className="text-base font-semibold text-white">{section.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="text-sm text-slate-400">
        Need help? <Link to="/contact" className="font-semibold text-indigo-400 hover:underline">Contact Placify</Link>.
      </p>
    </article>
  );
}
