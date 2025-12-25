'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, polineDAOABI, stakingManagerABI, polineTokenABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import Link from 'next/link'
import { ArrowUpRight, TrendingUp, Vote, FileText, Zap } from 'lucide-react'

const PROPOSAL_STATUS = ['Pending', 'Active', 'Cancelled', 'Defeated', 'Succeeded', 'Queued', 'Executed']

interface VoteRecord {
    proposalId: string
    description: string
    vote: number // 0=Against, 1=For, 2=Abstain
    voteWeight: bigint
    timestamp: bigint
    status: number
}

interface ProposalRecord {
    id: string
    description: string
    status: number
    forVotes: bigint
    againstVotes: bigint
    createdAt: bigint
}

export default function GovernanceHistoryPage() {
    const { address, isConnected } = useAccount()
    const [votingHistory, setVotingHistory] = useState<VoteRecord[]>([])
    const [proposalsCreated, setProposalsCreated] = useState<ProposalRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Get current voting power
    const { data: votingPower } = useReadContract({
        address: CONTRACTS.polineToken as `0x${string}`,
        abi: polineTokenABI,
        functionName: 'getVotes',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Get current stake
    const { data: userStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'getStake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Fetch voting history and created proposals
    useEffect(() => {
        async function fetchHistory() {
            if (!address) {
                setIsLoading(false)
                return
            }

            try {
                const votes: VoteRecord[] = []
                const created: ProposalRecord[] = []

                // Fetch all proposals (try up to 100)
                for (let i = 0; i < 100; i++) {
                    try {
                        const proposalId: any = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'allProposalIds',
                            args: [BigInt(i)],
                        })

                        const proposalData: any = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'getProposal',
                            args: [proposalId],
                        })

                        // Check if user voted
                        const hasVoted: any = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'hasVoted',
                            args: [proposalId, address],
                        })

                        if (hasVoted) {
                            // Get vote details
                            const voteData: any = await readContract(config, {
                                address: CONTRACTS.polineDAO as `0x${string}`,
                                abi: polineDAOABI,
                                functionName: 'votes',
                                args: [proposalId, address],
                            })

                            votes.push({
                                proposalId: proposalData.id,
                                description: proposalData.description,
                                vote: voteData[1] || voteData.support || 0, // support at index 1
                                voteWeight: voteData[2] || voteData.weight || BigInt(0), // weight at index 2
                                timestamp: proposalData.createdAt,
                                status: proposalData.status,
                            })
                        }

                        // Check if user created this proposal
                        if (proposalData.proposer.toLowerCase() === address.toLowerCase()) {
                            created.push({
                                id: proposalData.id,
                                description: proposalData.description,
                                status: proposalData.status,
                                forVotes: proposalData.forVotes,
                                againstVotes: proposalData.againstVotes,
                                createdAt: proposalData.createdAt,
                            })
                        }
                    } catch {
                        break // No more proposals
                    }
                }

                setVotingHistory(votes.reverse()) // Newest first
                setProposalsCreated(created.reverse())
            } catch (error) {
                console.error('Error fetching history:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchHistory()
    }, [address])

    if (!isConnected) {
        return (
            <div className="max-w-6xl space-y-6">
                <h1 className="text-3xl font-medium">Governance History</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Connect your wallet to view your governance history
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const totalProposals = proposalsCreated.length
    const totalVotes = votingHistory.length
    const participationRate = totalVotes > 0 ? ((totalVotes / (totalVotes + totalProposals)) * 100) : 0

    const voteBreakdown = {
        for: votingHistory.filter(v => v.vote === 1).length,
        against: votingHistory.filter(v => v.vote === 0).length,
        abstain: votingHistory.filter(v => v.vote === 2).length,
    }

    return (
        <div className="max-w-6xl space-y-8">
            <div>
                <h1 className="text-3xl font-medium tracking-tight">Governance History</h1>
                <p className="text-muted-foreground mt-1">
                    Your participation in Poline DAO governance
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border/60 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Voting Power
                            </CardTitle>
                            <Zap className="w-4 h-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {votingPower ? Number(formatEther(votingPower)).toFixed(0) : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">POLINE delegated</p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Votes Cast
                            </CardTitle>
                            <Vote className="w-4 h-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVotes}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {voteBreakdown.for}F / {voteBreakdown.against}A / {voteBreakdown.abstain}Ab
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Proposals Created
                            </CardTitle>
                            <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProposals}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {proposalsCreated.filter(p => p.status === 6).length} executed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Participation
                            </CardTitle>
                            <TrendingUp className="w-4 h-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{participationRate.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Engagement rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Voting History */}
            <Card className="border-border shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg">Voting History</CardTitle>
                    <CardDescription>
                        All votes you've cast on proposals
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading voting history...
                        </div>
                    ) : votingHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            You haven't voted on any proposals yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {votingHistory.map((vote) => (
                                <Link
                                    key={vote.proposalId}
                                    href={`/proposals/${vote.proposalId}`}
                                    className="block group"
                                >
                                    <div className="flex items-start gap-4 p-4 border border-border hover:bg-muted/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge
                                                    variant={
                                                        vote.vote === 1
                                                            ? 'default'
                                                            : vote.vote === 0
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                    className="text-[10px] uppercase font-mono"
                                                >
                                                    {vote.vote === 1 ? 'FOR' : vote.vote === 0 ? 'AGAINST' : 'ABSTAIN'}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                                    {PROPOSAL_STATUS[vote.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                                {vote.description}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>
                                                    Weight: {Number(formatEther(vote.voteWeight)).toFixed(2)} POLINE
                                                </span>
                                                <span>
                                                    {new Date(Number(vote.timestamp) * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Proposals Created */}
            <Card className="border-border shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg">Proposals Created</CardTitle>
                    <CardDescription>
                        Proposals you've submitted to the DAO
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading proposals...
                        </div>
                    ) : proposalsCreated.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            You haven't created any proposals yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {proposalsCreated.map((proposal) => {
                                const total = Number(formatEther(proposal.forVotes + proposal.againstVotes))
                                const forVotes = Number(formatEther(proposal.forVotes))
                                const forPercent = total > 0 ? (forVotes / total) * 100 : 0

                                return (
                                    <Link
                                        key={proposal.id}
                                        href={`/proposals/${proposal.id}`}
                                        className="block group"
                                    >
                                        <div className="flex items-start gap-4 p-4 border border-border hover:bg-muted/30 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                                        {PROPOSAL_STATUS[proposal.status]}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                                    {proposal.description}
                                                </p>
                                                <div className="mt-3 space-y-1">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>For: {forPercent.toFixed(1)}%</span>
                                                        <span>{total.toFixed(0)} votes</span>
                                                    </div>
                                                    <div className="h-1.5 bg-secondary overflow-hidden">
                                                        <div
                                                            style={{ width: `${forPercent}%` }}
                                                            className="h-full bg-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
