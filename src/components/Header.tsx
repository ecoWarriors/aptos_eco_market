// components/Header.tsx

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { WalletSelector } from "./WalletSelector";

export function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-8 max-w-screen-xl mx-auto w-full">
      {/* Logo Image */}
      <div className="flex-shrink-0">
        <Link href="/">
          <Image 
            src="/images/ecotoken.png" 
            alt="EcoToken Logo" 
            width={128} 
            height={35} 
            className="h-10 md:h-12 w-auto hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          />
        </Link>
      </div>

      {/* Centered Title */}
      <h1 className="text-xl md:text-2xl font-semibold text-center flex-grow">
        Aptos Eco Marketplace
      </h1>

      {/* WalletSelector */}
      <div className="flex gap-2 items-center flex-shrink-0">
        <WalletSelector />
      </div>
    </div>
  );
}