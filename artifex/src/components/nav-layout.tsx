'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Palette, MessageSquare, Menu } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { EchoAccount } from '@/components/echo-account-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Critique', href: '/critique', icon: MessageSquare },
  { name: 'Studio', href: '/studio', icon: Palette },
];

export function NavLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen bg-[#22223B]">
      {/* Header with logo and hamburger menu */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-[#4A4E69]">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo/Artifex_Favicon.png"
              alt="Artifex Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2E9E4] tracking-tight">
              Artifex
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            {/* Echo Account */}
            <EchoAccount />

            {/* Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-[#4A4E69] bg-transparent hover:bg-[#4A4E69] hover:text-[#F2E9E4] text-[#C9ADA7]"
                >
                  <Menu size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#2a2a45] border-[#4A4E69]">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 cursor-pointer text-[#F2E9E4] hover:bg-[#4A4E69]',
                          isActive && 'bg-[#4A4E69] text-[#C9ADA7]'
                        )}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
