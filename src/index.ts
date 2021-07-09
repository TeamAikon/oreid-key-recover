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
  const [, , fileNameArg] = process.argv
  let accountJson
  let accounts
  if (!fileNameArg) {
    console.log('Please include a filename. Example: oreid-key-recover oreid-backup.json')
    process.exit()
  }

  if (!fs.existsSync(fileNameArg)) {
    console.log(`Cant find file ${fileNameArg}`)
    process.exit()
  }

  try {
    const rawdata = fs.readFileSync(fileNameArg);
    const accountJson = JSON.parse(rawdata.toString())
    ;({ accounts } = accountJson)
    if(!accounts) throw new Error('Bad format')
  }
  catch (error) {
    console.log(`Problem: Cant find backup info in ${fileNameArg}. Make sure it is an ORE ID export file (JSON format)`)
    process.exit()
  }

  try{
    const password = reader.question("ORE ID Wallet Password: ", { hideEchoBack: true });
    console.log('accounts:', accounts)
    console.log('Your Keys:')
    // decrypt and show keys
    for (const account of accounts) {
      const { chain, chainAccounts } = account
      console.log('\nChain ==> ', (chain as string).toUpperCase())
      const chainjs = getChain(chain)
      chainAccounts.map((chAcc: any) => {
        const { chainAccount, keys, chainNetwork } = chAcc
        console.log(` Chain Account: ${chainAccount} (network: ${chainNetwork})`)
        keys.forEach( (key: any) => {
          const { publicKey, privateKeyEncrypted, iterations, salt } = key 
          const encrypOptions = getOptionsForChain(iterations, salt, chain)
          let decryptedPrivateKey
          try {
            decryptedPrivateKey = chainjs.decryptWithPassword(chainjs.toSymEncryptedDataString(privateKeyEncrypted), password, encrypOptions)
          } catch(error) {
            console.log('Problem: Cant decrypt at least one backup key. Make sure your password is correct')
            process.exit()
          }
          console.log('     Private Key: ', decryptedPrivateKey)
        });
      })
    }
  } catch (error) {
    console.log(`Problem: Something happened trying to recover backup`)
    console.log(error)
  }
}

(async function () {
  await start()
})()
