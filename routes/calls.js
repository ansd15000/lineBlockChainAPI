/* ====== 모듈 ====== */
    const axios = require(`axios`);
    const utils = require(`web3-utils`);
    const express = require("express");
    const calls = express.Router();
    const crypto = require('crypto');

/* ====== 에러 변수 ====== */
    const CALL_FAIL = message => new Error(message);

/* ====== 변수 ====== */
    const p = `POST`, g = `GET`, put = `PUT`;

    const _contractId = `67e6d1e1`;
    const serviceId   = ``;
    const apiKey      = ``;
    const apiSecret   = ``;
    const adminWallet = ``;
    const adminSecret = ``;
    const host        = ``;
    const hostPv      = ``;
    const baseUrl = `https://test-api.blockchain.line.me`;
    

    const token = `/v1/service-tokens`;
    const wallet = `/v1/wallets`;
    const memos = `/v1/memos`

/* ====== 내부 함수 ====== */

    const c = m => console.log(m);
    const getNonce = () => utils.randomHex(4).slice(2);
    const getTimestamp = () => Date.now();
    const geturl = path => baseUrl + path;
    const addOwnerData = param => {   
        param.ownerAddress = adminWallet;  
        param.ownerSecret = adminSecret;
    }

    const makeQuery = (data, parameter) => {
        data = data + "?";
        const keys = Object.keys(parameter);
        keys.sort(); // 오름차순 정렬.. 아니 원하는거 개많네 진짜
        for (let key of keys) data = data + key + "=" + parameter[key] + "&";
        data = data.slice(0, -1); // 마지막 & 제거
        c(data)
        return data;
    }

    function getSignature (nonce, timestamp, method, path, parameter = null) {
        let data = `${nonce}${timestamp}${method}${path}`
        if (parameter) data = makeQuery(data, parameter);
        const hmac = crypto.createHmac('sha512', apiSecret)
        hmac.update(data)
        return hmac.digest('base64')
    }

    async function callapi(url, method, headers, body = null) {
        let result;
        if (!body) result = await axios({url, method, headers});
        else result = await axios({url, method, headers, data : body});

        const {data:{ statusCode, statusMessage, responseData }} = result;

        if      (statusCode === 1000) return responseData
        else if (statusCode === 1002 || statusCode === 1020) {
            c(statusMessage);
            return responseData;
        }
        else throw CALL_FAIL(statusMessage);
    }

    function makeHeader (method, path, parameter = null) {
        const nonce = getNonce();
        const timestamp = getTimestamp();
        const headers  = {};
        headers[`service-api-key`] = apiKey;
        headers[`nonce`]           = nonce;
        headers[`timestamp`]       = timestamp;
        headers['Content-Type']    = 'application/json';
        headers[`signature`]       = getSignature(nonce, timestamp, method, path, parameter);
        return headers;
    } 
    
