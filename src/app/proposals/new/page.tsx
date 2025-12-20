'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { zeroAddress } from 'viem'

const proposalTypes = [
    { value: 1, label: 'Oracle', description: 'Mudanças no sistema de oráculos' },
    { value: 2, label: 'Governança', description: 'Regras de governança da DAO' },
    { value: 3, label: 'Protocol Rules', description: 'Parâmetros do protocolo (fees, AMM)' },
    { value: 4, label: 'Disputa', description: 'Sistema de disputas' },
    { value: 5, label: 'Comunidade', description: 'Crescimento e comunidade' },
]

export default function NewProposalPage() {
    const { isConnected } = useAccount()
    const router = useRouter()
    const [description, setDescription] = useState('')
    const [proposalType, setProposalType] = useState(2) // Governança por padrão

    const { writeContract, data: hash, isPending } = useWriteContract()

    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash,
    })

    const handleCreateProposal = () => {
        if (!description.trim()) {
            toast.error('Digite uma descrição para a proposta')
            return
        }

        // CircleId baseado no tipo de proposta
        const circleIds: Record<number, string> = {
            1: '0x0000000000000000000000000000000000000000000000000000000000000001', // Oracle
            2: '0x0000000000000000000000000000000000000000000000000000000000000002', // Governance
            3: '0x0000000000000000000000000000000000000000000000000000000000000003', // Protocol
            4: '0x0000000000000000000000000000000000000000000000000000000000000004', // Dispute
            5: '0x0000000000000000000000000000000000000000000000000000000000000005', // Community
        }

        writeContract({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: polineDAOABI,
            functionName: 'createProposal',
            args: [
                circleIds[proposalType] as `0x${string}`,
                proposalType,
                description,
                zeroAddress, // target
                '0x' as `0x${string}`, // callData
                0n, // value
            ],
        }, {
            onSuccess: () => {
                toast.success('Proposta criada com sucesso!')
                router.push('/proposals')
            },
            onError: (error) => {
                toast.error('Erro ao criar proposta: ' + error.message)
            },
        })
    }

    if (!isConnected) {
        return (
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">Criar Proposta</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Conecte sua carteira para criar propostas
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-4xl font-bold">Criar Proposta</h1>
                <p className="text-muted-foreground mt-2">
                    Crie uma proposta de governança para a DAO
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nova Proposta</CardTitle>
                    <CardDescription>
                        Você precisa ser membro do círculo correspondente
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Tipo de Proposta (Círculo)</Label>
                        <div className="grid gap-2">
                            {proposalTypes.map((type) => (
                                <label
                                    key={type.value}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${proposalType === type.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="proposalType"
                                        value={type.value}
                                        checked={proposalType === type.value}
                                        onChange={() => setProposalType(type.value)}
                                        className="sr-only"
                                    />
                                    <div>
                                        <div className="font-medium">{type.label}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {type.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição da Proposta</Label>
                        <Input
                            id="description"
                            placeholder="Descreva sua proposta..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold">⚠️ Requisitos</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Você precisa ser membro do círculo correspondente</li>
                            <li>• Ter stake mínimo necessário para o círculo</li>
                            <li>• Após criação, período de votação inicia</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleCreateProposal}
                        disabled={isPending || isConfirming}
                        className="w-full"
                    >
                        {isPending || isConfirming ? 'Criando...' : 'Criar Proposta'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
