'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
    Shield,
    Bell,
    Vote,
    Eye,
    Mail,
    Clock,
    AlertTriangle
} from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { toast } from 'sonner'

export default function SettingsPrivacyPage() {
    const { address, isConnected } = useAccount()

    // DAO-relevant privacy settings
    const [showVoteHistory, setShowVoteHistory] = useState(true)
    const [showDelegations, setShowDelegations] = useState(true)
    const [enableNotifications, setEnableNotifications] = useState(true)
    const [proposalReminders, setProposalReminders] = useState(true)
    const [anonymousVoting, setAnonymousVoting] = useState(false)

    const { data: profile, refetch } = useReadContract({
        address: CONTRACTS.userProfile as `0x${string}`,
        abi: userProfileABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        // Load from localStorage and on-chain
        const saved = localStorage.getItem('poline-privacy')
        if (saved) {
            try {
                const prefs = JSON.parse(saved)
                if (prefs.showVoteHistory !== undefined) setShowVoteHistory(prefs.showVoteHistory)
                if (prefs.showDelegations !== undefined) setShowDelegations(prefs.showDelegations)
                if (prefs.enableNotifications !== undefined) setEnableNotifications(prefs.enableNotifications)
                if (prefs.proposalReminders !== undefined) setProposalReminders(prefs.proposalReminders)
                if (prefs.anonymousVoting !== undefined) setAnonymousVoting(prefs.anonymousVoting)
            } catch { }
        }
    }, [profile])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Preferências atualizadas!')
            refetch()
        }
    }, [isSuccess, refetch])

    const handleSave = async () => {
        const prefs = {
            showVoteHistory,
            showDelegations,
            enableNotifications,
            proposalReminders,
            anonymousVoting
        }
        localStorage.setItem('poline-privacy', JSON.stringify(prefs))

        if (isConnected && address) {
            try {
                const currentPrefs = profile?.preferences ? JSON.parse(profile.preferences) : {}
                const mergedPrefs = { ...currentPrefs, ...prefs }

                writeContract({
                    address: CONTRACTS.userProfile as `0x${string}`,
                    abi: userProfileABI,
                    functionName: 'setPreferences',
                    args: [JSON.stringify(mergedPrefs)],
                })
            } catch (err) {
                toast.error('Erro ao salvar on-chain')
            }
        } else {
            toast.success('Preferências salvas localmente!')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Privacidade & Notificações</h2>
                <p className="text-muted-foreground">Configure sua experiência na DAO</p>
            </div>

            {/* DAO Decentralization Note */}
            <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Compromisso com a Descentralização
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        A Poline DAO opera com <strong>transparência on-chain</strong>. Votos e delegações
                        são registros públicos na blockchain, garantindo auditabilidade e confiança.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Propriedade total dos seus dados</li>
                        <li>Governança transparente e auditável</li>
                        <li>Resistência à censura</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Vote History Visibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Vote className="h-5 w-5" />
                        Histórico de Votos
                    </CardTitle>
                    <CardDescription>
                        Exibir seu histórico de votos em seu perfil público
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{showVoteHistory ? 'Visível' : 'Oculto'}</p>
                        <p className="text-sm text-muted-foreground">
                            {showVoteHistory
                                ? 'Outros podem ver como você votou'
                                : 'Histórico oculto no perfil (ainda visível on-chain)'}
                        </p>
                    </div>
                    <Switch
                        checked={showVoteHistory}
                        onCheckedChange={setShowVoteHistory}
                    />
                </CardContent>
            </Card>

            {/* Delegations Visibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Delegações Recebidas
                    </CardTitle>
                    <CardDescription>
                        Exibir quantos votos foram delegados para você
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{showDelegations ? 'Visível' : 'Oculto'}</p>
                        <p className="text-sm text-muted-foreground">
                            {showDelegations
                                ? 'Poder de voto delegado visível no perfil'
                                : 'Quantidade de delegações oculta'}
                        </p>
                    </div>
                    <Switch
                        checked={showDelegations}
                        onCheckedChange={setShowDelegations}
                    />
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notificações
                    </CardTitle>
                    <CardDescription>
                        Receber alertas sobre atividades da DAO
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{enableNotifications ? 'Ativadas' : 'Desativadas'}</p>
                        <p className="text-sm text-muted-foreground">
                            Novas propostas, resultados de votações, etc.
                        </p>
                    </div>
                    <Switch
                        checked={enableNotifications}
                        onCheckedChange={setEnableNotifications}
                    />
                </CardContent>
            </Card>

            {/* Proposal Reminders */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Lembretes de Propostas
                    </CardTitle>
                    <CardDescription>
                        Alertas antes do fim do período de votação
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{proposalReminders ? 'Ativados' : 'Desativados'}</p>
                        <p className="text-sm text-muted-foreground">
                            Lembrete 24h antes do encerramento de votações
                        </p>
                    </div>
                    <Switch
                        checked={proposalReminders}
                        onCheckedChange={setProposalReminders}
                    />
                </CardContent>
            </Card>

            {/* Anonymous Voting - Future Feature */}
            <Card className="opacity-60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Votação Anônima
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Em breve</span>
                    </CardTitle>
                    <CardDescription>
                        Votar sem revelar sua escolha até o fim da votação (via ZK proofs)
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-muted-foreground">Indisponível</p>
                        <p className="text-sm text-muted-foreground">
                            Recurso em desenvolvimento utilizando provas de conhecimento zero
                        </p>
                    </div>
                    <Switch
                        checked={anonymousVoting}
                        onCheckedChange={setAnonymousVoting}
                        disabled
                    />
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
            </div>
        </div>
    )
}
