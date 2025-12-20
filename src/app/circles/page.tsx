'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, circleRegistryABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'

export default function CirclesPage() {
    const [circles, setCircles] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // 1. Get all circle IDs
    const { data: circleIds } = useReadContract({
        address: CONTRACTS.circleRegistry as `0x${string}`,
        abi: circleRegistryABI,
        functionName: 'getAllCircles',
    })

    // 2. Fetch details for each circle
    useEffect(() => {
        async function fetchCircleDetails() {
            if (!circleIds || circleIds.length === 0) {
                setIsLoading(false)
                return
            }

            try {
                const details = await Promise.all(
                    circleIds.map(async (id) => {
                        const data: any = await readContract(config, {
                            address: CONTRACTS.circleRegistry as `0x${string}`,
                            abi: circleRegistryABI,
                            functionName: 'circles',
                            args: [id],
                        })
                        // Viem returns an array for structs
                        return {
                            id: data[0],
                            name: data[1],
                            proposalScope: data[2],
                            requiredStake: data[3],
                            active: data[4],
                            createdAt: data[5]
                        }
                    })
                )
                setCircles(details)
            } catch (error) {
                console.error('Error fetching circles:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCircleDetails()
    }, [circleIds])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium tracking-tighter">Holacracy Circles</h1>
                <p className="text-muted-foreground max-w-2xl">
                    The DAO is organized into specialized circles with distinct scopes and powers.
                    Each circle manages its own proposals and membership.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {circles.map((circle: any) => (
                    <Card key={circle.id} className="border-border/60 shadow-none hover:border-primary/40 transition-all group rounded-sm bg-card">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
                                    {circle.name}
                                </CardTitle>
                                {circle.active ? (
                                    <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Active</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] uppercase font-mono text-muted-foreground">Inactive</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="label-tech block">Stake Required</span>
                                    <span className="font-mono font-medium">{formatEther(circle.requiredStake)} POLINE</span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="label-tech block">Scope ID</span>
                                    <span className="font-mono font-medium text-muted-foreground">{circle.proposalScope.toString()}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border flex justify-between items-center">
                                <span className="label-tech text-xs">JOIN REQUEST</span>
                                <span className="text-xs text-muted-foreground font-mono">Via Governance</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!isLoading && circles.length === 0) && (
                    <div className="col-span-full py-16 text-center border border-dashed border-border rounded-sm bg-muted/5">
                        <p className="font-mono text-sm text-muted-foreground">NO CIRCLES FOUND IN REGISTRY</p>
                        <p className="text-xs text-muted-foreground mt-2">Initialize the DAO to create default circles.</p>
                    </div>
                )}
            </div>

            <div className="border border-border p-6 rounded-sm bg-card">
                <h3 className="text-lg font-medium mb-4">How to Participate</h3>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <div className="label-tech text-primary">STEP 01</div>
                        <h4 className="font-medium">Stake Tokens</h4>
                        <p className="text-sm text-muted-foreground">
                            You must stake the minimum amount required for the specific circle you wish to join.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="label-tech text-primary">STEP 02</div>
                        <h4 className="font-medium">Request Membership</h4>
                        <p className="text-sm text-muted-foreground">
                            Membership is granted via proposal or by existing circle admins. Submit your request for review.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="label-tech text-primary">STEP 03</div>
                        <h4 className="font-medium">Governance</h4>
                        <p className="text-sm text-muted-foreground">
                            Once a member, you can create proposals and vote on issues within the circle's scope.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
