'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { polygonAmoy } from 'wagmi/chains'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CONTRACTS, polinePurchaseABI, polineTokenABI } from '@/lib/contracts'
import { toast } from 'sonner'
import { ArrowRight, Wallet } from 'lucide-react'

export default function BuyPage() {
    const { address, isConnected, chain } = useAccount()
    const { switchChain } = useSwitchChain()
    const [polineAmount, setPolineAmount] = useState('100')
    const [polCost, setPolCost] = useState('0')

    // Check if on correct network
    const isWrongNetwork = chain && chain.id !== polygonAmoy.id

    // Read contract data with explicit chainId
    const { data: pricePerToken } = useReadContract({
        address: CONTRACTS.polinePurchase as `0x${string}`,
        abi: polinePurchaseABI,
        functionName: 'pricePerToken',
        chainId: polygonAmoy.id,
    })

    const { data: minimumPurchase } = useReadContract({
        address: CONTRACTS.polinePurchase as `0x${string}`,
        abi: polinePurchaseABI,
        functionName: 'minimumPurchase',
        chainId: polygonAmoy.id,
    })

    const { data: maximumPurchase } = useReadContract({
        address: CONTRACTS.polinePurchase as `0x${string}`,
        abi: polinePurchaseABI,
        functionName: 'maximumPurchase',
        chainId: polygonAmoy.id,
    })

    const { data: totalSold, refetch: refetchTotalSold } = useReadContract({
        address: CONTRACTS.polinePurchase as `0x${string}`,
        abi: polinePurchaseABI,
        functionName: 'totalSold',
        chainId: polygonAmoy.id,
    })

    const { data: userBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.polineToken as `0x${string}`,
        abi: polineTokenABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
        chainId: polygonAmoy.id,
    })

    // Calculate cost whenever amount changes
    useEffect(() => {
        if (polineAmount && pricePerToken) {
            try {
                const amount = parseEther(polineAmount)
                const cost = (amount * pricePerToken) / BigInt(10 ** 18)
                setPolCost(formatEther(cost))
            } catch {
                setPolCost('0')
            }
        } else {
            setPolCost('0')
        }
    }, [polineAmount, pricePerToken])

    // Write contract
    const { writeContract: buyTokens, data: txHash, isPending: isBuying } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    })

    // Refetch balance when transaction succeeds
    useEffect(() => {
        if (isSuccess) {
            // Wait 2 seconds then refetch
            setTimeout(() => {
                refetchBalance()
                refetchTotalSold()
            }, 2000)
            toast.success('Compra realizada! Atualizando saldo...')
            setPolineAmount('100')
        }
    }, [isSuccess, refetchBalance, refetchTotalSold])

    const handleBuy = () => {
        // Check network first
        if (isWrongNetwork) {
            switchChain({ chainId: polygonAmoy.id })
            return
        }

        if (!polineAmount || parseFloat(polineAmount) <= 0) {
            toast.error('Digite uma quantidade válida')
            return
        }

        const amount = parseEther(polineAmount)
        const cost = parseEther(polCost)

        buyTokens({
            address: CONTRACTS.polinePurchase as `0x${string}`,
            abi: polinePurchaseABI,
            functionName: 'buyTokens',
            args: [amount],
            value: cost,
        }, {
            onError: (error) => {
                toast.error('Erro na compra: ' + error.message)
            },
        })
    }

    if (!isConnected) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium tracking-tighter">Buy POLINE</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Compre tokens POLINE com POL (Polygon) para participar da DAO
                    </p>
                </div>
                <div className="border border-dashed border-border rounded-sm p-12 text-center bg-muted/5">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-mono text-sm text-muted-foreground">
                        Conecte sua carteira para comprar tokens
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium tracking-tighter">Buy POLINE</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Troque POL (Polygon) por tokens POLINE instantaneamente
                </p>
            </div>

            {/* Wrong Network Warning */}
            {isWrongNetwork && (
                <Card className="border-destructive/20 bg-destructive/5 shadow-none rounded-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-medium text-lg mb-2 tracking-tight text-destructive">Rede Incorreta</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Você está conectado à {chain?.name}. Por favor, troque para Polygon Amoy Testnet.
                                </p>
                                <Button
                                    onClick={() => switchChain({ chainId: polygonAmoy.id })}
                                    variant="destructive"
                                    className="rounded-sm font-mono uppercase text-xs tracking-wide"
                                >
                                    Trocar para Polygon Amoy
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {/* Stats Cards */}
                <Card className="border-border/60 shadow-none rounded-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium tracking-tight">Seu Saldo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="font-mono font-medium text-xl">
                            {userBalance ? Number(formatEther(userBalance)).toFixed(2) : '0'} <span className="text-sm text-muted-foreground">POLINE</span>
                        </span>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none rounded-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium tracking-tight">Preço Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="font-mono font-medium text-xl">
                            {pricePerToken ? Number(formatEther(pricePerToken)).toFixed(4) : '0.01'} <span className="text-sm text-muted-foreground">POL</span>
                        </span>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none rounded-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium tracking-tight">Total Vendido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="font-mono font-medium text-xl">
                            {totalSold ? Number(formatEther(totalSold)).toFixed(0) : '0'} <span className="text-sm text-muted-foreground">POLINE</span>
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Purchase Card */}
            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Comprar Tokens</CardTitle>
                    <CardDescription>
                        Mínimo: {minimumPurchase ? Number(formatEther(minimumPurchase)).toFixed(0) : '10'} POLINE
                        • Máximo: {maximumPurchase ? Number(formatEther(maximumPurchase)).toFixed(0) : '10000'} POLINE
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="poline-amount" className="label-tech">Quantidade POLINE</Label>
                            <Input
                                id="poline-amount"
                                type="number"
                                placeholder="100"
                                value={polineAmount}
                                onChange={(e) => setPolineAmount(e.target.value)}
                                className="font-mono text-lg h-12"
                            />
                        </div>

                        {/* Conversion Arrow */}
                        <div className="flex justify-center">
                            <div className="bg-muted rounded-full p-2">
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Cost Display */}
                        <div className="space-y-2">
                            <Label className="label-tech">Custo em POL</Label>
                            <div className="bg-muted rounded-sm p-4 border border-border">
                                <span className="font-mono text-2xl font-medium">
                                    {polCost} <span className="text-lg text-muted-foreground">POL</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buy Button */}
                    <Button
                        onClick={handleBuy}
                        disabled={isBuying || isConfirming || !polineAmount || isWrongNetwork}
                        className="w-full h-12 rounded-sm font-mono uppercase text-sm tracking-wide"
                        size="lg"
                    >
                        {isWrongNetwork ? 'Troque para Polygon Amoy' : isBuying || isConfirming ? 'Processando...' : `Comprar ${polineAmount} POLINE`}
                    </Button>

                    {/* Info Box */}
                    <div className="border-l-2 border-primary/20 pl-3 space-y-1">
                        <p className="text-xs text-muted-foreground font-mono">
                            ℹ️ Os tokens serão mintados diretamente para sua carteira
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                            ⚠️ POLINE é um token soulbound (não transferível)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Buy Options */}
            <Card className="border-border shadow-none rounded-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium tracking-tight">Compra Rápida</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['100', '500', '1000', '5000'].map((amount) => {
                            const cost = pricePerToken
                                ? formatEther((parseEther(amount) * pricePerToken) / BigInt(10 ** 18))
                                : '0'
                            return (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    onClick={() => setPolineAmount(amount)}
                                    className="h-auto py-3 flex flex-col items-start rounded-sm"
                                >
                                    <span className="font-mono font-bold text-lg">{amount}</span>
                                    <span className="text-xs text-muted-foreground">≈ {Number(cost).toFixed(3)} POL</span>
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
