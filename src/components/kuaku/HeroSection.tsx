
"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const handleSmoothScroll = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1); // Remove "#"
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div id="hero" className="relative bg-gradient-to-br from-primary/20 via-background to-background pt-16 md:pt-24">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="animate-fadeInFromBottom space-y-6 text-center md:text-left opacity-0" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Selamat Datang di <span className="text-primary">KUAKU</span>
            </h1>
            <p className="text-lg text-foreground/80 md:text-xl">
              Pusat layanan informasi terpadu untuk kebutuhan Anda. Kami siap melayani dengan hati.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button asChild size="lg" className="font-semibold">
                <Link href="#services" onClick={(e) => handleSmoothScroll(e, "#services")}>Lihat Layanan</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold border-primary/50 hover:bg-primary/10">
                <Link href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>Hubungi Kami</Link>
              </Button>
            </div>
          </div>
          <div className="animate-fadeInFromBottom relative aspect-[4/3] opacity-0" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
            <Image
              src="https://placehold.co/600x450.png"
              alt="KUAKU Hero Image"
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
              data-ai-hint="community diverse people"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

