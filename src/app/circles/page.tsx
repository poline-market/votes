'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, circleRegistryABI } from '@/lib/contracts'
import { formatEther } from 'viem'

const defaultCircles = [
    {
        id: 'Oracle',
        name: 'Oracle',
        scope: 1,
        description: 'Votar na resolução de eventos YES/NO',
        requiredStake: '100',
    },
    {
        id: 'Governance',
        name: 'Governança',
        scope: 2,
        description: 'Definir regras de governança da DAO',
        requiredStake: '200',
    },
    {
        id: 'Protocol Rules',
        name: 'Protocol Rules',
        scope: 4,
        description: 'Parâmetros do AMM, fees, mercados permitidos',
        requiredStake: '150',
    },
    {
        id: 'Dispute Resolution',
        name: 'Dispute Resolution',
        scope: 8,
        description: 'Sistema de court para disputas',
        requiredStake: '300',
    },
    {
        id: 'Community',
        name: 'Comunidade',
        scope: 16,
        description: 'Crescimento, marketing, comunidade',
        requiredStake: '50',
    },
]

export default function CirclesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Círculos (Holacracia)</h1>
                <p className="text-muted-foreground mt-2">
                    A DAO é organizada em círculos especializados, cada um com poder limitado e escopo definido.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>O que é Holacracia?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Ao invés de cargos hierárquicos, a DAO usa círculos temáticos.
                        Cada círculo pode propor mudanças e votar apenas dentro do seu escopo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Poder limitado</Badge>
                        <Badge variant="outline">Decisão descentralizada</Badge>
                        <Badge variant="outline">Especialização</Badge>
                        <Badge variant="outline">Transparência</Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {defaultCircles.map((circle) => (
                    <Card key={circle.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{circle.name}</CardTitle>
                                <Badge variant="secondary">Scope {circle.scope}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {circle.description}
                            </p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Stake Mínimo</span>
                                <span className="font-bold">{circle.requiredStake} POLINE</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Como Participar de um Círculo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Badge>1. Fazer Stake</Badge>
                            <p className="text-sm text-muted-foreground">
                                Stake o mínimo necessário para o círculo desejado
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Badge>2. Solicitar Entrada</Badge>
                            <p className="text-sm text-muted-foreground">
                                Admin do círculo aprova novos membros
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Badge>3. Participar</Badge>
                            <p className="text-sm text-muted-foreground">
                                Crie propostas e vote dentro do escopo
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
