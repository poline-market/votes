'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, disputeResolutionABI } from '@/lib/contracts'

const statusLabels: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    0: { label: 'Aberta', variant: 'default' },
    1: { label: 'Votação', variant: 'default' },
    2: { label: 'Resolvida', variant: 'outline' },
    3: { label: 'Escalada', variant: 'secondary' },
    4: { label: 'Cancelada', variant: 'destructive' },
}

export default function DisputesPage() {
    const { data: disputeCount } = useReadContract({
        address: CONTRACTS.disputeResolution as `0x${string}`,
        abi: disputeResolutionABI,
        functionName: 'disputeCount',
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Disputas</h1>
                <p className="text-muted-foreground mt-2">
                    Sistema de court estilo Kleros/UMA. Desafie decisões erradas.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total de Disputas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {disputeCount?.toString() || '0'}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Como Funciona o Sistema de Disputas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Badge>1. Evento Resolvido</Badge>
                            <p className="text-sm text-muted-foreground">
                                Um evento oracle é resolvido com resultado YES ou NO
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Badge>2. Abrir Disputa</Badge>
                            <p className="text-sm text-muted-foreground">
                                Se você acredita que está errado, abra disputa com stake extra
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Badge>3. Nova Votação</Badge>
                            <p className="text-sm text-muted-foreground">
                                Oráculos votam novamente: reverter ou manter
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Badge>4. Resolução</Badge>
                            <p className="text-sm text-muted-foreground">
                                Perdedor sofre slashing. Pode escalar com mais stake.
                            </p>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Escalação</h4>
                        <p className="text-sm text-muted-foreground">
                            Cada rodada de escalação requer 1.5x mais stake. Isso garante que disputas
                            frívolas sejam caras, mas disputas legítimas possam ser resolvidas.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        {disputeCount && Number(disputeCount) > 0
                            ? 'Carregando disputas...'
                            : 'Nenhuma disputa ativa. Disputas são abertas quando um evento resolvido é contestado.'}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
