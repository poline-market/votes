'use client'

import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CONTRACTS, stakingManagerABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { ArrowRight, Activity, Scale, Building2, TrendingUp } from 'lucide-react'

// Componente para Kpis minimalistas
function KpiCard({ title, value, unit, icon: Icon }: any) {
  return (
    <Card className="border-border/60 shadow-none rounded-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="label-tech">{title}</span>
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-mono font-medium tracking-tight">{value}</span>
          <span className="text-sm text-muted-foreground font-mono">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionCard({ title, description, href, icon: Icon, actionLabel }: any) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full border-border/60 shadow-none rounded-sm hover:border-primary/40 transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
          </div>
          <CardTitle className="text-lg font-medium tracking-tight">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardHeader>
      </Card>
    </Link>
  )
}

export default function Dashboard() {
  const { address, isConnected } = useAccount()

  // Hooks de dados...
  const { data: totalStaked } = useReadContract({
    address: CONTRACTS.stakingManager as `0x${string}`,
    abi: stakingManagerABI,
    functionName: 'totalStaked',
  })

  // ... (outros hooks mantidos)

  return (
    <div className="space-y-12">
      {/* Hero Section Minimalista */}
      <section className="space-y-4 pt-4">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-foreground">
          Protocolo de Decisão <br />
          <span className="text-muted-foreground">Coletiva Descentralizada</span>
        </h1>
        <p className="max-w-[600px] text-muted-foreground text-lg">
          Oráculos humanos, skin in the game e resolução de disputas on-chain.
        </p>
      </section>

      {!isConnected ? (
        <Card className="bg-muted/30 border-dashed border-2 rounded-sm max-w-md">
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-4">
            <p className="text-muted-foreground">Conecte sua carteira para acessar o painel de oráculo.</p>
            {/* O botão de conectar já está na navbar, mas pode ser útil aqui também se necessário */}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {/* KPI Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="TOTAL VALUE LOCKED"
              value={totalStaked ? Number(formatEther(totalStaked)).toFixed(0) : '0'}
              unit="POLINE"
              icon={TrendingUp}
            />
            <KpiCard
              title="ACTIVE MARKETS"
              value="12"
              unit="EVENTS"
              icon={Activity}
            />
            {/* ... outros KPIs */}
          </div>

          {/* Actions Grid */}
          <div>
            <h2 className="label-tech mb-6 px-1">SYSTEM MODULES</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                title="Oracle Markets"
                description="Vote na resolução de eventos e ganhe recompensas por consenso correto."
                href="/events"
                icon={Activity}
              />
              <ActionCard
                title="Governance"
                description="Participe dos círculos de decisão e crie propostas de protocolo."
                href="/proposals"
                icon={Building2}
              />
              <ActionCard
                title="Court System"
                description="Audite e desafie decisões incorretas através do mecanismo de disputa."
                href="/disputes"
                icon={Scale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
