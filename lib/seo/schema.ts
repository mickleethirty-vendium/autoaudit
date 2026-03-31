import { absoluteUrl } from "./routes";

type BreadcrumbItem = {
  name: string;
  item: string;
};

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.item),
    })),
  };
}

export function faqSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "AutoAudit vehicle check",
    brand: {
      "@type": "Brand",
      name: "AutoAudit",
    },
    offers: [
      {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: "4.99",
        name: "Core report",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: "9.99",
        name: "Full bundle",
        availability: "https://schema.org/InStock",
      },
    ],
  };
}

export function articleSchema({
  headline,
  description,
  path,
}: {
  headline: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: absoluteUrl(path),
    url: absoluteUrl(path),
    publisher: {
      "@type": "Organization",
      name: "AutoAudit",
    },
  };
}
