import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
    burn,
    
    TOKEN_PROGRAM_ID,
    
    
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import axios from "axios";
  require('dotenv').config();
  
  // Ensure privateKey is read from the .env file
  const privateKey = process.env.private_Key;
  if (!privateKey) {
    throw new Error('Private key not found in .env file');
  }
  
  // Create the connection and Keypair
  const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/yjNuV3vlG-0t4DN6mYrauBTcwBGKXJLa");
  const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
  const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);
  
  export const mintTokens = async (toAddress: PublicKey, amount: number) => {
    try {
      // Get or create the recipient's associated token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintAddress, // Address of the token mint
        toAddress, // Recipient's public key
     
      );


      await mintTo(
        connection,
        payer,
        mintAddress,
        recipientTokenAccount.address,
        payer.publicKey,
        amount

      )
  
      console.log('Recipient token account:', recipientTokenAccount.address);
      // Add your logic for minting tokens (e.g., using `mintTo`)
    } catch (error) {
      console.error('Error minting tokens:', error);
    }
  };
  

  export const burnTokens = async (fromAddress: PublicKey, amount: number) => {
    try {
      console.log("Burning tokens");
  
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintAddress,
        fromAddress,
      );
      const token = new Token(connection, mintAddress, TOKEN_PROGRAM_ID, payer);
  
      // Create a transaction to burn tokens
      const transaction = new Transaction().add(
        token.createBurnInstruction(
          fromTokenAccount.address,
          amount,
          payer.publicKey,
          []
        )
      );
      const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
      console.log('Tokens burned successfully. Signature:', signature);
    } catch (error) {
      console.error('Error burning tokens:', error);
    }
  };
  export const sendNativeTokens = async (toAddress: PublicKey, amount: number) => {
    try {
      // Create a transaction to send native SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: toAddress,
          lamports: amount, // Amount in lamports (1 SOL = 1,000,000,000 lamports)
        })
      );
  
      // Send and confirm the transaction
    //   const signature = await sendAndConfirmTransaction(connection, transaction, {
    //     signers: [payer],
    //   });
    const signature=await sendAndConfirmTransaction(connection,transaction,[payer])
  
      console.log('Native tokens sent successfully. Signature:', signature);
    } catch (error) {
      console.error('Error sending native tokens:', error);
    }
  };


  export async function Respone_url(){
    const response =await axios.get("https://httpdump.app/inspect/0e9cbdb3-8100-4c0e-b2c5-09a2dc25f754");


    return response;
  }