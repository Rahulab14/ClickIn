import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
    className?: string
    width?: number
    height?: number
}

export function Logo({ className, width = 120, height = 40 }: LogoProps) {
    return (
        <div className={cn("relative flex items-center", className)} style={{ width, height }}>
            <Image
                src="/logo.png"
                alt="ClickIn Logo"
                fill
                sizes="120px"
                className="object-contain"
                priority
            />
        </div>
    )
}
