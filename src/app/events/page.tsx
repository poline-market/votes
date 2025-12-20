'use client'

import { useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CONTRACTS, oracleVotingABI } from '@/lib/contracts'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { formatEther } from 'viem'

// Helper to format date
const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
}

// Helper to get status string
const getStatus = (status: number) => {
    const statuses = ['PENDING', 'ACTIVE', 'RESOLVED', 'DISPUTED']
    return statuses[status] || 'UNKNOWN'
}

function EventTicker({ id, title, yesVotes, noVotes, status, endDate }: any) {
    const total = Number(formatEther(yesVotes + noVotes))
    const yesVal = Number(formatEther(yesVotes))
    // const noVal = Number(formatEther(noVotes))
    const yesPercent = total > 0 ? (yesVal / total) * 100 : 0

    return (
        <Link href={`/events/${id}`} className="block group h-full bg-card hover:bg-muted/30 transition-colors relative">
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg leading-tight tracking-tight group-hover:text-primary transition-colors pr-4 line-clamp-2">
                            {title}
                        </h3>
                        <span className="label-tech text-[10px] whitespace-nowrap border border-border px-1.5 py-0.5 rounded-sm h-fit">
                            {getStatus(status)}
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
                        <span className="font-mono text-xs">{total.toFixed(0)} POLINE</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="label-tech text-[10px] text-muted-foreground">DEADLINE</span>
                        <span className="font-mono text-xs">{formatDate(endDate)}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                console.log('🔍 Starting event fetch...')
                console.log('📍 OracleVoting address:', CONTRACTS.oracleVoting)

                const count = await readContract(config, {
                    address: CONTRACTS.oracleVoting as `0x${string}`,
                    abi: oracleVotingABI,
                    functionName: 'getEventCount',
                })

                console.log('📊 Event count:', count)

                if (!count || count === BigInt(0)) {
                    console.warn('⚠️ No events found')
                    setEvents([])
                    setIsLoading(false)
                    return
                }

                const eventPromises = []
                for (let i = Number(count) - 1; i >= 0; i--) {
                    console.log(`🔄 Fetching event ${i}...`)
                    eventPromises.push((async () => {
                        const id = await readContract(config, {
                            address: CONTRACTS.oracleVoting as `0x${string}`,
                            abi: oracleVotingABI,
                            functionName: 'allEventIds',
                            args: [BigInt(i)],
                        })
                        console.log(`  Event ${i} ID:`, id)

                        const data: any = await readContract(config, {
                            address: CONTRACTS.oracleVoting as `0x${string}`,
                            abi: oracleVotingABI,
                            functionName: 'getEvent',
                            args: [id],
                        })

                        console.log(`  Event ${i} data:`, {
                            description: data.description,
                            status: data.status,
                            yesVotes: data.yesVotes?.toString(),
                            noVotes: data.noVotes?.toString()
                        })

                        return {
                            id: data.id,
                            description: data.description,
                            createdAt: data.createdAt,
                            votingDeadline: data.votingDeadline,
                            yesVotes: data.yesVotes,
                            noVotes: data.noVotes,
                            status: data.status,
                            outcome: data.outcome,
                            creator: data.creator,
                        }
                    })())
                }

                const fetchedEvents = await Promise.all(eventPromises)
                console.log('✅ All events fetched:', fetchedEvents.length)
                setEvents(fetchedEvents)
            } catch (error) {
                console.error('❌ Error fetching events:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvents()
    }, [])

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
                {events.map((event: any) => (
                    <EventTicker
                        key={event.id}
                        id={event.id}
                        title={event.description}
                        yesVotes={event.yesVotes}
                        noVotes={event.noVotes}
                        status={event.status}
                        endDate={event.votingDeadline}
                    />
                ))}

                {(!isLoading && events.length === 0) && (
                    <div className="col-span-full bg-card p-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <p className="font-mono text-sm text-muted-foreground">NO ACTIVE MARKETS FOUND IN REGISTRY</p>
                    </div>
                )}
            </div>
        </div>
    )
}
