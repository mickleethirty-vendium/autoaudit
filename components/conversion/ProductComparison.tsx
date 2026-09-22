export const products = [
  {
    name: "Free snapshot",
    price: "£0",
    detail: "An initial view of available MOT signals and estimated repair exposure. No payment details required.",
  },
  {
    name: "Core Report",
    price: "£4.99",
    detail: "Detailed findings, itemised repair-risk guidance, fuller MOT analysis, relevant model issues, seller questions, negotiation guidance and market comparison where available.",
  },
  {
    name: "Full Bundle including HPI",
    price: "£9.99",
    detail: "Everything in Core, plus available finance, write-off, stolen, mileage anomaly, keeper and plate-change checks. Requires a registration.",
  },
] as const;

export default function ProductComparison({ dark = false, historyAvailable = true }: {
  dark?: boolean;
  historyAvailable?: boolean;
}) {
  const available = products.filter((product) => historyAvailable || product.price !== "£9.99");
  return (
    <div className={`grid gap-3 ${historyAvailable ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {available.map((product) => (
        <div key={product.name} className={`rounded-xl border p-4 ${dark ? "border-white/20 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
          <h3 className={`text-sm font-bold ${dark ? "text-white" : "text-slate-950"}`}>{product.name}</h3>
          <p className="mt-2 text-xl font-bold">{product.price}</p>
          <p className={`mt-2 text-sm leading-6 ${dark ? "text-slate-200" : "text-slate-600"}`}>{product.detail}</p>
        </div>
      ))}
    </div>
  );
}
