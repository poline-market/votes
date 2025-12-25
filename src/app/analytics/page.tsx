'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

const PROPOSAL_STATUS = ['Pending', 'Active', 'Cancelled', 'Defeated', 'Succeeded', 'Queued', 'Executed']
const PROPOSAL_TYPES = ['Market Rules', 'Trusted Sources', 'AMM Parameters', 'Fees', 'Dispute Policy', 'Circle Membership', 'Parameter Change', 'General', 'Budget Wallet', 'Budget Allocation']

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

interface ProposalData {
    id: string
    propType: number
    status: number
    forVotes: bigint
    againstVotes: bigint
    abstainVotes: bigint
    createdAt: bigint
}

export default function AnalyticsPage() {
    const [proposals, setProposals] = useState<ProposalData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchProposals() {
            try {
                const fetchedProposals: ProposalData[] = []

                // Fetch all proposals
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

                        fetchedProposals.push({
                            id: proposalData.id,
                            propType: proposalData.propType,
                            status: proposalData.status,
                            forVotes: proposalData.forVotes,
                            againstVotes: proposalData.againstVotes,
                            abstainVotes: proposalData.abstainVotes,
                            createdAt: proposalData.createdAt,
                        })
                    } catch {
                        break
                    }
                }

                setProposals(fetchedProposals)
            } catch (error) {
                console.error('Error fetching proposals:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProposals()
    }, [])

    // Calculate stats
    const totalProposals = proposals.length
    const activeProposals = proposals.filter(p => p.status === 1).length
    const executedProposals = proposals.filter(p => p.status === 6).length
    const succeededProposals = proposals.filter(p => p.status === 4).length

    // Status distribution
    const statusData = PROPOSAL_STATUS.map((status, index) => ({
        name: status,
        value: proposals.filter(p => p.status === index).length,
    })).filter(d => d.value > 0)

    // Proposal types distribution
    const typeData = PROPOSAL_TYPES.map((type, index) => ({
        name: type,
        count: proposals.filter(p => p.propType === index).length,
    })).filter(d => d.count > 0)

    // Participation over time (aggregate by week)
    const participationData = proposals
        .map(p => {
            const total = Number(formatEther(p.forVotes + p.againstVotes + p.abstainVotes))
            const week = new Date(Number(p.createdAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return { week, votes: total }
        })
        .slice(-10) // Last 10 proposals

    // Voting breakdown
    const totalForVotes = proposals.reduce((sum, p) => sum + Number(formatEther(p.forVotes)), 0)
    const totalAgainstVotes = proposals.reduce((sum, p) => sum + Number(formatEther(p.againstVotes)), 0)
    const totalAbstainVotes = proposals.reduce((sum, p) => sum + Number(formatEther(p.abstainVotes)), 0)

    const voteBreakdown = [
        { name: 'For', value: totalForVotes },
        { name: 'Against', value: totalAgainstVotes },
        { name: 'Abstain', value: totalAbstainVotes },
    ].filter(d => d.value > 0)

    return (
        <div className="max-w-7xl space-y-8">
            <div>
                <h1 className="text-3xl font-medium tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Insights sobre atividade de governança do DAO
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                    Carregando dados...
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="border-border/60 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Proposals
                                    </CardTitle>
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalProposals}</div>
                                <p className="text-xs text-muted-foreground mt-1">All time</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Active
                                    </CardTitle>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeProposals}</div>
                                <p className="text-xs text-muted-foreground mt-1">Currently voting</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Executed
                                    </CardTitle>
                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{executedProposals}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalProposals > 0 ? ((executedProposals / totalProposals) * 100).toFixed(0) : 0}% success rate
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Succeeded
                                    </CardTitle>
                                    <PieChartIcon className="w-4 h-4 text-yellow-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{succeededProposals}</div>
                                <p className="text-xs text-muted-foreground mt-1">Awaiting execution</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Status Distribution */}
                        <Card className="border-border shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg">Status Distribution</CardTitle>
                                <CardDescription>Proposals by current status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">No data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Proposal Types */}
                        <Card className="border-border shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg">Proposal Types</CardTitle>
                                <CardDescription>Distribution by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {typeData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={typeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">No data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vote Breakdown */}
                        <Card className="border-border shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg">Total Votes</CardTitle>
                                <CardDescription>Aggregate voting results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {voteBreakdown.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={voteBreakdown}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}`}
                                            >
                                                <Cell fill="#10b981" />
                                                <Cell fill="#ef4444" />
                                                <Cell fill="#6b7280" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">No votes cast yet</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Participation Trend */}
                        <Card className="border-border shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg">Participation Trend</CardTitle>
                                <CardDescription>Votes over recent proposals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {participationData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={participationData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="votes" stroke="#8b5cf6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">Not enough data</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
