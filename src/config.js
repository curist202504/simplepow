export const CONFIG = {
    MINING_DIFFICULTY: 2,
    MINING_REWARD: 100,
    DEFAULT_ADDRESSES: {
        GENESIS: 'SPW-00000000-00000000-00000000',
        MINER: 'SPW-11111111-11111111-11111111',
        USER: 'SPW-22222222-22222222-22222222'
    },
    TOOLTIPS: {
        FROM_ADDRESS: 'Enter the sender\'s wallet address (format: SPW-xxxxxxxx-xxxxxxxx-xxxxxxxx)',
        TO_ADDRESS: 'Enter the recipient\'s wallet address (format: SPW-xxxxxxxx-xxxxxxxx-xxxxxxxx)',
        AMOUNT: 'Enter the amount to transfer. Must be a positive number.',
        MINER_ADDRESS: 'Enter your miner\'s wallet address to receive mining rewards (format: SPW-xxxxxxxx-xxxxxxxx-xxxxxxxx)',
        CREATE_TRANSACTION: 'Create a new transaction that will be added to the pending transactions pool.',
        MINE_BLOCK: 'Mine a new block containing all pending transactions and receive the mining reward.',
        BLOCK_HASH: 'Unique identifier of this block, calculated using SHA-256.',
        PREVIOUS_HASH: 'Hash of the previous block, creating the chain.',
        TIMESTAMP: 'When this block was created.',
        DATA: 'Transactions contained in this block.',
        NONCE: 'Number used in mining to achieve the required difficulty.',
        BALANCE: 'Current balance of this address.',
        ADDRESS_FORMAT: 'Addresses must follow the format: SPW-xxxxxxxx-xxxxxxxx-xxxxxxxx where x is a lowercase letter or number',
        COPY_ADDRESS: 'Copy the wallet address to clipboard',
        COPY_SEED: 'Copy the seed phrase to clipboard (keep this secure!)',
        RESTORE_WALLET: 'Restore a wallet using its seed phrase'
    }
}; 