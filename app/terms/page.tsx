import Link from "next/link";
import SiteDisclaimer from "@/app/components/SiteDisclaimer";

export const metadata = {
  title: "Terms and Conditions | AutoAudit",
  description: "Terms and Conditions for AutoAudit.",
};

export default function TermsPage() {
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
        <h1>Terms and Conditions</h1>
        <p>
          <strong>Last updated:</strong> 30 March 2026
        </p>

        <p>
          These Terms and Conditions explain how you may use AutoAudit and the
          services available through <strong>autoaudit.uk</strong>.
        </p>

        <p>
          By using AutoAudit, you agree to these Terms. If you do not agree, you
          must not use the service.
        </p>

        <h2>1. About AutoAudit</h2>
        <p>
          AutoAudit is a UK-focused online service that helps users assess
          potential risks when considering the purchase of a used vehicle.
        </p>
        <p>Our reports may include information such as:</p>
        <ul>
          <li>MOT history analysis</li>
          <li>repair risk indicators</li>
          <li>estimated repair exposure</li>
          <li>price versus market comparison</li>
          <li>known model weak points</li>
          <li>optional vehicle history checks</li>
        </ul>
        <p>
          AutoAudit does <strong>not</strong> inspect vehicles, test vehicles,
          verify condition in person, or guarantee that a vehicle is safe,
          roadworthy, correctly described, or worth a particular amount.
        </p>

        <h2>2. Informational Use Only</h2>
        <p>
          AutoAudit reports are provided for{" "}
          <strong>general informational and research purposes only</strong>.
          They are intended to help users ask better questions and identify
          areas for further investigation.
        </p>
        <p>A report should not be treated as a substitute for:</p>
        <ul>
          <li>a professional mechanical inspection</li>
          <li>an independent valuation</li>
          <li>a full vehicle history check</li>
          <li>your own judgment and due diligence</li>
        </ul>

        <h2>3. Automated Reports</h2>
        <p>
          Reports are generated automatically using rules, models and data made
          available to us at the time of the request. Reports are not manually
          reviewed before being delivered to you.
        </p>
        <p>
          Because reports are automated, they may not identify every issue, and
          they may highlight risks that do not in fact apply to a specific
          vehicle.
        </p>

        <h2>4. Vehicle Data Accuracy Disclaimer</h2>
        <p>
          AutoAudit relies on third-party and external data sources, which may
          include DVSA MOT data, valuation or enrichment providers, and vehicle
          history sources.
        </p>
        <p>
          We do not control those data sources and we do not guarantee that the
          data they provide is accurate, complete, current, available, or fit
          for your intended use.
        </p>
        <p>
          Vehicle data may be delayed, incomplete, inconsistent, wrongly
          matched, or out of date. This includes, without limitation,
          registration data, MOT records, specification data, valuations,
          mileage-related information, and history-check outputs.
        </p>

        <h2>5. No Mechanical, Financial or Valuation Advice</h2>
        <p>AutoAudit does not provide:</p>
        <ul>
          <li>mechanical advice</li>
          <li>engineering advice</li>
          <li>legal advice</li>
          <li>financial advice</li>
          <li>investment advice</li>
          <li>valuation advice</li>
        </ul>
        <p>
          Nothing in a report should be interpreted as a recommendation to buy,
          avoid, negotiate for, finance, insure, or value a vehicle in any
          particular way.
        </p>

        <h2>6. Your Responsibility</h2>
        <p>
          You are responsible for deciding how to use the information provided by
          AutoAudit. Before buying a vehicle, you should consider obtaining an
          independent inspection and carrying out any additional checks you think
          are appropriate.
        </p>

        <h2>7. Eligibility and Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>use AutoAudit for any unlawful purpose</li>
          <li>attempt to gain unauthorised access to our systems</li>
          <li>copy, scrape, bulk extract, or resell report data</li>
          <li>interfere with or disrupt the platform</li>
          <li>use the service in a way that could damage AutoAudit or others</li>
        </ul>
        <p>
          We may suspend or restrict access if we reasonably believe the service
          is being misused.
        </p>

        <h2>8. Accounts</h2>
        <p>
          Some features may be available without an account. If you create an
          account, you are responsible for keeping your login details secure and
          for activity under your account.
        </p>
        <p>
          We may suspend or terminate accounts where necessary to protect the
          service, investigate misuse, or comply with legal obligations.
        </p>

        <h2>9. Payments</h2>
        <p>
          Some AutoAudit features require payment before the full report is made
          available. Prices are shown before checkout and are payable in GBP.
        </p>
        <p>
          Payments are processed by Stripe or another payment provider we may
          use from time to time. We do not store full payment card details.
        </p>

        <h2>10. Refunds</h2>
        <p>
          AutoAudit reports are digital products that are usually made available
          immediately after purchase.
        </p>
        <p>
          Once a paid report has been unlocked or delivered, refunds will
          usually not be available unless:
        </p>
        <ul>
          <li>you were charged in error</li>
          <li>the report could not be generated due to a technical fault</li>
          <li>we are otherwise required to provide a refund by law</li>
        </ul>
        <p>
          If you believe a refund is justified, please contact us at{" "}
          <a href="mailto:support@autoaudit.uk">support@autoaudit.uk</a>.
        </p>

        <h2>11. Report Availability, Retention and Expiry</h2>
        <p>
          If you create an account, paid reports may be saved to your account
          for a limited period. Unless we say otherwise, saved reports are
          typically retained for up to <strong>30 days</strong>.
        </p>
        <p>
          After that period, reports may be deleted or may no longer be
          accessible. You are responsible for saving any report content you wish
          to keep.
        </p>
        <p>
          We may also delete or remove reports earlier where reasonably
          necessary for technical, legal, security or operational reasons.
        </p>

        <h2>12. Intellectual Property</h2>
        <p>
          AutoAudit, including its software, branding, design, text, report
          format and content structure, is owned by or licensed to us and is
          protected by intellectual property laws.
        </p>
        <p>
          You may use purchased reports for your own personal, non-commercial
          use. You must not reproduce, republish, distribute, sell, sublicense,
          or commercially exploit report content without our written permission.
        </p>

        <h2>13. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, AutoAudit will not be liable
          for any loss or damage arising from:
        </p>
        <ul>
          <li>your decision to buy or not buy a vehicle</li>
          <li>the condition, safety, value or performance of a vehicle</li>
          <li>repair costs, faults, breakdowns, or hidden defects</li>
          <li>incorrect, incomplete or unavailable third-party data</li>
          <li>service downtime, delays, bugs, or interruptions</li>
          <li>any reliance placed on a report beyond its intended purpose</li>
        </ul>
        <p>
          Nothing in these Terms excludes or limits liability where it would be
          unlawful to do so, including liability for fraud, fraudulent
          misrepresentation, or death or personal injury caused by negligence.
        </p>

        <h2>14. Service Changes</h2>
        <p>
          We may change, suspend, or discontinue any part of AutoAudit at any
          time. We may also update report formats, features, data sources, and
          pricing.
        </p>

        <h2>15. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. The latest version will
          always appear on this page. Continued use of AutoAudit after changes
          take effect means you accept the updated Terms.
        </p>

        <h2>16. Governing Law</h2>
        <p>
          These Terms are governed by the laws of{" "}
          <strong>England and Wales</strong>. Any dispute arising in connection
          with these Terms or the service will be subject to the courts of
          England and Wales, unless applicable law gives you the right to bring
          proceedings elsewhere in the UK.
        </p>

        <h2>17. Contact</h2>
        <p>
          For questions about these Terms, please contact{" "}
          <a href="mailto:support@autoaudit.uk">support@autoaudit.uk</a>.
        </p>
      </article>

      <SiteDisclaimer />
    </main>
  );
}