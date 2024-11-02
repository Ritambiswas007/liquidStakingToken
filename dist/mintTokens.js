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
exports.sendNativeTokens = exports.burnTokens = exports.mintTokens = void 0;
exports.Respone_url = Respone_url;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
require('dotenv').config();
// Ensure privateKey is read from the .env file
const privateKey = process.env.private_Key;
if (!privateKey) {
    throw new Error('Private key not found in .env file');
}
// Create the connection and Keypair
const connection = new web3_js_1.Connection("https://solana-devnet.g.alchemy.com/v2/yjNuV3vlG-0t4DN6mYrauBTcwBGKXJLa");
const payer = web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
const mintAddress = new web3_js_1.PublicKey(process.env.TOKEN_MINT_ADDRESS);
const mintTokens = (toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get or create the recipient's associated token account
        const recipientTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mintAddress, // Address of the token mint
        toAddress);
        yield (0, spl_token_1.mintTo)(connection, payer, mintAddress, recipientTokenAccount.address, payer.publicKey, amount);
        console.log('Recipient token account:', recipientTokenAccount.address);
        // Add your logic for minting tokens (e.g., using `mintTo`)
    }
    catch (error) {
        console.error('Error minting tokens:', error);
    }
});
exports.mintTokens = mintTokens;
const burnTokens = (fromAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Burning tokens");
        const fromTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mintAddress, fromAddress);
        const token = new Token(connection, mintAddress, spl_token_1.TOKEN_PROGRAM_ID, payer);
        // Create a transaction to burn tokens
        const transaction = new web3_js_1.Transaction().add(token.createBurnInstruction(fromTokenAccount.address, amount, payer.publicKey, []));
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
        console.log('Tokens burned successfully. Signature:', signature);
    }
    catch (error) {
        console.error('Error burning tokens:', error);
    }
});
exports.burnTokens = burnTokens;
const sendNativeTokens = (toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a transaction to send native SOL
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: toAddress,
            lamports: amount, // Amount in lamports (1 SOL = 1,000,000,000 lamports)
        }));
        // Send and confirm the transaction
        //   const signature = await sendAndConfirmTransaction(connection, transaction, {
        //     signers: [payer],
        //   });
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
        console.log('Native tokens sent successfully. Signature:', signature);
    }
    catch (error) {
        console.error('Error sending native tokens:', error);
    }
});
exports.sendNativeTokens = sendNativeTokens;
function Respone_url() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://httpdump.app/inspect/0e9cbdb3-8100-4c0e-b2c5-09a2dc25f754");
        return response;
    });
}
