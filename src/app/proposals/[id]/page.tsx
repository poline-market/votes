'use client'

import { useEffect, useState, use } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONTRACTS, polineDAOABI, stakingManagerABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { toast } from 'sonner'
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, Clock, Check } from 'lucide-react'
import Link from 'next/link'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'

const PROPOSAL_STATUS = ['Pending', 'Active', 'Cancelled', 'Defeated', 'Succeeded', 'Queued', 'Executed']
const PROPOSAL_TYPES = ['Market Rules', 'Trusted Sources', 'AMM Parameters', 'Fees', 'Dispute Policy', 'Circle Membership', 'Parameter Change']

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { address, isConnected } = useAccount()
    const [proposal, setProposal] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Unwrap params Promise (Next.js 15)
    const { id } = use(params)
    const proposalId = id as `0x${string}`

    const { writeContract: castVoteWrite, isPending: isVoting } = useWriteContract()
    const { writeContract: queueWrite, isPending: isQueuing } = useWriteContract()
    const { writeContract: executeWrite, isPending: isExecuting } = useWriteContract()

    const { data: hasVoted } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: polineDAOABI,
        functionName: 'hasVoted',
        args: proposalId && address ? [proposalId, address] : undefined,
        query: { enabled: !!proposalId && !!address },
    })

    const { data: userStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'getStake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    useEffect(() => {
        async function fetchProposal() {
            if (!proposalId) return

            try {
                const data: any = await readContract(config, {
                    address: CONTRACTS.polineDAO as `0x${string}`,
                    abi: polineDAOABI,
                    functionName: 'getProposal',
                    args: [proposalId],
                })

                setProposal({
                    id: data.id,
                    proposer: data.proposer,
                    circleId: data.circleId,
                    propType: data.propType,
                    description: data.description,
                    createdAt: data.createdAt,
                    votingStarts: data.votingStarts,
                    votingEnds: data.votingEnds,
                    forVotes: data.forVotes,
                    againstVotes: data.againstVotes,
                    abstainVotes: data.abstainVotes,
                    status: data.status,
                    executionTime: data.executionTime,
                })
            } catch (error) {
                console.error('Error fetching proposal:', error)
                toast.error('Failed to load proposal')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProposal()
    }, [proposalId])

    const castVote = (support: number) => {
        castVoteWrite({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: polineDAOABI,
            functionName: 'castVote',
            args: [proposalId, support],
        }, {
            onSuccess: () => {
                toast.success('Vote cast successfully!')
                setTimeout(() => window.location.reload(), 2000)
            },
            onError: (error: any) => {
                toast.error(`Failed to vote: ${error.message}`)
            },
        })
    }

    const queueProposal = () => {
        queueWrite({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: polineDAOABI,
            functionName: 'queueProposal',
            args: [proposalId],
        }, {
            onSuccess: () => {
                toast.success('Proposal queued!')
                setTimeout(() => window.location.reload(), 2000)
            },
            onError: (error: any) => {
                toast.error(`Failed to queue: ${error.message}`)
            },
        })
    }

    const executeProposal = () => {
        executeWrite({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: polineDAOABI,
            functionName: 'executeProposal',
            args: [proposalId],
        }, {
            onSuccess: () => {
                toast.success('Proposal executed!')
                setTimeout(() => window.location.reload(), 2000)
            },
            onError: (error: any) => {
                toast.error(`Failed to execute: ${error.message}`)
            },
        })
    }

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Loading proposal...</div>
    }

    if (!proposal) {
        return <div className="p-12 text-center text-muted-foreground">Proposal not found</div>
    }

    const total = Number(formatEther(proposal.forVotes + proposal.againstVotes + proposal.abstainVotes))
    const forVotes = Number(formatEther(proposal.forVotes))
    const againstVotes = Number(formatEther(proposal.againstVotes))
    const abstainVotes = Number(formatEther(proposal.abstainVotes))
    const forPercent = total > 0 ? (forVotes / total) * 100 : 0
    const againstPercent = total > 0 ? (againstVotes / total) * 100 : 0

    const now = Math.floor(Date.now() / 1000)
    const isVotingActive = proposal.status === 1 && now >= Number(proposal.votingStarts) && now <= Number(proposal.votingEnds)
    const canQueue = proposal.status === 4 && address?.toLowerCase() === proposal.proposer?.toLowerCase()
    const canExecute = proposal.status === 5 && now >= Number(proposal.executionTime)

    const stake = userStake ? Number(formatEther(userStake)) : 0

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="rounded-sm">
                    <Link href="/proposals">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-medium tracking-tight">{proposal.description}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {PROPOSAL_TYPES[proposal.propType]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {PROPOSAL_STATUS[proposal.status]}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border shadow-none rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Voting Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-500 font-medium">For</span>
                                <span className="font-mono">{forVotes.toFixed(0)} ({forPercent.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-none overflow-hidden">
                                <div style={{ width: `${forPercent}%` }} className="h-full bg-green-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-500 font-medium">Against</span>
                                <span className="font-mono">{againstVotes.toFixed(0)} ({againstPercent.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-none overflow-hidden">
                                <div style={{ width: `${againstPercent}%` }} className="h-full bg-red-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Abstain</span>
                                <span className="font-mono">{abstainVotes.toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Total Votes</span>
                                <span className="font-mono">{total.toFixed(0)} POLINE</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-none rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Cast Your Vote</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isConnected && (
                            <p className="text-sm text-muted-foreground">Connect wallet to vote</p>
                        )}

                        {isConnected && !isVotingActive && (
                            <p className="text-sm text-muted-foreground">Voting is closed</p>
                        )}

                        {isConnected && hasVoted && (
                            <div className="flex items-center gap-2 p-3 border border-primary/20 bg-primary/5 rounded-sm">
                                <Check className="w-4 h-4 text-pr imary" />
                                <span className="text-sm">You have already voted</span>
                            </div>
                        )}

                        {isConnected && isVotingActive && !hasVoted && (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Your vote weight: <span className="font-mono font-medium">{stake.toFixed(2)} POLINE</span>
                                </p>

                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        onClick={() => castVote(1)}
                                        disabled={isVoting}
                                        className="flex-col h-auto py-4 rounded-sm bg-green-500 hover:bg-green-600"
                                    >
                                        <ThumbsUp className="w-5 h-5 mb-1" />
                                        <span className="text-xs">For</span>
                                    </Button>

                                    <Button
                                        onClick={() => castVote(0)}
                                        disabled={isVoting}
                                        className="flex-col h-auto py-4 rounded-sm bg-red-500 hover:bg-red-600"
                                    >
                                        <ThumbsDown className="w-5 h-5 mb-1" />
                                        <span className="text-xs">Against</span>
                                    </Button>

                                    <Button
                                        onClick={() => castVote(2)}
                                        disabled={isVoting}
                                        variant="outline"
                                        className="flex-col h-auto py-4 rounded-sm"
                                    >
                                        <Minus className="w-5 h-5 mb-1" />
                                        <span className="text-xs">Abstain</span>
                                    </Button>
                                </div>
                            </>
                        )}

                        {canQueue && (
                            <Button onClick={queueProposal} disabled={isQueuing} className="w-full rounded-sm">
                                Queue Proposal
                            </Button>
                        )}

                        {canExecute && (
                            <Button onClick={executeProposal} disabled={isExecuting} className="w-full rounded-sm bg-green-500 hover:bg-green-600">
                                Execute Proposal
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Created: {new Date(Number(proposal.createdAt) * 1000).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Voting ends: {new Date(Number(proposal.votingEnds) * 1000).toLocaleString()}</span>
                        </div>
                        {proposal.executionTime > 0 && (
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Executable after: {new Date(Number(proposal.executionTime) * 1000).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
