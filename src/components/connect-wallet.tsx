'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/UserAvatar'
import { Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

export function ConnectWallet() {
    const { address, isConnected } = useAccount()
    const { connect, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="font-mono gap-2 pl-2">
                            <UserAvatar address={address} size={24} />
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                                <Settings className="h-4 w-4" />
                                Configurações
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => disconnect()}
                            className="text-destructive focus:text-destructive gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Desconectar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings Cog Icon */}
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Configurações</span>
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <Button
            onClick={() => connect({ connector: injected() })}
            disabled={isPending}
        >
            {isPending ? 'Conectando...' : 'Conectar MetaMask'}
        </Button>
    )
}
