'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, stakingManagerABI } from '@/lib/contracts'
import { toast } from 'sonner'

export default function StakingPage() {
    const { address, isConnected } = useAccount()
    const [amount, setAmount] = useState('')

    const { data: userStake, refetch: refetchStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'getStake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { data: isOracle } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'isOracle',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { data: canUnstake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'canUnstake',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { data: minimumStake } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'minimumStake',
    })

    const { data: unstakeCooldown } = useReadContract({
        address: CONTRACTS.stakingManager as `0x${string}`,
        abi: stakingManagerABI,
        functionName: 'unstakeCooldown',
    })

    const { writeContract: stake, data: stakeHash, isPending: isStaking } = useWriteContract()
    const { writeContract: requestUnstake, data: requestHash, isPending: isRequesting } = useWriteContract()
    const { writeContract: completeUnstake, data: completeHash, isPending: isCompleting } = useWriteContract()
    const { writeContract: cancelUnstake, isPending: isCanceling } = useWriteContract()

    const { isLoading: isStakeConfirming } = useWaitForTransactionReceipt({
        hash: stakeHash,
    })

    const handleStake = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Digite um valor válido')
            return
        }
        stake({
            address: CONTRACTS.stakingManager as `0x${string}`,
            abi: stakingManagerABI,
            functionName: 'stake',
            args: [parseEther(amount)],
        }, {
            onSuccess: () => {
                toast.success('Stake realizado com sucesso!')
                setAmount('')
                refetchStake()
            },
            onError: (error) => {
                toast.error('Erro ao fazer stake: ' + error.message)
            },
        })
    }

    const handleRequestUnstake = () => {
        requestUnstake({
            address: CONTRACTS.stakingManager as `0x${string}`,
            abi: stakingManagerABI,
            functionName: 'requestUnstake',
        }, {
            onSuccess: () => {
                toast.success('Unstake solicitado! Aguarde o cooldown.')
                refetchStake()
            },
            onError: (error) => {
                toast.error('Erro: ' + error.message)
            },
        })
    }

    const handleCompleteUnstake = () => {
        completeUnstake({
            address: CONTRACTS.stakingManager as `0x${string}`,
            abi: stakingManagerABI,
            functionName: 'completeUnstake',
        }, {
            onSuccess: () => {
                toast.success('Unstake completado!')
                refetchStake()
            },
            onError: (error) => {
                toast.error('Erro: ' + error.message)
            },
        })
    }

    if (!isConnected) {
        return (
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">Staking</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Conecte sua carteira para fazer stake
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Staking</h1>
                <p className="text-muted-foreground mt-2">
                    Faça stake de tokens POLINE para se tornar um oráculo
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Status atual */}
                <Card>
                    <CardHeader>
                        <CardTitle>Seu Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={isOracle ? 'default' : 'secondary'}>
                                {isOracle ? 'Oráculo Ativo' : 'Não é Oráculo'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Seu Stake</span>
                            <span className="font-bold">
                                {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Mínimo para Oráculo</span>
                            <span>
                                {minimumStake ? Number(formatEther(minimumStake)).toFixed(0) : '100'} POLINE
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cooldown Unstake</span>
                            <span>
                                {unstakeCooldown ? Number(unstakeCooldown) / 86400 : '7'} dias
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Fazer Stake */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fazer Stake</CardTitle>
                        <CardDescription>
                            Stake tokens para ganhar poder de voto em eventos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Quantidade (POLINE)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleStake}
                            disabled={isStaking || isStakeConfirming}
                            className="w-full"
                        >
                            {isStaking || isStakeConfirming ? 'Processando...' : 'Fazer Stake'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Unstake */}
            {userStake && userStake > 0n && (
                <Card>
                    <CardHeader>
                        <CardTitle>Unstake</CardTitle>
                        <CardDescription>
                            Remova seu stake. Há um período de cooldown de {unstakeCooldown ? Number(unstakeCooldown) / 86400 : 7} dias.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            {!canUnstake ? (
                                <Button
                                    variant="outline"
                                    onClick={handleRequestUnstake}
                                    disabled={isRequesting}
                                >
                                    {isRequesting ? 'Processando...' : 'Solicitar Unstake'}
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={handleCompleteUnstake}
                                    disabled={isCompleting}
                                >
                                    {isCompleting ? 'Processando...' : 'Completar Unstake'}
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            ⚠️ Se você tem votes pendentes ou disputas ativas, aguarde antes de fazer unstake.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
