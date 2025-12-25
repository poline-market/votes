'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Users, MessageSquare } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { toast } from 'sonner'

export default function SettingsDelegatePage() {
    const { address, isConnected } = useAccount()
    const [isDelegate, setIsDelegate] = useState(false)
    const [delegateStatement, setDelegateStatement] = useState('')

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
        if (profile) {
            setIsDelegate(profile.isDelegate || false)
            setDelegateStatement(profile.delegateStatement || '')
        }
    }, [profile])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Configurações de delegação atualizadas!')
            refetch()
        }
    }, [isSuccess, refetch])

    const handleSave = async () => {
        if (!isConnected || !address) {
            toast.error('Conecte sua carteira primeiro')
            return
        }

        try {
            writeContract({
                address: CONTRACTS.userProfile as `0x${string}`,
                abi: userProfileABI,
                functionName: 'setDelegateInfo',
                args: [isDelegate, delegateStatement],
            })
        } catch (err) {
            toast.error('Erro ao salvar')
        }
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Conecte sua carteira para configurar delegação</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Delegação</h2>
                <p className="text-muted-foreground">Configure se você aceita receber delegações de votos</p>
            </div>

            {/* Accept Delegations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Aceitar Delegações
                    </CardTitle>
                    <CardDescription>
                        Ao ativar, outros membros da DAO poderão delegar seus votos para você
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{isDelegate ? 'Ativo' : 'Inativo'}</p>
                        <p className="text-sm text-muted-foreground">
                            {isDelegate
                                ? 'Você aparece na lista de delegados'
                                : 'Você não está disponível para delegação'}
                        </p>
                    </div>
                    <Switch
                        checked={isDelegate}
                        onCheckedChange={setIsDelegate}
                    />
                </CardContent>
            </Card>

            {/* Delegate Statement */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Statement de Delegado
                    </CardTitle>
                    <CardDescription>
                        Explique sua visão e como você pretende votar em nome dos delegadores
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={delegateStatement}
                        onChange={(e) => setDelegateStatement(e.target.value)}
                        placeholder="Descreva sua filosofia de votação, experiência, e como você representa os interesses da comunidade..."
                        rows={5}
                        disabled={!isDelegate}
                    />
                    <p className="text-xs text-muted-foreground">
                        Este statement será visível para todos os membros da DAO que buscam um delegado
                    </p>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
            </div>
        </div>
    )
}
