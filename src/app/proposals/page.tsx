'use client'

import { useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { formatEther } from 'viem'

// Helper Enums
const PROPOSAL_TYPES = ['Market Rules', 'Trusted Sources', 'AMM Parameters', 'Fees', 'Dispute Policy', 'Circle Membership', 'Parameter Change', 'General', 'Budget Wallet', 'Budget Allocation']
const PROPOSAL_STATUS = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed']

// Componente "Proposal Row" - Tabular style
function ProposalRow({ id, title, type, status, forVotes, againstVotes }: any) {
    const total = Number(formatEther(forVotes + againstVotes))
    const forVal = Number(formatEther(forVotes))
    // const againstVal = Number(formatEther(againstVotes))
    const forPercent = total > 0 ? (forVal / total) * 100 : 0

    // Status color logic (simplified)
    const isActive = status === 1;

    return (
        <Link href={`/proposals/${id}`} className="block group">
            <div className="grid grid-cols-12 gap-4 items-center px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors">
                <div className="col-span-12 md:col-span-6 flex gap-3 items-center">
                    <span className="font-mono text-muted-foreground text-xs">#{id.substring(0, 6)}...</span>
                    <h3 className="font-medium group-hover:text-primary transition-colors truncate text-sm">
                        {title}
                    </h3>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <Badge variant="outline" className="rounded-sm font-mono text-[10px] uppercase font-normal text-muted-foreground">
                        {PROPOSAL_TYPES[type] || 'Unknown'}
                    </Badge>
                </div>

                <div className="col-span-6 md:col-span-2 text-right md:text-left">
                    <span className={`label-tech text-[10px] ${isActive ? 'text-emerald-500' : ''}`}>
                        {PROPOSAL_STATUS[status] || 'UNKNOWN'}
                    </span>
                </div>

                <div className="col-span-12 md:col-span-2 flex items-center gap-2 justify-end">
                    <div className="flex-1 h-1.5 bg-secondary rounded-sm max-w-[100px] flex justify-end overflow-hidden">
                        <div style={{ width: `${forPercent}%` }} className="bg-primary h-full" />
                    </div>
                    <span className="font-mono text-xs w-12 text-right">{forPercent.toFixed(0)}%</span>
                </div>
            </div>
        </Link>
    )
}

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    // Fetch proposals by trying indices until we get an error
    useEffect(() => {
        async function fetchProposals() {
            setIsLoading(true)
            console.log('Starting proposal fetch from:', CONTRACTS.polineDAO)
            try {
                const fetchedProposals: any[] = []

                // Try fetching proposals by index until we hit an error
                for (let i = 0; ; i++) {
                    try {
                        console.log(`Trying allProposalIds(${i})...`)
                        const proposalId = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'allProposalIds',
                            args: [BigInt(i)],
                        }) as `0x${string}`

                        console.log(`Fetched proposalId[${i}]:`, proposalId)

                        const proposalData = await readContract(config, {
                            address: CONTRACTS.polineDAO as `0x${string}`,
                            abi: polineDAOABI,
                            functionName: 'getProposal',
                            args: [proposalId],
                        }) as any

                        console.log(`Proposal[${i}] data:`, proposalData)

                        fetchedProposals.push({
                            id: proposalData.id,
                            proposer: proposalData.proposer,
                            circleId: proposalData.circleId,
                            propType: proposalData.propType,
                            description: proposalData.description,
                            callData: proposalData.callData,
                            target: proposalData.target,
                            createdAt: proposalData.createdAt,
                            votingStarts: proposalData.votingStarts,
                            votingEnds: proposalData.votingEnds,
                            forVotes: proposalData.forVotes,
                            againstVotes: proposalData.againstVotes,
                            abstainVotes: proposalData.abstainVotes,
                            status: proposalData.status,
                            executionTime: proposalData.executionTime,
                        })
                    } catch {
                        // Index doesn't exist, we've fetched all proposals
                        console.log(`Total proposals found: ${fetchedProposals.length}`)
                        break
                    }
                }

                setProposals(fetchedProposals.reverse()) // Newest first
            } catch (error) {
                console.error('Error fetching proposals:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProposals()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-medium tracking-tighter">Governance</h1>
                    <p className="text-muted-foreground text-sm mt-1 max-w-xl">
                        Protocol updates and circle elections.
                    </p>
                </div>
                <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5 rounded-sm h-9">
                    <Link href="/proposals/new" className="gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="label-tech text-primary">NEW PROPOSAL</span>
                    </Link>
                </Button>
            </div>

            <div className="border border-border bg-card">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-muted/20 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden md:grid items-center">
                    <div className="col-span-6 pl-2">Proposal</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right pr-2">Vote Consensus</div>
                </div>

                {/* Rows */}
                {proposals.map((prop: any) => (
                    <ProposalRow
                        key={prop.id}
                        id={prop.id}
                        title={prop.description}
                        type={prop.propType}
                        status={prop.status}
                        forVotes={prop.forVotes}
                        againstVotes={prop.againstVotes}
                    />
                ))}

                {(!isLoading && proposals.length === 0) && (
                    <div className="p-16 text-center text-muted-foreground font-mono text-xs uppercase tracking-widest">
                        No Proposals Found
                    </div>
                )}
            </div>
        </div>
    )
}
