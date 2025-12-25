'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Identicon from '@polkadot/react-identicon'
import { fetchUserNFTs, getNFTImageUrl, type NFTMetadata } from '@/lib/moralis'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { toast } from 'sonner'
import { Loader2, Image as ImageIcon, Sparkles, Trophy, Star, Zap } from 'lucide-react'

interface AvatarSelectorProps {
    address: string
    onClose: () => void
    onSave: () => void
}

export function AvatarSelector({ address, onClose, onSave }: AvatarSelectorProps) {
    const [nfts, setNfts] = useState<NFTMetadata[]>([])
    const [loading, setLoading] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)
    const [selectedTab, setSelectedTab] = useState('identicon')
    const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null)

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    // Only fetch NFTs when user clicks the NFT tab - saves CUs
    useEffect(() => {
        async function loadNFTs() {
            if (selectedTab !== 'nft' || hasFetched) return

            setLoading(true)
            try {
                const userNFTs = await fetchUserNFTs(address)
                setNfts(userNFTs)
                setHasFetched(true)
            } catch (err) {
                console.error('Error loading NFTs:', err)
            } finally {
                setLoading(false)
            }
        }
        loadNFTs()
    }, [address, selectedTab, hasFetched])

    useEffect(() => {
        if (isSuccess) {
            toast.success('🎉 Avatar atualizado com sucesso!')
            onSave()
        }
    }, [isSuccess, onSave])

    const handleSaveIdenticon = () => {
        writeContract({
            address: CONTRACTS.userProfile as `0x${string}`,
            abi: userProfileABI,
            functionName: 'setAvatar',
            args: ['', 0], // Empty URI, type 0 = identicon
        })
    }

    const handleSaveNFT = () => {
        if (!selectedNFT) {
            toast.error('Selecione um NFT primeiro')
            return
        }

        const imageUrl = getNFTImageUrl(selectedNFT)
        if (!imageUrl) {
            toast.error('NFT sem imagem válida')
            return
        }

        writeContract({
            address: CONTRACTS.userProfile as `0x${string}`,
            abi: userProfileABI,
            functionName: 'setAvatar',
            args: [imageUrl, 1], // NFT image URL, type 1 = NFT
        })
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-background border-border">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl">Escolha seu Avatar</DialogTitle>
                    <DialogDescription>
                        Personalize sua identidade e destaque-se na comunidade!
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="identicon" className="gap-2">
                            Identicon
                            <Badge variant="secondary" className="ml-1 text-xs">Padrão</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="nft" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20">
                            <ImageIcon className="h-4 w-4" />
                            NFTs
                            <Badge className="ml-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 border-0">Pro</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="identicon" className="mt-6">
                        <Card className="border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                            <CardContent className="flex flex-col items-center gap-4 py-8">
                                {/* Avatar with glow effect */}
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl opacity-30 animate-pulse" />
                                    <div className="relative rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-500 to-blue-500 bg-card p-1" style={{ width: 140, height: 140 }}>
                                        <div className="rounded-full overflow-hidden bg-muted flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
                                            <Identicon
                                                value={address}
                                                size={120}
                                                theme="ethereum"
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-1.5">
                                        <Star className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="font-medium">Identicon Único</p>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Gerado automaticamente a partir do seu endereço. Cada carteira tem um padrão exclusivo!
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                                    <Zap className="h-3 w-3 text-purple-500" />
                                    <span>Salvo on-chain na Polygon</span>
                                </div>

                                <Button
                                    onClick={handleSaveIdenticon}
                                    disabled={isPending || isConfirming}
                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                >
                                    {isPending || isConfirming ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Usar Identicon
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="nft" className="mt-6">
                        <Card className="border-2 border-dashed border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                            <CardContent className="py-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                                        <p className="text-sm text-muted-foreground">Buscando seus NFTs...</p>
                                    </div>
                                ) : nfts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium">Nenhum NFT encontrado</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            NFTs na rede Polygon/Amoy aparecerão aqui
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full mt-4 mx-auto w-fit">
                                            <Zap className="h-3 w-3 text-amber-500" />
                                            <span>Colete NFTs para desbloquear</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                                            {nfts.map((nft) => {
                                                const imageUrl = getNFTImageUrl(nft)
                                                if (!imageUrl) return null

                                                const isSelected = selectedNFT?.tokenId === nft.tokenId &&
                                                    selectedNFT?.tokenAddress === nft.tokenAddress

                                                return (
                                                    <button
                                                        key={`${nft.tokenAddress}-${nft.tokenId}`}
                                                        onClick={() => setSelectedNFT(nft)}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                            ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                                                            : 'border-muted hover:border-amber-500/50 hover:scale-102'
                                                            }`}
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={nft.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                                                <div className="bg-amber-500 rounded-full p-1">
                                                                    <Star className="h-4 w-4 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Button
                                                onClick={handleSaveNFT}
                                                disabled={isPending || isConfirming || !selectedNFT}
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                            >
                                                {isPending || isConfirming ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trophy className="h-4 w-4 mr-2" />
                                                        Usar NFT Selecionado
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
