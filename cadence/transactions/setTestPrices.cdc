import Grants from "../contracts/Grants.cdc"

transaction() {
    let registrar: &Grants.Registrar
    prepare(account: AuthAccount) {
        self.registrar = account.borrow<&Grants.Registrar>(from: Grants.RegistrarStoragePath)
            ?? panic("Could not borrow Registrar")
    }

    execute {
        var len = 1
        while len < 11 {
            self.registrar.setPrices(key: len, val: 0.000001)
            len = len + 1
        }
    }
}