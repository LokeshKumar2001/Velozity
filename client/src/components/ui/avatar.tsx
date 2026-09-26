import * as React from "react"
import { cn } from "../../lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  colorBg?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

function Avatar({ className, src, fallback, colorBg = "bg-blue-600 text-white", size = "md", ...props }: AvatarProps) {
  const sizeStyles = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-xs font-bold",
    xl: "w-12 h-12 text-sm font-extrabold",
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center font-bold uppercase shadow-xs border border-white/20 select-none",
        sizeStyles[size],
        colorBg,
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={fallback} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  )
}

export { Avatar }
