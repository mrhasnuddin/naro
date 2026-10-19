// Test-only wallet creation. The private key never reaches stdout or Git.
// Windows DPAPI binds the encrypted key to the current Windows user account.
import { Wallet } from 'ethers';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = new URL('../.local/', import.meta.url);
const keyPath = new URL('test-wallet.dpapi', directory);
const publicPath = new URL('test-wallet-public.json', directory);
if (process.platform !== 'win32') throw new Error('This wallet storage requires Windows DPAPI.');
await mkdir(directory, { recursive: true });
let exists = false;
try { await access(keyPath); exists = true; } catch {}
if (exists) {
  const info = JSON.parse(await readFile(publicPath, 'utf8'));
  console.log(JSON.stringify({ address: info.address, chainId: 97, storage: 'Existing Windows-user encrypted test wallet' }));
} else {
  const wallet = Wallet.createRandom();
  const protectedKey = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
    'Add-Type -AssemblyName System.Security; $secretText=[Console]::In.ReadToEnd(); $secretBytes=[Text.Encoding]::UTF8.GetBytes($secretText); $encrypted=[Security.Cryptography.ProtectedData]::Protect($secretBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($encrypted)); [Array]::Clear($secretBytes,0,$secretBytes.Length)'],
    { input: wallet.privateKey, encoding: 'utf8', windowsHide: true });
  if (protectedKey.status !== 0 || !protectedKey.stdout.trim()) throw new Error('Wallet encryption failed; no key was saved.');
  await writeFile(keyPath, Buffer.from(protectedKey.stdout.trim(), 'base64'), { flag: 'wx' });
  await writeFile(publicPath, JSON.stringify({ address: wallet.address, chainId: 97, createdAt: new Date().toISOString(), purpose: 'NARO BNB testnet only', keyFile: 'test-wallet.dpapi' }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ address: wallet.address, chainId: 97, storage: fileURLToPath(keyPath), keyEncrypted: true }));
}
