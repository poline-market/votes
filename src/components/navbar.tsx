'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ConnectWallet } from '@/components/connect-wallet'

const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/proposals', label: 'Propostas' },
    { href: '/events', label: 'Eventos Oracle' },
    { href: '/staking', label: 'Staking' },
    { href: '/disputes', label: 'Disputas' },
    { href: '/circles', label: 'Círculos' },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-bold">
                        Poline DAO
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'text-sm font-medium transition-colors hover:text-primary',
                                    pathname === item.href
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <ConnectWallet />
            </div>
        </nav>
    )
}