/* ====== 토큰 ====== */
    // 현 서비스 정보 확인. 다른 서비스 아이디로 정보를 가져올 일이 있을까?
    calls.post(`/services`, async(req, res, next) => {
        const method = g;
        const path = `/v1/services/${serviceId}`;
        const url = baseUrl + path;
        const headers = makeHeader(method, path)
        const result = await callapi(url, method, headers);
        res.json(result);
    })
    
    // 현 서비스에서 운영하는 토큰 컨트랙들 정보 반환
    calls.post(`/serviceTokens`, async(req, res, next) => {
        const method = g;
        const path = token;
        const url = geturl(path);
        const headers = makeHeader(method, path);

        const result = await callapi(url, method, headers);
        res.json(result);
    })

    // 컨트랙 아이디로 컨트랙정보 반환
    calls.post(`/tokenInformation`, async(req, res, next) => {
        const method = g;
        const path = `${token}/${_contractId}`;
        const url = geturl(path);
        const headers = makeHeader(method, path);

        const result = await callapi(url, method, headers);
        res.json(result);
    })

    // 서비스토큰 정보 업데이트
    calls.post(`/updateTokenInformation`, async(req, res, next) => {
        const method = put;
        const path = `${token}/${_contractId}`;
        const url = geturl(path);
        const {name, meta} = req.body; // 옵셔널
        const param = {name, meta};
        addOwnerData(param);   
        const headers = makeHeader(method, path, param);
        try {
            const result = await callapi(url, method, headers, param);
            res.json(result);
        }catch(e) {
            next(e);
        }
    })

    // 토큰 민트. 일반 사용자월렛도 민트가 가능한지 확인해보자. 반환값은 txHash. 콜백리스폰 쓰면 세부정보까지 나오나봐
    calls.post(`/tokenMint`, async(req, res, next) => {
        const method = p;
        const path = `${token}/${_contractId}/mint`;
        const url = geturl(path);
        const {toUserId, toAddress, amount} = req.body;
        const param = {
            // toUserId,   // 아마 비트맥스지갑을 사용하는 유저 전용인거같음
            toAddress, amount};
        addOwnerData(param);

        const headers = makeHeader(method, path, param);
        try {
            const result = await callapi(url, method, headers, param);
            res.json(result);
        }catch (e) {next(e)};
        
    })

    // 토큰소각. 서비스 어드민만 호출 가능. 반환값 txHash
    calls.post(`/tokenBurn`, async(req, res, next) => {
        const method = p;
        const path = `${token}/${_contractId}/burn`;
        const url = geturl(path);
        const {amount} = req.body;
        const param = {amount};
        addOwnerData(param);

        const headers = makeHeader(method, path, param);
        try {
            const result = await callapi(url, method, headers, param);
            res.json(result);
        }catch (e) {next(e)};
    })

    // 토큰 소유자들의 지갑주소 및 토큰갯수반환. 페이징처리시켜 처리가능
    calls.post(`/tokenHolders`, async(req, res, next) => {
        const method = g;
        const path = `${token}/${_contractId}/holders`;
        const url = geturl(path);
        // 전부 선택사항
        // limit = 표기시킬 홀더 갯수 기본값 10, 최대 50 
        // page	 = 페이징. 범위는 limit ✕ (page-1) + 1–limit ✕ (page) from the entire data list. 이렇대. 기본값 1, 최대값 x
        // orderBy = 정렬. desc(내림차순. 기본값), asc(오름차순)

        // const param = {limit, page, orderBy} = req.body;
        // addOwnerData(param);
        
        const headers = makeHeader(method, path);
        try {
            const result = await callapi(url, method, headers);
            res.json(result);
        }catch(e) {
            next(e);
        }
    })


