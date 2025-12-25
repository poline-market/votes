'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CONTRACTS, polineDAOABI, circleRegistryABI } from '@/lib/contracts'
import { toast } from 'sonner'
import { parseEther } from 'viem'
import { Wallet, DollarSign, ArrowRight } from 'lucide-react'

const BUDGET_TYPES = [
    { value: '0', label: 'Storage (IPFS/Filecoin)' },
    { value: '1', label: 'Accounts (Service Payments)' },
    { value: '2', label: 'Resellers (Commissions)' },
    { value: '3', label: 'Partners (Partnerships)' },
    { value: '4', label: 'Development (Grants)' },
    { value: '5', label: 'Marketing (Campaigns)' },
    { value: '6', label: 'Legal (Compliance)' },
    { value: '7', label: 'Infrastructure (Servers)' },
    { value: '8', label: 'Operations (General)' },
    { value: '9', label: 'Community (Programs)' },
]

export default function CreateBudgetProposal() {
    const { address, isConnected } = useAccount()
    const [proposalType, setProposalType] = useState<'create' | 'allocate'>('create')
    const [budgetType, setBudgetType] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [managerAddress, setManagerAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [governanceCircleId, setGovernanceCircleId] = useState<`0x${string}` | null>(null)
    const [minVotingPeriod, setMinVotingPeriod] = useState<bigint>(BigInt(259200)) // Default 3 days

    const { writeContract, isPending } = useWriteContract()

    // ABI for reading minVotingPeriod
    const minVotingPeriodABI = [{
        inputs: [],
        name: 'minVotingPeriod',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    }] as const

    // Fetch minVotingPeriod from PolineDAO contract on mount
    useEffect(() => {
        const fetchMinVotingPeriod = async () => {
            try {
                const period = await readContract(config, {
                    address: CONTRACTS.polineDAO as `0x${string}`,
                    abi: minVotingPeriodABI,
                    functionName: 'minVotingPeriod',
                }) as bigint

                setMinVotingPeriod(period)
                console.log('Fetched minVotingPeriod:', Number(period), 'seconds')
            } catch (error) {
                console.error('Error fetching minVotingPeriod:', error)
            }
        }

        fetchMinVotingPeriod()
    }, [])

    // Fetch Governance circle ID on mount
    useEffect(() => {
        const fetchGovernanceCircle = async () => {
            try {
                const circleIds = await readContract(config, {
                    address: CONTRACTS.circleRegistry as `0x${string}`,
                    abi: circleRegistryABI,
                    functionName: 'getAllCircles',
                }) as `0x${string}`[]

                // Find Governance circle (proposalScope = 2)
                // circles() returns tuple: [id, name, proposalScope, requiredStake, active, createdAt]
                for (const id of circleIds) {
                    const circleData = await readContract(config, {
                        address: CONTRACTS.circleRegistry as `0x${string}`,
                        abi: circleRegistryABI,
                        functionName: 'circles',
                        args: [id],
                    }) as readonly [string, string, bigint, bigint, boolean, bigint]

                    const proposalScope = circleData[2] // Index 2 is proposalScope

                    if (proposalScope === BigInt(2)) { // SCOPE_GOVERNANCE = 2
                        setGovernanceCircleId(id)
                        console.log('Found Governance Circle:', id, 'with scope:', Number(proposalScope))
                        return
                    }
                }

                // Fallback: use first circle if no governance found
                if (circleIds.length > 0) {
                    setGovernanceCircleId(circleIds[0])
                    console.log('Using first circle as fallback:', circleIds[0])
                }
            } catch (error) {
                console.error('Error fetching governance circle:', error)
            }
        }

        fetchGovernanceCircle()
    }, [])

    const handleSubmit = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet')
            return
        }

        try {
            let calldata: `0x${string}`
            const treasuryManagerAddress = CONTRACTS.treasuryManager as `0x${string}`

            if (proposalType === 'create') {
                if (!walletAddress || !managerAddress) {
                    toast.error('Please fill all fields')
                    return
                }

                // Validate addresses
                if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                    toast.error('Invalid wallet address')
                    return
                }
                if (!managerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                    toast.error('Invalid manager address')
                    return
                }

                // Encode setBudgetWallet call
                const { encodeFunctionData } = await import('viem')
                const { treasuryManagerABI } = await import('@/lib/contracts-treasury')

                calldata = encodeFunctionData({
                    abi: treasuryManagerABI,
                    functionName: 'setBudgetWallet',
                    args: [parseInt(budgetType), walletAddress as `0x${string}`, managerAddress as `0x${string}`]
                })

                toast.info('Creating budget wallet proposal...')
            } else {
                if (!amount || parseFloat(amount) <= 0) {
                    toast.error('Please enter a valid amount')
                    return
                }

                // Encode proposeAllocation call
                const { encodeFunctionData } = await import('viem')
                const { treasuryManagerABI } = await import('@/lib/contracts-treasury')
                const amountWei = parseEther(amount)

                calldata = encodeFunctionData({
                    abi: treasuryManagerABI,
                    functionName: 'proposeAllocation',
                    args: [parseInt(budgetType), amountWei]
                })

                toast.info('Creating budget allocation proposal...')
            }

            // Submit proposal to DAO
            // ABI: propose(circleId, propType, description, target, callData, votingPeriod)
            if (!governanceCircleId) {
                toast.error('Governance circle not found. Please try again.')
                return
            }

            // Use minVotingPeriod fetched from PolineDAO contract
            const VOTING_PERIOD = minVotingPeriod
            // IMPORTANT: PolineDAO.ProposalType enum only has values 0-6!
            // Using 8 or 9 causes silent revert. Use 6 (ParameterChange) for budget proposals.
            const proposalTypeNum = 6 // ParameterChange - valid for budget operations

            writeContract({
                address: CONTRACTS.polineDAO as `0x${string}`,
                abi: polineDAOABI,
                functionName: 'propose',
                args: [
                    governanceCircleId, // circleId (bytes32) from CircleRegistry
                    proposalTypeNum, // propType (uint8)
                    description, // description (string)
                    treasuryManagerAddress, // target (address)
                    calldata, // callData (bytes)
                    VOTING_PERIOD // votingPeriod (uint256)
                ]
            }, {
                onSuccess: () => {
                    toast.success('Proposal created successfully!')
                    // Reset form
                    setBudgetType('')
                    setWalletAddress('')
                    setManagerAddress('')
                    setAmount('')
                    setDescription('')
                },
                onError: (error) => {
                    console.error(error)
                    toast.error('Failed to create proposal')
                }
            })

        } catch (error) {
            console.error(error)
            toast.error('Failed to prepare proposal')
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create Budget Proposal</h1>
                <p className="text-muted-foreground">
                    Propose budget allocations for DAO treasury management
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Proposal Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant={proposalType === 'create' ? 'default' : 'outline'}
                            onClick={() => setProposalType('create')}
                            className="h-auto py-6 flex-col gap-2"
                        >
                            <Wallet className="w-6 h-6" />
                            <div className="text-center">
                                <div className="font-semibold">Create Budget Wallet</div>
                                <div className="text-xs text-muted-foreground">
                                    Set up new budget category
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant={proposalType === 'allocate' ? 'default' : 'outline'}
                            onClick={() => setProposalType('allocate')}
                            className="h-auto py-6 flex-col gap-2"
                        >
                            <DollarSign className="w-6 h-6" />
                            <div className="text-center">
                                <div className="font-semibold">Allocate Budget</div>
                                <div className="text-xs text-muted-foreground">
                                    Transfer funds to budget
                                </div>
                            </div>
                        </Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div>
                            <Label>Budget Category</Label>
                            <Select value={budgetType} onValueChange={setBudgetType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select budget type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BUDGET_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {proposalType === 'create' ? (
                            <>
                                <div>
                                    <Label>Wallet Address</Label>
                                    <Input
                                        placeholder="0x..."
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Dedicated wallet for this budget (recommend Gnosis Safe multi-sig)
                                    </p>
                                </div>

                                <div>
                                    <Label>Manager Address</Label>
                                    <Input
                                        placeholder="0x..."
                                        value={managerAddress}
                                        onChange={(e) => setManagerAddress(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Who can manage spending from this budget
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <Label>Amount (POL)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Amount to transfer from DAO treasury to this budget wallet
                                </p>
                            </div>
                        )}

                        <div>
                            <Label>Proposal Description</Label>
                            <Textarea
                                placeholder="Explain the purpose and justification for this budget proposal..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ArrowRight className="w-4 h-4" />
                                Governance Process
                            </div>
                            <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                                <li>Your proposal will be submitted to governance</li>
                                <li>Community votes on the proposal</li>
                                <li>If approved, changes execute automatically</li>
                                <li>All budget allocations are transparent on-chain</li>
                            </ol>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !budgetType || !description}
                            className="w-full"
                            size="lg"
                        >
                            {isPending ? 'Creating Proposal...' : 'Submit Proposal to DAO'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
