'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ConnectWallet } from '@/components/connect-wallet'
import { useTheme } from 'next-themes'
import { Moon, Sun, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { loadNotifications, checkProposalDeadlines, saveNotifications, markAllAsRead, mergeNotifications, type Notification } from '@/lib/notifications'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Buy POLINE', href: '/buy' },
    { label: 'Staking', href: '/staking' },
    { label: 'Circles', href: '/circles' },
    { label: 'Markets', href: '/events' },
    { label: 'Disputes', href: '/disputes' },
    { label: 'Governance', href: '/proposals' },
    { label: 'Treasury', href: '/treasury' },
    { label: 'History', href: '/governance/history' },
    { label: 'Analytics', href: '/analytics' },
    // Admin only shows when SDK_TOOLS is enabled
    ...(process.env.NEXT_PUBLIC_SDK_TOOLS === 'true' ? [{ label: '⚙️ Admin', href: '/admin' }] : []),
]

export function Navbar() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        // Load from localStorage
        const stored = loadNotifications()
        setNotifications(stored)

        // Check for new notifications every 60s
        const interval = setInterval(async () => {
            try {
                const proposals = []
                // Fetch proposals
                for (let i = 0; i < 100; i++) {
                    try {
                        const proposalId: any = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'allProposalIds',
                            args: [BigInt(i)],
                        })

                        const proposalData: any = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'getProposal',
                            args: [proposalId],
                        })

                        proposals.push(proposalData)
                    } catch {
                        break
                    }
                }

                const newNotifs = checkProposalDeadlines(proposals)
                const merged = mergeNotifications(stored, newNotifs)
                setNotifications(merged)
                saveNotifications(merged)
            } catch (error) {
                console.error('Error checking notifications:', error)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    const handleMarkAllRead = () => {
        const updated = markAllAsRead()
        setNotifications(updated)
    }

    return (
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="font-mono text-lg font-bold tracking-tight pl-5">
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
                    {/* Notifications Bell */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Badge>
                                )}
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <div className="flex items-center justify-between px-2 py-1.5">
                                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={handleMarkAllRead}
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No notifications
                                </div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.slice(0, 10).map((notif) => (
                                        <Link key={notif.id} href={notif.proposalId ? `/proposals/${notif.proposalId}` : '/proposals'}>
                                            <DropdownMenuItem className={cn(
                                                "flex-col items-start gap-1 cursor-pointer",
                                                !notif.read && "bg-primary/5"
                                            )}>
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="font-medium text-xs">{notif.title}</span>
                                                    {!notif.read && (
                                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(notif.timestamp).toLocaleDateString()}
                                                </span>
                                            </DropdownMenuItem>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

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