/* ====== 지갑 ====== */

    calls.post(`/wallet`, async(req, res, next) => {
        const method = g;
        const path = wallet;
        const url = geturl(path);
        const headers = makeHeader(method, path);
    
        const result = await callapi(url, method, headers);
        res.json(result);
    })

    calls.post(`/walletInformation`, async(req, res, next) => {
        const method = g;
        let address = req.body.wallet;
        if (!address) adminWallet;  // 따로 파라메터 넘기는게 없다면 어드민 주소
        const path = `${wallet}/${address}`;
        const url = geturl(path);
        const headers = makeHeader(method, path);
        const result = await callapi(url, method, headers);
        res.json(result);
    })

    // 트랜잭션을 서명했거나, 관여된 월렛의 모든 트랜잭션 반환
    calls.post(`/walletTransactions`, async(req, res, next) => {
        const method = g;
        let address = req.body.wallet; // 사용자 페이지에서 조회하고자 하는 월렛주소
        if (!address) adress = adminWallet;
        const path = `${wallet}/${adress}/transactions`;
        const url = geturl(path);
        // 다 옵셔널.
        const {
            before,  // 해당 타임스탬프 값까지의 종료된 트랜잭션 목록을 반환함 (기본값: 가장 마지막 트랜잭션 완료시간)
            after,   // 트랜잭션 검색시 시작할 타임스탬프. 아마 시간 범위 설정한 만큼간의 트랜잭션 조회하는데 사용하나봄
            limit, 
            page, 
            orderBy, // 리밋, 페이지, 오더바이는 페이징 처리를 위한 값 
            msgType  // 검색하고자 하는 트랜잭션 유형을 설정. Msg{기능명} 이 트랜잭션 이름 형태인가봄 
        } = req.body;
        // const param = {

        // }

        const headers = makeHeader(method, path);
    
        const result = await callapi(url, method, headers);
        res.json(result);
    })

    // 해당 월렛에 있는 baseCoin 반환 decimals가 6임. 즉 100 + 000000 으로 반환됨
    calls.post(`/getCoinBalance`, async(req, res, next) => {
        const method = g;
        let address = req.body.wallet;
        if (!address) address = adminWallet;
        const path = `${wallet}/${address}/base-coin`;
        const url = geturl(path);
        const headers = makeHeader(method, path);
    
        const result = await callapi(url, method, headers);
        res.json(result);
    })

    // 파라메터에 url의 지갑주소에 맞는 secret을 파라메터로 보내는거다~!,
    calls.post(`/walletTransfer`, async(req, res, next) => {
        const method = p;
        let address = req.body.wallet;       // 코인을 보낼놈
        if (!address) address = adminWallet; // 설정 안되있으면 어드민이지 
        const path = `${wallet}/${address}/base-coin/transfer`;
        const url = geturl(path);
        // walletSecret 보낼점 비밀키
        // toAddress  받을넘 
        // amount     값
        let {toAddress, walletSecret, amount} = req.body;
        if (!toAddress || !walletSecret) {
            walletSecret = adminSecret;
            toAddress = host;
            c(`서버 상수값으로 진행`)
        }
        const param = { walletSecret, toAddress, amount };

        const headers = makeHeader(method, path, param);
        const result = await callapi(url, method, headers, param);
        res.json(result);
    })

    // 호출한 유저의 서비스 토큰 개수 반환. 페이징처리 파라메터는 추가 안했음
    calls.post(`/getTokenBalance`, async(req, res, next) => {
        const method = g;
        let address = req.body.wallet;
        if (!address) address = adminWallet;
        const path = `${wallet}/${address}/service-tokens`;
        const url = geturl(path);
        const headers = makeHeader(method, path);
    
        const result = await callapi(url, method, headers);
        res.json(result);
    })

    // 특정 컨트랙트의 사용자 토큰개수 반환.
    calls.post(`/getTokenBalanceInContract`, async(req, res, next) => {
        const method = g;
        let address = req.body.wallet;
        let contractId = req.body.contractId;
        if (!address) address = adminWallet;
        if (!contractId) contractId = _contractId;
        const path = `${wallet}/${address}/service-tokens/${contractId}`;
        const url = geturl(path);
        const headers = makeHeader(method, path);
    
        const result = await callapi(url, method, headers);
        res.json(result);
    })
    
    // 특정 컨트랙트의 해당 사용자 토큰개수 전송
    calls.post(`/walletTokenTransfer`, async(req, res, next) => {
        const method = p;
        let address = req.body.wallet;       // 코인을 보낼놈
        let contractId = req.body.contractId;
        if (!address) address = adminWallet;
        if (!contractId) contractId = _contractId; // 설정 안되있음 고정값이야 일단은.

        const path = `${wallet}/${address}/service-tokens/${contractId}/transfer`;
        const url = geturl(path);
        // walletSecret 보낼놈 비밀키
        // toAddress  받을넘 
        // amount     값
        let {toAddress, walletSecret, amount} = req.body;
        if (!toAddress || !walletSecret) {
            walletSecret = adminSecret;
            toAddress = host;
            c(`서버 상수값으로 진행`)
        }
        const param = { walletSecret, toAddress, amount };

        const headers = makeHeader(method, path, param);
        const result = await callapi(url, method, headers, param);
        res.json(result);
    })

    // 아이템 토큰은 안쓰는듯하니 구현안하겠음

/* ====== 트랜잭션 ====== */
    calls.post(`/getTransactions`, async(req, res, next) => {
        const method = g;
        const {txHash} = req.body;
        const path = `/v1/transactions/${txHash}`;
        const url = geturl(path);
        const headers = makeHeader(method, path);

        const result = await callapi(url, method, headers);
        res.json(result);
    })

/* ====== 메모 ====== */
    // 블록체인에 그냥 텍스트를 저장할 때.. 토큰과 관련이 없음
    calls.post(`/saveText`, async(req, res, next) => {
        const method = p;
        let {memo, walletAddress, walletSecret} = req.body;
        if (!walletAddress || !walletSecret) {
            walletAddress = adminWallet;
            walletSecret = adminSecret;
        }
        const param = {memo, walletAddress, walletSecret};
        const path = memos;
        const url = geturl(path);

        const headers = makeHeader(method, path, param);
        const result = await callapi(url, method, headers, param);
        res.json(result);
    })

    // 트랜잭션에 있는 메모만 반환함 ㅋㅋㅋㅋㅋ
    calls.post(`/getMemoInTx`, async(req, res, next) => {
        const method = g;
        const {txHash} = req.body;
        const path = `${memos}/${txHash}`;
        const url = geturl(path);

        const headers = makeHeader(method, path);
        const result = await callapi(url, method, headers);
        res.json(result);
    })

module.exports = calls
