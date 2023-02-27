import * as fcl from "@onflow/fcl";

export async function initializeAccount() {
  return fcl.mutate({
    cadence: INIT_ACCOUNT,
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 50,
  });
}

const INIT_ACCOUNT = `
import Grants from 0xGrants
import NonFungibleToken from 0xNonFungibleToken

transaction() {
    prepare(account: AuthAccount) {
        account.save<@NonFungibleToken.Collection>(<- Grants.createEmptyCollection(), to: Grants.GrantsStoragePath)
        account.link<&Grants.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, Grants.CollectionPublic}>(Grants.GrantsPublicPath, target: Grants.GrantsStoragePath)
        account.link<&Grants.Collection>(Grants.GrantsPrivatePath, target: Grants.GrantsStoragePath)
    }
}
`;

export async function registerGrant(name, duration) {
    return fcl.mutate({
      cadence: REGISTER_GRANT,
      args: (arg, t) => [arg(name, t.String), arg(duration, t.UFix64)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000,
    });
  }
  
  const REGISTER_GRANT = `
  import Grants from 0xGrants
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  
  transaction(name: String, duration: UFix64) {
      let nftReceiverCap: Capability<&{NonFungibleToken.Receiver}>
      let vault: @FungibleToken.Vault
      prepare(account: AuthAccount) {
          self.nftReceiverCap = account.getCapability<&{NonFungibleToken.Receiver}>(Grants.GrantsPublicPath)
          let vaultRef = account.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault) ?? panic("Could not borrow Flow token vault reference")
          let rentCost = Grants.getRentCost(name: name, duration: duration)
          self.vault <- vaultRef.withdraw(amount: rentCost)
      }
      execute {
          Grants.registerGrant(name: name, duration: duration, feeTokens: <- self.vault, receiver: self.nftReceiverCap)
      }
  }
  `;


  export async function fundGrant(name, duration) {
    return fcl.mutate({
      cadence: REGISTER_GRANT,
      args: (arg, t) => [arg(name, t.String), arg(duration, t.UFix64)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000,
    });
  }
  
  const FUND_GRANT = `
  import Grants from 0xGrants
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  
  transaction(name: String, duration: UFix64) {
      let nftReceiverCap: Capability<&{NonFungibleToken.Receiver}>
      let vault: @FungibleToken.Vault
      prepare(account: AuthAccount) {
          self.nftReceiverCap = account.getCapability<&{NonFungibleToken.Receiver}>(Grants.GrantsPublicPath)
          let vaultRef = account.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault) ?? panic("Could not borrow Flow token vault reference")
          let rentCost = Grants.getRentCost(name: name, duration: duration)
          self.vault <- vaultRef.withdraw(amount: rentCost)
      }
      execute {
          Grants.registerGrant(name: name, duration: duration, feeTokens: <- self.vault, receiver: self.nftReceiverCap)
      }
  }
  `;



// // Transfer Tokens

// import ExampleToken from 0x02

// // This transaction is a template for a transaction that
// // could be used by anyone to send tokens to another account
// // that owns a Vault
// transaction {

//   // Temporary Vault object that holds the balance that is being transferred
//   var temporaryVault: @ExampleToken.Vault

//   prepare(acct: AuthAccount) {
//     // withdraw tokens from your vault by borrowing a reference to it
//     // and calling the withdraw function with that reference
//     let vaultRef = acct.borrow<&ExampleToken.Vault>(from: /storage/CadenceFungibleTokenTutorialVault)
//         ?? panic("Could not borrow a reference to the owner's vault")
      
//     self.temporaryVault <- vaultRef.withdraw(amount: 10.0)
//   }

//   execute {
//     // get the recipient's public account object
//     let recipient = getAccount(0x02)

//     // get the recipient's Receiver reference to their Vault
//     // by borrowing the reference from the public capability
//     let receiverRef = recipient.getCapability(/public/CadenceFungibleTokenTutorialReceiver)
//                       .borrow<&ExampleToken.Vault{ExampleToken.Receiver}>()
//                       ?? panic("Could not borrow a reference to the receiver")

//     // deposit your tokens to their Vault
//     receiverRef.deposit(from: <-self.temporaryVault)

//     log("Transfer succeeded!")
//   }
// }





  export async function updateBioForGrant(nameHash, bio) {
    return fcl.mutate({
      cadence: UPDATE_BIO_FOR_GRANT,
      args: (arg, t) => [arg(nameHash, t.String), arg(bio, t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000,
    });
  }
  
  const UPDATE_BIO_FOR_GRANT = `
  import Grants from 0xGrants
  
  transaction(nameHash: String, bio: String) {
      var grant: &{Grants.GrantPrivate}
      prepare(account: AuthAccount) {
          var grant: &{Grants.GrantPrivate}? = nil
          let collectionPvt = account.borrow<&{Grants.CollectionPrivate}>(from: Grants.GrantsStoragePath) ?? panic("Could not load collection private")
  
          let id = Grants.nameHashToIDs[nameHash]
          if id == nil {
              panic("Could not find grant")
          }
  
          grant = collectionPvt.borrowGrantPrivate(id: id!)
          self.grant = grant!
      }
      execute {
          self.grant.setBio(bio: bio)
      }
  }
  `;

  export async function updateImgUrlForGrant(nameHash, imgurl) {
    return fcl.mutate({
      cadence: UPDATE_IMGURL_FOR_GRANT,
      args: (arg, t) => [arg(nameHash, t.String), arg(imgurl, t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000,
    });
  }
  
  const UPDATE_IMGURL_FOR_GRANT = `
  import Grants from 0xGrants
  
  transaction(nameHash: String, imgurl: String) {
      var grant: &{Grants.GrantPrivate}
      prepare(account: AuthAccount) {
          var grant: &{Grants.GrantPrivate}? = nil
          let collectionPvt = account.borrow<&{Grants.CollectionPrivate}>(from: Grants.GrantsStoragePath) ?? panic("Could not load collection private")
  
          let id = Grants.nameHashToIDs[nameHash]
          if id == nil {
              panic("Could not find grant")
          }
  
          grant = collectionPvt.borrowGrantPrivate(id: id!)
          self.grant = grant!
      }
      execute {
          self.grant.setImgUrl(imgurl: imgurl)
      }
  }
  `;



  export async function updateAddressForGrant(nameHash, addr) {
    return fcl.mutate({
      cadence: UPDATE_ADDRESS_FOR_GRANT,
      args: (arg, t) => [arg(nameHash, t.String), arg(addr, t.Address)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000,
    });
  }
  
  const UPDATE_ADDRESS_FOR_GRANT = `
  import Grants from 0xGrants
  
  transaction(nameHash: String, addr: Address) {
      var grant: &{Grants.GrantPrivate}
      prepare(account: AuthAccount) {
          var grant: &{Grants.GrantPrivate}? = nil
          let collectionPvt = account.borrow<&{Grants.CollectionPrivate}>(from: Grants.GrantsStoragePath) ?? panic("Could not load collection private")
  
          let id = Grants.nameHashToIDs[nameHash]
          if id == nil {
              panic("Could not find grant")
          }
  
          grant = collectionPvt.borrowGrantPrivate(id: id!)
          self.grant = grant!
      }
      execute {
          self.grant.setAddress(addr: addr)
      }
  }
  `;

  export async function renewGrant(name, duration) {
    return fcl.mutate({
      cadence: RENEW_GRANT,
      args: (arg, t) => [arg(name, t.String), arg(duration, t.UFix64)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000,
    });
  }
  
  const RENEW_GRANT = `
  import Grants from 0xGrants
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  
  transaction(name: String, duration: UFix64) {
    let vault: @FungibleToken.Vault
    var grant: &Grants.NFT
    prepare(account: AuthAccount) {
        let collectionRef = account.borrow<&{Grants.CollectionPublic}>(from: Grants.GrantsStoragePath) ?? panic("Could not borrow collection public")
        var grant: &Grants.NFT? = nil
        let collectionPrivateRef = account.borrow<&{Grants.CollectionPrivate}>(from: Grants.GrantsStoragePath) ?? panic("Could not borrow collection private")
  
        let nameHash = Grants.getGrantNameHash(name: name)
        let grantId = Grants.nameHashToIDs[nameHash]
        log(grantId)
        if grantId == nil {
            panic("You don't own this grant")
        }
  
        grant = collectionPrivateRef.borrowGrantPrivate(id: grantId!)
        self.grant = grant!
        let vaultRef = account.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault) ?? panic("Could not borrow Flow token vault reference")
        let rentCost = Grants.getRentCost(name: name, duration: duration)
        self.vault <- vaultRef.withdraw(amount: rentCost)
    }
    execute {
        Grants.renewGrant(grant: self.grant, duration: duration, feeTokens: <- self.vault)
    }
  }
  `;

  // export async function transferTokens(amount, recipient) {

  //   const transactionId = await fcl.mutate({
  //     cadence: TRANSFER_TOKENS,
  //     args: (arg, t) => [
  //       arg(parseFloat(amount).toFixed(2), t.UInt64),
  //       arg(recipient, t.Address)
  //     ],
  //     proposer: fcl.authz,
  //     payer: fcl.authz,
  //     authorizations: [fcl.authz],
  //     limit: 999
  //   });

  //   console.log('Transaction Id', transactionId);
  // }

  // const TRANSFER_TOKENS =`
  // import FungibleToken from 0xFungibleToken
  // import Grant from 0xGrants

  // transaction(amount: UInt64, recipient: Address) {
  //   let SentVault: @FungibleToken.Vault
  //   prepare(signer: AuthAccount) {
  //       let vaultRef = signer.borrow<&FungibleToken.Vault>(from: FungibleToken.VaultStoragePath)
  //                         ?? panic("Could not borrow reference to the owner's Vault!")

  //       self.SentVault <- vaultRef.withdraw(amount: amount)
  //   }

  //   execute {
  //       let receiverRef = getAccount(recipient).getCapability(FungibleToken.VaultReceiverPath)
  //                           .borrow<&FungibleToken.Vault{FungibleToken.Receiver}>()
  //                           ?? panic("Could not borrow receiver reference to the recipient's Vault")

  //       receiverRef.deposit(from: <-self.SentVault)
  //   }
  // }
  // `;


  export async function sendFlow(recepient, amount) {
    return fcl.mutate({
    cadence:SEND_FLOW,
    args : (arg, t) => [arg(recepient, t.Address), arg(amount, t.UFix64)],
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000,
});
}

const SEND_FLOW=`      
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFLOW

transaction(recepient: Address, amount: UFix64){
  prepare(signer: AuthAccount){
    let sender = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
      ?? panic("Could not borrow Provider reference to the Vault")

    let receiverAccount = getAccount(recepient)

    let receiver = receiverAccount.getCapability(/public/flowTokenReceiver)
      .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
      ?? panic("Could not borrow Receiver reference to the Vault")

            let tempVault <- sender.withdraw(amount: amount)
    receiver.deposit(from: <- tempVault)
  }
}
`;
 