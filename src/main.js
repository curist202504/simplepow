import Blockchain from './Blockchain.js';
import Wallet from './Wallet.js';
import { CONFIG } from './config.js';

// Initialize the blockchain and wallets
const blockchain = new Blockchain();
const wallets = new Map();

// Add default wallets
wallets.set(CONFIG.DEFAULT_ADDRESSES.GENESIS, new Wallet());
wallets.set(CONFIG.DEFAULT_ADDRESSES.MINER, new Wallet());
wallets.set(CONFIG.DEFAULT_ADDRESSES.USER, new Wallet());

// Load saved wallets from localStorage
function loadWallets() {
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
        const walletData = JSON.parse(savedWallets);
        for (const [address, seedPhrase] of Object.entries(walletData)) {
            Wallet.fromSeedPhrase(seedPhrase).then(wallet => {
                wallets.set(address, wallet);
            });
        }
    }
}

// Save wallets to localStorage
function saveWallets() {
    const walletData = {};
    wallets.forEach((wallet, address) => {
        walletData[address] = wallet.seedPhrase;
    });
    localStorage.setItem('wallets', JSON.stringify(walletData));
}

// Create default wallet for creator
async function initializeCreatorWallet() {
    try {
        const creatorWallet = await Wallet.fromSeedPhrase('creator-wallet-seed-phrase');
        const creatorAddress = 'SPW-CREATOR-00000000-00000000';
        wallets.set(creatorAddress, creatorWallet);
        await updateCurrentWalletDisplay(creatorAddress, 'creator-wallet-seed-phrase');
        showStatus('success', 'Creator wallet initialized with 1000 coins');
    } catch (error) {
        console.error('Error initializing creator wallet:', error);
        showStatus('error', 'Failed to initialize creator wallet');
    }
}

// Debug function to check if elements exist and are properly set up
function debugElements() {
    const elements = {
        fromAddress: document.getElementById('fromAddress'),
        toAddress: document.getElementById('toAddress'),
        minerAddress: document.getElementById('minerAddress'),
        createWalletBtn: document.getElementById('createWalletBtn'),
        createTransactionBtn: document.getElementById('createTransactionBtn'),
        mineBlockBtn: document.getElementById('mineBlockBtn')
    };

    console.log('Checking elements:');
    for (const [id, element] of Object.entries(elements)) {
        console.log(`${id}:`, {
            exists: !!element,
            type: element?.type,
            tagName: element?.tagName,
            onclick: element?.onclick,
            hasEventListener: element ? element.onclick !== null : false
        });
    }
}

// Update wallet persistence
async function saveWallet(wallet) {
    localStorage.setItem('currentWallet', JSON.stringify({
        address: wallet.address,
        seedPhrase: wallet.seedPhrase
    }));
    await updateCurrentWalletDisplay(wallet.address, wallet.seedPhrase);
}

async function loadWallet() {
    const savedWallet = localStorage.getItem('currentWallet');
    if (savedWallet) {
        const { address, seedPhrase } = JSON.parse(savedWallet);
        const wallet = await Wallet.fromSeedPhrase(seedPhrase);
        wallets.set(address, wallet);
        await updateCurrentWalletDisplay(address, seedPhrase);
        return wallet;
    }
    return null;
}

// Update current wallet display
async function updateCurrentWalletDisplay(address, seedPhrase) {
    const currentWalletDiv = document.getElementById('currentWallet');
    if (currentWalletDiv) {
        currentWalletDiv.innerHTML = `
            <div class="current-wallet">
                <h3>Current Wallet</h3>
                <p>Address: <span class="address">${address}</span></p>
                <p>Seed Phrase: <span class="seed-phrase">${seedPhrase}</span></p>
                <div class="wallet-actions">
                    <button onclick="copyToClipboard('${address}')" title="${CONFIG.TOOLTIPS.COPY_ADDRESS}">Copy Address</button>
                    <button onclick="copyToClipboard('${seedPhrase}')" title="${CONFIG.TOOLTIPS.COPY_SEED}">Copy Seed Phrase</button>
                    <button onclick="restoreWallet()" title="${CONFIG.TOOLTIPS.RESTORE_WALLET}">Restore Wallet</button>
                </div>
            </div>
        `;
        
        // Save current wallet to localStorage
        localStorage.setItem('currentWallet', JSON.stringify({ address, seedPhrase }));
    }
}

// Load current wallet on startup
function loadCurrentWallet() {
    const savedWallet = localStorage.getItem('currentWallet');
    if (savedWallet) {
        const { address, seedPhrase } = JSON.parse(savedWallet);
        updateCurrentWalletDisplay(address, seedPhrase);
    }
}

// Add utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus('success', 'Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showStatus('error', 'Failed to copy to clipboard');
    });
}

