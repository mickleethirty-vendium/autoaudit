import Link from "next/link";

export default function SiteDisclaimer() {
  return (
    <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <p className="font-medium text-slate-700">Important</p>

      <p className="mt-1">
        AutoAudit provides automated vehicle risk guidance generated from
        available third-party data sources. Reports are for informational
        purposes only and may contain incomplete or outdated information.
      </p>

      <p className="mt-2">
        Reports do not replace a mechanical inspection, independent valuation,
        or full vehicle history check. You should carry out your own checks
        before purchasing a vehicle.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-slate-900"
        >
          Terms
        </Link>

        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-slate-900"
        >
          Privacy
        </Link>

        <a
          href="mailto:support@autoaudit.uk"
          className="underline underline-offset-4 hover:text-slate-900"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}