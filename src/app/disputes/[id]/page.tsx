'use client'

import { use } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, disputeResolutionABI, oracleVotingABI, stakingManagerABI } from '@/lib/contracts'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Scale, Vote, Users, TrendingUp } from 'lucide-react'

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

const getDisputeStatus = (status: number) => {
    const statuses = ['PENDING', 'VOTING', 'RESOLVED', 'CANCELLED']
    return statuses[status] || 'UNKNOWN'
}

const getStatusColor = (status: number) => {
    if (status === 0) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    if (status === 1) return 'bg-primary/10 text-primary border-primary/20'
    if (status === 2) return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (status === 3) return 'bg-red-500/10 text-red-500 border-red-500/20'
    return 'bg-muted/10 text-muted-foreground border-border'
}

export default function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: disputeId } = use(params)
    const { address, isConnected } = useAccount()

    // Ensure disputeId has 0x prefix
    const fullDisputeId = (disputeId.startsWith('0x') ? disputeId : `0x${disputeId}`) as `0x${string}`

    // Read dispute data
    const { data: disputeData, refetch: refetchDispute } = useReadContract({
        address: CONTRACTS.disputeResolution as `0x${string}`,
        abi: disputeResolutionABI,
        functionName: 'getDispute',
        args: [fullDisputeId],
    })

    // Read original event data
    const eventId = disputeData ? (disputeData as any).eventId : '0x0'
    const { data: eventData } = useReadContract({
        address: CONTRACTS.oracleVoting as `0x${string}`,
        abi: oracleVotingABI,
        functionName: 'getEvent',
        args: [eventId],
        query: { enabled: !!disputeData },
    })

    // Check if user is oracle
    const { data: isOracle } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'isOracle',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Check if user has voted on dispute
    const { data: hasVotedDispute } = useReadContract({
        address: CONTRACTS.disputeResolution as `0x${string}`,
        abi: disputeResolutionABI,
        functionName: 'hasVoted',
        args: [fullDisputeId, address || '0x0'],
        query: { enabled: !!address && !!disputeData },
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
    const { writeContract: voteDispute, data: voteHash, isPending: isVoting } = useWriteContract()
    const { writeContract: escalate, data: escalateHash, isPending: isEscalating } = useWriteContract()
    const { writeContract: resolve, data: resolveHash, isPending: isResolving } = useWriteContract()

    const { isLoading: isConfirmingVote, isSuccess: isVoteSuccess } = useWaitForTransactionReceipt({
        hash: voteHash,
    })
    const { isLoading: isConfirmingEscalate, isSuccess: isEscalateSuccess } = useWaitForTransactionReceipt({
        hash: escalateHash,
    })
    const { isLoading: isConfirmingResolve, isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({
        hash: resolveHash,
    })

    // Parse data
    const dispute: any = disputeData
    const event: any = eventData

    // Calculate percentages
    const totalDisputeVotes = dispute ? Number(formatEther(dispute.overturnVotes + dispute.upholdVotes)) : 0
    const overturnPercent = totalDisputeVotes > 0 ? (Number(formatEther(dispute.overturnVotes)) / totalDisputeVotes) * 100 : 0
    const upholdPercent = totalDisputeVotes > 0 ? (Number(formatEther(dispute.upholdVotes)) / totalDisputeVotes) * 100 : 0

    // Check if voting is open
    const now = Math.floor(Date.now() / 1000)
    const isDisputeVotingOpen = dispute && dispute.status === 1 && now <= Number(dispute.deadline)
    const hasEnded = dispute && now > Number(dispute.deadline)

    const handleVote = (overturn: boolean) => {
        if (!isOracle) {
            toast.error('Você precisa ser um oráculo para votar')
            return
        }
        if (hasVotedDispute) {
            toast.error('Você já votou neste dispute')
            return
        }
        if (!isDisputeVotingOpen) {
            toast.error('Votação de dispute não está aberta')
            return
        }

        voteDispute({
            address: CONTRACTS.disputeResolution as `0x${string}`,
            abi: disputeResolutionABI,
            functionName: 'castVote',
            args: [fullDisputeId, overturn],
        }, {
            onError: (error) => {
                toast.error('Erro ao votar: ' + error.message)
            },
        })
    }

    const handleEscalate = () => {
        escalate({
            address: CONTRACTS.disputeResolution as `0x${string}`,
            abi: disputeResolutionABI,
            functionName: 'escalateDispute',
            args: [fullDisputeId],
        }, {
            onError: (error) => {
                toast.error('Erro ao escalar: ' + error.message)
            },
        })
    }

    const handleResolve = () => {
        resolve({
            address: CONTRACTS.disputeResolution as `0x${string}`,
            abi: disputeResolutionABI,
            functionName: 'resolveDispute',
            args: [fullDisputeId],
        }, {
            onError: (error) => {
                toast.error('Erro ao resolver: ' + error.message)
            },
        })
    }

    // Refetch after actions
    if (isVoteSuccess || isEscalateSuccess || isResolveSuccess) {
        setTimeout(() => {
            refetchDispute()
            if (isVoteSuccess) toast.success('Voto em dispute registrado!')
            if (isEscalateSuccess) toast.success('Dispute escalado!')
            if (isResolveSuccess) toast.success('Dispute resolvido!')
        }, 2000)
    }

    if (!dispute || !event) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm" className="rounded-sm">
                        <Link href="/disputes">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando dispute...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="rounded-sm">
                    <Link href="/disputes">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar Disputes
                    </Link>
                </Button>
            </div>

            {/* Dispute Title & Status */}
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-medium tracking-tight leading-tight">
                                Dispute: {event.description}
                            </h1>
                            <Badge className={`rounded-sm ${getStatusColor(dispute.status)} font-mono text-xs whitespace-nowrap`}>
                                {getDisputeStatus(dispute.status)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Escalation Level: {Number(dispute.escalationLevel)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Event Info */}
            <Card className="border-yellow-500/20 bg-yellow-500/5 shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Evento Original</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Resultado Oracle:</span>
                        <span className="font-mono">{event.outcome ? 'SIM' : 'NÃO'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">YES Votes:</span>
                        <span className="font-mono">{Number(formatEther(event.yesVotes)).toFixed(2)} POLINE</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">NO Votes:</span>
                        <span className="font-mono">{Number(formatEther(event.noVotes)).toFixed(2)} POLINE</span>
                    </div>
                    <div className="pt-2">
                        <Link href={`/events/${event.id}`} className="text-xs text-primary hover:underline">
                            Ver evento completo →
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Dispute Voting Results */}
                <Card className="border-border shadow-none rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                            <Scale className="w-5 h-5" />
                            Votação do Dispute
                        </CardTitle>
                        <CardDescription>
                            Oráculos votam para REVERTER ou MANTER resultado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* OVERTURN votes */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                                    REVERTER
                                </span>
                                <span className="font-mono text-sm">
                                    {Number(formatEther(dispute.overturnVotes)).toFixed(2)} POLINE ({overturnPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 bg-secondary rounded-none overflow-hidden">
                                <div
                                    style={{ width: `${overturnPercent}%` }}
                                    className="h-full bg-yellow-500 transition-all duration-500"
                                />
                            </div>
                        </div>

                        {/* UPHOLD votes */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Vote className="w-4 h-4 text-primary" />
                                    MANTER
                                </span>
                                <span className="font-mono text-sm">
                                    {Number(formatEther(dispute.upholdVotes)).toFixed(2)} POLINE ({upholdPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 bg-secondary rounded-none overflow-hidden">
                                <div
                                    style={{ width: `${upholdPercent}%` }}
                                    className="h-full bg-primary transition-all duration-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total de Stake</span>
                                <span className="font-mono font-medium">
                                    {totalDisputeVotes.toFixed(2)} POLINE
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
                            Votar no Dispute
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
                        ) : hasVotedDispute ? (
                            <div className="p-4 border border-primary/20 bg-primary/5 rounded-sm space-y-2">
                                <p className="text-sm font-medium">✓ Você já votou neste dispute!</p>
                                <p className="text-xs text-muted-foreground">
                                    Peso do voto: {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE
                                </p>
                            </div>
                        ) : !isDisputeVotingOpen ? (
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
                                        disabled={isVoting || isConfirmingVote}
                                        variant="destructive"
                                        className="rounded-sm h-12 font-mono uppercase text-sm"
                                    >
                                        {isVoting || isConfirmingVote ? 'Processando...' : 'REVERTER'}
                                    </Button>
                                    <Button
                                        onClick={() => handleVote(false)}
                                        disabled={isVoting || isConfirmingVote}
                                        className="rounded-sm h-12 font-mono uppercase text-sm"
                                    >
                                        {isVoting || isConfirmingVote ? 'Processando...' : 'MANTER'}
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    ⚠️ Votar contra o consenso pode resultar em slashing
                                </p>
                            </div>
                        )}

                        {/* Admin Actions */}
                        {dispute.status === 1 && hasEnded && (
                            <div className="pt-4 border-t border-border space-y-2">
                                <Button
                                    onClick={handleResolve}
                                    disabled={isResolving || isConfirmingResolve}
                                    variant="outline"
                                    className="w-full rounded-sm"
                                >
                                    Resolver Dispute
                                </Button>
                                <Button
                                    onClick={handleEscalate}
                                    disabled={isEscalating || isConfirmingEscalate}
                                    variant="outline"
                                    className="w-full rounded-sm"
                                >
                                    Escalar para Círculo Superior
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dispute Info */}
            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Informações do Dispute</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                        <span className="text-muted-foreground">ID do Dispute</span>
                        <p className="font-mono text-xs mt-1 break-all">{fullDisputeId}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Challenger</span>
                        <p className="font-mono text-xs mt-1 break-all">{dispute.challenger}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Deadline</span>
                        <p className="font-mono mt-1">{formatDate(dispute.deadline)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