function useWalletAddress(address) {
    document.getElementById('fromAddress').value = address;
    showStatus('success', 'Address set as sender');
}

// Add restore wallet functionality
async function restoreWallet() {
    const seedPhrase = prompt('Enter your seed phrase to restore wallet:');
    if (seedPhrase) {
        try {
            const wallet = await Wallet.fromSeedPhrase(seedPhrase);
            wallets.set(wallet.address, wallet);
            await updateCurrentWalletDisplay(wallet.address, seedPhrase);
            showStatus('success', 'Wallet restored successfully!');
            updateUI();
        } catch (error) {
            showStatus('error', 'Invalid seed phrase');
        }
    }
}

// Make functions available globally
window.createWallet = createWallet;
window.createTransaction = createTransaction;
window.mineBlock = mineBlock;
window.copyToClipboard = copyToClipboard;
window.useWalletAddress = useWalletAddress;
window.restoreWallet = restoreWallet;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing application...');
        
        // Debug elements
        debugElements();
        
        // Load saved wallets first
        const savedWallets = localStorage.getItem('wallets');
        if (savedWallets) {
            const walletData = JSON.parse(savedWallets);
            for (const [address, seedPhrase] of Object.entries(walletData)) {
                try {
                    const wallet = await Wallet.fromSeedPhrase(seedPhrase);
                    wallets.set(address, wallet);
                    console.log('Loaded wallet:', address);
                } catch (error) {
                    console.error('Error loading wallet:', address, error);
                }
            }
        }

        // Load current wallet
        const savedCurrentWallet = localStorage.getItem('currentWallet');
        if (savedCurrentWallet) {
            const { address, seedPhrase } = JSON.parse(savedCurrentWallet);
            if (!wallets.has(address)) {
                const wallet = await Wallet.fromSeedPhrase(seedPhrase);
                wallets.set(address, wallet);
            }
            await updateCurrentWalletDisplay(address, seedPhrase);
        }

        // Initialize creator wallet if not exists
        const creatorAddress = 'SPW-CREATOR-00000000-00000000';
        if (!wallets.has(creatorAddress)) {
            const creatorWallet = await Wallet.fromSeedPhrase('creator-wallet-seed-phrase');
            wallets.set(creatorAddress, creatorWallet);
            await updateCurrentWalletDisplay(creatorAddress, 'creator-wallet-seed-phrase');
            showStatus('success', 'Creator wallet initialized with 1000 coins');
        }

        // Set up event listeners
        const createWalletBtn = document.getElementById('createWalletBtn');
        if (createWalletBtn) {
            createWalletBtn.onclick = createWallet;
            console.log('createWalletBtn event listener set');
        }

        const createTransactionBtn = document.getElementById('createTransactionBtn');
        if (createTransactionBtn) {
            createTransactionBtn.onclick = createTransaction;
            console.log('createTransactionBtn event listener set');
        }

        const mineBlockBtn = document.getElementById('mineBlockBtn');
        if (mineBlockBtn) {
            mineBlockBtn.onclick = mineBlock;
            console.log('mineBlockBtn event listener set');
        }

        // Initialize tooltips
        initializeTooltips();

        // Save initial state
        saveWallets();
        
        // Update UI
        updateUI();
        
        // Set up periodic saves
        setInterval(saveWallets, 5000);
    } catch (error) {
        console.error('Error during initialization:', error);
        showStatus('error', 'Failed to initialize application: ' + error.message);
    }
});

function initializeTooltips() {
    // Set tooltips for inputs
    document.getElementById('fromAddressTooltip').textContent = CONFIG.TOOLTIPS.FROM_ADDRESS;
    document.getElementById('toAddressTooltip').textContent = CONFIG.TOOLTIPS.TO_ADDRESS;
    document.getElementById('amountTooltip').textContent = CONFIG.TOOLTIPS.AMOUNT;
    document.getElementById('minerAddressTooltip').textContent = CONFIG.TOOLTIPS.MINER_ADDRESS;
    
    // Set tooltips for buttons
    document.getElementById('createTransactionTooltip').textContent = CONFIG.TOOLTIPS.CREATE_TRANSACTION;
    document.getElementById('mineBlockTooltip').textContent = CONFIG.TOOLTIPS.MINE_BLOCK;
}

// Update createWallet function
async function createWallet() {
    console.log('createWallet function called');
    try {
        const wallet = new Wallet();
        await wallet.generateAddress();
        wallets.set(wallet.address, wallet);
        await saveWallet(wallet);
        showStatus('success', 'New wallet created!');
        updateUI();
    } catch (error) {
        console.error('Error in createWallet:', error);
        showStatus('error', 'Error creating wallet: ' + error.message);
    }
}

