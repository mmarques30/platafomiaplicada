import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botões no padrão da LP iaplicada.com: pill (rounded-full), primário em
 * lime com texto charcoal, secundário em olive, outline/ghost sobre o
 * fundo escuro. `brand-pill` e `brand-pill-outline` são aliases mantidos
 * por compatibilidade com o código existente.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-brand-strong",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-foreground/20 bg-transparent text-foreground hover:border-primary/60 hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground/80 hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* Aliases legados (mesmo visual do default/outline) */
        "brand-pill": "bg-primary text-primary-foreground hover:bg-brand-strong",
        "brand-pill-outline":
          "border border-foreground/20 bg-transparent text-foreground hover:border-primary/60 hover:text-primary",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        pill: "h-11 px-6 text-sm",
        "pill-lg": "h-12 px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
