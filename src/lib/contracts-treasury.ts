// TreasuryManager ABI
export const treasuryManagerABI = [
    {
        inputs: [
            { name: 'budgetType', type: 'uint8' },
            { name: 'walletAddress', type: 'address' },
            { name: 'manager', type: 'address' },
        ],
        name: 'setBudgetWallet',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'budgetType', type: 'uint8' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'proposeAllocation',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'allocationId', type: 'bytes32' }],
        name: 'transferToBudget',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'budgetType', type: 'uint8' }],
        name: 'getBudgetWallet',
        outputs: [
            { name: 'walletAddress', type: 'address' },
            { name: 'manager', type: 'address' },
            { name: 'totalAllocated', type: 'uint256' },
            { name: 'currentBalance', type: 'uint256' },
            { name: 'active', type: 'bool' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'budgetType', type: 'uint8' },
            { name: 'newManager', type: 'address' },
        ],
        name: 'setBudgetManager',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const
