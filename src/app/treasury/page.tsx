'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { readContract, getBalance } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONTRACTS } from '@/lib/contracts'
import { treasuryManagerABI } from '@/lib/contracts-treasury'
import { formatEther } from 'viem'
import { Wallet, TrendingUp, Users, DollarSign, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

const BUDGET_TYPES = [
    { id: 0, name: 'Storage', icon: '💾', color: 'bg-blue-500' },
    { id: 1, name: 'Accounts', icon: '👤', color: 'bg-green-500' },
    { id: 2, name: 'Resellers', icon: '🤝', color: 'bg-purple-500' },
    { id: 3, name: 'Partners', icon: '🔗', color: 'bg-pink-500' },
    { id: 4, name: 'Development', icon: '⚙️', color: 'bg-orange-500' },
    { id: 5, name: 'Marketing', icon: '📢', color: 'bg-red-500' },
    { id: 6, name: 'Legal', icon: '⚖️', color: 'bg-gray-500' },
    { id: 7, name: 'Infrastructure', icon: '🖥️', color: 'bg-cyan-500' },
    { id: 8, name: 'Operations', icon: '🔧', color: 'bg-yellow-500' },
    { id: 9, name: 'Community', icon: '🌍', color: 'bg-indigo-500' },
]

interface BudgetWalletData {
    walletAddress: string
    manager: string
    totalAllocated: bigint
    currentBalance: bigint
    active: boolean
}

function BudgetCard({ budgetType, data }: { budgetType: typeof BUDGET_TYPES[0], data: BudgetWalletData | null }) {
    const walletData = data || {
        walletAddress: '0x0000000000000000000000000000000000000000',
        manager: '0x0000000000000000000000000000000000000000',
        totalAllocated: 0n,
        currentBalance: 0n,
        active: false,
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${budgetType.color} flex items-center justify-center text-white text-xl`}>
                            {budgetType.icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{budgetType.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">Budget Wallet</p>
                        </div>
                    </div>
                    {walletData.active ? (
                        <Badge>Active</Badge>
                    ) : (
                        <Badge variant="secondary">Not Set</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {walletData.active ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Current Balance</p>
                                <p className="text-2xl font-bold">
                                    {Number(formatEther(walletData.currentBalance)).toLocaleString('en-US', { maximumFractionDigits: 4 })} POL
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Allocated</p>
                                <p className="text-xl font-semibold">
                                    {Number(formatEther(walletData.totalAllocated)).toLocaleString('en-US', { maximumFractionDigits: 4 })} POL
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Wallet:</span>
                                <code className="text-xs">{walletData.walletAddress.substring(0, 10)}...</code>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Manager:</span>
                                <code className="text-xs">{walletData.manager.substring(0, 10)}...</code>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                <a
                                    href={`https://amoy.polygonscan.com/address/${walletData.walletAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View on Polygonscan
                                </a>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            No budget wallet set for this category
                        </p>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/treasury/propose">
                                Create Proposal
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function TreasuryDashboard() {
    const [budgetData, setBudgetData] = useState<(BudgetWalletData | null)[]>(Array(10).fill(null))
    const [daoBalance, setDaoBalance] = useState<bigint>(0n)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTreasuryData() {
            setIsLoading(true)
            try {
                // Fetch DAO Treasury balance (TreasuryManager contract balance)
                const balance = await getBalance(config, {
                    address: CONTRACTS.treasuryManager as `0x${string}`,
                })
                setDaoBalance(balance.value)
                console.log('DAO Treasury Balance:', formatEther(balance.value), 'POL')

                // Fetch all budget wallet data
                const allBudgetData: (BudgetWalletData | null)[] = []
                for (let i = 0; i < 10; i++) {
                    try {
                        const result = await readContract(config, {
                            address: CONTRACTS.treasuryManager as `0x${string}`,
                            abi: treasuryManagerABI,
                            functionName: 'getBudgetWallet',
                            args: [i],
                        }) as readonly [string, string, bigint, bigint, boolean]

                        allBudgetData.push({
                            walletAddress: result[0],
                            manager: result[1],
                            totalAllocated: result[2],
                            currentBalance: result[3],
                            active: result[4],
                        })
                        console.log(`Budget[${i}]:`, allBudgetData[i])
                    } catch (err) {
                        console.error(`Error fetching budget ${i}:`, err)
                        allBudgetData.push(null)
                    }
                }
                setBudgetData(allBudgetData)
            } catch (error) {
                console.error('Error fetching treasury data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTreasuryData()
    }, [])

    const activeBudgets = budgetData.filter(b => b?.active).length
    const totalAllocated = budgetData.reduce((sum, b) => sum + (b?.totalAllocated || 0n), 0n)

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">DAO Treasury</h1>
                <p className="text-muted-foreground">
                    Transparent budget management with community governance
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">DAO Treasury</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatEther(daoBalance)} POL</div>
                        <p className="text-xs text-muted-foreground">TreasuryManager balance</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeBudgets}</div>
                        <p className="text-xs text-muted-foreground">Budget wallets configured</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatEther(totalAllocated)} POL</div>
                        <p className="text-xs text-muted-foreground">Across all budgets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <Button asChild>
                    <Link href="/treasury/propose">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Create Budget Proposal
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/proposals">
                        View All Proposals
                    </Link>
                </Button>
            </div>

            {/* Budget Wallets Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Budget Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BUDGET_TYPES.map((budgetType) => (
                        <BudgetCard key={budgetType.id} budgetType={budgetType} data={budgetData[budgetType.id]} />
                    ))}
                </div>
            </div>

            {/* Info Section */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>How Budget Management Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Community Controlled
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                All budget amounts and allocations are decided by DAO governance votes.
                                No values are hardcoded - the community has complete control.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Dedicated Wallets
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Each budget category has its own Ethereum wallet. Funds are transferred
                                from the DAO treasury to these wallets after governance approval.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Transparent
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                All wallet balances and transactions are publicly visible on Etherscan.
                                Complete transparency for community oversight.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Flexible
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Budget managers can spend allocated funds quickly without needing
                                individual governance votes for each payment.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
