import logoImage from "@/public/logo.png";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex gap-2 justify-start items-center", className)}>
      <Image src={logoImage} alt="AutoBudget Logo" className="w-8" />
      <p className="font-bold">AutoBudget</p>
    </div>
  );
}
