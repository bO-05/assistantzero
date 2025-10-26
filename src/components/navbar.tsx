'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/utils/cn';

export const ActiveLink = (props: { href: string; children: ReactNode }) => {
  const pathname = usePathname();
  return (
    <Link
      href={props.href}
      className={cn(
        'px-4 py-2 rounded-[18px] whitespace-nowrap flex items-center gap-2 text-sm transition-all duration-200 hover:bg-white/10',
        pathname === props.href && 'bg-primary text-primary-foreground shadow-md scale-105',
        pathname !== props.href && 'text-white/80 hover:text-white',
      )}
    >
      {props.children}
    </Link>
  );
};
