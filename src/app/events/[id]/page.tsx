'use client'

import { use } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, oracleVotingABI, stakingManagerABI } from '@/lib/contracts'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, ThumbsUp, ThumbsDown, Clock, Users, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Helper functions
const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const getStatus = (status: number) => {
    const statuses = ['PENDING', 'VOTING', 'RESOLVED', 'DISPUTED', 'CANCELLED']
    return statuses[status] || 'UNKNOWN'
}

const getStatusColor = (status: number) => {
    if (status === 1) return 'bg-primary/10 text-primary border-primary/20'
    if (status === 2) return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (status === 3) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    if (status === 4) return 'bg-red-500/10 text-red-500 border-red-500/20'
    return 'bg-muted/10 text-muted-foreground border-border'
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { address, isConnected } = useAccount()
    const router = useRouter()

    // Ensure id has 0x prefix
    const eventId = (id.startsWith('0x') ? id : `0x${id}`) as `0x${string}`

    // Read event data
    const { data: eventData, refetch: refetchEvent } = useReadContract({
        address: CONTRACTS.oracleVoting as `0x${string}`,
        abi: oracleVotingABI,
        functionName: 'getEvent',
        args: [eventId],
    })

    // Check if user is oracle
    const { data: isOracle } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'isOracle',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Check if user has voted
    const { data: voteData } = useReadContract({
        address: CONTRACTS.oracleVoting as `0x${string}`,
        abi: oracleVotingABI,
        functionName: 'getVote',
        args: [eventId, address || '0x0'],
        query: { enabled: !!address },
    })

    // Get user stake
    const { data: userStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'getStake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Write contracts
    const { writeContract: castVote, data: voteHash, isPending: isVoting } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: voteHash,
    })

    // Parse event data
    const event: any = eventData
    const hasVoted = voteData ? (voteData as any).hasVoted : false
    const userVote = voteData ? (voteData as any).vote : false

    // Calculate vote percentages
    const totalVotes = event ? Number(formatEther(event.yesVotes + event.noVotes)) : 0
    const yesPercent = totalVotes > 0 ? (Number(formatEther(event.yesVotes)) / totalVotes) * 100 : 0
    const noPercent = totalVotes > 0 ? (Number(formatEther(event.noVotes)) / totalVotes) * 100 : 0

    // Check if voting is open
    const now = Math.floor(Date.now() / 1000)
    const isVotingOpen = event && event.status === 1 && now <= Number(event.votingDeadline)
    const hasEnded = event && now > Number(event.votingDeadline)

    const handleVote = (voteYes: boolean) => {
        if (!isOracle) {
            toast.error('Você precisa ser um oráculo para votar')
            return
        }
        if (hasVoted) {
            toast.error('Você já votou neste evento')
            return
        }
        if (!isVotingOpen) {
            toast.error('Votação não está aberta')
            return
        }

        castVote({
            address: CONTRACTS.oracleVoting as `0x${string}`,
            abi: oracleVotingABI,
            functionName: 'castVote',
            args: [eventId, voteYes],
        }, {
            onError: (error) => {
                toast.error('Erro ao votar: ' + error.message)
            },
        })
    }

    // Refetch after vote
    if (isSuccess) {
        setTimeout(() => {
            refetchEvent()
            toast.success('Voto registrado com sucesso!')
        }, 2000)
    }

    if (!event) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm" className="rounded-sm">
                        <Link href="/events">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando evento...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="rounded-sm">
                    <Link href="/events">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Link>
                </Button>
            </div>

            {/* Event Title & Status */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-4xl font-medium tracking-tight leading-tight">
                        {event.description}
                    </h1>
                    <Badge className={`rounded-sm ${getStatusColor(event.status)} font-mono text-xs`}>
                        {getStatus(event.status)}
                    </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Criado: {formatDate(event.createdAt)}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Deadline: {formatDate(event.votingDeadline)}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Voting Results */}
                <Card className="border-border shadow-none rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Resultado da Votação
                        </CardTitle>
                        <CardDescription>
                            Stake-weighted voting pelos oráculos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* YES votes */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <ThumbsUp className="w-4 h-4 text-primary" />
                                    SIM
                                </span>
                                <span className="font-mono text-sm">
                                    {Number(formatEther(event.yesVotes)).toFixed(2)} POLINE ({yesPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 bg-secondary rounded-none overflow-hidden">
                                <div
                                    style={{ width: `${yesPercent}%` }}
                                    className="h-full bg-primary transition-all duration-500"
                                />
                            </div>
                        </div>

                        {/* NO votes */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <ThumbsDown className="w-4 h-4 text-red-500" />
                                    NÃO
                                </span>
                                <span className="font-mono text-sm">
                                    {Number(formatEther(event.noVotes)).toFixed(2)} POLINE ({noPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 bg-secondary rounded-none overflow-hidden">
                                <div
                                    style={{ width: `${noPercent}%` }}
                                    className="h-full bg-red-500 transition-all duration-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total de Stake</span>
                                <span className="font-mono font-medium">
                                    {totalVotes.toFixed(2)} POLINE
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Voting Interface */}
                <Card className="border-border shadow-none rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Votar como Oráculo
                        </CardTitle>
                        <CardDescription>
                            Seu voto será ponderado pelo seu stake
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isConnected ? (
                            <div className="p-4 border border-dashed border-border rounded-sm text-center text-sm text-muted-foreground">
                                Conecte sua carteira para votar
                            </div>
                        ) : !isOracle ? (
                            <div className="p-4 border border-dashed border-yellow-500/20 bg-yellow-500/5 rounded-sm space-y-3">
                                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                                    Você precisa ser um oráculo para votar
                                </p>
                                <Button asChild size="sm" variant="outline" className="rounded-sm w-full">
                                    <Link href="/staking">
                                        Fazer Stake e se tornar Oráculo
                                    </Link>
                                </Button>
                            </div>
                        ) : hasVoted ? (
                            <div className="p-4 border border-primary/20 bg-primary/5 rounded-sm space-y-2">
                                <p className="text-sm font-medium">✓ Você já votou!</p>
                                <p className="text-sm text-muted-foreground">
                                    Seu voto: <span className="font-mono font-medium text-foreground">
                                        {userVote ? 'SIM' : 'NÃO'}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Peso do voto: {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE
                                </p>
                            </div>
                        ) : !isVotingOpen ? (
                            <div className="p-4 border border-dashed border-border rounded-sm text-center text-sm text-muted-foreground">
                                {hasEnded ? 'Votação encerrada' : 'Votação não iniciada'}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-3 bg-muted/50 rounded-sm text-xs space-y-1">
                                    <p className="text-muted-foreground">Seu stake:</p>
                                    <p className="font-mono font-medium">
                                        {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => handleVote(true)}
                                        disabled={isVoting || isConfirming}
                                        className="rounded-sm h-12 font-mono uppercase text-sm"
                                    >
                                        {isVoting || isConfirming ? (
                                            'Processando...'
                                        ) : (
                                            <>
                                                <ThumbsUp className="w-4 h-4 mr-2" />
                                                Votar SIM
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => handleVote(false)}
                                        disabled={isVoting || isConfirming}
                                        variant="destructive"
                                        className="rounded-sm h-12 font-mono uppercase text-sm"
                                    >
                                        {isVoting || isConfirming ? (
                                            'Processando...'
                                        ) : (
                                            <>
                                                <ThumbsDown className="w-4 h-4 mr-2" />
                                                Votar NÃO
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    ⚠️ Votar contra o consenso pode resultar em slashing de 10%
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Event Info */}
            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Informações do Evento</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                        <span className="text-muted-foreground">ID do Evento</span>
                        <p className="font-mono text-xs mt-1 break-all">{eventId}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Criador</span>
                        <p className="font-mono text-xs mt-1 break-all">{event.creator}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Status Final</span>
                        <p className="font-mono mt-1">
                            {event.status === 2 ? (event.outcome ? 'SIM' : 'NÃO') : 'Pendente'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
