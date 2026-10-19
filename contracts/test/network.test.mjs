import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {JsonRpcProvider,ContractFactory} from 'ethers';
const system=JSON.parse(await readFile(new URL('../artifacts/NaroDemo.json',import.meta.url),'utf8'));
const token=JSON.parse(await readFile(new URL('../artifacts/DemoNaroToken.json',import.meta.url),'utf8'));
async function simulation(network,port,run){
 const child=spawn(process.execPath,['node_modules/hardhat/dist/src/cli.js','--network',network,'node','--hostname','127.0.0.1','--port',String(port)],{stdio:['ignore','pipe','pipe']});
 const provider=new JsonRpcProvider(`http://127.0.0.1:${port}`,undefined,{cacheTimeout:-1});provider.pollingInterval=50;
 try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Local chain startup timeout')),20000);child.on('exit',code=>{clearTimeout(timer);reject(new Error('Local chain exited '+code));});child.stdout.on('data',data=>{if(data.toString().includes(':'+port)){clearTimeout(timer);resolve();}});});await run(provider);}finally{provider.destroy();child.kill();}
}
test('both constructors reject a local simulation with unsupported chain ID 56',async()=>simulation('unsupportedSimulation',8546,async provider=>{assert.equal(BigInt(await provider.send('eth_chainId',[])),56n);const signer=await provider.getSigner(0);await assert.rejects(new ContractFactory(system.abi,system.bytecode,signer).deploy(),error=>new ContractFactory(system.abi,system.bytecode).interface.parseError(error.data)?.name==='UnsupportedNetwork');await assert.rejects(new ContractFactory(token.abi,token.bytecode,signer).deploy(await signer.getAddress()),error=>new ContractFactory(token.abi,token.bytecode).interface.parseError(error.data)?.name==='UnsupportedNetwork');}));
test('deployment succeeds on a local simulation of BNB testnet chain ID 97',async()=>simulation('bscTestSimulation',8547,async provider=>{assert.equal(BigInt(await provider.send('eth_chainId',[])),97n);const deployed=await new ContractFactory(system.abi,system.bytecode,await provider.getSigner(0)).deploy();await deployed.waitForDeployment();assert.equal(await deployed.memberCount(),1n);assert.notEqual(await provider.getCode(await deployed.token()),'0x');}));
