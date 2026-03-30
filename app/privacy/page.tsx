import Link from "next/link";
import SiteDisclaimer from "@/app/components/SiteDisclaimer";

export const metadata = {
  title: "Privacy Notice | AutoAudit",
  description: "Privacy Notice for AutoAudit.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-slate-600 underline underline-offset-4 hover:text-slate-900"
        >
          ← Back to home
        </Link>
      </div>

      <article className="prose prose-slate max-w-none">
        <h1>Privacy Notice</h1>
        <p>
          <strong>Last updated:</strong> 30 March 2026
        </p>

        <p>
          This Privacy Notice explains how AutoAudit collects, uses and protects
          personal data when you use <strong>autoaudit.uk</strong>.
        </p>

        <p>
          AutoAudit is committed to handling personal data responsibly and in
          line with applicable UK data protection law, including the UK GDPR and
          the Data Protection Act 2018.
        </p>

        <h2>1. Who We Are</h2>
        <p>AutoAudit is a UK-focused online used vehicle research service.</p>
        <p>
          For privacy questions or data requests, contact us at{" "}
          <a href="mailto:support@autoaudit.uk">support@autoaudit.uk</a>.
        </p>
        <p>
          For the purposes of data protection law, AutoAudit is the{" "}
          <strong>data controller</strong> of the personal data described in
          this notice.
        </p>

        <h2>2. Personal Data We Collect</h2>

        <h3>a) Data you provide directly</h3>
        <ul>
          <li>email address, if you create an account or contact us</li>
          <li>vehicle registration numbers you enter</li>
          <li>optional details you provide, such as mileage or asking price</li>
          <li>support messages and correspondence</li>
        </ul>

        <h3>b) Account and authentication data</h3>
        <ul>
          <li>account identifiers</li>
          <li>login and authentication records</li>
          <li>basic account metadata</li>
        </ul>

        <h3>c) Payment and transaction data</h3>
        <p>
          Payments are handled by Stripe. We do not store full payment card
          details. We may receive transaction-related information such as:
        </p>
        <ul>
          <li>payment status</li>
          <li>transaction reference IDs</li>
          <li>purchase history</li>
          <li>limited billing-related metadata</li>
        </ul>

        <h3>d) Technical and usage data</h3>
        <ul>
          <li>IP address</li>
          <li>browser and device information</li>
          <li>app and page usage information</li>
          <li>logs used for security, debugging and performance monitoring</li>
        </ul>

        <h2>3. How We Use Personal Data</h2>
        <p>We use personal data to:</p>
        <ul>
          <li>generate and deliver vehicle reports</li>
          <li>provide paid features and process purchases</li>
          <li>create and manage user accounts</li>
          <li>save reports for account holders</li>
          <li>respond to support requests and enquiries</li>
          <li>maintain platform security and prevent abuse</li>
          <li>debug, improve and develop the service</li>
          <li>comply with legal and financial obligations</li>
        </ul>

        <h2>4. Lawful Bases for Processing</h2>
        <p>
          Under UK GDPR, we rely on one or more of the following lawful bases:
        </p>

        <h3>Contract</h3>
        <p>
          Where processing is necessary to provide the service you ask us to
          provide, including generating reports, creating accounts and supplying
          paid content.
        </p>

        <h3>Legitimate interests</h3>
        <p>
          Where processing is reasonably necessary for our legitimate interests,
          including operating the platform, preventing fraud and misuse,
          troubleshooting issues, improving our services, and defending legal
          claims.
        </p>

        <h3>Legal obligation</h3>
        <p>
          Where we must process or retain data to comply with legal, tax,
          accounting, regulatory, or law-enforcement obligations.
        </p>

        <h2>5. Third-Party Processors and Services</h2>
        <p>
          We use third-party providers to help us operate AutoAudit. These may
          include:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> for authentication and database services
          </li>
          <li>
            <strong>Stripe</strong> for payment processing
          </li>
          <li>
            <strong>Vercel</strong> for hosting and application infrastructure
          </li>
          <li>
            <strong>DVSA and vehicle data providers</strong> for MOT,
            enrichment, valuation or history-related data
          </li>
        </ul>
        <p>
          These providers may process personal data on our behalf or as separate
          controllers depending on the context of the service they provide.
        </p>

        <h2>6. Data Sharing</h2>
        <p>We do not sell your personal data.</p>
        <p>We may share personal data where necessary:</p>
        <ul>
          <li>with service providers that help us operate AutoAudit</li>
          <li>to process payments and manage transactions</li>
          <li>to comply with legal obligations</li>
          <li>to establish, exercise or defend legal claims</li>
          <li>in connection with a business sale, merger, or restructuring</li>
        </ul>

        <h2>7. Data Retention</h2>
        <p>
          We keep personal data only for as long as reasonably necessary for the
          purposes described in this notice.
        </p>
        <p>Typical retention periods are:</p>
        <ul>
          <li>
            <strong>account data:</strong> while your account remains active and
            for a reasonable period afterwards where needed for security, backup
            or compliance purposes
          </li>
          <li>
            <strong>saved reports:</strong> typically up to{" "}
            <strong>30 days</strong>, unless a longer period is required for
            technical, legal or support reasons
          </li>
          <li>
            <strong>transaction and payment records:</strong> retained for as
            long as reasonably necessary for accounting, tax and legal
            compliance
          </li>
          <li>
            <strong>support communications:</strong> retained for as long as
            reasonably necessary to deal with the issue and maintain records
          </li>
        </ul>

        <h2>8. Security</h2>
        <p>
          We use reasonable technical and organisational measures to help
          protect personal data, including secure hosting, access controls and
          encrypted connections where appropriate.
        </p>
        <p>
          However, no method of storage or transmission is completely secure, so
          we cannot guarantee absolute security.
        </p>

        <h2>9. International Transfers</h2>
        <p>
          Some of our service providers may process data outside the UK. Where
          this happens, we take steps intended to ensure appropriate safeguards
          are in place in line with applicable data protection law.
        </p>

        <h2>10. Your Rights</h2>
        <p>Depending on the circumstances, you may have the right to:</p>
        <ul>
          <li>request access to your personal data</li>
          <li>request correction of inaccurate personal data</li>
          <li>request erasure of your personal data</li>
          <li>request restriction of processing</li>
          <li>object to certain processing</li>
          <li>request transfer of your data</li>
          <li>withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise your rights, email{" "}
          <a href="mailto:support@autoaudit.uk">support@autoaudit.uk</a>.
        </p>

        <h2>11. Complaints</h2>
        <p>
          If you are unhappy with how we handle your personal data, we would
          appreciate the chance to address your concerns first.
        </p>
        <p>
          You also have the right to complain to the Information Commissioner’s
          Office (ICO), the UK data protection regulator.
        </p>

        <h2>12. Cookies and Similar Technologies</h2>
        <p>
          We may use essential cookies and similar technologies necessary for
          the operation, security and performance of the site.
        </p>
        <p>
          If we introduce non-essential analytics or marketing cookies, we will
          provide appropriate notice and controls where required.
        </p>

        <h2>13. Changes to This Privacy Notice</h2>
        <p>
          We may update this Privacy Notice from time to time. The latest
          version will always appear on this page with the revised date.
        </p>

        <h2>14. Contact</h2>
        <p>
          For privacy questions or data requests, contact{" "}
          <a href="mailto:support@autoaudit.uk">support@autoaudit.uk</a>.
        </p>
      </article>

      <SiteDisclaimer />
    </main>
  );
}