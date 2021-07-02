import path from 'path';
import * as fs from 'fs';
import { ChainFactory, ChainType } from '@open-rights-exchange/chainjs'

function getChain(chain: string) {
  switch (chain) {
    case 'eos':
      return new ChainFactory().create(ChainType.EosV2, [])
    case 'ethereum':
      return new ChainFactory().create(ChainType.EthereumV1, [])
    case 'algorand':
      return new ChainFactory().create(ChainType.AlgorandV1, [])
    default:
      throw new Error('Invalid chain argument passed')
  }

}


async function start() {
  const filePath = process.argv[2]
  const password = process.argv[3] // TODO: make convert it to ask input runtime
  const rawdata = fs.readFileSync(filePath);
  const accountJson = JSON.parse(rawdata.toString())
  const { accountName, keys } = accountJson
  console.log('Recovery running for account: ', accountName)

  const decrypted = []
  for (const key of keys) {
    const { chain, privayeKeys } = key
    const chainjs = getChain(chain)
    const decryptedKey = privayeKeys.map((pk: any) => {
      const { privateKeyEncryped, privateKeyEncryptionSalt } = pk
      const decryptedPrivateKey = chainjs.decryptWithPassword(privateKeyEncryped, password, { salt: privateKeyEncryptionSalt })
      return { ...pk, decryptedPrivateKey }
    })
    decrypted.push(decryptedKey)
  }
  console.log(decrypted)

}

(async function () {
  await start()
})();
