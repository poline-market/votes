'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, oracleVotingABI } from '@/lib/contracts'
import Link from 'next/link'
import { Plus } from 'lucide-react'

// Componente "Market Ticker" para eventos
function EventTicker({ id, title, yesVotes, noVotes, status, endDate }: any) {
    const total = yesVotes + noVotes
    const yesPercent = total > 0 ? (yesVotes / total) * 100 : 0

    return (
        <Link href={`/events/${id}`} className="block group h-full bg-card hover:bg-muted/30 transition-colors relative">
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg leading-tight tracking-tight group-hover:text-primary transition-colors pr-4">
                            {title}
                        </h3>
                        <span className="label-tech text-[10px] whitespace-nowrap border border-border px-1.5 py-0.5 rounded-sm">
                            {status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-1 h-1.5 bg-secondary rounded-none overflow-hidden flex">
                            <div
                                style={{ width: `${yesPercent}%` }}
                                className="bg-primary transition-all duration-500"
                            />
                        </div>
                        <span className="font-mono text-xl font-medium tracking-tight">
                            {yesPercent.toFixed(0)}% <span className="text-xs text-muted-foreground ml-1">YES</span>
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-end border-t border-border pt-4">
                    <div className="flex flex-col">
                        <span className="label-tech text-[10px] text-muted-foreground">VOLUME</span>
                        <span className="font-mono text-xs">{total} POLINE</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="label-tech text-[10px] text-muted-foreground">ENDS</span>
                        <span className="font-mono text-xs">{endDate}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function EventsPage() {
    const { data: eventCount } = useReadContract({
        address: CONTRACTS.oracleVoting as `0x${string}`,
        abi: oracleVotingABI,
        functionName: 'eventCount',
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-medium tracking-tighter">Oracle Markets</h1>
                    <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                        Binary resolution markets powered by human oracles.
                    </p>
                </div>
                <Button asChild variant="outline" className="h-9 px-4 rounded-sm border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">
                    <Link href="/events/new" className="gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        <span className="label-tech text-primary tracking-wide">CREATE EVENT</span>
                    </Link>
                </Button>
            </div>

            <div className="bg-border p-px grid gap-px grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-border">
                {/* Placeholder data simulating tickers */}
                <EventTicker
                    id="1"
                    title="Bitcoin > $100k by EOY 2024?"
                    yesVotes={750}
                    noVotes={250}
                    status="ACTIVE"
                    endDate="31 DEC 2024"
                />
                <EventTicker
                    id="2"
                    title="Will SpaceX launch Starship in March?"
                    yesVotes={300}
                    noVotes={700}
                    status="ACTIVE"
                    endDate="31 MAR 2024"
                />
                {/* Adicionar mais items reais aqui quando integrados */}

                {(!eventCount || Number(eventCount) === 0) && (
                    <div className="col-span-full bg-card p-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                            {/* Icon placeholder since we don't import FileText here yet */}
                            <span className="text-2xl">⚡</span>
                        </div>
                        <p className="font-mono text-sm text-muted-foreground">NO ACTIVE MARKETS FOUND IN REGISTRY</p>
                    </div>
                )}
            </div>
        </div>
    )
}
