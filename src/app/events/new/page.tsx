'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CONTRACTS, oracleVotingABI } from '@/lib/contracts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function NewEventPage() {
    const { isConnected } = useAccount()
    const router = useRouter()
    const [description, setDescription] = useState('')
    const [votingDays, setVotingDays] = useState('3')

    const { writeContract, data: hash, isPending } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const handleCreateEvent = () => {
        if (!description.trim()) {
            toast.error('Digite uma descrição para o evento')
            return
        }

        const votingPeriod = BigInt(parseInt(votingDays) * 24 * 60 * 60) // dias para segundos

        writeContract({
            address: CONTRACTS.oracleVoting as `0x${string}`,
            abi: oracleVotingABI,
            functionName: 'createEvent',
            args: [description, votingPeriod],
        }, {
            onSuccess: () => {
                toast.success('Evento criado com sucesso!')
                router.push('/events')
            },
            onError: (error) => {
                toast.error('Erro ao criar evento: ' + error.message)
            },
        })
    }

    if (!isConnected) {
        return (
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">Criar Evento</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Conecte sua carteira para criar eventos
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-4xl font-bold">Criar Evento Oracle</h1>
                <p className="text-muted-foreground mt-2">
                    Crie um evento para ser resolvido pelos oráculos
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Novo Evento</CardTitle>
                    <CardDescription>
                        O evento deve ter uma resposta clara YES ou NO
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição / Pergunta</Label>
                        <Input
                            id="description"
                            placeholder="Ex: O BTC fechou acima de 70k em 31/12?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                            Seja específico. A pergunta deve ter resposta verificável.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="votingDays">Período de Votação (dias)</Label>
                        <Input
                            id="votingDays"
                            type="number"
                            min="1"
                            max="30"
                            value={votingDays}
                            onChange={(e) => setVotingDays(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold">⚠️ Importante</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Você precisa ser um oráculo (ter stake) para criar eventos</li>
                            <li>• Após o período de votação, o evento é resolvido</li>
                            <li>• A minoria que votou errado sofre slashing (perde parte do stake)</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleCreateEvent}
                        disabled={isPending || isConfirming}
                        className="w-full"
                    >
                        {isPending || isConfirming ? 'Criando...' : 'Criar Evento'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
