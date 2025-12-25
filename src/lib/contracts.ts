// Contract addresses deployed on Polygon Amoy testnet
export const CONTRACTS = {
    polineToken: '0xea102082ae2a897c4dbbebf39b4c15e8a8341307',
    stakingManager: '0x9f33ef78fe276d7e9d03b42308e08d1094436713',
    circleRegistry: '0x86a61152bd41b7cd34db767ec0a916f39118605e',
    oracleVoting: '0xf66413ef88e068dc594886be88e59f449893f9a4',
    disputeResolution: '0x884f6a11079139b9077efc998c0a87778165bab3',
    polineDAO: '0x6e64588abfa6616fa0c163f6d02f23c06a7f573e',
    polinePurchase: '0xeb409d3f0e692b6925665af906706f42475c4142',
    treasuryManager: '0x24f29fe3765ba33ec46984e73c537c2bb4ff83a7',
    storageRegistry: '0x9DFd21872D1aaaAc289527f17048072deE1C1e82',
    userProfile: '0xa5e4709bb929836c2ced40203baf538fee913636',
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
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'delegates',
        outputs: [{ name: '', type: 'address' }],
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
            { name: 'propType', type: 'uint8' },
            { name: 'description', type: 'string' },
            { name: 'target', type: 'address' },
            { name: 'callData', type: 'bytes' },
            { name: 'votingPeriod', type: 'uint256' },
        ],
        name: 'propose',
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
        name: 'queueProposal',
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
        name: 'cancelProposal',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'getProposal',
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'id', type: 'bytes32' },
                    { name: 'proposer', type: 'address' },
                    { name: 'circleId', type: 'bytes32' },
                    { name: 'propType', type: 'uint8' },
                    { name: 'description', type: 'string' },
                    { name: 'callData', type: 'bytes' },
                    { name: 'target', type: 'address' },
                    { name: 'createdAt', type: 'uint256' },
                    { name: 'votingStarts', type: 'uint256' },
                    { name: 'votingEnds', type: 'uint256' },
                    { name: 'forVotes', type: 'uint256' },
                    { name: 'againstVotes', type: 'uint256' },
                    { name: 'abstainVotes', type: 'uint256' },
                    { name: 'status', type: 'uint8' },
                    { name: 'executionTime', type: 'uint256' },
                ],
            },
        ],
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
        name: 'allProposalIds',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'proposalId', type: 'bytes32' },
            { name: 'voter', type: 'address' },
        ],
        name: 'hasVoted',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'proposalThreshold',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'quorumPercentage',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'minVotingPeriod',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'proposalId', type: 'bytes32' },
            { name: 'voter', type: 'address' },
        ],
        name: 'votes',
        outputs: [
            { name: 'hasVoted', type: 'bool' },
            { name: 'support', type: 'uint8' },
            { name: 'weight', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'queue',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'bytes32' }],
        name: 'execute',
        outputs: [],
        stateMutability: 'nonpayable',
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
    {
        inputs: [{ name: 'circleId', type: 'bytes32' }],
        name: 'joinCircle',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'circleId', type: 'bytes32' }],
        name: 'leaveCircle',
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

// UserProfile ABI
export const userProfileABI = [
    {
        inputs: [{ name: '_user', type: 'address' }],
        name: 'getProfile',
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'avatarURI', type: 'string' },
                    { name: 'displayName', type: 'string' },
                    { name: 'bio', type: 'string' },
                    { name: 'socialLinks', type: 'string' },
                    { name: 'preferences', type: 'string' },
                    { name: 'avatarType', type: 'uint8' },
                    { name: 'isDelegate', type: 'bool' },
                    { name: 'delegateStatement', type: 'string' },
                    { name: 'updatedAt', type: 'uint256' },
                ],
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '_users', type: 'address[]' }],
        name: 'getProfiles',
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                components: [
                    { name: 'avatarURI', type: 'string' },
                    { name: 'displayName', type: 'string' },
                    { name: 'bio', type: 'string' },
                    { name: 'socialLinks', type: 'string' },
                    { name: 'preferences', type: 'string' },
                    { name: 'avatarType', type: 'uint8' },
                    { name: 'isDelegate', type: 'bool' },
                    { name: 'delegateStatement', type: 'string' },
                    { name: 'updatedAt', type: 'uint256' },
                ],
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: '_uri', type: 'string' },
            { name: '_avatarType', type: 'uint8' },
        ],
        name: 'setAvatar',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: '_displayName', type: 'string' },
            { name: '_bio', type: 'string' },
        ],
        name: 'setNameAndBio',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: '_isDelegate', type: 'bool' },
            { name: '_statement', type: 'string' },
        ],
        name: 'setDelegateInfo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: '_preferences', type: 'string' }],
        name: 'setPreferences',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: '_socialLinks', type: 'string' }],
        name: 'setSocialLinks',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: '_name', type: 'string' }],
        name: 'getAddressByName',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '_name', type: 'string' }],
        name: 'isNameAvailable',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const
