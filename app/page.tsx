import type { Metadata } from "next";
import HomePageClient from "@/app/components/HomePageClient";

export const metadata: Metadata = {
  title: "Used Car Check UK | Avoid Hidden Costs",
  description:
    "Check a used car by registration. Get instant repair-cost signals, MoT-based warnings and optional vehicle history checks before you buy.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Used Car Check UK | Avoid Hidden Costs | AutoAudit",
    description:
      "Check a used car by registration. Get instant repair-cost signals, MoT-based warnings and optional vehicle history checks before you buy.",
    url: "https://autoaudit.uk",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AutoAudit used car check UK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Used Car Check UK | Avoid Hidden Costs | AutoAudit",
    description:
      "Check a used car by registration. Get instant repair-cost signals, MoT-based warnings and optional vehicle history checks before you buy.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}