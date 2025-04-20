# SimplePoW Blockchain

A simple blockchain implementation with Proof of Work (PoW) that runs in the browser. This project demonstrates the basic concepts of blockchain technology, including:

- Block creation and mining
- Proof of Work consensus mechanism
- Transaction management
- Chain validation

## Features

- Create and mine blocks
- Create transactions between addresses
- View the entire blockchain
- Simple web interface
- Basic transaction validation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. **Create a Transaction**:
   - Enter the sender's address
   - Enter the recipient's address
   - Enter the amount
   - Click "Create Transaction"

2. **Mine a Block**:
   - Enter your miner address
   - Click "Mine Pending Transactions"
   - The block will be mined and added to the chain

3. **View the Blockchain**:
   - The blockchain is displayed below the input forms
   - Each block shows its hash, previous hash, timestamp, and data

## Technical Details

- Uses SHA-256 for hashing
- Adjustable mining difficulty
- Basic transaction validation
- Simple Proof of Work implementation

## Note

This is a simplified implementation for educational purposes. It should not be used for production purposes as it lacks many security features and optimizations found in real blockchain implementations. 