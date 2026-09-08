import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[#df5c37] text-white shadow-lg shadow-[#df5c37]/20 hover:shadow-xl hover:shadow-[#df5c37]/30 hover:bg-[#c94d2a]",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border-2 border-[#dcdee1] dark:border-[#3a4155] bg-white dark:bg-[#2a3040] hover:bg-[#f3f5f6] dark:hover:bg-[#3a4155] hover:border-[#df5c37]/40 dark:hover:border-[#df5c37]/60",
        secondary:
          "bg-[#e7eaec] dark:bg-[#2a3040] text-gray-900 dark:text-gray-100 hover:bg-[#dcdee1] dark:hover:bg-[#3a4155]",
        ghost:
          "hover:bg-[#f3f5f6] dark:hover:bg-[#2a3040]",
        link: "text-[#df5c37] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
