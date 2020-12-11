/* ====== 공통함수 ====== */
    const c = message => console.log(message);
    const getById = id => document.getElementById(id).value;

    async function call (action, parameter) {
        if (!parameter) {
            const {data} = await axios.post(`http://localhost:9201/api/${action}`);
            c(data)
        }else {
            const {data} = await axios.post(`http://localhost:9201/api/${action}`,parameter);
            c(data)
        }    
    }
// 페이징 관련한 요청은 관리자 페이지에서 포괄 처리하는 형태로 진행하면 편할 것 같다.

/* ====== 토큰관련 요청 ====== */
    async function updateTokenInformation() {
        const name = getById(`tokenName`);
        const meta = getById(`metaData`);
        const data = {name, meta};
        c(`update!`)
        await call(`updateTokenInformation`,data);
    }

    async function tokenMint() {
        // const toUserId = getById(`toUserId`);
        const toAddress = getById(`toAddress`) ;
        const amount = getById(`amount`);
        const data = {
            // toUserId, 
            toAddress, amount};
        c('mint!')
        await call(`tokenMint`, data);
    }

    async function tokenBurn() {
        const amount = getById(`amount`);
        const data = {amount};
        c('burn!')
        await call(`tokenBurn`, data);
    }

    async function tokenHolders() {
        const limit = getById(`limit`);
        const page = getById(`page`);
        const orderBy = getById(`orderBy`);
        const data = {limit, page, orderBy};
        c(`holders!`)
        await call(`tokenHolders`, data);
    }

/* ====== 지갑관련 요청 ====== */    
    async function walletInformation() {
        const wallet = getById(`chkWalletInfo`);
        const data = {wallet};
        c(`${wallet}'s information!`)
        await call(`walletInformation`, data);
    }

    async function walletTransactions() {
        const wallet = getById(`getWallet`);
        const data = {wallet};
        c(`${wallet}'s transactions!`)
        await call(`walletTransactions`, data);
    }

    async function getCoinBalance() {
        const wallet = getById(`getWallet`);
        const data = {wallet};
        c(`${wallet}'s coin balance!`)
        await call(`getCoinBalance`, data);
    }

    async function walletTransfer() {
        let   wallet = getById(`fromWallet`),
           toAddress = getById(`toWallet`), 
        walletSecret = getById(`fromSecret`),
              amount = getById(`coinAmount`);
        const data = {wallet, toAddress, walletSecret, amount};
        if(!toAddress || !walletSecret) c(`admin's coin transfer to host!`);
        else c(`${wallet}'s coin transfer to ${toAddress}!`);
        await call(`walletTransfer`, data);
    }

    async function getTokenBalance() {
        const wallet = getById(`getWallet`);
        const data = {wallet};
        c(`${wallet}'s service-token balance!`)
        await call(`getTokenBalance`,data);
    }

    async function getTokenBalanceInContract() {
        const wallet = getById(`getWallet`);
        const contractId = getById(`getContractId`);
        const data = {wallet, contractId};
        c(`${contractId}의 ${wallet}이 가진 서비스토큰 정보 반환`)
        await call(`getTokenBalanceInContract`, data);
    }

    async function walletTokenTransfer() {
        let   wallet = getById(`fromWallet`),
          contractId = getById(`getContractId`),
           toAddress = getById(`toWallet`), 
        walletSecret = getById(`fromSecret`),
              amount = getById(`tokenAmount`);
        const data = {wallet, contractId, toAddress, walletSecret, amount};
        if(!toAddress || !walletSecret) c(`admin's coin transfer to host!`);
        else c(`${wallet}'s token transfer to ${toAddress}!`);
        await call(`walletTransfer`, data);
    }

    async function getTransactions() {
        const txHash = getById(`txHash`);
        const data = {txHash}
        await call(`getTransactions`, data);
    }

    async function saveText() {
        const memo = getById(`memo`);
        const walletWallet = getById(`memoWallet`);
        const walletSecret = getById(`memoSecret`);
        const data = {memo, walletWallet, walletSecret};
        await call(`saveText`, data);
    }

    async function getMemoInTx() {
        const txHash = getById(`txHash`);
        const data = {txHash};
        await call(`getMemoInTx`, data);
    }

// function callData (amount = 0, toAddress = host) { return { walletSecret, toAddress, amount, } }


// function getSignature (nonce, timestamp, method, path, parameter = null) {

//     let data = `${nonce}${timestamp}${method}${path}`
//     if (parameter) {
//         data = data + "?";
//         const keys = Object.keys(parameter);
//         for (let key of keys) data = data + key + "=" + parameter[key] + "&";
//         // data = `${data}${key}=${parameter[key]}&`;
//         data = data.slice(0, -1); // 마지막 & 제거
//     }
//     c(data)
//     // const hash = crypto.createHash('sha512');
//     // hash.update(data)
//     // return hash.digest(`base64`)

//     const hmac = crypto.createHmac('sha512', apiKey)
//     hmac.update(data)
//     return hmac.digest('base64')
// }





















/**
 * HTTP method: PUT
Request path: /v1/item-tokens/61e14383/non-fungibles/10000001/00000001
Request body string:
{
  "ownerAddress": "tlink1fr9mpexk5yq3hu6jc0npajfsa0x7tl427fuveq", 
  "ownerSecret": "uhbdnNvIqQFnnIFDDG8EuVxtqkwsLtDR/owKInQIYmo=", 
  "name": "NewName" 
}

Bp0IqgXE
1581850266351
PUT
/v1/item-tokens/61e14383/non-fungibles/10000001/00000001
?name=NewName
&ownerAddress=tlink1fr9mpexk5yq3hu6jc0npajfsa0x7tl427fuveq
&ownerSecret=uhbdnNvIqQFnnIFDDG8EuVxtqkwsLtDR/owKInQIYmo=

f772331c
1607256013858
POST/v1/wallets/tlink1nue33ra7xxu396x5msvqv4456el4hr954gruhv/service-tokens/67e6d1e1/transfer?walletSecret=HNDewI4HR7NwogTYqNMHC6bEfgENbxusBIGRC9fJEh4=&toAddress=tlink12d73dqfvcsawu5sfqemqslh0u0p4v2y4cd0ca0&amount=0

echo -n "Bp0IqgXE1581850266351GET/v1/wallets/tlink1fr9mpexk5yq3hu6jc0npajfsa0x7tl427fuveq/transactions?page=2&msgType=coin/MsgSend" | openssl dgst -sha512 -binary -hmac "9256bf8a-2b86-42fe-b3e0-d3079d0141fe" | base64
Bp0IqgXE
1581850266351
GET/v1/wallets/tlink1fr9mpexk5yq3hu6jc0npajfsa0x7tl427fuveq/transactions
?page=2
&msgType=coin/MsgSend" | openssl dgst -sha512 -binary -hmac "9256bf8a-2b86-42fe-b3e0-d3079d0141fe

*/