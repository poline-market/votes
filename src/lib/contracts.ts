// Contract addresses deployed on Polygon Amoy testnet
export const CONTRACTS = {
    polineToken: '0x1Ae28C576Bc48652BDf316cCfBA09f74F3E890e9',
    stakingManager: '0x0289E2C7129BFBcCa50465eCF631aBb0EeA39A10',
    circleRegistry: '0x24BeA193279A2dDf20aCd82F0e801BbC65a9Fb11',
    oracleVoting: '0xb7E76E16E28100664dC1649b73e1788224c59bD5',
    disputeResolution: '0x350632960846D2583F9f7e123Ec33de48448d0c4',
    polineDAO: '0xcce1f7890c3611bd96404460af9cfd74a99fec13',
    polinePurchase: '0x6659beb09d82192feb66c8896f524fad6d01bd28',
} as const

// PolineToken ABI (soulbound governance token)
export const polineTokenABI = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'getVotes',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'delegatee', type: 'address' }],
        name: 'delegate',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// StakingManager ABI
export const stakingManagerABI = [
    {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'stake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'requestUnstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'completeUnstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'cancelUnstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'getStake',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'isOracle',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'canUnstake',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'timeUntilUnstake',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalStaked',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'minimumStake',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'unstakeCooldown',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// OracleVoting ABI
export const oracleVotingABI = [
    {
        inputs: [],
        name: 'getEventCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'index', type: 'uint256' }],
        name: 'allEventIds',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'eventId', type: 'bytes32' }],
        name: 'getEvent',
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'id', type: 'bytes32' },
                    { name: 'description', type: 'string' },
                    { name: 'createdAt', type: 'uint256' },
                    { name: 'votingDeadline', type: 'uint256' },
                    { name: 'yesVotes', type: 'uint256' },
                    { name: 'noVotes', type: 'uint256' },
                    { name: 'status', type: 'uint8' },
                    { name: 'outcome', type: 'bool' },
                    { name: 'creator', type: 'address' },
                ],
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'eventId', type: 'bytes32' },
            { name: 'vote', type: 'bool' },
        ],
        name: 'castVote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'description', type: 'string' },
            { name: 'votingPeriod', type: 'uint256' },
        ],
        name: 'createEvent',
        outputs: [{ name: 'eventId', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'eventId', type: 'bytes32' }],
        name: 'resolveEvent',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'eventId', type: 'bytes32' },
            { name: 'voter', type: 'address' },
        ],
        name: 'getVote',
        outputs: [
            { name: 'hasVoted', type: 'bool' },
            { name: 'vote', type: 'bool' },
            { name: 'weight', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'eventId', type: 'bytes32' }],
        name: 'getVoters',
        outputs: [{ name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'eventId', type: 'bytes32' },
            { name: 'voter', type: 'address' },
        ],
        name: 'hasVoted',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// PolineDAO ABI
export const polineDAOABI = [
    {
        inputs: [
            { name: 'circleId', type: 'bytes32' },
            { name: 'proposalType', type: 'uint8' },
            { name: 'description', type: 'string' },
            { name: 'target', type: 'address' },
            { name: 'callData', type: 'bytes' },
            { name: 'value', type: 'uint256' },
        ],
        name: 'createProposal',
        outputs: [{ name: 'proposalId', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'proposalId', type: 'bytes32' },
            { name: 'support', type: 'uint8' },
        ],
        name: 'castVote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'executeProposal',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'queueProposal',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'getProposal',
        outputs: [
            { name: 'id', type: 'bytes32' },
            { name: 'proposer', type: 'address' },
            { name: 'circleId', type: 'bytes32' },
            { name: 'proposalType', type: 'uint8' },
            { name: 'description', type: 'string' },
            { name: 'callData', type: 'bytes' },
            { name: 'target', type: 'address' },
            { name: 'createdAt', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'forVotes', type: 'uint256' },
            { name: 'againstVotes', type: 'uint256' },
            { name: 'abstainVotes', type: 'uint256' },
            { name: 'status', type: 'uint8' },
            { name: 'eta', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'getProposalStatus',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'proposalCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'index', type: 'uint256' }],
        name: 'proposalIds',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// CircleRegistry ABI
export const circleRegistryABI = [
    {
        inputs: [{ name: 'circleId', type: 'bytes32' }],
        name: 'circles',
        outputs: [
            { name: 'id', type: 'bytes32' },
            { name: 'name', type: 'string' },
            { name: 'proposalScope', type: 'uint256' },
            { name: 'requiredStake', type: 'uint256' },
            { name: 'active', type: 'bool' },
            { name: 'createdAt', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'circleId', type: 'bytes32' },
            { name: 'member', type: 'address' },
        ],
        name: 'isMember',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'circleId', type: 'bytes32' }],
        name: 'getMembers',
        outputs: [{ name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'circleId', type: 'bytes32' }],
        name: 'getMemberCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'member', type: 'address' }],
        name: 'getCirclesForMember',
        outputs: [{ name: '', type: 'bytes32[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getAllCircles',
        outputs: [{ name: '', type: 'bytes32[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'SCOPE_ORACLE',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'SCOPE_GOVERNANCE',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'circleId', type: 'bytes32' },
            { name: 'member', type: 'address' },
        ],
        name: 'addMember',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'circleId', type: 'bytes32' },
            { name: 'member', type: 'address' },
        ],
        name: 'removeMember',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const

// DisputeResolution ABI
export const disputeResolutionABI = [
    {
        inputs: [{ name: 'eventId', type: 'bytes32' }],
        name: 'openDispute',
        outputs: [{ name: 'disputeId', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'disputeId', type: 'bytes32' },
            { name: 'overturn', type: 'bool' },
        ],
        name: 'castVote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'disputeId', type: 'bytes32' }],
        name: 'resolveDispute',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'disputeId', type: 'bytes32' }],
        name: 'escalateDispute',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'disputeId', type: 'bytes32' }],
        name: 'getDispute',
        outputs: [
            { name: 'id', type: 'bytes32' },
            { name: 'eventId', type: 'bytes32' },
            { name: 'challenger', type: 'address' },
            { name: 'createdAt', type: 'uint256' },
            { name: 'escalationLevel', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'overturnVotes', type: 'uint256' },
            { name: 'upholdVotes', type: 'uint256' },
            { name: 'status', type: 'uint8' },
            { name: 'resolved', type: 'bool' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'disputeCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'index', type: 'uint256' }],
        name: 'allDisputeIds',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'disputeId', type: 'bytes32' },
            { name: 'voter', type: 'address' },
        ],
        name: 'hasVoted',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// PolinePurchase ABI
export const polinePurchaseABI = [
    {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'buyTokens',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'calculateCost',
        outputs: [{ name: 'cost', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'maticAmount', type: 'uint256' }],
        name: 'calculateTokens',
        outputs: [{ name: 'amount', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pricePerToken',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'minimumPurchase',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'maximumPurchase',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalCollected',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSold',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const
