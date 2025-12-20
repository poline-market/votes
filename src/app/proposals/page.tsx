'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

// Componente "Proposal Row" - Tabular style
function ProposalRow({ id, title, type, status, forVotes, againstVotes }: any) {
    return (
        <Link href={`/proposals/${id}`} className="block group">
            <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/30 transition-colors">
                <div className="col-span-12 md:col-span-6 flex gap-3 items-center">
                    <span className="font-mono text-muted-foreground text-xs">#{id}</span>
                    <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                        {title}
                    </h3>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <Badge variant="outline" className="rounded-sm font-mono text-[10px] uppercase font-normal">
                        {type}
                    </Badge>
                </div>

                <div className="col-span-6 md:col-span-2 text-right md:text-left">
                    <span className="label-tech text-[10px]">{status}</span>
                </div>

                <div className="col-span-12 md:col-span-2 flex items-center gap-2 justify-end">
                    <div className="flex-1 h-1.5 bg-secondary rounded-sm max-w-[100px] flex justify-end">
                        <div style={{ width: '60%' }} className="bg-primary h-full" />
                    </div>
                    <span className="font-mono text-xs">60% FOR</span>
                </div>
            </div>
        </Link>
    )
}

export default function ProposalsPage() {
    const { data: proposalCount } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: polineDAOABI,
        functionName: 'proposalCount',
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-4">
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
                <ProposalRow
                    id="104"
                    title="Implement Staking V2 parameters for Oracle Circle"
                    type="Protocol"
                    status="VOTING PERIOD"
                />
                <ProposalRow
                    id="103"
                    title="Add new dispute resolution moderator"
                    type="Governance"
                    status="EXECUTED"
                />

                {(!proposalCount || Number(proposalCount) === 0) && (
                    <div className="p-12 text-center text-muted-foreground font-mono text-sm">
                        NO PROPOSALS FOUND
                    </div>
                )}
            </div>
        </div>
    )
}
