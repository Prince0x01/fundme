require('dotenv').config();
const { 
    Client,
    PrivateKey,
    AccountInfoQuery, 
    TransferTransaction, 
    Hbar} = require("@hashgraph/sdk");

const operatorAccountId = process.env.MY_ACCOUNT_ID;
const operatorPrivateKey = process.env.MY_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(operatorAccountId, operatorPrivateKey);

const newPrivateKey = PrivateKey.generateECDSA();
console.log(`The raw ECDSA private key (use this for JSON RPC wallet import): ${newPrivateKey.toStringRaw()}`);

const newPublicKey = newPrivateKey.publicKey;
console.log(`The raw ECDSA public key (use this for JSON RPC wallet import): ${newPublicKey.toStringRaw()}`);

const aliasAccountId = newPublicKey.toAccountId(0, 0);
console.log(`The alias account id: ${aliasAccountId}`);

const setAliasAccountUsingTx = async (senderAccountId, receiverAccountId, amount) => {
    const transferToAliasTx = await new TransferTransaction()
        .addHbarTransfer(senderAccountId, new Hbar(-amount))
        .addHbarTransfer(receiverAccountId, new Hbar(amount))
        .execute(client);

    await transferToAliasTx.getReceipt(client);
}

const getAccountInfo = async (accountId) => {
    const info = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client);

    console.log(`The normal account ID: ${info.accountId}`);
    console.log(`Account Balance: ${info.balance}`);
}

const main = async () => {
    await setAliasAccountUsingTx(operatorAccountId, aliasAccountId, 10);
    await getAccountInfo(aliasAccountId);
}
