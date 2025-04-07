import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

interface ConceptTitleProps extends TypographyProps {
  children: React.ReactNode;
}

export function ConceptTitle({ children, className, ...rest }: ConceptTitleProps) {
  return (
    <Typography
      variant={"secondary"}
      className={cn(`text-2xl font-bold leading-5 md:text-3xl lg:text-4xl`, className)}
      {...rest}
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
        default: "",
        pre: "lg:text-lg md:text-base text-sm font-medium",
        primary: "md:text-4xl text-2xl font-extrabold leading-loose tracking-wide",
        secondary: "lg:text-xl md:text-lg text-base font-semibold leading-tight tracking-wide",
        menuButton: "lg:text-2xl md:text-xl text-lg font-medium leading-4 tracking-tight uppercase",
        bodyText: "lg:text-lg md:text-base text-sm font-light tracking-tighter",
        buttonText: "lg:text-lg md:text-base text-sm font-medium leading-4 tracking-wide uppercase",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof typographyVariants> {
}

const Typography: React.FC<TypographyProps> = ({ className, variant, ...props }) => {
  const Comp = variant === "pre" ? "pre" : "span"

  return (
    <Comp
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  )
}

Typography.displayName = "Typography"

export { Typography, typographyVariants }
