// Test-only provider. This module is outside Vite's production entry graph.
const scenario = new URLSearchParams(location.search).get('scenario') || 'success';
const ADDRESS_A='0x1234567890123456789012345678901234567890';
const ADDRESS_B='0x9876543210987654321098765432109876543210';
const log = document.querySelector('#qa-log');
document.querySelector('#qa-scenario').textContent = `Scenario: ${scenario}`;
if(scenario==='live-rpc')document.querySelector('#qa-disclaimer').textContent='QA connector: account selection is simulated. Chain and balance reads use live BNB testnet RPC for a public diagnostic address. No ownership is claimed. No signature, transaction or faucet claim.';
const allowed=new Set(['eth_requestAccounts','eth_chainId','eth_getBalance','wallet_switchEthereumChain','wallet_addEthereumChain']);
let chain=scenario==='wrong-network' || scenario==='add-network' ? '0x1' : '0x61';
let address=ADDRESS_A,known=scenario!=='add-network',balanceBroken=scenario==='balance-error';
let oldResolve;
const handlers=new Map();
const emit=(event,value)=>handlers.get(event)?.forEach(handler=>handler(value));
const provider={
 on(event,handler){if(!handlers.has(event))handlers.set(event,new Set());handlers.get(event).add(handler);},
 removeListener(event,handler){handlers.get(event)?.delete(handler);},
 async request({method,params}){
  log.textContent+=`${method}\n`;
  if(!allowed.has(method))throw new Error('Forbidden method in wallet test');
  if(scenario==='live-rpc' && (method==='eth_chainId'||method==='eth_getBalance')){
   log.textContent+=`LIVE_RPC ${method}\n`;
   const response=await fetch('https://bsc-testnet-dataseed.bnbchain.org',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params:params||[]}),signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw new Error('Live RPC unavailable');
   const payload=await response.json();if(payload.error)throw new Error('Live RPC error');return payload.result;
  }
  if(method==='eth_requestAccounts'){
   if(scenario==='reject')throw {code:4001};
   if(scenario==='pending')throw {code:-32002};
   if(scenario==='delayed')await new Promise(resolve=>setTimeout(resolve,2500));
   return [address];
  }
  if(method==='eth_chainId')return chain;
  if(method==='wallet_addEthereumChain'){if(params?.[0]?.chainId!=='0x61')throw new Error('Unexpected chain');known=true;return null;}
  if(method==='wallet_switchEthereumChain'){
   if(scenario==='switch-reject')throw {code:4001};
   if(!known)throw {code:4902};
   if(params?.[0]?.chainId!=='0x61')throw new Error('Unexpected chain');
   chain='0x61';emit('chainChanged',chain);return null;
  }
  if(method==='eth_getBalance'){
   if(chain!=='0x61')throw new Error('Balance requested on wrong network');
   if(balanceBroken)throw new Error('Simulated balance service outage');
   if(scenario==='timeout')return new Promise(()=>{});
   if(scenario==='stale'&&params?.[0]===ADDRESS_A)return new Promise(resolve=>{oldResolve=resolve;});
   return params?.[0]===ADDRESS_B?'0x22b1c8c1227a0000':'0x1158e460913d0000'; // 2.5 / 1.25 tBNB
  }
 }
};
const info={uuid:'12345678-1234-4234-8234-123456789012',name:'NARO QA wallet (simulation)',rdns:'test.naro.qa',icon:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" rx="8" fill="%2381caff"/%3E%3Ctext x="20" y="26" font-size="18" text-anchor="middle"%3EQA%3C/text%3E%3C/svg%3E'};
window.addEventListener('eip6963:requestProvider',()=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info,provider}})));
document.querySelector('#qa-account').addEventListener('click',()=>{address=address===ADDRESS_A?ADDRESS_B:ADDRESS_A;emit('accountsChanged',[address]);});
document.querySelector('#qa-chain').addEventListener('click',()=>{chain=chain==='0x61'?'0x1':'0x61';emit('chainChanged',chain);});
document.querySelector('#qa-disconnect').addEventListener('click',()=>emit('disconnect',{code:4900}));
document.querySelector('#qa-resolve').addEventListener('click',()=>oldResolve?.('0x56bc75e2d63100000'));
document.querySelector('#qa-recover').addEventListener('click',()=>{balanceBroken=false;});
const response=await fetch('../dist/index.html',{cache:'no-store'});
if(!response.ok)throw new Error('Build the frontend before running this harness');
const html=new DOMParser().parseFromString(await response.text(),'text/html');
for(const stylesheet of html.querySelectorAll('link[rel="stylesheet"]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL(stylesheet.getAttribute('href'),response.url).href;document.head.append(link);
}
const entry=html.querySelector('script[type="module"]').getAttribute('src');
log.textContent+=`BUILD ${entry}\n`;
await import(new URL(entry,response.url).href);
