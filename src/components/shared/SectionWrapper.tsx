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
        "py-12 md:py-20",
        hasAnimation && "animate-fadeInFromBottom opacity-0", // opacity-0 for initial state if animation is JS controlled
        className
      )}
      style={hasAnimation ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
    >
      <div className="container">
        {(title || subtitle) && (
          <div className="mb-10 text-center md:mb-12">
            {subtitle && (
              <p className="mb-2 font-headline text-base font-medium text-primary md:text-lg">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
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
