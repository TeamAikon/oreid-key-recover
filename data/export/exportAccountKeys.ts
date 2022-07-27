import * as fs from 'fs'
import { createGuid, isNullOrEmpty } from 'aikon-js'
import { createServerContextAndInitServices } from '../../../server/server_init'
import { AccountType, ChainPlatformType, Context } from '../../../backend/models'
import { getChainPlatformTypeForChainNetwork } from '../../../backend/resolvers/helpers'
import { findOneMongo } from '../../../backend/services/mongo/resolvers'
import { CredentialData, WalletAccountAccount, WalletAccountAccountPermission } from '../../../backend/models/data'
import { asyncForEach } from '../../../backend/utils/helpers'
import { findWallet } from '../../../backend/resolvers/wallet'
import { getUserByAccountName } from '../../../backend/resolvers/user'
import { Chain, ChainFactory, ChainType } from '@open-rights-exchange/chainjs'

require('dotenv').config({ path: '../../../.env' })

const accountListFilePath = './exportAccounts_accountsToExport.json'

function getChain(chainPlatform: ChainPlatformType) {
  switch (chainPlatform) {
    case ChainPlatformType.eos:
      return new ChainFactory().create(ChainType.EosV2, [])
    case ChainPlatformType.ethereum:
      return new ChainFactory().create(ChainType.EthereumV1, [])
    case ChainPlatformType.algorand:
      return new ChainFactory().create(ChainType.AlgorandV1, [])
    default:
      throw new Error('Invalid chain argument passed')
  }
}

const aesDecryptWithPassword = getChain(ChainPlatformType.eos).decryptWithPassword

function getReEncryptionOptions(chainPlatform: ChainPlatformType) {
  switch (chainPlatform) {
    case ChainPlatformType.eos:
      return {
        iter: 1048576,
        salt: createGuid(),
      }
    case ChainPlatformType.ethereum:
      return {
        iter: 1048576,
        salt: createGuid(),
      }
    case ChainPlatformType.algorand:
      return {
        N: 1048576,
        salt: createGuid(),
      }
    default:
      throw new Error('Invalid chain argument passed')
  }
}

async function accountToPrivateKeysArray(
  context: Context,
  account: WalletAccountAccount,
  chainPlatform: ChainPlatformType,
) {
  const chain = getChain(chainPlatform)
  const privateKeys = await Promise.all(
    account.permissions.map(async (perm: WalletAccountAccountPermission) => {
      const { constants, mongo } = context
      const credential = await findOneMongo<CredentialData>({
        context,
        mongoObject: mongo.Credential,
        filter: { publicKey: perm.publicKey },
      })

      const {
        passwordEncrypted,
        passwordEncryptionMethod,
        privateKeyEncrypted,
        privateKeyEncryptionMethod,
      } = credential
      const passwordSalt = constants.SALT_MAPPING[passwordEncryptionMethod.salt]
      const passwordKey = constants.SALT_MAPPING[passwordEncryptionMethod.key]

      const decryptedPassword = aesDecryptWithPassword(chain.toSymEncryptedDataString(passwordEncrypted), passwordKey, {
        salt: passwordSalt,
      })
      const privateKeySalt = constants.SALT_MAPPING[privateKeyEncryptionMethod.salt]
      const decryptedKey = chain.decryptWithPassword(
        chain.toSymEncryptedDataString(privateKeyEncrypted),
        decryptedPassword,
        { salt: privateKeySalt },
      )
      const reEncryptionOptions = getReEncryptionOptions(chainPlatform)
      const reEncryptedKey = chain.encryptWithPassword(decryptedKey, decryptedPassword, reEncryptionOptions)

      return {
        publicKey: perm.publicKey,
        privateKeyEncrypted: reEncryptedKey,
        iterations: reEncryptionOptions.iter || reEncryptionOptions.N,
        salt: reEncryptionOptions.salt,
        // iterations: credential.privateKeyEncryptionMethod.iterations  //TODO: uncomment this line after iterations is added to privateKeyEncryptionMethod
      }
    }),
  )
  return privateKeys
}

async function accountsToChainsArray(context: Context, accounts: WalletAccountAccount[]) {
  const eosKeys: any[] = []
  const ethKeys: any[] = []
  const algoKeys: any[] = []

  await asyncForEach(accounts, async account => {
    if (account?.accountType !== AccountType.Native) return
    const chainPlatform = getChainPlatformTypeForChainNetwork(context, account.chainNetwork, true)
    const keys = await accountToPrivateKeysArray(context, account, chainPlatform)
    if (isNullOrEmpty(keys)) return
    const accountWithKeys = {
      chainAccount: account.accountName,
      chainNetwork: account.chainNetwork,
      keys,
    }
    if (chainPlatform === ChainPlatformType.eos) {
      eosKeys.push(accountWithKeys)
    } else if (chainPlatform === ChainPlatformType.ethereum) {
      ethKeys.push(accountWithKeys)
    } else if (chainPlatform === ChainPlatformType.algorand) {
      algoKeys.push(accountWithKeys)
    }
  })
  return { eosKeys, ethKeys, algoKeys }
}

/**  collect records to export */
async function writeAccounts(context: Context) {
  const accountListData = fs.readFileSync(accountListFilePath)
  const { accountNames } = JSON.parse(accountListData.toString())
  await asyncForEach(accountNames, async (accountName: string) => {
    const user = await getUserByAccountName(accountName as any, context)
    const email = user ? `_${user.email}` : ''
    const { accounts } = await findWallet({ filter: { accountName } }, context)
    const { eosKeys, ethKeys, algoKeys } = await accountsToChainsArray(context, accounts)
    const jsonToWrite: any = { walletAccountName: accountName, accounts: [] }
    if (!isNullOrEmpty(eosKeys)) jsonToWrite.accounts.push({ chain: 'EOS', chainAccounts: eosKeys })
    if (!isNullOrEmpty(ethKeys)) jsonToWrite.accounts.push({ chain: 'Ethereum', chainAccounts: ethKeys })
    if (!isNullOrEmpty(algoKeys)) jsonToWrite.accounts.push({ chain: 'Algorand', chainAccounts: algoKeys })
    fs.writeFileSync(
      `./exportedAccounts/oreid_key_export_${accountName}${email}.json`,
      JSON.stringify(jsonToWrite),
      'utf8',
    )
  })
}

/** run the export */
async function runExport() {
  const { env } = process
  const { globalContext } = await createServerContextAndInitServices(env)
  try {
    await writeAccounts(globalContext)
  } catch (error) {
    console.log('Error running export:', error)
  }
  process.exit()
}

/** Trigger migration start */
;(async () => await runExport())()
