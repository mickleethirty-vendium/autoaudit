import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="AutoAudit"
            width={180}
            height={48}
            priority
            className="h-auto w-[132px] sm:w-[180px]"
          />
        </Link>

        <div className="hidden text-sm text-slate-600 sm:block">
          Don&apos;t overpay for your next used car
        </div>
      </div>
    </header>
  );
}