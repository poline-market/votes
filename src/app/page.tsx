'use client'

import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CONTRACTS, stakingManagerABI, polineTokenABI } from '@/lib/contracts'
import { formatEther } from 'viem'

export default function Dashboard() {
  const { address, isConnected } = useAccount()

  const { data: totalStaked } = useReadContract({
    address: CONTRACTS.stakingManager as `0x${string}`,
    abi: stakingManagerABI,
    functionName: 'totalStaked',
  })

  const { data: isOracle } = useReadContract({
    address: CONTRACTS.stakingManager as `0x${string}`,
    abi: stakingManagerABI,
    functionName: 'isOracle',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: userStake } = useReadContract({
    address: CONTRACTS.stakingManager as `0x${string}`,
    abi: stakingManagerABI,
    functionName: 'getStake',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: minimumStake } = useReadContract({
    address: CONTRACTS.stakingManager as `0x${string}`,
    abi: stakingManagerABI,
    functionName: 'minimumStake',
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de decisão coletiva com skin in the game
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Conecte sua carteira MetaMask para interagir com a DAO
              </p>
              <Badge variant="outline">Polygon Amoy Testnet</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status do usuário */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={isOracle ? 'default' : 'secondary'}>
                  {isOracle ? 'Oráculo Ativo' : 'Não é Oráculo'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seu Stake</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStake ? Number(formatEther(userStake)).toFixed(2) : '0'} POLINE
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stakado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalStaked ? Number(formatEther(totalStaked)).toFixed(2) : '0'} POLINE
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mínimo Oracle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {minimumStake ? Number(formatEther(minimumStake)).toFixed(0) : '100'} POLINE
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações rápidas */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Oráculo Humano</CardTitle>
                <CardDescription>
                  Stake tokens para votar na resolução de eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Faça stake para se tornar oráculo e ganhar poder de voto. Se votar errado, sofre slashing.
                </p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/staking">Fazer Stake</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/events">Ver Eventos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governança</CardTitle>
                <CardDescription>
                  Participe das decisões da DAO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Membros de círculos podem criar propostas. Vote em propostas ativas.
                </p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/proposals">Ver Propostas</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/circles">Círculos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disputas</CardTitle>
                <CardDescription>
                  Sistema de court estilo Kleros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Desafie decisões erradas com stake extra. Nova rodada de votação decide.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/disputes">Ver Disputas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
