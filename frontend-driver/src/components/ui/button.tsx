import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Base styles
    let variantStyles = "bg-action text-white hover:bg-action-hover shadow-sm"
    
    if (variant === "secondary") {
      variantStyles = "bg-primary text-white hover:bg-primary-light shadow-sm"
    } else if (variant === "outline") {
      variantStyles = "border border-gray-300 bg-transparent hover:bg-gray-100 text-text-main"
    } else if (variant === "ghost") {
      variantStyles = "hover:bg-gray-100 hover:text-text-main text-text-muted"
    }

    let sizeStyles = "h-10 px-4 py-2"
    if (size === "sm") sizeStyles = "h-9 rounded-md px-3"
    else if (size === "lg") sizeStyles = "h-12 rounded-md px-8 text-lg font-medium"
    else if (size === "icon") sizeStyles = "h-10 w-10"

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles,
          sizeStyles,
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
