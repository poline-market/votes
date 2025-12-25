'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/UserAvatar'
import { AvatarSelector } from '@/components/AvatarSelector'
import { User, AtSign, FileText, Link2, Eye } from 'lucide-react'
import { MarkdownBio } from '@/components/MarkdownBio'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { toast } from 'sonner'

export default function SettingsProfilePage() {
    const { address, isConnected } = useAccount()
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [socialLinks, setSocialLinks] = useState({
        twitter: '',
        telegram: '',
        discord: '',
        website: '',
    })
    const [showAvatarSelector, setShowAvatarSelector] = useState(false)
    const [showBioPreview, setShowBioPreview] = useState(false)

    const { data: profile, refetch } = useReadContract({
        address: CONTRACTS.userProfile as `0x${string}`,
        abi: userProfileABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    // Load profile data
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '')
            const existingBio = profile.bio || ''
            setBio(existingBio)
            // Show preview by default if bio already has content
            if (existingBio.length > 0) {
                setShowBioPreview(true)
            }
            try {
                const links = profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
                setSocialLinks({
                    twitter: links.twitter || '',
                    telegram: links.telegram || '',
                    discord: links.discord || '',
                    website: links.website || '',
                })
            } catch { }
        }
    }, [profile])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Perfil atualizado!')
            refetch()
        }
    }, [isSuccess, refetch])

    const handleSaveProfile = async () => {
        if (!isConnected || !address) {
            toast.error('Conecte sua carteira primeiro')
            return
        }

        // Validate displayName if not empty
        if (displayName.length > 0) {
            if (displayName.length < 3) {
                toast.error('Nome deve ter pelo menos 3 caracteres')
                return
            }
            if (displayName.length > 32) {
                toast.error('Nome deve ter no máximo 32 caracteres')
                return
            }
            // Validate characters (alphanumeric, underscore, dash only)
            const validPattern = /^[a-zA-Z0-9_-]+$/
            if (!validPattern.test(displayName)) {
                toast.error('Nome só pode conter letras, números, _ e -')
                return
            }
        }

        try {
            writeContract({
                address: CONTRACTS.userProfile as `0x${string}`,
                abi: userProfileABI,
                functionName: 'setNameAndBio',
                args: [displayName, bio],
            })
        } catch (err) {
            toast.error('Erro ao salvar perfil')
        }
    }

    const handleSaveSocialLinks = async () => {
        if (!isConnected || !address) {
            toast.error('Conecte sua carteira primeiro')
            return
        }

        try {
            writeContract({
                address: CONTRACTS.userProfile as `0x${string}`,
                abi: userProfileABI,
                functionName: 'setSocialLinks',
                args: [JSON.stringify(socialLinks)],
            })
        } catch (err) {
            toast.error('Erro ao salvar links sociais')
        }
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Conecte sua carteira para editar seu perfil</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Perfil</h2>
                <p className="text-muted-foreground">Personalize sua identidade na DAO</p>
            </div>

            {/* Avatar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Avatar
                    </CardTitle>
                    <CardDescription>Escolha entre um identicon ou um NFT</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <UserAvatar address={address!} size={80} />
                    <Button variant="outline" onClick={() => setShowAvatarSelector(true)}>
                        Alterar Avatar
                    </Button>
                </CardContent>
            </Card>

            {/* Display Name & Bio */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AtSign className="h-5 w-5" />
                        Nome e Bio
                    </CardTitle>
                    <CardDescription>Seu nome de exibição e biografia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nome de exibição</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Seu nome na DAO"
                            maxLength={32}
                        />
                        <p className="text-xs text-muted-foreground">
                            3-32 caracteres, apenas letras, números, _ e -
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="bio">Bio</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowBioPreview(!showBioPreview)}
                                className="h-7 text-xs gap-1"
                            >
                                <Eye className="h-3 w-3" />
                                {showBioPreview ? 'Editar' : 'Preview'}
                            </Button>
                        </div>
                        {showBioPreview ? (
                            <div className="min-h-[80px] p-3 rounded-md border bg-muted/50">
                                <MarkdownBio content={bio} />
                            </div>
                        ) : (
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="**Olá!** Eu sou um membro da DAO 🎉\n\n- Item 1\n- Item 2\n\n[Meu site](https://...)"
                                maxLength={500}
                                rows={4}
                            />
                        )}
                        <p className="text-xs text-muted-foreground flex justify-between">
                            <span>Suporta Markdown: **negrito**, *itálico*, [links](url), listas</span>
                            <span>{bio.length}/500</span>
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveProfile}
                        disabled={isPending || isConfirming}
                    >
                        {isPending || isConfirming ? 'Salvando...' : 'Salvar Nome e Bio'}
                    </Button>
                </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Links Sociais
                    </CardTitle>
                    <CardDescription>Conecte suas redes sociais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter</Label>
                            <Input
                                id="twitter"
                                value={socialLinks.twitter}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                                placeholder="@usuario"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telegram">Telegram</Label>
                            <Input
                                id="telegram"
                                value={socialLinks.telegram}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, telegram: e.target.value }))}
                                placeholder="@usuario"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discord">Discord</Label>
                            <Input
                                id="discord"
                                value={socialLinks.discord}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, discord: e.target.value }))}
                                placeholder="usuario#1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={socialLinks.website}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleSaveSocialLinks}
                        disabled={isPending || isConfirming}
                    >
                        {isPending || isConfirming ? 'Salvando...' : 'Salvar Links'}
                    </Button>
                </CardContent>
            </Card>

            {/* Avatar Selector Modal */}
            {showAvatarSelector && (
                <AvatarSelector
                    address={address!}
                    onClose={() => setShowAvatarSelector(false)}
                    onSave={() => {
                        setShowAvatarSelector(false)
                        refetch()
                    }}
                />
            )}
        </div>
    )
}
