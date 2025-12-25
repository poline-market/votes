'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, stakingManagerABI, polineTokenABI } from '@/lib/contracts'
import { toast } from 'sonner'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

export default function StakingPage() {
    const { address, isConnected } = useAccount()
    const [amount, setAmount] = useState('')
    const [delegateTarget, setDelegateTarget] = useState('')

    // Read token balance
    const { data: tokenBalance } = useReadContract({
        address: CONTRACTS.polineToken as `0x${string}`,
        abi: polineTokenABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Read user stake info
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

    // Check voting power
    const { data: votingPower, refetch: refetchVotes } = useReadContract({
        address: CONTRACTS.polineToken as `0x${string}`,
        abi: polineTokenABI,
        functionName: 'getVotes',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    // Write contracts
    const { writeContract: stake, data: stakeHash, isPending: isStaking } = useWriteContract()
    const { writeContract: requestUnstake, isPending: isRequesting } = useWriteContract()
    const { writeContract: completeUnstake, isPending: isCompleting } = useWriteContract()
    const { writeContract: delegateVotes, isPending: isDelegating } = useWriteContract()

    // Get current delegate
    const { data: currentDelegate } = useReadContract({
        address: CONTRACTS.polineToken as `0x${string}`,
        abi: polineTokenABI,
        functionName: 'delegates',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: stakeHash,
    })

    // Refetch after successful stake
    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                refetchStake()
            }, 2000)
            toast.success('Stake realizado! Atualizando...')
            setAmount('')
        }
    }, [isSuccess, refetchStake])

    const handleStake = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Digite um valor válido')
            return
        }

        // Validate user has sufficient token balance
        const stakeAmount = parseEther(amount)
        const currentStake = userStake ? BigInt(userStake) : BigInt(0)
        const totalRequired = currentStake + stakeAmount
        const balance = tokenBalance ? BigInt(tokenBalance) : BigInt(0)

        if (balance < totalRequired) {
            toast.error(`Saldo insuficiente. Você tem ${Number(formatEther(balance)).toFixed(2)} POLINE, mas precisa de ${Number(formatEther(totalRequired)).toFixed(2)} POLINE no total.`)
            return
        }

        stake({
            address: CONTRACTS.stakingManager as `0x${string}`,
            abi: stakingManagerABI,
            functionName: 'stake',
            args: [stakeAmount],
        }, {
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

    const handleDelegate = () => {
        if (!address) return
        delegateVotes({
            address: CONTRACTS.polineToken as `0x${string}`,
            abi: polineTokenABI,
            functionName: 'delegate',
            args: [address],
        }, {
            onSuccess: () => {
                toast.success('Voting power ativado!')
                setTimeout(() => refetchVotes(), 2000)
            },
            onError: (error) => {
                toast.error('Erro: ' + error.message)
            },
        })
    }

    const handleDelegateToOther = () => {
        if (!delegateTarget || !/^0x[a-fA-F0-9]{40}$/.test(delegateTarget)) {
            toast.error('Endereço inválido')
            return
        }
        delegateVotes({
            address: CONTRACTS.polineToken as `0x${string}`,
            abi: polineTokenABI,
            functionName: 'delegate',
            args: [delegateTarget as `0x${string}`],
        }, {
            onSuccess: () => {
                toast.success('Delegação realizada!')
                setDelegateTarget('')
                setTimeout(() => refetchVotes(), 2000)
            },
            onError: (error) => {
                toast.error('Erro: ' + error.message)
            },
        })
    }

    if (!isConnected) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium tracking-tighter">Staking</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Faça stake de tokens POLINE para se tornar um oráculo e participar da governança.
                    </p>
                </div>
                <div className="border border-dashed border-border rounded-sm p-12 text-center bg-muted/5">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-mono text-sm text-muted-foreground">
                        Conecte sua carteira para fazer stake
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium tracking-tighter">Staking</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Faça stake de tokens POLINE para se tornar um oráculo e participar da governança.
                </p>
            </div>

            {/* Zero Balance Banner */}
            {tokenBalance !== undefined && BigInt(tokenBalance) === BigInt(0) && (
                <Card className="border-primary/20 bg-primary/5 shadow-none rounded-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-medium text-lg mb-2 tracking-tight">Você não possui tokens POLINE</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Para fazer stake e se tornar um oráculo, você precisa primeiro adquirir tokens POLINE.
                                </p>
                                <Button asChild variant="default" className="rounded-sm font-mono uppercase text-xs tracking-wide">
                                    <Link href="/buy">
                                        Comprar POLINE com POL
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {/* Status Card - Enhanced */}
                <Card className={`border-border/60 shadow-none rounded-sm ${isOracle ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium tracking-tight">Status Oracle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isOracle ? (
                            <>
                                <Badge variant="default" className="rounded-sm font-mono uppercase text-xs">
                                    ✓ Oráculo Ativo
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Você pode votar em eventos e participar da governança
                                </p>
                            </>
                        ) : (
                            <>
                                <Badge variant="secondary" className="rounded-sm font-mono uppercase text-xs">
                                    ○ Inativo
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Stake mínimo: {minimumStake ? Number(formatEther(minimumStake)).toFixed(0) : '100'} POLINE
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Stake Amount Card */}
                <Card className="border-border/60 shadow-none rounded-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium tracking-tight">Stake Ativo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="font-mono font-medium text-xl">
                            {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} <span className="text-sm text-muted-foreground">POLINE</span>
                        </span>
                        <p className="text-xs text-muted-foreground mt-2">
                            Registrado no contrato
                        </p>
                    </CardContent>
                </Card>

                {/* Balance Card */}
                <Card className="border-border/60 shadow-none rounded-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium tracking-tight">Na Carteira</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="font-mono font-medium text-xl">
                            {tokenBalance ? Number(formatEther(tokenBalance)).toFixed(2) : '0'} <span className="text-sm text-muted-foreground">POLINE</span>
                        </span>
                        <p className="text-xs text-muted-foreground mt-2">
                            Soulbound - não transferível
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Fazer Stake Card - Second position after stats */}
            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Fazer Stake</CardTitle>
                    <CardDescription>
                        Tokens soulbound permanecem na sua carteira. O contrato apenas registra seu compromisso.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Info Grid - Clearer Labels */}
                    <div className="bg-muted/50 rounded-sm p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tokens na Carteira:</span>
                            <span className="font-mono font-medium">
                                {tokenBalance ? Number(formatEther(tokenBalance)).toFixed(2) : '0'} POLINE
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Já em Stake:</span>
                            <span className="font-mono font-medium">
                                {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2">
                            <span className="text-muted-foreground">Cooldown Unstake:</span>
                            <span className="font-mono font-medium">
                                {unstakeCooldown ? Math.floor(Number(unstakeCooldown) / 86400) : '7'} dias
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="label-tech">Quantidade POLINE</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="font-mono text-lg h-12"
                        />
                    </div>

                    <Button
                        onClick={handleStake}
                        disabled={isStaking || isConfirming || !amount}
                        className="w-full h-12 rounded-sm font-mono uppercase text-sm tracking-wide"
                        size="lg"
                    >
                        {isStaking || isConfirming ? 'Processando...' : 'Fazer Stake'}
                    </Button>

                    <div className="border-l-2 border-primary/20 pl-3 space-y-1">
                        <p className="text-xs text-muted-foreground font-mono">
                            ℹ️ Tokens soulbound não são transferidos, apenas registrados
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                            ⚠️ Unstake requer período de cooldown de 7 dias
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Unstake Card - Only if has stake */}
            {userStake !== undefined && BigInt(userStake) > BigInt(0) && (
                <Card className="border-border shadow-none rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium tracking-tight">Unstake</CardTitle>
                        <CardDescription>
                            {canUnstake
                                ? 'Cooldown completo! Você pode finalizar o unstake agora.'
                                : 'Inicie o período de espera de 7 dias para unstake.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {canUnstake ? (
                            <>
                                <div className="bg-primary/10 border border-primary/20 rounded-sm p-3 text-sm">
                                    <p className="text-primary font-medium mb-1">✓ Cooldown Completo</p>
                                    <p className="text-muted-foreground text-xs">
                                        Você pode completar o unstake e liberar seus {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCompleteUnstake}
                                    disabled={isCompleting}
                                    variant="destructive"
                                    className="w-full rounded-sm font-mono uppercase text-sm"
                                >
                                    {isCompleting ? 'Processando...' : 'Completar Unstake'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="bg-muted/50 border border-border rounded-sm p-3 text-sm space-y-2">
                                    <p className="font-medium">Como funciona o unstake:</p>
                                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                                        <li>Clique "Solicitar Unstake" (inicia cooldown de 7 dias)</li>
                                        <li>Aguarde 7 dias</li>
                                        <li>Volte aqui e clique "Completar Unstake"</li>
                                    </ol>
                                </div>
                                <Button
                                    onClick={handleRequestUnstake}
                                    disabled={isRequesting}
                                    variant="outline"
                                    className="w-full rounded-sm font-mono uppercase text-sm"
                                >
                                    {isRequesting ? 'Processando...' : 'Solicitar Unstake'}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Voting Power Warning */}
            {tokenBalance !== undefined && BigInt(tokenBalance) > BigInt(0) && votingPower === BigInt(0) && (
                <Card className="border-yellow-500/20 bg-yellow-500/5 shadow-none rounded-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-medium text-lg mb-2 tracking-tight">⚡ Ativar Voting Power</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Você tem tokens mas não tem voting power. Clique abaixo para delegar seus tokens para você mesmo e poder criar propostas de governança.
                                </p>
                                <Button
                                    onClick={handleDelegate}
                                    disabled={isDelegating}
                                    variant="default"
                                    className="rounded-sm font-mono uppercase text-xs"
                                >
                                    {isDelegating ? 'Ativando...' : 'Ativar Voting Power'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Advanced Delegation Section */}
            <Card className="border-border shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Delegação Avançada</CardTitle>
                    <CardDescription>
                        Delegue seu voting power para outro endereço de confiança
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current Delegation */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Delegado Atual</Label>
                        <div className="p-3 bg-muted/50 border border-border font-mono text-sm break-all">
                            {currentDelegate ? (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Delegando para:</p>
                                    <p className="font-medium">
                                        {currentDelegate === address ? (
                                            <span className="text-primary">Você mesmo (Self-delegated)</span>
                                        ) : (
                                            currentDelegate
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Nenhuma delegação ativa</p>
                            )}
                        </div>
                    </div>

                    {/* Delegate to Someone Else */}
                    <div className="space-y-3">
                        <Label htmlFor="delegateTarget" className="text-sm font-medium">
                            Delegar para Outro Endereço
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="delegateTarget"
                                placeholder="0x..."
                                value={delegateTarget}
                                onChange={(e) => setDelegateTarget(e.target.value)}
                                className="font-mono text-sm"
                            />
                            <Button
                                onClick={handleDelegateToOther}
                                disabled={isDelegating || !delegateTarget}
                                className="font-mono uppercase text-xs whitespace-nowrap"
                            >
                                {isDelegating ? 'Delegando...' : 'Delegar'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cole o endereço Ethereum completo (0x...)
                        </p>
                    </div>

                    {/* Revoke Delegation (delegate back to self) */}
                    {currentDelegate && currentDelegate !== address && (
                        <div className="pt-3 border-t border-border">
                            <Button
                                onClick={handleDelegate}
                                disabled={isDelegating}
                                variant="outline"
                                className="w-full font-mono uppercase text-xs"
                            >
                                {isDelegating ? 'Revogando...' : 'Revogar Delegação (Delegar para Si)'}
                            </Button>
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-blue-500/5 border border-blue-500/20 p-3 text-xs space-y-1.5">
                        <p className="font-medium">📋 Como funciona:</p>
                        <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                            <li>Delegar = transferir seu voting power temporariamente</li>
                            <li>Você mantém os tokens, mas o delegado pode votar</li>
                            <li>Pode revogar a qualquer momento</li>
                            <li>Self-delegation = você mantém o voting power</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
