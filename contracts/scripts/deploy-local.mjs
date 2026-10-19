import {readFile,writeFile} from 'node:fs/promises';
import {JsonRpcProvider,ContractFactory,keccak256} from 'ethers';
const provider=new JsonRpcProvider('http://127.0.0.1:8545',undefined,{cacheTimeout:-1});provider.pollingInterval=50;
if(BigInt(await provider.send('eth_chainId',[]))!==31337n)throw new Error('Local deployment requires chain 31337');
const artifact=JSON.parse(await readFile('artifacts/NaroDemo.json','utf8'));
const signer=await provider.getSigner(0);
const system=await new ContractFactory(artifact.abi,artifact.bytecode,signer).deploy();
const receipt=await system.deploymentTransaction().wait();
const address=await system.getAddress(),token=await system.token();
const deployment={chainId:31337,address,token,blockNumber:receipt.blockNumber,transactionHash:receipt.hash,systemCodeHash:keccak256(await provider.getCode(address)),tokenCodeHash:keccak256(await provider.getCode(token)),deployer:await signer.getAddress()};
await writeFile('deployments/local.json',JSON.stringify(deployment,null,2)+'\n');
let manifests={};try{manifests=JSON.parse(await readFile('../frontend/src/demo/deployments.json','utf8'));}catch{}
manifests['31337']=deployment;
await writeFile('../frontend/src/demo/deployments.json',JSON.stringify(manifests,null,2)+'\n');
console.log(`Local demo deployed: ${address}. Token: ${token}. No BNB testnet deployment performed.`);
await provider.send('evm_setIntervalMining',[1000]);
provider.destroy();
