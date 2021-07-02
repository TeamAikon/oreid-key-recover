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

  console.log('Wallet Password: xxxxxxxxxxx')
  console.log('Your Keys:')
  console.log(' Ethereum account: 0x8ddf39087300d92e27aa1be7fe87d1ea5f40c67f')
  console.log('       public key: 0xf95d091f8d3a62ba669d782ac6f6f19f80a57b991662c251a20f71923573c3d30c79834fd7ab7a3c7400b4682698b5388715d36b2f972488881c140785ca9bda')
  console.log('       private key: abcd...')
  console.log(' Algorand account: RIITJYWQGHYDXHX2COX7DIVUUBSYLO3J4NG7MM3BFTY4OVJZV7STHLQ664')
  console.log('       public key: 8a1134e2d031f03b9efa13aff1a2b4a06585bb69e34df633612cf1c75539afe5')
  console.log('       private key: xyz...')

   // Your Keys:
  //    {chain}: account: {chainAccoutn}, public: {publicKey}, private: {privateKey}
}

( async function() {
  await start()
} )();
