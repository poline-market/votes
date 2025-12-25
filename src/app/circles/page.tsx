'use client'

import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONTRACTS, circleRegistryABI, stakingManagerABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { CheckCircle, Lock, Users } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CirclesPage() {
    const { address, isConnected } = useAccount()
    const [circles, setCircles] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [memberships, setMemberships] = useState<Record<string, boolean>>({})

    // Get user stake
    const { data: userStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'getStake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Get all circle IDs
    const { data: circleIds } = useReadContract({
        address: CONTRACTS.circleRegistry as `0x${string}`,
        abi: circleRegistryABI,
        functionName: 'getAllCircles',
    })

    // Fetch circle details and membership status
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

                        // Check membership if user is connected
                        let isMember = false
                        if (address) {
                            isMember = await readContract(config, {
                                address: CONTRACTS.circleRegistry as `0x${string}`,
                                abi: circleRegistryABI,
                                functionName: 'isMember',
                                args: [id, address],
                            }) as boolean
                        }

                        return {
                            id: data[0],
                            name: data[1],
                            proposalScope: data[2],
                            requiredStake: data[3],
                            active: data[4],
                            createdAt: data[5],
                            isMember,
                        }
                    })
                )
                setCircles(details)

                // Build membership map
                const membershipMap: Record<string, boolean> = {}
                details.forEach(circle => {
                    membershipMap[circle.id] = circle.isMember
                })
                setMemberships(membershipMap)
            } catch (error) {
                console.error('Error fetching circles:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCircleDetails()
    }, [circleIds, address])

    const { writeContract: requestMembership, isPending: isRequesting } = useWriteContract()

    const handleJoinRequest = (circle: any) => {
        if (!isConnected) {
            toast.error('Connect your wallet first')
            return
        }

        const stake = userStake ? Number(formatEther(userStake)) : 0
        const required = Number(formatEther(circle.requiredStake))

        if (stake < required) {
            toast.error(`You need ${required} POLINE staked (you have ${stake.toFixed(2)})`)
            return
        }

        if (memberships[circle.id]) {
            toast.info('You are already a member of this circle')
            return
        }

        // Call joinCircle - no admin approval needed, just sufficient stake
        requestMembership({
            address: CONTRACTS.circleRegistry as `0x${string}`,
            abi: circleRegistryABI,
            functionName: 'joinCircle',
            args: [circle.id],
        }, {
            onSuccess: () => {
                toast.success(`Successfully joined ${circle.name}!`)
                // Refetch to update UI
                setTimeout(() => window.location.reload(), 2000)
            },
            onError: (error: any) => {
                // Check for specific error types
                if (error.message?.includes('InsufficientStake')) {
                    toast.error(`Insufficient stake to join this circle`)
                } else if (error.message?.includes('MemberAlreadyInCircle')) {
                    toast.info('You are already a member of this circle')
                } else {
                    toast.error(`Error joining circle: ${error.message}`)
                }
            },
        })
    }

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
                {circles.map((circle: any) => {
                    const stake = userStake ? Number(formatEther(userStake)) : 0
                    const required = Number(formatEther(circle.requiredStake))
                    const hasEnoughStake = stake >= required
                    const isMember = memberships[circle.id]

                    return (
                        <Card key={circle.id} className="border-border/60 shadow-none hover:border-primary/40 transition-all group rounded-sm bg-card">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
                                        {circle.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isMember && (
                                            <Badge variant="outline" className="text-[10px] uppercase font-mono text-primary border-primary/20 bg-primary/5">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Member
                                            </Badge>
                                        )}
                                        {circle.active ? (
                                            <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] uppercase font-mono text-muted-foreground">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="label-tech block">Stake Required</span>
                                        <span className={`font-mono font-medium ${!hasEnoughStake && isConnected ? 'text-yellow-500' : ''}`}>
                                            {formatEther(circle.requiredStake)} POLINE
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="label-tech block">Scope ID</span>
                                        <span className="font-mono font-medium text-muted-foreground">{circle.proposalScope.toString()}</span>
                                    </div>
                                </div>

                                {isConnected && (
                                    <div className="pt-2 border-t border-border">
                                        {isMember ? (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Circle Member
                                                </span>
                                                <Link href="/proposals" className="text-xs text-primary hover:underline font-mono">
                                                    VIEW PROPOSALS →
                                                </Link>
                                            </div>
                                        ) : !hasEnoughStake ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-yellow-500 text-sm">
                                                    <Lock className="w-4 h-4" />
                                                    <span>Need {required - stake} more POLINE</span>
                                                </div>
                                                <Button asChild size="sm" variant="outline" className="w-full rounded-sm">
                                                    <Link href="/staking">
                                                        Stake Tokens
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleJoinRequest(circle)}
                                                disabled={isRequesting}
                                                size="sm"
                                                className="w-full rounded-sm font-mono uppercase text-xs"
                                            >
                                                {isRequesting ? 'Requesting...' : 'Request Membership'}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {!isConnected && (
                                    <div className="pt-2 border-t border-border flex justify-between items-center">
                                        <span className="label-tech text-xs">JOIN REQUEST</span>
                                        <span className="text-xs text-muted-foreground font-mono">Connect Wallet</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}

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
