import { config } from "@onflow/fcl";

config({
  // The name of our dApp to show when connecting to a wallet
  "app.detail.title": "Flow Name Service",
  // An image to use as the icon for our dApp when connecting to a wallet
  "app.detail.icon": "https://placekitten.com/g/200/200",
  // RPC URL for the Flow Testnet
  "accessNode.api": "https://rest-testnet.onflow.org",
  // A URL to discover the various wallets compatible with this network
  // FCL automatically adds support for all wallets which support Testnet
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  // Alias for the Grants Contract
  // UPDATE THIS to be the address of YOUR contract account address
  "0xGrants": "0x9c692d972ed9a7fe",
  // Testnet aliases for NonFungibleToken and FungibleToken contracts
  "0xNonFungibleToken": "0x631e88ae7f1d7c20",
  "0xFungibleToken": "0x9a0766d93b6608b7",
  "0xFLOW": "0x7e60df042a9c0868",
});