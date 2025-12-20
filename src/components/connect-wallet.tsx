'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ConnectWallet() {
    const { address, isConnected } = useAccount()
    const { connect, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected && address) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="font-mono">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => disconnect()}>
                        Desconectar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
