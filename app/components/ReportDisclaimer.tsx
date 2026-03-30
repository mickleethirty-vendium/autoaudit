export default function ReportDisclaimer() {
  return (
    <section className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
        Important
      </div>

      <h2 className="mt-1 text-sm font-semibold text-amber-950">
        Report disclaimer
      </h2>

      <div className="mt-2 space-y-2">
        <p>
          This report is generated automatically using available third-party
          data sources and model-based rules. It is designed to help you spot
          potential risks and ask better questions about a vehicle.
        </p>

        <p>
          It is not a mechanical inspection, not a guarantee of condition, and
          not financial, legal, or valuation advice. It should not be treated
          as a recommendation to buy, avoid, or negotiate for a vehicle in any
          particular way.
        </p>

        <p>
          Vehicle data may be incomplete, delayed, inaccurate, mismatched, or
          out of date. You should not rely on this report alone when deciding
          whether to buy a vehicle.
        </p>

        <p>
          Before purchase, consider arranging an independent inspection, full
          history checks, and any additional checks appropriate for the vehicle.
        </p>
      </div>
    </section>
  );
}