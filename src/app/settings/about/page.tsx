'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info, ExternalLink, Github, FileText, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const version = '0.1.0'

const links = [
    {
        label: 'Documentação',
        href: 'https://docs.poline.io',
        icon: FileText,
        description: 'Aprenda sobre a Poline DAO'
    },
    {
        label: 'GitHub',
        href: 'https://github.com/poline-dao',
        icon: Github,
        description: 'Código fonte e contribuições'
    },
    {
        label: 'Discord',
        href: 'https://discord.gg/poline',
        icon: MessageCircle,
        description: 'Comunidade e suporte'
    },
]

const contracts = [
    { name: 'PolineToken', address: '0xea102082ae2a897c4dbbebf39b4c15e8a8341307' },
    { name: 'StakingManager', address: '0x9f33ef78fe276d7e9d03b42308e08d1094436713' },
    { name: 'CircleRegistry', address: '0x86a61152bd41b7cd34db767ec0a916f39118605e' },
    { name: 'OracleVoting', address: '0xf66413ef88e068dc594886be88e59f449893f9a4' },
    { name: 'DisputeResolution', address: '0x884f6a11079139b9077efc998c0a87778165bab3' },
    { name: 'PolineDAO', address: '0x6e64588abfa6616fa0c163f6d02f23c06a7f573e' },
    { name: 'PolinePurchase', address: '0xeb409d3f0e692b6925665af906706f42475c4142' },
    { name: 'TreasuryManager', address: '0x24f29fe3765ba33ec46984e73c537c2bb4ff83a7' },
    { name: 'UserProfile', address: '0xa5e4709bb929836c2ced40203baf538fee913636' },
]

export default function SettingsAboutPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Sobre</h2>
                <p className="text-muted-foreground">Informações sobre a Poline DAO</p>
            </div>

            {/* Version Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Versão
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-mono text-lg">{version}</p>
                            <p className="text-sm text-muted-foreground">Polygon Amoy Testnet</p>
                        </div>
                        <div className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium">
                            Testnet
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Links Úteis</CardTitle>
                    <CardDescription>Recursos e comunidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {links.map((link) => {
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{link.label}</p>
                                        <p className="text-sm text-muted-foreground">{link.description}</p>
                                    </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Contracts */}
            <Card>
                <CardHeader>
                    <CardTitle>Contratos</CardTitle>
                    <CardDescription>Smart contracts da Poline DAO na Amoy Testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {contracts.map((contract) => (
                            <div key={contract.name} className="flex items-center justify-between py-2 border-b last:border-0">
                                <span className="font-medium">{contract.name}</span>
                                <Link
                                    href={`https://amoy.polygonscan.com/address/${contract.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Built With */}
            <Card>
                <CardHeader>
                    <CardTitle>Tecnologias</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {['Next.js', 'React', 'Wagmi', 'Viem', 'Solidity', 'Foundry', 'Polygon'].map((tech) => (
                            <span
                                key={tech}
                                className="px-2 py-1 bg-muted rounded text-xs font-medium"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
