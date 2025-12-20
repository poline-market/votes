# Poline DAO Frontend

Este projeto é a interface web para interagir com a DAO do [Poline Prediction Market](https://github.com/poline/poline).

## 🚀 Features

- **Dashboard**: Visão geral, total staked, status do usuário.
- **Wallet Connection**: Conexão com MetaMask via Wagmi/Viem.
- **Staking**: Interface para fazer stake de tokens POLINE e se tornar um oráculo.
- **Oracle Events**: Criação e votação em eventos de resolução (YES/NO).
- **Governance**: Criação e votação em propostas de governança para diferentes círculos.
- **Disputes**: Sistema de disputa estilo Kleros para desafiar resoluções de oráculos.
- **Circles**: Visualização da estrutura de holacracia da DAO.

## 🛠️ Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI**: [Shadcn/UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Web3**: [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## 📦 Contratos Integrados (Polygon Amoy)

| Contrato | Endereço | Descrição |
|----------|----------|-----------|
| `PolineToken` | `0x1Ae28...90e9` | Soulbound governance token |
| `CircleRegistry` | `0x24BeA...Fb11` | Gerenciamento de círculos/holacracia |
| `StakingManager` | `0x0289E...9A10` | Stake para oráculos |
| `OracleVoting` | `0xb7E76...9bD5` | Votação em eventos |
| `PolineDAO` | `0xbEEc0...8dC9` | Governança e propostas |
| `DisputeResolution` | `0x35063...d0c4` | Sistema de disputas |

## 🏁 Como Rodar

1. Instale as dependências:
```bash
npm install
```

2. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── circles/      # Página de Círculos
│   ├── disputes/     # Página de Disputas
│   ├── events/       # Eventos Oracle (Lista, Novo, Detalhes)
│   ├── proposals/    # Propostas de Governança (Lista, Nova, Detalhes)
│   ├── staking/      # Página de Staking/Unstake
│   ├── layout.tsx    # Layout Principal + Providers
│   └── page.tsx      # Dashboard
├── components/
│   ├── ui/           # Componentes Shadcn
│   ├── navbar.tsx    # Barra de navegação
│   └── ...
├── lib/
│   ├── contracts.ts  # ABIs e Endereços dos contratos
│   └── wagmi-config.ts # Configuração do Wagmi (Polygon Amoy)
```

## 🔐 Requisitos

- Carteira MetaMask instalada no navegador.
- Rede Polygon Amoy Testnet configurada.
- Tokens POLINE (faucet ou mint) para interagir (stake, voto).
