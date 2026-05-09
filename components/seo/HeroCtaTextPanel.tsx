"use client";

import Image from "next/image";
import React from "react";

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
  heroAlt = "Hero image",
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
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]">
          <Image
            src={heroImageSrc}
            alt={heroAlt}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-5 sm:p-6 lg:p-8">
          {ctaComponent}
        </div>
      </div>

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
    </section>
  );
}