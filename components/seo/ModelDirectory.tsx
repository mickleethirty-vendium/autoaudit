import Link from "next/link";
import type { MakeModelSeed } from "@/lib/seo/types";
import { buildModelHubPath, buildModelCommonProblemsPath } from "@/lib/seo/routes";

export default function ModelDirectory({ models }: { models: MakeModelSeed[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <li key={model.full_slug} className="rounded-xl border p-4">
          <h2 className="font-semibold">{model.make} {model.model}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href={buildModelHubPath(model.make_slug, model.model_slug)}
              className="py-2 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              Buying guide
            </Link>
            <Link href={buildModelCommonProblemsPath(model.make_slug, model.model_slug)}
              className="py-2 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              Problems and checks
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
