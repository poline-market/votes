'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    Settings2,
    User,
    Users,
    Shield,
    Info
} from 'lucide-react'

const settingsNavItems = [
    { label: 'Geral', href: '/settings', icon: Settings2 },
    { label: 'Perfil', href: '/settings/profile', icon: User },
    { label: 'Delegação', href: '/settings/delegate', icon: Users },
    { label: 'Privacidade', href: '/settings/privacy', icon: Shield },
    { label: 'Sobre', href: '/settings/about', icon: Info },
]

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="container py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="sticky top-20">
                        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            Settings
                        </h1>
                        <nav className="space-y-1">
                            {settingsNavItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/settings' && pathname.startsWith(item.href))
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
