import React from "react";
import { getImageProps } from "next/image";

type HeroCtaTextPanelProps = {
  heroImageSrc: string;
  heroAlt?: string;
  title: string;
  subtitle?: string;
  ctaComponent: React.ReactNode;
  bodyContent?: React.ReactNode;
  className?: string;
};

export default function HeroCtaTextPanel({
  heroImageSrc,
  title,
  subtitle,
  ctaComponent,
  bodyContent,
  className = "",
}: HeroCtaTextPanelProps) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border bg-white shadow-lg ${className}`}
    >
      <div className="border-t border-slate-200 p-5 sm:p-6 lg:p-8">
        {subtitle ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {subtitle}
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>

        {bodyContent ? (
          <div className="mt-4 max-w-4xl text-base leading-7 text-slate-700">
            {bodyContent}
          </div>
        ) : null}
      </div>
      <div className="grid lg:grid-cols-2">
        <DecorativeHero src={heroImageSrc} />

        <div className="flex items-center justify-center bg-slate-50 p-5 sm:p-6 lg:p-8">
          {ctaComponent}
        </div>
      </div>

    </section>
  );
}
// A mobile <Image priority> still preloads when hidden by CSS. A media-selected
// source keeps Next's desktop image optimisation without downloading it mobile.
export function DecorativeHero({ src, className = "min-h-[240px]" }: {
  src: string;
  className?: string;
}) {
  const { props } = getImageProps({ src, alt: "", width: 1400, height: 900, sizes: "50vw" });
  return (
    <div aria-hidden="true" className={`relative hidden lg:block ${className}`}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={props.srcSet} sizes={props.sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element -- media source uses Next-optimised srcSet; mobile uses an inline empty image. */}
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E"
          alt=""
          width={1400}
          height={900}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </div>
  );
}
