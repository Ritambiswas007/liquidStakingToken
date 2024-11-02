"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const mintTokens_1 = require("./mintTokens");
const web3_js_1 = require("@solana/web3.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
const helius_response2 = {
    "transfer": {
        "from": "AMgq6vKryhW9cd2qvdhGKHQkEFb52g4yaWr8kyReGhc1",
        "to": "6kb9ZhjAApnhirNs5Lvn7WfsPUhHvtTxmWEjHQ1aDQNg",
        "amount": 80,
        "token": {
            "mint": "7SZi1xKP7h5HU7y2zUgPjSysQpoPKEWfTM5bnYN3cmFr",
            "tokenStandard": "Fungible"
        },
        "fee": 15001,
        "feePayer": "AMgq6vKryhW9cd2qvdhGKHQkEFb52g4yaWr8kyReGhc1",
        "timestamp": 1730573874,
        "signature": "49FhmRhq3WtGAeU4wXbevxjVhHkwQEkc9uknS4amVUFeQDpEJzqPHrMixqpDChiHm4mrPfUM9hKDWTLddRhVfDf5",
        "slot": 337299104
    }
};
// Route to handle incoming transfers
app.post('/helius', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incomingTx = helius_response1.nativeTransfers.find(x => x.toUserAccount === vault);
        if (!incomingTx) {
            return;
        }
        const fromAddress = new web3_js_1.PublicKey(incomingTx.fromUserAccount);
        const toAddress = new web3_js_1.PublicKey(vault);
        const amount = incomingTx.amount;
        // Mint tokens for the user
        yield (0, mintTokens_1.mintTokens)(toAddress, amount);
        // Optionally, send native SOL to the fromAddress
        yield (0, mintTokens_1.sendNativeTokens)(fromAddress, amount);
        res.status(200).json({ msg: "Transaction successful and tokens minted." });
    }
    catch (error) {
        console.error("Error processing transaction:", error);
        res.status(500).json({ msg: "Transaction failed" });
    }
}));
// Route to burn tokens
app.post('/burn', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incomingTx = helius_response1.nativeTransfers.find(x => x.toUserAccount === vault);
        if (!incomingTx) {
            return;
        }
        const fromAddress = new web3_js_1.PublicKey(incomingTx.fromUserAccount);
        const amount = incomingTx.amount; // The amount of custom tokens to burn
        const toAddress = new web3_js_1.PublicKey(vault); // The vault address where burned tokens are sent
        // Burn the custom tokens
        yield (0, mintTokens_1.burnTokens)(fromAddress, toAddress, amount);
        // Send equivalent SOL back to the user
        yield (0, mintTokens_1.sendNativeTokens)(fromAddress, amount); // Assuming `amount` is the correct amount of SOL to send
        res.status(200).json({ msg: "Tokens burned successfully and SOL returned." });
    }
    catch (error) {
        console.error("Error burning tokens:", error);
        res.status(500).json({ msg: "Burning tokens failed" });
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
