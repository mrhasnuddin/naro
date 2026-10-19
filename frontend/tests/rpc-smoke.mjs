import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {TESTNET} from '../../prototype/wallet.js';
const endpoint=TESTNET.rpcUrls[0];
const diagnostics=[['eth_chainId',[]],['eth_blockNumber',[]],['eth_getBalance',['0x0000000000000000000000000000000000000000','latest']]];
const results=await Promise.all(diagnostics.map(async([method,params],id)=>{
 const started=Date.now();
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:id+1,method,params}),signal:AbortSignal.timeout(15000)});
 assert.ok(response.ok,`${method}: HTTP ${response.status}`);
 const payload=await response.json();assert.equal(payload.error,undefined,`${method}: RPC error`);assert.match(payload.result,/^0x[0-9a-f]+$/i);
 if(method==='eth_chainId')assert.equal(payload.result,TESTNET.chainId);
 return {method,result:payload.result,elapsedMs:Date.now()-started};
}));
const report={checkedAt:new Date().toISOString(),endpoint,scope:'Public read-only diagnostics. Zero-address balance is not a user balance. No faucet claim, wallet authorization, signature or transaction.',results};
await writeFile(new URL('../review/rpc-smoke-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
for(const result of results)console.log(`PASS ${result.method} (${result.elapsedMs}ms)`);
