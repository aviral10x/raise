import FungibleToken from "./interfaces/FungibleToken.cdc"
import NonFungibleToken from "./interfaces/NonFungibleToken.cdc"
import FlowToken from "./tokens/FlowToken.cdc"

pub contract Grants: NonFungibleToken {
  pub let forbiddenChars: String
  pub let owners: {String: Address}
  pub let expirationTimes: {String: UFix64}
  pub let nameHashToIDs: {String: UInt64}
  pub var totalSupply: UInt64

  pub let GrantsStoragePath: StoragePath
  pub let GrantsPrivatePath: PrivatePath
  pub let GrantsPublicPath: PublicPath
  pub let RegistrarStoragePath: StoragePath
  pub let RegistrarPrivatePath: PrivatePath
  pub let RegistrarPublicPath: PublicPath

  pub event ContractInitialized()
  pub event GrantBioChanged(nameHash: String, bio: String)
  pub event GrantImgUrlChanged(nameHash: String, imgurl: String)
  pub event GrantAddressChanged(nameHash: String, address: Address)
  pub event Withdraw(id: UInt64, from: Address?)
  pub event Deposit(id: UInt64, to: Address?)
  pub event GrantMinted(id: UInt64, name: String, nameHash: String, expiresAt: UFix64, receiver: Address)
  pub event GrantRenewed(id: UInt64, name: String, nameHash: String, expiresAt: UFix64, receiver: Address)

  init() {
    self.owners = {}
    self.expirationTimes = {}
    self.nameHashToIDs = {}

    self.forbiddenChars = "!@#$%^&*()<>?/"
    self.totalSupply = 0

    self.GrantsStoragePath = StoragePath(identifier: "flowGrants") ?? panic("Could not set storage path")
    self.GrantsPrivatePath = PrivatePath(identifier: "flowGrants") ?? panic("Could not set private path")
    self.GrantsPublicPath = PublicPath(identifier: "flowGrants") ?? panic("Could not set public path")

    self.RegistrarStoragePath = StoragePath(identifier: "Registrar") ?? panic("Could not set storage path")
    self.RegistrarPrivatePath = PrivatePath(identifier: "flowRegistrar") ?? panic("Could not set private path")
    self.RegistrarPublicPath = PublicPath(identifier: "flowRegistrar") ?? panic("Could not set public path")


    self.account.save(<- self.createEmptyCollection(), to: Grants.GrantsStoragePath)
    self.account.link<&Grants.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, Grants.CollectionPublic}>(self.GrantsPublicPath, target: self.GrantsStoragePath)
    self.account.link<&Grants.Collection>(self.GrantsPrivatePath, target: self.GrantsStoragePath)

    let collectionCapability = self.account.getCapability<&Grants.Collection>(self.GrantsPrivatePath)
    let vault <- FlowToken.createEmptyVault()
    let registrar <- create Registrar(vault: <- vault, collection: collectionCapability)
    self.account.save(<- registrar, to: self.RegistrarStoragePath)
    self.account.link<&Grants.Registrar{Grants.RegistrarPublic}>(self.RegistrarPublicPath, target: self.RegistrarStoragePath)
    self.account.link<&Grants.Registrar>(self.RegistrarPrivatePath, target: self.RegistrarStoragePath)

    emit ContractInitialized()
  }

  pub struct GrantInfo {
    pub let id: UInt64
    pub let owner: Address
    pub let name: String
    pub let nameHash: String
    pub let expiresAt: UFix64
    pub let address: Address?
    pub let bio: String
    pub let createdAt: UFix64
    pub let imgurl: String

    init(
      id: UInt64,
      owner: Address,
      name: String,
      nameHash: String,
      expiresAt: UFix64,
      address: Address?,
      bio: String,
      createdAt: UFix64,
      imgurl: String
    ) {
      self.id = id
      self.owner = owner
      self.name = name
      self.nameHash = nameHash
      self.expiresAt = expiresAt
      self.address = address
      self.bio = bio
      self.createdAt = createdAt
      self.imgurl = imgurl
    }
  }

  pub resource interface GrantPublic {
    pub let id: UInt64
    pub let name: String
    pub let nameHash: String
    pub let createdAt: UFix64

    pub fun getBio(): String
    pub fun getAddress(): Address?
    pub fun getGrantName(): String
    pub fun getInfo(): GrantInfo
    pub fun getImgUrl() : String
  }

  pub resource interface GrantPrivate {
    pub fun setBio(bio: String)
    pub fun setAddress(addr: Address)
    pub fun setImgUrl(imgurl: String)

  }
  
  pub resource NFT: GrantPublic, GrantPrivate, NonFungibleToken.INFT {
    pub let id: UInt64
    pub let name: String
    pub let nameHash: String
    pub let createdAt: UFix64

    access(self) var address: Address?
    access(self) var bio: String
    access(self) var imgurl: String



    init(id: UInt64, name: String, nameHash: String) {
      self.id = id
      self.name = name
      self.nameHash = nameHash
      self.createdAt = getCurrentBlock().timestamp
      self.address = nil
      self.bio = ""
      self.imgurl = ""
    }

    pub fun getBio(): String {
      return self.bio
    }

    pub fun setBio(bio: String) {
      pre {
        Grants.isExpired(nameHash: self.nameHash) == false : "Grant is expired"
      }
      self.bio = bio
      emit GrantBioChanged(nameHash: self.nameHash, bio: bio)
    }

      pub fun getImgUrl(): String {
      return self.imgurl
    }

    pub fun setImgUrl(imgurl: String) {
      pre {
        Grants.isExpired(nameHash: self.nameHash) == false : "Grant is expired"
      }
      self.imgurl = imgurl
      emit GrantImgUrlChanged(nameHash: self.nameHash, imgurl: imgurl)
    }


    pub fun getAddress(): Address? {
      return self.address
    }

    pub fun setAddress(addr: Address) {
      pre {
        Grants.isExpired(nameHash: self.nameHash) == false : "Grant is expired"
      }

      self.address = addr
      emit GrantAddressChanged(nameHash: self.nameHash, address: addr)
    }

    pub fun getGrantName(): String {
      return self.name
    }

    pub fun getInfo(): GrantInfo {
      let owner = Grants.owners[self.nameHash]!

      return GrantInfo(
        id: self.id,
        owner: owner,
        name: self.name,
        nameHash: self.nameHash,
        expiresAt: Grants.expirationTimes[self.nameHash]!,
        address: self.address,
        bio: self.bio,
        createdAt: self.createdAt,
        imgurl: self.imgurl
      )
    }
  }

  pub resource interface CollectionPublic {
    pub fun borrowGrant(id: UInt64): &{Grants.GrantPublic}
  }

  pub resource interface CollectionPrivate {
    access(account) fun mintGrant(name: String, nameHash: String, expiresAt: UFix64, receiver: Capability<&{NonFungibleToken.Receiver}>)
    pub fun borrowGrantPrivate(id: UInt64): &Grants.NFT
  }

  pub resource Collection: CollectionPublic, CollectionPrivate, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
    pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    init() {
      self.ownedNFTs <- {}
    }

    // NonFungibleToken.Provider
    pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
      let grant <- self.ownedNFTs.remove(key: withdrawID) ?? panic("NFT not found in collection")
      emit Withdraw(id: grant.id, from: self.owner?.address)
      return <-grant
    }

    // NonFungibleToken.Receiver
    pub fun deposit(token: @NonFungibleToken.NFT) {
      let grant <- token as! @Grants.NFT
      let id = grant.id
      let nameHash = grant.nameHash

      if Grants.isExpired(nameHash: nameHash) {
        panic("Grant is expired")
      }

      Grants.updateOwner(nameHash: nameHash, address: self.owner!.address)

      let oldToken <- self.ownedNFTs[id] <- grant
      emit Deposit(id: id, to: self.owner?.address)

      destroy oldToken
    }

    // NonFungibleToken.CollectionPublic
    pub fun getIDs(): [UInt64] {
      return self.ownedNFTs.keys
    }

    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
      return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
    }

    // Grants.CollectionPublic
    pub fun borrowGrant(id: UInt64): &{Grants.GrantPublic} {
      pre {
        self.ownedNFTs[id] != nil : "Grant does not exist"
      }

      let token = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
      return token as! &Grants.NFT
    }

    // Grants.CollectionPrivate
    access(account) fun mintGrant(name: String, nameHash: String, expiresAt: UFix64, receiver: Capability<&{NonFungibleToken.Receiver}>){
      pre {
        Grants.isAvailable(nameHash: nameHash) : "Grant not available"
      }

      let grant <- create Grants.NFT(
        id: Grants.totalSupply,
        name: name,
        nameHash: nameHash
      )

      Grants.updateOwner(nameHash: nameHash, address: receiver.address)
      Grants.updateExpirationTime(nameHash: nameHash, expTime: expiresAt)
      Grants.updateNameHashToID(nameHash: nameHash, id: grant.id)
      Grants.totalSupply = Grants.totalSupply + 1

      emit GrantMinted(id: grant.id, name: name, nameHash: nameHash, expiresAt: expiresAt, receiver: receiver.address)

      receiver.borrow()!.deposit(token: <- grant)
    }

    pub fun borrowGrantPrivate(id: UInt64): &Grants.NFT {
      pre {
        self.ownedNFTs[id] != nil: "grant doesn't exist"
      }
      let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
      return ref as! &Grants.NFT
    }

    destroy() {
      destroy self.ownedNFTs
    }
  }

  pub resource interface RegistrarPublic {
    pub let minRentDuration: UFix64
    pub let maxGrantLength: Int
    pub let prices: {Int: UFix64}

    pub fun renewGrant(grant: &Grants.NFT, duration: UFix64, feeTokens: @FungibleToken.Vault)
    pub fun registerGrant(name: String, duration: UFix64, feeTokens: @FungibleToken.Vault, receiver: Capability<&{NonFungibleToken.Receiver}>)
    pub fun getPrices(): {Int: UFix64}
    pub fun getVaultBalance(): UFix64
  }

  pub resource interface RegistrarPrivate {
    pub fun updateRentVault(vault: @FungibleToken.Vault)
    pub fun withdrawVault(receiver: Capability<&{FungibleToken.Receiver}>, amount: UFix64)
    pub fun setPrices(key: Int, val: UFix64)
  }

  pub resource Registrar: RegistrarPublic, RegistrarPrivate {
    pub let minRentDuration: UFix64
    pub let maxGrantLength: Int
    pub let prices: {Int: UFix64}

    priv var rentVault: @FungibleToken.Vault
    access(account) var grantsCollection: Capability<&Grants.Collection>

    init(vault: @FungibleToken.Vault, collection: Capability<&Grants.Collection>) {
      self.minRentDuration = UFix64(365 * 24 * 60 * 60)
      self.maxGrantLength = 30
      self.prices = {}

      self.rentVault <- vault
      self.grantsCollection = collection
    }

    pub fun renewGrant(grant: &Grants.NFT, duration: UFix64, feeTokens: @FungibleToken.Vault) {
      var len = grant.name.length
      if len > 10 {
        len = 10
      }

      let price = self.getPrices()[len]

      if duration < self.minRentDuration {
        panic("Grant must be registered for at least the minimum duration: ".concat(self.minRentDuration.toString()))
      }

      if price == 0.0 || price == nil {
        panic("Price has not been set for this length of grant")
      }

      let rentCost = price! * duration
      let feeSent = feeTokens.balance

      if feeSent < rentCost {
        panic("You did not send enough FLOW tokens. Expected: ".concat(rentCost.toString()))
      }

      self.rentVault.deposit(from: <- feeTokens)

      let newExpTime = Grants.getExpirationTime(nameHash: grant.nameHash)! + duration
      Grants.updateExpirationTime(nameHash: grant.nameHash, expTime: newExpTime)

      emit GrantRenewed(id: grant.id, name: grant.name, nameHash: grant.nameHash, expiresAt: newExpTime, receiver: grant.owner!.address)
    }

    pub fun registerGrant(name: String, duration: UFix64, feeTokens: @FungibleToken.Vault, receiver: Capability<&{NonFungibleToken.Receiver}>) {
      pre {
        name.length <= self.maxGrantLength : "Grant name is too long"
      }

      let nameHash = Grants.getGrantNameHash(name: name)
      
      if Grants.isAvailable(nameHash: nameHash) == false {
        panic("Grant is not available")
      }

      var len = name.length
      if len > 10 {
        len = 10
      }

      let price = self.getPrices()[len]

      if duration < self.minRentDuration {
        panic("Grant must be registered for at least the minimum duration: ".concat(self.minRentDuration.toString()))
      }

      if price == 0.0 || price == nil {
        panic("Price has not been set for this length of grant")
      }

      let rentCost = price! * duration
      let feeSent = feeTokens.balance

      if feeSent < rentCost {
        panic("You did not send enough FLOW tokens. Expected: ".concat(rentCost.toString()))
      }

      self.rentVault.deposit(from: <- feeTokens)

      let expirationTime = getCurrentBlock().timestamp + duration

      self.grantsCollection.borrow()!.mintGrant(name: name, nameHash: nameHash, expiresAt: expirationTime, receiver: receiver)

      // Event is emitted from mintGrant ^
    }

    pub fun getPrices(): {Int: UFix64} {
      return self.prices
    }

    pub fun getVaultBalance(): UFix64 {
      return self.rentVault.balance
    }

    pub fun updateRentVault(vault: @FungibleToken.Vault) {
      pre {
        self.rentVault.balance == 0.0 : "Withdraw balance from old vault before updating"
      }

      let oldVault <- self.rentVault <- vault
      destroy oldVault
    }

    pub fun withdrawVault(receiver: Capability<&{FungibleToken.Receiver}>, amount: UFix64) {
      let vault = receiver.borrow()!
      vault.deposit(from: <- self.rentVault.withdraw(amount: amount))
    }

    pub fun setPrices(key: Int, val: UFix64) {
      self.prices[key] = val
    }

    destroy() {
      destroy self.rentVault
    }
  }

  // Global Functions
  pub fun createEmptyCollection(): @NonFungibleToken.Collection {
    let collection <- create Collection()
    return <- collection
  }

  pub fun registerGrant(name: String, duration: UFix64, feeTokens: @FungibleToken.Vault, receiver: Capability<&{NonFungibleToken.Receiver}>) {
    let cap = self.account.getCapability<&Grants.Registrar{Grants.RegistrarPublic}>(self.RegistrarPublicPath)
    let registrar = cap.borrow() ?? panic("Could not borrow registrar")
    registrar.registerGrant(name: name, duration: duration, feeTokens: <- feeTokens, receiver: receiver)
  }

  pub fun renewGrant(grant: &Grants.NFT, duration: UFix64, feeTokens: @FungibleToken.Vault) {
    let cap = self.account.getCapability<&Grants.Registrar{Grants.RegistrarPublic}>(self.RegistrarPublicPath)
    let registrar = cap.borrow() ?? panic("Could not borrow registrar")
    registrar.renewGrant(grant: grant, duration: duration, feeTokens: <- feeTokens)
  }

  pub fun getRentCost(name: String, duration: UFix64): UFix64 {
    var len = name.length
    if len > 10 {
      len = 10
    }

    let price = self.getPrices()[len]

    let rentCost = price! * duration
    return rentCost
  }

  pub fun getGrantNameHash(name: String): String {
    let forbiddenCharsUTF8 = self.forbiddenChars.utf8
    let nameUTF8 = name.utf8

    for char in forbiddenCharsUTF8 {
      if nameUTF8.contains(char) {
        panic("Illegal grant name")
      }
    }

    let nameHash = String.encodeHex(HashAlgorithm.SHA3_256.hash(nameUTF8))
    return nameHash
  }

  pub fun isAvailable(nameHash: String): Bool {
    if self.owners[nameHash] == nil {
      return true
    }
    return self.isExpired(nameHash: nameHash)
  }

  pub fun getPrices(): {Int: UFix64} {
    let cap = self.account.getCapability<&Grants.Registrar{Grants.RegistrarPublic}>(Grants.RegistrarPublicPath)
    let collection = cap.borrow() ?? panic("Could not borrow collection")
    return collection.getPrices()
  }

  pub fun getVaultBalance(): UFix64 {
    let cap = self.account.getCapability<&Grants.Registrar{Grants.RegistrarPublic}>(Grants.RegistrarPublicPath)
    let registrar = cap.borrow() ?? panic("Could not borrow registrar public")
    return registrar.getVaultBalance()
  }

  pub fun getExpirationTime(nameHash: String): UFix64? {
    return self.expirationTimes[nameHash]
  }

  pub fun isExpired(nameHash: String): Bool {
    let currTime = getCurrentBlock().timestamp
    let expTime = self.expirationTimes[nameHash]
    if expTime != nil {
      return currTime >= expTime!
    }
    return false
  }

  pub fun getAllOwners(): {String: Address} {
    return self.owners
  }

  pub fun getAllExpirationTimes(): {String: UFix64} {
    return self.expirationTimes
  }

  pub fun getAllNameHashToIDs(): {String: UInt64} {
    return self.nameHashToIDs
  }

  access(account) fun updateOwner(nameHash: String, address: Address) {
    self.owners[nameHash] = address
  }

  access(account) fun updateExpirationTime(nameHash: String, expTime: UFix64) {
    self.expirationTimes[nameHash] = expTime
  }

  access(account) fun updateNameHashToID(nameHash: String, id: UInt64) {
    self.nameHashToIDs[nameHash] = id
  }
}