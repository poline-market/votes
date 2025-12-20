'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ConnectWallet } from '@/components/connect-wallet'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Buy POLINE', href: '/buy' },
    { label: 'Staking', href: '/staking' },
    { label: 'Circles', href: '/circles' },
    { label: 'Markets', href: '/events' },
    { label: 'Governance', href: '/proposals' },
]

export function Navbar() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()

    return (
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="font-mono text-lg font-bold tracking-tight">
                        POLINE
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative h-14 flex items-center"
                                >
                                    <span className={cn(
                                        'text-xs font-medium uppercase tracking-wide transition-colors',
                                        isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground/80'
                                    )}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary mb-[-1px]" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle minimalista */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <div className="h-4 w-[1px] bg-border" /> {/* Divider */}

                    <ConnectWallet />
                </div>
            </div>
        </nav>
    )
}
