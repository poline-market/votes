'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CONTRACTS, polineDAOABI, circleRegistryABI, stakingManagerABI } from '@/lib/contracts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { zeroAddress, formatEther } from 'viem'
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi-config'
import { AlertCircle, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function NewProposalPage() {
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const [description, setDescription] = useState('')
    const [selectedCircleId, setSelectedCircleId] = useState<string>('')
    const [userCircles, setUserCircles] = useState<any[]>([])
    const [isLoadingCircles, setIsLoadingCircles] = useState(true)
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

    // Get user stake
    const { data: userStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'getStake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Get proposal threshold
    const { data: proposalThreshold } = useReadContract({
        address: CONTRACTS.polineDAO as `0x${string}`,
        abi: polineDAOABI,
        functionName: 'proposalThreshold',
    })

    // Fetch circles user is member of
    useEffect(() => {
        async function fetchUserCircles() {
            if (!address) {
                setIsLoadingCircles(false)
                return
            }

            try {
                const circleIds = await readContract(config, {
                    address: CONTRACTS.circleRegistry as `0x${string}`,
                    abi: circleRegistryABI,
                    functionName: 'getAllCircles',
                }) as `0x${string}`[]

                const userMemberCircles = await Promise.all(
                    circleIds.map(async (id) => {
                        const isMember = await readContract(config, {
                            address: CONTRACTS.circleRegistry as `0x${string}`,
                            abi: circleRegistryABI,
                            functionName: 'isMember',
                            args: [id, address],
                        }) as boolean

                        if (!isMember) return null

                        const circleData = await readContract(config, {
                            address: CONTRACTS.circleRegistry as `0x${string}`,
                            abi: circleRegistryABI,
                            functionName: 'circles',
                            args: [id],
                        }) as any

                        return {
                            id,
                            name: circleData[1] || id.substring(0, 10) + '...',
                            proposalScope: circleData[2],
                        }
                    })
                )

                const filtered = userMemberCircles.filter(c => c !== null)
                setUserCircles(filtered)
                if (filtered.length > 0) {
                    setSelectedCircleId(filtered[0].id)
                }
            } catch (error) {
                console.error('Error fetching circles:', error)
            } finally {
                setIsLoadingCircles(false)
            }
        }

        fetchUserCircles()
    }, [address])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!description.trim()) {
            toast.error('Digite uma descrição')
            return
        }

        if (!selectedCircleId) {
            toast.error('Selecione um círculo')
            return
        }

        const stake = userStake ? Number(formatEther(userStake)) : 0
        const threshold = proposalThreshold ? Number(formatEther(proposalThreshold)) : 100

        if (stake < threshold) {
            toast.error(`Você precisa de ${threshold} POLINE staked (você tem ${stake.toFixed(2)})`)
            return
        }

        console.log('Creating proposal with:', {
            circleId: selectedCircleId.substring(0, 10),
            propType: 0,
            description: description.substring(0, 30) + '...',
        })

        writeContract({
            address: CONTRACTS.polineDAO as `0x${string}`,
            abi: polineDAOABI,
            functionName: 'propose',
            args: [
                selectedCircleId as `0x${string}`,
                0, // Market Rules - sempre 0 para simplificar
                description,
                zeroAddress,
                '0x' as `0x${string}`,
                minVotingPeriod, // Uses contract's minVotingPeriod
            ],
        }, {
            onSuccess: () => {
                toast.success('Proposta criada!')
                setTimeout(() => router.push('/proposals'), 2000)
            },
            onError: (error: any) => {
                console.error('Full error:', error)
                if (error.message?.includes('NotCircleMember')) {
                    toast.error('Você não é membro deste círculo')
                } else if (error.message?.includes('CircleNotAuthorized')) {
                    toast.error('Este círculo não tem autoridade para propostas')
                } else if (error.message?.includes('InsufficientVotingPower')) {
                    toast.error('Stake insuficiente para criar propostas')
                } else {
                    toast.error('Erro: ' + (error.shortMessage || error.message))
                }
            },
        })
    }

    if (!isConnected) {
        return (
            <div className="max-w-2xl space-y-6">
                <h1 className="text-3xl font-medium">Nova Proposta</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Conecte sua carteira para criar propostas
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const stake = userStake ? Number(formatEther(userStake)) : 0
    const threshold = proposalThreshold ? Number(formatEther(proposalThreshold)) : 100
    const hasEnoughStake = stake >= threshold

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/proposals"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-medium tracking-tight">Nova Proposta</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Criar proposta de governança
                    </p>
                </div>
            </div>

            {!hasEnoughStake && (
                <div className="border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Stake Insuficiente</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Você precisa de {threshold} POLINE staked. Você tem {stake.toFixed(2)}.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                            <Link href="/staking">Stake Mais</Link>
                        </Button>
                    </div>
                </div>
            )}

            {userCircles.length === 0 && !isLoadingCircles && (
                <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Nenhum Círculo</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Você não é membro de nenhum círculo. Junte-se primeiro em /circles.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                            <Link href="/circles">Ver Círculos</Link>
                        </Button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Detalhes da Proposta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoadingCircles ? (
                            <p className="text-sm text-muted-foreground">Carregando círculos...</p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Seu Círculo</Label>
                                    <select
                                        value={selectedCircleId}
                                        onChange={(e) => setSelectedCircleId(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-sm bg-background"
                                        disabled={userCircles.length === 0}
                                        required
                                    >
                                        {userCircles.map((circle) => (
                                            <option key={circle.id} value={circle.id}>
                                                {circle.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        O círculo do qual você é membro
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descreva sua proposta de forma clara..."
                                        className="min-h-[120px]"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Explique o que você quer que o DAO faça
                                    </p>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-sm border border-border">
                                    <div className="flex gap-2">
                                        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">Informações</p>
                                            <p className="text-muted-foreground">• Período de votação: {Number(minVotingPeriod) < 60 ? `${minVotingPeriod} segundos` : Number(minVotingPeriod) < 3600 ? `${Math.floor(Number(minVotingPeriod) / 60)} minutos` : Number(minVotingPeriod) < 86400 ? `${Math.floor(Number(minVotingPeriod) / 3600)} horas` : `${Math.floor(Number(minVotingPeriod) / 86400)} dias`}</p>
                                            <p className="text-muted-foreground">• Seu stake: {stake.toFixed(2)} POLINE</p>
                                            <p className="text-muted-foreground">• Timelock: 1 dia após aprovação</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/proposals')}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isPending || !hasEnoughStake || userCircles.length === 0}
                                        className="flex-1"
                                    >
                                        {isPending ? 'Criando...' : 'Criar Proposta'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