// Update createTransaction function
async function createTransaction() {
    console.log('createTransaction function called');
    try {
        const fromAddress = document.getElementById('fromAddress').value;
        const toAddress = document.getElementById('toAddress').value;
        const amount = parseFloat(document.getElementById('amount').value);

        console.log('Transaction details:', { fromAddress, toAddress, amount });

        if (!Wallet.isValidAddress(fromAddress) || !Wallet.isValidAddress(toAddress)) {
            showStatus('error', 'Invalid address format. Addresses must follow the format: SPW-xxxxxxxx-xxxxxxxx-xxxxxxxx');
            return;
        }

        if (!amount || amount <= 0) {
            showStatus('error', 'Please enter a valid amount greater than 0');
            return;
        }

        const balance = blockchain.getBalanceOfAddress(fromAddress);
        if (balance < amount) {
            showStatus('error', `Insufficient balance. Current balance: ${balance}`);
            return;
        }

        const wallet = wallets.get(fromAddress);
        if (!wallet) {
            showStatus('error', 'Wallet not found for sender address');
            return;
        }

        const transaction = {
            from: fromAddress,
            to: toAddress,
            amount: amount,
            timestamp: Date.now()
        };

        // Sign the transaction
        transaction.signature = await wallet.sign(JSON.stringify(transaction));

        blockchain.createTransaction(transaction);
        showStatus('success', 'Transaction created and added to pending transactions!');
        updateUI();
    } catch (error) {
        console.error('Error in createTransaction:', error);
        showStatus('error', 'Error creating transaction: ' + error.message);
    }
}

// Update mineBlock function
async function mineBlock() {
    console.log('mineBlock function called');
    try {
        const minerAddress = document.getElementById('minerAddress').value;
        
        if (!Wallet.isValidAddress(minerAddress)) {
            showStatus('error', 'Invalid miner address format. Addresses must follow the format: SPW-xxxxxxxx-xxxxxxxx-xxxxxxxx');
            return;
        }

        // Check if miner has a wallet
        const minerWallet = wallets.get(minerAddress);
        if (!minerWallet) {
            showStatus('error', 'You need a wallet to mine. Please create or restore a wallet first.');
            return;
        }

        if (blockchain.pendingTransactions.length === 0) {
            showStatus('error', 'No pending transactions to mine');
            return;
        }

        // Show mining progress
        showStatus('info', 'Mining in progress... This may take a few seconds.');
        
        // Mine the block
        await blockchain.minePendingTransactions(minerAddress);
        
        showStatus('success', 'Block mined successfully! Mining reward: 100 coins');
        updateUI();
    } catch (error) {
        console.error('Error in mineBlock:', error);
        showStatus('error', 'Error mining block: ' + error.message);
    }
}

function updateUI() {
    console.log('Updating UI...');
    
    // Update pending transactions
    const pendingDiv = document.getElementById('pendingTransactions');
    if (pendingDiv) {
        pendingDiv.innerHTML = blockchain.pendingTransactions.length > 0
            ? JSON.stringify(blockchain.pendingTransactions, null, 2)
            : 'No pending transactions';
    }

    // Update blockchain display
    const blockchainDiv = document.getElementById('blockchain');
    if (blockchainDiv) {
        blockchainDiv.innerHTML = blockchain.chain.map((block, index) => `
            <div class="block">
                <h3>Block #${index}</h3>
                <p>Hash: ${block.hash}</p>
                <p>Previous Hash: ${block.previousHash}</p>
                <p>Nonce: ${block.nonce}</p>
                <p>Transactions: ${JSON.stringify(block.transactions, null, 2)}</p>
            </div>
        `).join('');
    }

    // Update balances
    const balancesDiv = document.getElementById('balances');
    if (balancesDiv) {
        console.log('Updating balances...');
        const balances = {};
        wallets.forEach((wallet, address) => {
            const balance = blockchain.getBalanceOfAddress(address);
            console.log('Balance for', address, ':', balance);
            balances[address] = balance;
        });
        balancesDiv.innerHTML = Object.entries(balances)
            .map(([address, balance]) => `
                <div class="balance">
                    <span class="address">${address}</span>: ${balance} coins
                </div>
            `).join('');
    }
}

function showStatus(type, message) {
    console.log(`${type}: ${message}`);
    let statusDiv;
    
    switch (type) {
        case 'error':
            statusDiv = document.getElementById('transactionStatus');
            break;
        case 'success':
            statusDiv = document.getElementById('walletStatus');
            break;
        case 'info':
            statusDiv = document.getElementById('miningStatus');
            break;
        default:
            statusDiv = document.getElementById('walletStatus');
    }

    if (!statusDiv) return;

    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
    }, 3000);
}

// Initialize when DOM is ready
console.log('Main.js loaded, waiting for DOM...'); 