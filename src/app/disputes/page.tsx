'use client'

import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { CONTRACTS, disputeResolutionABI, oracleVotingABI } from '@/lib/contracts'
import Link from 'next/link'
import { AlertTriangle, Scale } from 'lucide-react'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'

// Helper to format date
const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('pt-BR')
}

// Helper to get status
const getStatus = (status: number) => {
    const statuses = ['PENDING', 'VOTING', 'RESOLVED', 'CANCELLED']
    return statuses[status] || 'UNKNOWN'
}

function DisputeCard({ id, eventDescription, overturnVotes, upholdVotes, status, deadline, escalationLevel }: any) {
    const total = Number(formatEther(overturnVotes + upholdVotes))
    const overturnVal = Number(formatEther(overturnVotes))
    const overturnPercent = total > 0 ? (overturnVal / total) * 100 : 0

    return (
        <Link href={`/disputes/${id}`} className="block group h-full bg-card hover:bg-muted/30 transition-colors relative">
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-base leading-tight tracking-tight group-hover:text-primary transition-colors pr-4 line-clamp-2">
                                    {eventDescription}
                                </h3>
                                <span className="label-tech text-[10px] whitespace-nowrap border border-border px-1.5 py-0.5 rounded-sm h-fit">
                                    {getStatus(status)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Level {escalationLevel}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-1 h-1.5 bg-secondary rounded-none overflow-hidden flex">
                            <div
                                style={{ width: `${overturnPercent}%` }}
                                className="bg-yellow-500 transition-all duration-500"
                            />
                        </div>
                        <span className="font-mono text-sm font-medium tracking-tight">
                            {overturnPercent.toFixed(0)}%
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Scale className="w-3.5 h-3.5" />
                        <span>{total.toFixed(0)} POLINE</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="label-tech text-[10px] text-muted-foreground">DEADLINE</span>
                        <span className="font-mono text-xs">{formatDate(deadline)}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDisputes = async () => {
            try {
                console.log('🔍 Fetching disputes...')

                const count = await readContract(config, {
                    address: CONTRACTS.disputeResolution as `0x${string}`,
                    abi: disputeResolutionABI,
                    functionName: 'disputeCount',
                })

                console.log('📊 Dispute count:', count)

                if (!count || count === BigInt(0)) {
                    console.warn('⚠️ No disputes found')
                    setDisputes([])
                    setIsLoading(false)
                    return
                }

                const disputePromises = []
                for (let i = Number(count) - 1; i >= 0; i--) {
                    console.log(`🔄 Fetching dispute ${i}...`)
                    disputePromises.push((async () => {
                        // Get dispute by index
                        const disputeId: any = await readContract(config, {
                            address: CONTRACTS.disputeResolution as `0x${string}`,
                            abi: disputeResolutionABI,
                            functionName: 'allDisputeIds',
                            args: [BigInt(i)],
                        })

                        // Get full dispute data
                        const disputeData: any = await readContract(config, {
                            address: CONTRACTS.disputeResolution as `0x${string}`,
                            abi: disputeResolutionABI,
                            functionName: 'getDispute',
                            args: [disputeId],
                        })

                        // Get event data
                        const eventData: any = await readContract(config, {
                            address: CONTRACTS.oracleVoting as `0x${string}`,
                            abi: oracleVotingABI,
                            functionName: 'getEvent',
                            args: [disputeData.eventId],
                        })

                        return {
                            id: disputeData.id,
                            eventId: disputeData.eventId,
                            eventDescription: eventData.description,
                            challenger: disputeData.challenger,
                            createdAt: disputeData.createdAt,
                            deadline: disputeData.deadline,
                            escalationLevel: disputeData.escalationLevel,
                            overturnVotes: disputeData.overturnVotes,
                            upholdVotes: disputeData.upholdVotes,
                            status: disputeData.status,
                            resolved: disputeData.resolved,
                        }
                    })())
                }

                const fetchedDisputes = await Promise.all(disputePromises)
                console.log('✅ All disputes fetched:', fetchedDisputes.length)
                setDisputes(fetchedDisputes)
            } catch (error) {
                console.error('❌ Error fetching disputes:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDisputes()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-medium tracking-tighter">Disputes</h1>
                    <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                        Contestações de resultados oracle em análise pela comunidade.
                    </p>
                </div>
            </div>

            <div className="bg-border p-px grid gap-px grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-border">
                {disputes.map((dispute: any) => (
                    <DisputeCard
                        key={dispute.id}
                        id={dispute.id}
                        eventDescription={dispute.eventDescription}
                        overturnVotes={dispute.overturnVotes}
                        upholdVotes={dispute.upholdVotes}
                        status={dispute.status}
                        deadline={dispute.deadline}
                        escalationLevel={Number(dispute.escalationLevel)}
                    />
                ))}

                {(!isLoading && disputes.length === 0) && (
                    <div className="col-span-full bg-card p-12 flex flex-col items-center justify-center text-center space-y-3">
                        <AlertTriangle className="w-12 h-12 text-muted-foreground/50" />
                        <div>
                            <h3 className="font-medium text-lg">Nenhum Dispute Ativo</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Disputes aparecem quando oráculos contestam resultados
                            </p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="col-span-full bg-card p-12 text-center">
                        <p className="text-muted-foreground">Carregando disputes...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
