require('dotenv').config();
import express, { Request, Response } from 'express';
import { burnTokens, mintTokens, sendNativeTokens } from './mintTokens';
import { PublicKey } from '@solana/web3.js';

const app = express();
app.use(express.json());

const vault = "6kb9ZhjAApnhirNs5Lvn7WfsPUhHvtTxmWEjHQ1aDQNg";
const helius_response1 = {
    "nativeTransfers": [{
        "amount": 100000,
        "fromUserAccount": "AMgq6vKryhW9cd2qvdhGKHQkEFb52g4yaWr8kyReGhc1",
        "toUserAccount": vault
    }],
    "signature": "5XVFceuZsuQkBX3puUXFR8DfDcbHKrMEKWo4XCYJ2Ks7yUUxk696UDigpz5pTpGcop354T6V9RWNANfcN9wEieFr",
    "slot": 337280248,
    "source": "SYSTEM_PROGRAM",
    "timestamp": 1730566745,
    "tokenTransfers": [],
    "transactionError": null,
    "type": "TRANSFER"
};
const helius_response2={
    "transfer": {
      "from": "AMgq6vKryhW9cd2qvdhGKHQkEFb52g4yaWr8kyReGhc1",
      "to": "6kb9ZhjAApnhirNs5Lvn7WfsPUhHvtTxmWEjHQ1aDQNg",
      "amount": 80,
      "token": {
        "mint": "7SZi1xKP7h5HU7y2zUgPjSysQpoPKEWfTM5bnYN3cmFr",
        "tokenStandard": "Fungible"
      },
    }
  
  };

// Route to handle incoming transfers
app.post('/helius', async (req: Request, res: Response) => {
    try {
        const incomingTx = helius_response1.nativeTransfers.find(x => x.toUserAccount === vault);
        
        if (!incomingTx) {
            return
        }

        const fromAddress = new PublicKey(incomingTx.fromUserAccount);
        const toAddress = new PublicKey(vault);
        const amount = incomingTx.amount;

        // Mint tokens for the user
        await mintTokens(toAddress, amount);

        // Optionally, send native SOL to the fromAddress
        // await sendNativeTokens(fromAddress, amount);

        res.status(200).json({ msg: "Transaction successful and tokens minted." });
    } catch (error) {
        console.error("Error processing transaction:", error);
        res.status(500).json({ msg: "Transaction failed" });
    }
});

// Route to burn tokens
app.post('/burn', async (req: Request, res: Response) => {
    try {
        const incomingTx = helius_response1.nativeTransfers.find(x => x.toUserAccount === vault);

        if (!incomingTx) {
            return 
        }

        const fromAddress = new PublicKey(incomingTx.fromUserAccount);
        const amount = incomingTx.amount; // The amount of custom tokens to burn

        const toAddress = new PublicKey(vault); // The vault address where burned tokens are sent

        // Burn the custom tokens
        await burnTokens(fromAddress, toAddress, amount);

        // Send equivalent SOL back to the user
        await sendNativeTokens(fromAddress, amount); // Assuming `amount` is the correct amount of SOL to send

        res.status(200).json({ msg: "Tokens burned successfully and SOL returned." });
    } catch (error) {
        console.error("Error burning tokens:", error);
        res.status(500).json({ msg: "Burning tokens failed" });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
