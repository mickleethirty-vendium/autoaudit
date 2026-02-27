import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="AutoAudit"
            width={180}
            height={48}
            priority
          />
        </Link>
        <div className="text-sm text-slate-600 hidden sm:block">
          Don&apos;t overpay for your next used car
        </div>
      </div>
    </header>
  );
}
