'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Moon, Sun, Monitor, Globe, DollarSign } from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { toast } from 'sonner'

export default function SettingsGeneralPage() {
    const { theme, setTheme } = useTheme()
    const { address, isConnected } = useAccount()
    const [language, setLanguage] = useState('pt-BR')
    const [currency, setCurrency] = useState('BRL')
    const [mounted, setMounted] = useState(false)

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        setMounted(true)
        // Load from localStorage
        const saved = localStorage.getItem('poline-preferences')
        if (saved) {
            try {
                const prefs = JSON.parse(saved)
                if (prefs.language) setLanguage(prefs.language)
                if (prefs.currency) setCurrency(prefs.currency)
            } catch { }
        }
    }, [])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Preferências salvas on-chain!')
        }
    }, [isSuccess])

    const handleSavePreferences = async () => {
        const prefs = { theme, language, currency }
        // Save locally first
        localStorage.setItem('poline-preferences', JSON.stringify(prefs))

        // Save on-chain if connected
        if (isConnected && address) {
            try {
                writeContract({
                    address: CONTRACTS.userProfile as `0x${string}`,
                    abi: userProfileABI,
                    functionName: 'setPreferences',
                    args: [JSON.stringify(prefs)],
                })
            } catch (err) {
                toast.error('Erro ao salvar on-chain')
            }
        } else {
            toast.success('Preferências salvas localmente!')
        }
    }

    if (!mounted) return null

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Geral</h2>
                <p className="text-muted-foreground">Configurações gerais da aplicação</p>
            </div>

            {/* Theme */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        Tema
                    </CardTitle>
                    <CardDescription>Escolha o tema visual da interface</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('light')}
                            className="gap-2"
                        >
                            <Sun className="h-4 w-4" />
                            Claro
                        </Button>
                        <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('dark')}
                            className="gap-2"
                        >
                            <Moon className="h-4 w-4" />
                            Escuro
                        </Button>
                        <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('system')}
                            className="gap-2"
                        >
                            <Monitor className="h-4 w-4" />
                            Sistema
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Language */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Idioma
                    </CardTitle>
                    <CardDescription>Escolha o idioma da interface</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pt-BR">Português (BR)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Currency */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Moeda
                    </CardTitle>
                    <CardDescription>Moeda para exibição de valores</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BRL">Real (R$)</SelectItem>
                            <SelectItem value="USD">Dólar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSavePreferences}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
            </div>
        </div>
    )
}
