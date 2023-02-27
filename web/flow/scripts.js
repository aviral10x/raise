import * as fcl from "@onflow/fcl";

export async function checkIsInitialized(addr) {
  return fcl.query({
    cadence: IS_INITIALIZED,
    args: (arg, t) => [arg(addr, t.Address)],
  });
}

const IS_INITIALIZED = `
import Grants from 0xGrants
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address): Bool {
    let capability = getAccount(account).getCapability<&Grants.Collection{NonFungibleToken.CollectionPublic, Grants.CollectionPublic}>(Grants.GrantsPublicPath)
    return capability.check()
}
`;

export async function getAllGrantInfos() {
    return fcl.query({
      cadence: GET_ALL_GRANT_INFOS,
    });
  }
  
  const GET_ALL_GRANT_INFOS = `
  import Grants from 0xGrants
  
  pub fun main(): [Grants.GrantInfo] {
      let allOwners = Grants.getAllOwners()
      let infos: [Grants.GrantInfo] = []
  
      for nameHash in allOwners.keys {
          let publicCap = getAccount(allOwners[nameHash]!).getCapability<&Grants.Collection{Grants.CollectionPublic}>(Grants.GrantsPublicPath)
          let collection = publicCap.borrow()!
          let id = Grants.nameHashToIDs[nameHash]
          if id != nil {
              let grant = collection.borrowGrant(id: id!)
              let grantInfo = grant.getInfo()
              infos.append(grantInfo)
          }
      }
  
      return infos
  }
  `;

  export async function checkIsAvailable(name) {
    return fcl.query({
      cadence: CHECK_IS_AVAILABLE,
      args: (arg, t) => [arg(name, t.String)],
    });
  }
  
  const CHECK_IS_AVAILABLE = `
  import Grants from 0xGrants
  
  pub fun main(name: String): Bool {
    return Grants.isAvailable(nameHash: name)
  }
  `;
  
  export async function getRentCost(name, duration) {
    return fcl.query({
      cadence: GET_RENT_COST,
      args: (arg, t) => [arg(name, t.String), arg(duration, t.UFix64)],
    });
  }
  
  const GET_RENT_COST = `
  import Grants from 0xGrants
  
  pub fun main(name: String, duration: UFix64): UFix64 {
    return Grants.getRentCost(name: name, duration: duration)
  }
  `;



//   export async function getVaultBalance() {
//     return fcl.query({
//       cadence: GET_VAULT_BALANCE,
//     });
//   }

//   const GET_VAULT_BALANCE = `
//   import Grants from 0xGrants

//   let cap = self.account.getCapability<&Grants.Registrar{Grants.RegistrarPublic}>(Grants.RegistrarPublicPath)
//     let registrar = cap.borrow() ?? panic("Could not borrow registrar public")
//     return self.rentVault.balance
  
//   `
  export async function getMyGrantInfos(addr) {
    return fcl.query({
      cadence: GET_MY_GRANT_INFOS,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  }
  
  const GET_MY_GRANT_INFOS = `
  import Grants from 0xGrants
  import NonFungibleToken from 0xNonFungibleToken
  
  pub fun main(account: Address): [Grants.GrantInfo] {
      let capability = getAccount(account).getCapability<&Grants.Collection{NonFungibleToken.CollectionPublic, Grants.CollectionPublic}>(Grants.GrantsPublicPath)
      let collection = capability.borrow() ?? panic("Collection capability could not be borrowed")
  
      let ids = collection.getIDs()
      let infos: [Grants.GrantInfo] = []
  
      for id in ids {
          let grant = collection.borrowGrant(id: id!)
          let grantInfo = grant.getInfo()
          infos.append(grantInfo)
      }
  
      return infos
  }
  `;

  export async function getGrantInfoByNameHash(addr, nameHash) {
  return fcl.query({
    cadence: GET_GRANT_BY_NAMEHASH,
    args: (arg, t) => [arg(addr, t.Address), arg(nameHash, t.String)],
  });
}

const GET_GRANT_BY_NAMEHASH = `
import Grants from 0xGrants
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address, nameHash: String): Grants.GrantInfo {
  let capability = getAccount(account).getCapability<&Grants.Collection{NonFungibleToken.CollectionPublic, Grants.CollectionPublic}>(Grants.GrantsPublicPath)
  let collection = capability.borrow() ?? panic("Collection capability could not be borrowed")

  let id = Grants.nameHashToIDs[nameHash]
  if id == nil {
    panic("Grant not found")
  }

  let grant = collection.borrowGrant(id: id!)
  let grantInfo = grant.getInfo()
  return grantInfo
}
`;

export async function getFlowBalance(addr) {
    return fcl.query({
    cadence :GET_FLOW_BALANCE,
    args: (arg, t) => [arg(addr, t.Address)],
   
  });
}

  const GET_FLOW_BALANCE=` import FlowToken from 0xFLOW
  import FungibleToken from 0xFungibleToken

  pub fun main(address: Address): UFix64 {
    let account = getAccount(address)

    let vaultRef = account.getCapability(/public/flowTokenBalance)
      .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
      ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
  }`