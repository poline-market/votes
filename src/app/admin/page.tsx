'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, polineDAOABI } from '@/lib/contracts'
import { Settings, Clock, Users, Coins, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

// Extended ABI for admin functions
const adminABI = [
    ...polineDAOABI,
    {
        inputs: [
            { name: 'newMinPeriod', type: 'uint256' },
            { name: 'newQuorum', type: 'uint256' },
            { name: 'newThreshold', type: 'uint256' },
            { name: 'newTimelock', type: 'uint256' },
        ],
        name: 'updateParameters',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'minVotingPeriod',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'quorumPercentage',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'proposalThreshold',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'timelockDelay',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }],
        name: 'hasRole',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'queue',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'execute',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

export default function AdminPage() {
    const { address, isConnected } = useAccount()
    const { writeContract, isPending } = useWriteContract()
    const { writeContract: queueContract, isPending: isPendingQueue } = useWriteContract()
    const { writeContract: executeContract, isPending: isPendingExecute } = useWriteContract()

    // Form state
    const [minPeriod, setMinPeriod] = useState('')
    const [quorum, setQuorum] = useState('')
    const [threshold, setThreshold] = useState('')
    const [timelock, setTimelock] = useState('')
    const [proposalIdInput, setProposalIdInput] = useState('')

    // Check SDK_TOOLS env
    const sdkToolsEnabled = process.env.NEXT_PUBLIC_SDK_TOOLS === 'true'

    // Read current parameters
    const { data: currentMinPeriod } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: adminABI,
        functionName: 'minVotingPeriod',
    })

    const { data: currentQuorum } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: adminABI,
        functionName: 'quorumPercentage',
    })

    const { data: currentThreshold } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: adminABI,
        functionName: 'proposalThreshold',
    })

    const { data: currentTimelock } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: adminABI,
        functionName: 'timelockDelay',
    })

    const { data: isAdmin } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: adminABI,
        functionName: 'hasRole',
        args: address ? [DEFAULT_ADMIN_ROLE as `0x${string}`, address] : undefined,
        query: { enabled: !!address },
    })

    // Format time helper
    const formatTime = (seconds: bigint | undefined) => {
        if (!seconds) return 'Loading...'
        const s = Number(seconds)
        if (s < 60) return `${s} seconds`
        if (s < 3600) return `${Math.floor(s / 60)} minutes`
        if (s < 86400) return `${Math.floor(s / 3600)} hours`
        return `${Math.floor(s / 86400)} days`
    }

    const handleUpdateParameters = () => {
        if (!minPeriod || !quorum || !threshold || !timelock) {
            toast.error('Please fill all fields')
            return
        }

        writeContract({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: adminABI,
            functionName: 'updateParameters',
            args: [
                BigInt(minPeriod),
                BigInt(quorum),
                BigInt(threshold),
                BigInt(timelock),
            ],
        }, {
            onSuccess: () => {
                toast.success('Parameters updated successfully!')
            },
            onError: (error) => {
                console.error(error)
                toast.error('Failed to update parameters')
            },
        })
    }

    const setQuickVotingPeriod = (seconds: number) => {
        setMinPeriod(seconds.toString())
    }

    const handleQueueProposal = () => {
        if (!proposalIdInput) {
            toast.error('Enter a proposal ID')
            return
        }

        queueContract({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: adminABI,
            functionName: 'queue',
            args: [proposalIdInput as `0x${string}`],
        }, {
            onSuccess: () => {
                toast.success('Proposal queued successfully!')
                setProposalIdInput('')
            },
            onError: (error) => {
                console.error(error)
                toast.error('Failed to queue proposal')
            },
        })
    }

    const handleExecuteProposal = () => {
        if (!proposalIdInput) {
            toast.error('Enter a proposal ID')
            return
        }

        executeContract({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: adminABI,
            functionName: 'execute',
            args: [proposalIdInput as `0x${string}`],
        }, {
            onSuccess: () => {
                toast.success('Proposal executed successfully!')
                setProposalIdInput('')
            },
            onError: (error) => {
                console.error(error)
                toast.error('Failed to execute proposal')
            },
        })
    }

    // Show access denied if SDK_TOOLS is not enabled
    if (!sdkToolsEnabled) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Card className="border-destructive">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                            <div>
                                <CardTitle className="text-destructive">Access Denied</CardTitle>
                                <CardDescription>
                                    Admin tools are not enabled. Set SDK_TOOLS=true in your environment.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Connect Wallet</CardTitle>
                        <CardDescription>
                            Please connect your wallet to access admin tools.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Admin Tools</h1>
                    <Badge variant="outline" className="ml-2">SDK_TOOLS</Badge>
                </div>
                <p className="text-muted-foreground">
                    Manage DAO parameters and configuration. Only visible when SDK_TOOLS=true.
                </p>
            </div>

            {/* Admin Status */}
            <Card className={`mb-6 ${isAdmin ? 'border-green-500' : 'border-destructive'}`}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        {isAdmin ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        )}
                        <div>
                            <CardTitle className="text-lg">
                                {isAdmin ? 'Admin Access Granted' : 'Not Admin'}
                            </CardTitle>
                            <CardDescription>
                                {isAdmin
                                    ? 'You have DEFAULT_ADMIN_ROLE on PolineDAO'
                                    : 'Your wallet does not have admin privileges'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Current Parameters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Current DAO Parameters</CardTitle>
                    <CardDescription>Read from PolineDAO contract</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Min Voting Period</span>
                            </div>
                            <p className="text-xl font-bold">{formatTime(currentMinPeriod)}</p>
                            <p className="text-xs text-muted-foreground">{currentMinPeriod?.toString()} seconds</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Quorum</span>
                            </div>
                            <p className="text-xl font-bold">{currentQuorum ? Number(currentQuorum) / 100 : 0}%</p>
                            <p className="text-xs text-muted-foreground">{currentQuorum?.toString()} basis points</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Coins className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Proposal Threshold</span>
                            </div>
                            <p className="text-xl font-bold">{currentThreshold ? Number(currentThreshold) / 1e18 : 0} POL</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Timelock Delay</span>
                            </div>
                            <p className="text-xl font-bold">{formatTime(currentTimelock)}</p>
                            <p className="text-xs text-muted-foreground">{currentTimelock?.toString()} seconds</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Update Parameters Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Update DAO Parameters</CardTitle>
                    <CardDescription>
                        Modify the DAO governance parameters. Requires DEFAULT_ADMIN_ROLE.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                        <Label className="mb-2 block">Quick Set Voting Period</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(59)}>
                                1 minute
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(119)}>
                                2 minutes
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(179)}>
                                3 minutes
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(359)}>
                                6 minutes
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(539)}>
                                9 minutes
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(3600)}>
                                1 hour
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(86400)}>
                                1 day
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickVotingPeriod(259200)}>
                                3 days
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minPeriod">Min Voting Period (seconds)</Label>
                            <Input
                                id="minPeriod"
                                type="number"
                                placeholder={currentMinPeriod?.toString() || '259200'}
                                value={minPeriod}
                                onChange={(e) => setMinPeriod(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {minPeriod ? formatTime(BigInt(minPeriod)) : 'Enter seconds'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quorum">Quorum Percentage (basis points)</Label>
                            <Input
                                id="quorum"
                                type="number"
                                placeholder={currentQuorum?.toString() || '2000'}
                                value={quorum}
                                onChange={(e) => setQuorum(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {quorum ? `${Number(quorum) / 100}%` : 'e.g., 2000 = 20%'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="threshold">Proposal Threshold (wei)</Label>
                            <Input
                                id="threshold"
                                type="number"
                                placeholder={currentThreshold?.toString() || '100000000000000000000'}
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {threshold ? `${Number(threshold) / 1e18} POL` : 'e.g., 100e18 = 100 POL'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timelock">Timelock Delay (seconds)</Label>
                            <Input
                                id="timelock"
                                type="number"
                                placeholder={currentTimelock?.toString() || '86400'}
                                value={timelock}
                                onChange={(e) => setTimelock(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {timelock ? formatTime(BigInt(timelock)) : 'Enter seconds'}
                            </p>
                        </div>
                    </div>

                    {/* Pre-fill with current values button */}
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (currentMinPeriod) setMinPeriod(currentMinPeriod.toString())
                            if (currentQuorum) setQuorum(currentQuorum.toString())
                            if (currentThreshold) setThreshold(currentThreshold.toString())
                            if (currentTimelock) setTimelock(currentTimelock.toString())
                        }}
                    >
                        Load Current Values
                    </Button>

                    <Button
                        className="w-full"
                        onClick={handleUpdateParameters}
                        disabled={isPending || !isAdmin}
                    >
                        {isPending ? 'Updating...' : 'Update Parameters'}
                    </Button>

                    {!isAdmin && (
                        <p className="text-sm text-destructive text-center">
                            ⚠️ You need DEFAULT_ADMIN_ROLE to update parameters
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Manual Queue/Execute Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manual Proposal Queue/Execute</CardTitle>
                    <CardDescription>
                        Manually queue or execute proposals. Useful for testing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="proposalId">Proposal ID (bytes32)</Label>
                        <Input
                            id="proposalId"
                            placeholder="0x..."
                            value={proposalIdInput}
                            onChange={(e) => setProposalIdInput(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleQueueProposal()}
                            disabled={!proposalIdInput || isPendingQueue}
                        >
                            {isPendingQueue ? 'Queuing...' : '📋 Queue Proposal'}
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => handleExecuteProposal()}
                            disabled={!proposalIdInput || isPendingExecute}
                        >
                            {isPendingExecute ? 'Executing...' : '🚀 Execute Proposal'}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        ⚠️ Queue requires voting period to have ended. Execute requires EXECUTOR_ROLE and timelock to have passed.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
