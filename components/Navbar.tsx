import { TextAlignJustify } from "lucide-react";
import Image from "next/image";
import Link from "next/link"

export function Navbar(){
  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[580px] flex justify-center border rounded-md h-10 bg-zinc-950/80 border-white/10">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
        <Link href="/">
          <h1 className="text-xl font-bold">Flipfi</h1>
        </Link>
        <TextAlignJustify 
          className="size-6 text-white cursor-pointer"
        />
      </div>
      </div>
    </div>
  );
}