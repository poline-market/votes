'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import Link from 'next/link'

const statusLabels: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    0: { label: 'Pendente', variant: 'secondary' },
    1: { label: 'Votação Ativa', variant: 'default' },
    2: { label: 'Cancelada', variant: 'destructive' },
    3: { label: 'Derrotada', variant: 'destructive' },
    4: { label: 'Aprovada', variant: 'outline' },
    5: { label: 'Em Fila', variant: 'outline' },
    6: { label: 'Executada', variant: 'default' },
    7: { label: 'Expirada', variant: 'secondary' },
}

const proposalTypes: Record<number, string> = {
    0: 'Geral',
    1: 'Oracle',
    2: 'Governança',
    3: 'Protocol Rules',
    4: 'Disputa',
    5: 'Comunidade',
}

export default function ProposalsPage() {
    const { data: proposalCount } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: polineDAOABI,
        functionName: 'proposalCount',
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">Propostas</h1>
                    <p className="text-muted-foreground mt-2">
                        Propostas de governança da DAO. Membros de círculos podem criar propostas.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/proposals/new">Criar Proposta</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total de Propostas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {proposalCount?.toString() || '0'}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Tipos de Proposta (Holacracia)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(proposalTypes).map(([key, label]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <Badge variant="outline">{label}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Tipo {key}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Como Funciona</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Badge>1. Criar</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Membro de círculo cria proposta
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Badge>2. Votar</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Token holders votam FOR/AGAINST
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Badge>3. Fila</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Se aprovada, entra em timelock
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Badge>4. Executar</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Após timelock, pode ser executada
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de propostas seria carregada aqui */}
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            {proposalCount && Number(proposalCount) > 0
                                ? 'Carregando propostas...'
                                : 'Nenhuma proposta criada ainda.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
