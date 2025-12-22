import logoImage from "@/public/logo.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="flex gap-2 justify-start items-center">
      <Image src={logoImage} alt="AutoBudget Logo" className="w-8" />
      <p className="font-bold">AutoBudget</p>
    </div>
  );
}
