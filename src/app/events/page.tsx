'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, oracleVotingABI } from '@/lib/contracts'
import Link from 'next/link'

const statusLabels: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    0: { label: 'Pendente', variant: 'secondary' },
    1: { label: 'Votação Ativa', variant: 'default' },
    2: { label: 'Resolvido', variant: 'outline' },
    3: { label: 'Disputado', variant: 'destructive' },
    4: { label: 'Cancelado', variant: 'secondary' },
}

export default function EventsPage() {
    const { data: eventCount } = useReadContract({
        address: CONTRACTS.oracleVoting as `0x${string}`,
        abi: oracleVotingABI,
        functionName: 'eventCount',
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">Eventos Oracle</h1>
                    <p className="text-muted-foreground mt-2">
                        Vote YES ou NO na resolução de eventos. Minoria sofre slashing.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/events/new">Criar Evento</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {eventCount?.toString() || '0'}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Como Funciona</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Badge>1. Criar Evento</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Qualquer oráculo pode criar um evento com pergunta YES/NO
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Badge>2. Votação</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Oráculos votam YES ou NO durante o período de votação
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Badge>3. Resolução</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Após deadline, resultado é definido e minoria é slashed
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de eventos seria carregada aqui */}
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            {eventCount && Number(eventCount) > 0
                                ? 'Carregando eventos...'
                                : 'Nenhum evento criado ainda. Seja o primeiro a criar!'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
