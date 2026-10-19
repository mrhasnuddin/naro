// Injected EVM connections only. No signatures, transactions, storage, or automatic reconnect.
export const TESTNET = Object.freeze({ chainId: '0x61', chainName: 'BNB Smart Chain Testnet', nativeCurrency: {name:'Test BNB',symbol:'tBNB',decimals:18}, rpcUrls:['https://bsc-testnet-dataseed.bnbchain.org'], blockExplorerUrls:['https://testnet.bscscan.com'] });
export const validAddress = value => typeof value === 'string' && /^0x[0-9a-f]{40}$/i.test(value);
export const normalizeChain = value => { try { return `0x${BigInt(value).toString(16)}`; } catch { return null; } };
export function walletError(error) {
  return ({4001:'rejected', '-32002':'pending', 4902:'unknownChain', 4200:'unsupported', '-32601':'unsupported', 4900:'offline', 4901:'offline'})[error?.code] || 'failed';
}
export class WalletConnection {
  constructor(onChange = () => {}, network = TESTNET) { this.network = network; this.onChange = onChange; this.state = {address:null,chainId:null,name:null,busy:false,error:null}; this.provider = null; this.cleanup = () => {}; this.revision = 0; this.accountVersion = 0; }
  emit(patch) { Object.assign(this.state, patch); this.onChange({...this.state}); }
  bind(provider) {
    this.cleanup(); this.provider = provider;
    const accounts = list => { ++this.accountVersion; const address = Array.isArray(list) && validAddress(list[0]) ? list[0] : null; this.emit({address,error:null}); };
    const chain = id => this.emit({chainId:normalizeChain(id),error:null});
    const disconnect = () => this.forget();
    provider.on?.('accountsChanged',accounts); provider.on?.('chainChanged',chain); provider.on?.('disconnect',disconnect);
    this.cleanup = () => { provider.removeListener?.('accountsChanged',accounts); provider.removeListener?.('chainChanged',chain); provider.removeListener?.('disconnect',disconnect); };
  }
  async connect(entry) {
    if (this.state.busy) return;
    const revision = ++this.revision;
    this.cleanup(); this.provider = null;
    this.emit({address:null,chainId:null,name:entry.name,busy:true,error:null});
    try {
      // Listeners are attached before requesting approval so changes are not missed.
      this.bind(entry.provider);
      const accountVersion = this.accountVersion;
      const accounts = await entry.provider.request({method:'eth_requestAccounts'});
      if (revision !== this.revision) return;
      if (!Array.isArray(accounts) || !validAddress(accounts[0])) throw new Error('Invalid account');
      if (accountVersion === this.accountVersion) this.emit({address:accounts[0]});
      const chainId = normalizeChain(await entry.provider.request({method:'eth_chainId'}));
      if (revision !== this.revision) return;
      if (!chainId) throw new Error('Invalid chain');
      this.emit({chainId});
    } catch(error) { if (revision === this.revision) { this.cleanup(); this.provider = null; this.emit({address:null,chainId:null,error:walletError(error)}); } }
    finally { if (revision === this.revision) this.emit({busy:false}); }
  }
  async switchNetwork() {
    if (!this.provider || !this.state.address || this.state.busy) return;
    const provider = this.provider, revision = this.revision;
    this.emit({busy:true,error:null});
    try {
      try { await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:this.network.chainId}]}); }
      catch(error) {
        if (Number(error.code) !== 4902) throw error;
        await provider.request({method:'wallet_addEthereumChain',params:[this.network]});
        if (revision !== this.revision) return;
        await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:this.network.chainId}]});
      }
      const chainId = normalizeChain(await provider.request({method:'eth_chainId'}));
      if (revision === this.revision) this.emit({chainId,error:chainId === this.network.chainId ? null : 'wrongChain'});
    } catch(error) { if (revision === this.revision) this.emit({error:walletError(error)}); }
    finally { if (revision === this.revision) this.emit({busy:false}); }
  }
  forget() { ++this.revision; this.cleanup(); this.cleanup = () => {}; this.provider = null; this.emit({address:null,chainId:null,name:null,busy:false,error:null}); }
}
export function discoverWallets(host, onChange) {
  const entries = [];
  const add = (provider, name, image = '') => {
    if (!provider || typeof provider.request !== 'function') return;
    name = String(name || 'EVM wallet').slice(0,80);
    image = typeof image === 'string' && /^data:image\/(png|webp|jpeg|svg\+xml)[;,]/i.test(image) && image.length < 200000 ? image : '';
    const existing = entries.find(item => item.provider === provider);
    if (existing) { if (existing.legacy) { existing.name = name; existing.image = image; existing.legacy = false; onChange(entries); } return; }
    entries.push({id:String(entries.length), provider, name:String(name || 'EVM wallet').slice(0,80), image:typeof image === 'string' && /^data:image\/(png|webp|jpeg|svg\+xml)[;,]/i.test(image) && image.length < 200000 ? image : ''});
    onChange(entries);
  };
  host.addEventListener('eip6963:announceProvider', event => { const detail = event.detail; if (detail?.info) add(detail.provider,detail.info.name,detail.info.icon); });
  const refresh = () => {
    host.dispatchEvent(new Event('eip6963:requestProvider'));
    const providers = Array.isArray(host.ethereum?.providers) ? host.ethereum.providers : [host.ethereum];
    for (const provider of providers) {
      if (!provider || entries.some(item => item.provider === provider)) continue;
      add(provider, 'Browser wallet');
      const entry = entries.find(item => item.provider === provider); if (entry) entry.legacy = true;
    }
  };
  refresh();
  return {entries,refresh};
}
