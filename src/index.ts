import path from 'path';


// oreid-backup.json
// accountName: 'ore...', // ore wallet account
// keys: [ 
//   {
//     chain: 'eos',
//     privateKeys: [
//       { account: chainAccount, 
//         encrytpedKey: { credentials from DB - publicKey, privateKeyEncrypted, privateKeyEncryptionSalt }
//       }  
//     ]
//   }
// ]

async function start() {

  // require command-line switch for --network (-n) 'algorand', 'eos', 'ethereum'
  // Prompt for user to enter password
  // load credential from local file - ./oreid-backup.json
  // loop through backup - create chainjs chain for chain type
  // -- foreach credential, chain.decryptWithPassword using password entered and salt in credential
  // for each key, display chain, account (chainAccount), public key, private key 

  // Enter you wallet password: nnnn
  // Your Keys:
  //    {chain}: account: {chainAccoutn}, public: {publicKey}, private: {privateKey}

  console.log('App typescript is running...')
}

( async function() {
  await start()
} )();
