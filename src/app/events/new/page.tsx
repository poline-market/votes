'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CONTRACTS, oracleVotingABI } from '@/lib/contracts'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Plus, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateEventPage() {
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const [description, setDescription] = useState('')
    const [votingDays, setVotingDays] = useState('3')

    const { writeContract: createEvent, data: createHash, isPending: isCreating } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: createHash,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!description.trim()) {
            toast.error('Digite uma descrição para o evento')
            return
        }

        const days = parseInt(votingDays)
        if (isNaN(days) || days < 1 || days > 30) {
            toast.error('Período de votação deve ser entre 1 e 30 dias')
            return
        }

        const votingPeriod = days * 24 * 60 * 60 // Convert days to seconds

        createEvent({
            address: CONTRACTS.oracleVoting as `0x${string}`,
            abi: oracleVotingABI,
            functionName: 'createEvent',
            args: [description, BigInt(votingPeriod)],
        }, {
            onError: (error) => {
                toast.error('Erro ao criar evento: ' + error.message)
            },
        })
    }

    // Redirect after success
    if (isSuccess) {
        setTimeout(() => {
            toast.success('Evento criado com sucesso!')
            router.push('/events')
        }, 2000)
    }

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="rounded-sm">
                    <Link href="/events">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-4xl font-medium tracking-tight">Criar Evento</h1>
                <p className="text-muted-foreground mt-2">
                    Crie um novo mercado para resolução por oráculos
                </p>
            </div>

            {!isConnected ? (
                <Card className="border-border shadow-none rounded-sm">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">
                            Conecte sua carteira para criar eventos
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Card className="border-border shadow-none rounded-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Informações do Evento
                            </CardTitle>
                            <CardDescription>
                                Defina a questão que será resolvida pelos oráculos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="label-tech">
                                    Descrição do Evento *
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Ex: Bitcoin atingirá $100,000 USD até 31 de Dezembro de 2025?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px] rounded-sm resize-none font-medium"
                                    maxLength={200}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {description.length}/200 caracteres
                                </p>
                                <div className="p-3 bg-muted/50 rounded-sm space-y-2 text-xs">
                                    <p className="font-medium">💡 Dicas para criar bons eventos:</p>
                                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                                        <li>Seja específico e mensurável</li>
                                        <li>Defina um prazo claro</li>
                                        <li>Use linguagem simples e objetiva</li>
                                        <li>Evite ambiguidades</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Voting Period */}
                            <div className="space-y-2">
                                <Label htmlFor="votingDays" className="label-tech flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Período de Votação (dias) *
                                </Label>
                                <Input
                                    id="votingDays"
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={votingDays}
                                    onChange={(e) => setVotingDays(e.target.value)}
                                    className="rounded-sm font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Os oráculos terão até {votingDays} dias para votar após a criação
                                </p>
                            </div>

                            {/* Important Info */}
                            <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-sm space-y-2">
                                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                                    ⚠️ Informações Importantes:
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Você precisa ter a role EVENT_CREATOR_ROLE</li>
                                    <li>O evento iniciará imediatamente após a criação</li>
                                    <li>Oráculos votarão SIM ou NÃO baseado no resultado</li>
                                    <li>Após o deadline, o evento pode ser resolvido</li>
                                    <li>Votos minority serão slashed em 10%</li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isCreating || isConfirming || !description.trim()}
                                className="w-full h-12 rounded-sm font-mono uppercase text-sm"
                                size="lg"
                            >
                                {isCreating || isConfirming ? (
                                    'Criando Evento...'
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Evento Oracle
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            )}

            {/* Examples */}
            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">
                        Exemplos de Eventos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-sm text-sm">
                        <p className="font-medium mb-1">Cripto:</p>
                        <p className="text-muted-foreground text-xs">
                            "Ethereum atingirá $5,000 USD até 30 de Junho de 2025?"
                        </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-sm text-sm">
                        <p className="font-medium mb-1">Esportes:</p>
                        <p className="text-muted-foreground text-xs">
                            "Brasil será campeão da Copa do Mundo de 2026?"
                        </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-sm text-sm">
                        <p className="font-medium mb-1">Política:</p>
                        <p className="text-muted-foreground text-xs">
                            "Reforma tributária será aprovada até Dezembro de 2025?"
                        </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-sm text-sm">
                        <p className="font-medium mb-1">Tecnologia:</p>
                        <p className="text-muted-foreground text-xs">
                            "Apple lançará um novo produto de IA até final de 2025?"
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
