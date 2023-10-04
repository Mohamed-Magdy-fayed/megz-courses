import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import React, { FC, HTMLProps } from "react";

interface ConceptTitleProps {
  children: React.ReactNode;
}

export function ConceptTitle({ children }: ConceptTitleProps) {
  return (
    <Typography
      className={`m-0 font-["Plus_Jakarta_Sans",_sans-serif] text-2xl font-bold leading-5 md:text-3xl lg:text-4xl`}
    >
      {children}
    </Typography>
  );
}

const typographyVariants = cva(
  "",
  {
    variants: {
      variant: {
        primary: "lg:text-5xl md:text-4xl text-2xl font-extrabold leading-loose tracking-wide",
        secondary: "xl:text-2xl lg:text-1xl md:text-lg text-base font-semibold leading-tight tracking-wide",
        menuButton: "xl:text-2xl lg:text-xl md:text-lg text-base font-medium leading-4 tracking-tight uppercase",
        bodyText: "xl:text-xl lg:text-lg md:text-base text-sm font-light tracking-tighter",
        buttonText: "xl:text-xl lg:text-lg md:text-base text-sm font-medium leading-4 tracking-wide uppercase",
      },
    },
    defaultVariants: {
      variant: "bodyText",
    },
  }
)

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof typographyVariants> {
}

const Typography: React.FC<TypographyProps> = ({ className, variant, ...props }) => {
  const Comp = variant === "primary" ? "h1" : variant === "secondary" ? "h2" : variant === "bodyText" ? "p" : "span"

  return (
    <Comp
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  )
}

Typography.displayName = "Typography"

export { Typography, typographyVariants }
