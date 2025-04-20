export default class Wallet {
    constructor(seedPhrase = null) {
        if (seedPhrase) {
            this.seedPhrase = seedPhrase;
            this.privateKey = this.generatePrivateKeyFromSeed(seedPhrase);
        } else {
            this.seedPhrase = this.generateSeedPhrase();
            this.privateKey = this.generatePrivateKeyFromSeed(this.seedPhrase);
        }
        this.address = this.generateAddress();
    }

    static isValidAddress(address) {
        const parts = address.split('-');
        return parts.length === 4 && 
               parts[0] === 'SPW' && 
               parts[1].length === 8 && 
               parts[2].length === 8 && 
               parts[3].length === 8;
    }

    generateSeedPhrase() {
        const words = [];
        const wordList = [
            'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
            'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
            'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray',
            'yankee', 'zulu'
        ];
        
        for (let i = 0; i < 12; i++) {
            const randomIndex = Math.floor(Math.random() * wordList.length);
            words.push(wordList[randomIndex]);
        }
        
        return words.join(' ');
    }

    async generatePrivateKeyFromSeed(seedPhrase) {
        const encoder = new TextEncoder();
        const data = encoder.encode(seedPhrase);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async generateAddress() {
        const encoder = new TextEncoder();
        const data = encoder.encode(this.privateKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Split into three 8-character parts
        const part1 = hashHex.substring(0, 8);
        const part2 = hashHex.substring(8, 16);
        const part3 = hashHex.substring(16, 24);
        
        return `SPW-${part1}-${part2}-${part3}`;
    }

    async sign(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const combinedData = encoder.encode(hashHex + this.privateKey);
        const signatureBuffer = await crypto.subtle.digest('SHA-256', combinedData);
        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verify(data, signature) {
        const expectedSignature = await this.sign(data);
        return signature === expectedSignature;
    }

    static async fromSeedPhrase(seedPhrase) {
        const wallet = new Wallet(seedPhrase);
        wallet.address = await wallet.generateAddress();
        return wallet;
    }
} 