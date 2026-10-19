// Local-only development wallet. Not imported or bundled by the production frontend.
if(new URLSearchParams(location.search).get('network')!=='local')location.replace(location.pathname+'?network=local#overview');
const rpc='http://127.0.0.1:8545',log=document.querySelector('#local-log');
let sequence=0;
async function send(method,params=[]){const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++sequence,method,params}),signal:AbortSignal.timeout(15000)});const result=await response.json();if(result.error)throw Object.assign(new Error(result.error.message),result.error);return result.result;}
if(await send('eth_chainId')!=='0x7a69')throw new Error('Local test wallet refuses any chain except 31337');
const accounts=await send('eth_accounts');let selected=accounts[1];
const artifact=await (await fetch('../src/demo/abi.json',{cache:'no-store'})).json();
const deployment=await (await fetch('../src/demo/deployments.json',{cache:'no-store'})).json();
const handlers=new Map(),emit=(name,value)=>handlers.get(name)?.forEach(fn=>fn(value));
const reads=new Set(['eth_chainId','eth_getBalance','eth_call','eth_estimateGas','eth_gasPrice','eth_maxPriorityFeePerGas','eth_feeHistory','eth_getBlockByNumber','eth_getBlockByHash','eth_blockNumber','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getTransactionCount','eth_getCode','eth_getLogs']);
const provider={on(name,fn){if(!handlers.has(name))handlers.set(name,new Set());handlers.get(name).add(fn);},removeListener(name,fn){handlers.get(name)?.delete(fn);},async request({method,params=[]}){
 if(method==='eth_accounts'||method==='eth_requestAccounts')return [selected];
 if(method==='wallet_switchEthereumChain'){if(params[0]?.chainId!=='0x7a69')throw {code:4902};return null;}
 if(method==='eth_sendTransaction'){
  if(await send('eth_chainId')!=='0x7a69')throw new Error('Wrong local chain');
  const transaction=params[0];if(transaction.from?.toLowerCase()!==selected.toLowerCase()||BigInt(transaction.value||0)!==0n)throw new Error('Local demo transaction rejected');
  if(transaction.to){if(transaction.to.toLowerCase()!==deployment['31337'].address.toLowerCase())throw new Error('Local wallet only permits the demo contract');}
  else if(transaction.data?.toLowerCase()!==artifact.bytecode.toLowerCase())throw new Error('Unexpected deployment bytecode');
  const hash=await send(method,params);log.textContent+=`${method}: ${hash}\n`;return hash;
 }
 if(!reads.has(method))throw new Error('Unsupported local-only wallet method');
 return send(method,params);
}};
const info={uuid:'44444444-1234-4234-8234-444444444444',name:'NARO Local Test Wallet',rdns:'test.naro.local',icon:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" rx="8" fill="%23f5c451"/%3E%3Ctext x="20" y="26" font-size="18" text-anchor="middle"%3EL%3C/text%3E%3C/svg%3E'};
window.addEventListener('eip6963:requestProvider',()=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info,provider}})));
document.querySelector('#local-account').addEventListener('change',event=>{selected=accounts[Number(event.target.value)];emit('accountsChanged',[selected]);});
document.querySelector('#local-time').addEventListener('click',async()=>{if(await send('eth_chainId')!=='0x7a69')throw new Error('Wrong local chain');await send('evm_increaseTime',[61]);await send('evm_mine');log.textContent+='Advanced local clock by 61 seconds\n';});
const response=await fetch('../dist/index.html',{cache:'no-store'});const html=new DOMParser().parseFromString(await response.text(),'text/html');
for(const style of html.querySelectorAll('link[rel="stylesheet"]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL(style.getAttribute('href'),response.url).href;document.head.append(link);}
await import(new URL(html.querySelector('script[type="module"]').getAttribute('src'),response.url).href);
