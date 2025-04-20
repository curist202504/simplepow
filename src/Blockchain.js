import Block from './Block.js';

export default class Blockchain {
    constructor() {
        this.chain = this.loadChain() || [this.createGenesisBlock()];
        this.pendingTransactions = this.loadPendingTransactions() || [];
        this.difficulty = 2;
    }

    loadChain() {
        const savedChain = localStorage.getItem('blockchain');
        if (savedChain) {
            try {
                return JSON.parse(savedChain);
            } catch (error) {
                console.error('Error loading blockchain:', error);
                return null;
            }
        }
        return null;
    }

    loadPendingTransactions() {
        const savedTransactions = localStorage.getItem('pendingTransactions');
        if (savedTransactions) {
            try {
                return JSON.parse(savedTransactions);
            } catch (error) {
                console.error('Error loading pending transactions:', error);
                return null;
            }
        }
        return null;
    }

    saveChain() {
        localStorage.setItem('blockchain', JSON.stringify(this.chain));
    }

    savePendingTransactions() {
        localStorage.setItem('pendingTransactions', JSON.stringify(this.pendingTransactions));
    }

    createGenesisBlock() {
        // Create initial transaction to give coins to the creator
        const genesisTransaction = {
            from: 'SPW-GENESIS-00000000-00000000',  // Special genesis address
            to: 'SPW-CREATOR-00000000-00000000',    // Creator's address
            amount: 1000,                            // Initial supply
            timestamp: Date.now(),
            signature: 'GENESIS'                     // Special signature for genesis transaction
        };

        console.log('Creating genesis block with transaction:', genesisTransaction);

        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            transactions: [genesisTransaction],
            previousHash: '0',
            hash: this.calculateHash({
                index: 0,
                timestamp: Date.now(),
                transactions: [genesisTransaction],
                previousHash: '0',
                nonce: 0
            }),
            nonce: 0
        };

        // Save the genesis block
        this.chain = [genesisBlock];
        this.saveChain();
        console.log('Genesis block created and saved:', genesisBlock);
        return genesisBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    async calculateHash(block) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(block));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async minePendingTransactions(minerAddress) {
        const rewardTx = {
            from: null,
            to: minerAddress,
            amount: 100, // Mining reward
            timestamp: Date.now()
        };
        this.pendingTransactions.push(rewardTx);

        const block = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            previousHash: this.getLatestBlock().hash,
            nonce: 0
        };

        let hash = await this.calculateHash(block);
        while (!hash.startsWith('0'.repeat(this.difficulty))) {
            block.nonce++;
            hash = await this.calculateHash(block);
        }

        block.hash = hash;
        this.chain.push(block);
        this.pendingTransactions = [];
        
        // Save after mining
        this.saveChain();
        this.savePendingTransactions();
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
        this.savePendingTransactions();
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        console.log('Calculating balance for address:', address);
        for (const block of this.chain) {
            console.log('Checking block:', block.index);
            for (const transaction of block.transactions) {
                console.log('Transaction:', transaction);
                if (transaction.from === address) {
                    balance -= transaction.amount;
                    console.log('Subtracting:', transaction.amount, 'New balance:', balance);
                }
                if (transaction.to === address) {
                    balance += transaction.amount;
                    console.log('Adding:', transaction.amount, 'New balance:', balance);
                }
            }
        }
        console.log('Final balance for', address, ':', balance);
        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== this.calculateHash(currentBlock)) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
} 