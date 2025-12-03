import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  hasAnimation?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className,
  title,
  subtitle,
  hasAnimation = true,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-8 md:py-12",
        hasAnimation && "animate-fadeInFromBottom opacity-0", // opacity-0 for initial state if animation is JS controlled
        className
      )}
      style={hasAnimation ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
    >
      <div className="container">
        {(title || subtitle) && (
          <div className="mb-8 text-center md:mb-10">
            {subtitle && (
              <p className="mb-2 font-sans text-lg font-semibold text-teal-700 md:text-xl">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="font-sans text-4xl font-black text-teal-700 md:text-5xl">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
