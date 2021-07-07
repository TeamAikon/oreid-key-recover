import path from 'path';
import * as fs from 'fs';
import { ChainFactory, ChainType } from '@open-rights-exchange/chainjs'

import reader from 'readline-sync'



function getChain(chain: string) {
  switch (chain) {
    case 'EOS':
      return new ChainFactory().create(ChainType.EosV2, [])
    case 'Ethereum':
      return new ChainFactory().create(ChainType.EthereumV1, [])
    case 'Algorand':
      return new ChainFactory().create(ChainType.AlgorandV1, [])
    default:
      throw new Error('Invalid chain argument passed')
  }
}

function getOptionsForChain(iterations: number, salt: string, chain: string) {
  switch (chain) {
    case 'EOS':
      return {
        iter: iterations,
        salt
      }
    case 'Ethereum':
      return {
        iter: iterations,
        salt
      }
    case 'Algorand':
      return {
        N: iterations,
        salt
      }
    default:
      throw new Error('Invalid chain argument passed')
  }
}



async function start() {
  const filePath = process.argv[2]

  try{
    const rawdata = fs.readFileSync(filePath);
    const accountJson = JSON.parse(rawdata.toString())
    const { walletAccountName, accounts } = accountJson
    console.log('Recovery running for account: ', walletAccountName)
  
    const password = reader.question("Password: ",{ hideEchoBack: true });
    console.log('Your Keys:')
    const decrypted = []
    for (const account of accounts) {
      const { chain, chainAccounts } = account
      console.log('\nChain ==> ', (chain as string).toUpperCase())
      const chainjs = getChain(chain)
      const decryptedKey = chainAccounts.map((chAcc: any) => {
        const { chainAccount, keys, chainNetwork } = chAcc
        console.log(` Chain Account: ${chainAccount} (network: ${chainNetwork})`)
        keys.forEach( (key: any) => {
          const { publicKey, privateKeyEncrypted, iterations, salt } = key 
          const encrypOptions = getOptionsForChain(iterations, salt, chain)
          const decryptedPrivateKey = chainjs.decryptWithPassword(chainjs.toSymEncryptedDataString(privateKeyEncrypted), password, encrypOptions)
          console.log('     Public Key: ', publicKey)
          console.log('     Private Key: ', decryptedPrivateKey)
        });
      })
    }
  } catch (error) {
    console.log(error)
  }
}

(async function () {
  await start()
})();
