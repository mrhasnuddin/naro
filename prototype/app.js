import { WalletConnection, discoverWallets, TESTNET } from './wallet.js';
import en from './locales/en.js';
import zh from './locales/zh-Hans.js';

const catalogs = { en, 'zh-Hans': zh };
const views = ['overview', 'rewards', 'community', 'network', 'account'];
const icons = { overview: 'overview', rewards: 'rewards', community: 'community', network: 'network', account: 'account' };
const main = document.getElementById('main-content');
const dialog = document.getElementById('app-dialog');
const dialogContent = document.getElementById('dialog-content');
const status = document.getElementById('status');
const stateSelect = document.getElementById('preview-state');
const localeSelect = document.getElementById('locale');
let locale = 'en';
let account = 'active';
let previousTrigger = null;
let dialogKind = null;
let discovery;
const wallet = new WalletConnection(() => { render(); if (dialog.open && dialogKind === 'wallet') renderWallet(); });
let statusTimer;
let view = views.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
const snapshot = new Date('2026-10-18T16:00:00Z');
const sample = Object.freeze({ total: 1240.5, holdingsReward: 880.25, communityReward: 280.25, rankReward: 80, settled: 12500, wallet: 12650, members: 12, community: 86400, supply: 987200000, burned: 12800000, holders: 8420 });
const t = (key, values = {}) => {
  const message = catalogs[locale][key] ?? en[key];
  if (message === undefined) throw new Error(`Missing translation: ${key}`);
  return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
};
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const number = (value, digits = 0) => new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const date = () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Kuala_Lumpur' }).format(snapshot);
const icon = name => `<span class="icon icon-${name}" aria-hidden="true"></span>`;
const link = (target, label, cls = 'text-link') => `<a class="${cls}" href="#${target}">${esc(t(label))}${icon('arrow')}</a>`;
const amount = (value, digits = 2) => `<span class="naro-number">${number(value, digits)}</span><span class="unit"><bdi>NARO</bdi></span>`;

function announce(message) {
  clearTimeout(statusTimer);
  status.hidden = false;
  status.textContent = message;
  statusTimer = setTimeout(() => { status.hidden = true; }, 6000);
}

function hero(onRewards = false) {
  if (account !== 'active') {
    const publicState = account === 'public';
    return `<section class="reward-hero intro-hero" aria-labelledby="hero-title"><div class="hero-top"><span class="section-label">${esc(t('setup.title'))}</span><span class="naro-badge ${publicState ? 'naro-badge--info' : 'naro-badge--warning'}">${esc(t(`overview.${account}`))}</span></div><h2 id="hero-title">${esc(t(publicState ? 'hero.public.title' : 'hero.setup.title'))}</h2><p class="hero-description">${esc(t(publicState ? 'hero.public.note' : 'hero.setup.note'))}</p><div class="hero-actions naro-actions"><button class="naro-button naro-button--primary" type="button" data-action="${publicState ? 'wallet' : 'activation'}">${esc(t(publicState ? 'wallet.connect' : 'hero.setup.action'))}${icon('arrow')}</button>${link('network', 'hero.public.browse')}</div><div class="hero-foot">${icon('info')}<p>${esc(t(publicState ? 'review.note' : 'activation.boundary'))}</p></div></section>`;
  }
  return `<section class="reward-hero" aria-labelledby="hero-title"><div class="hero-top"><h2 id="hero-title" class="section-label">${esc(t('hero.claimable'))}</h2><span class="naro-badge naro-badge--success">${icon('check')}${esc(t('overview.active'))}</span></div><div class="hero-balance">${amount(sample.total)}</div><p class="hero-description">${esc(t('hero.note'))}</p><div class="hero-actions naro-actions">${onRewards ? `<button type="button" class="naro-button" disabled aria-describedby="claim-limit">${esc(t('rewards.preview'))}</button>` : link('rewards', 'hero.review', 'naro-button naro-button--primary')}</div><dl class="reward-split"><div><dt>${esc(t('hero.holdings'))}</dt><dd>${number(sample.holdingsReward, 2)}</dd></div><div><dt>${esc(t('hero.community'))}</dt><dd>${number(sample.communityReward, 2)}</dd></div><div><dt>${esc(t('hero.rank'))}</dt><dd>${number(sample.rankReward, 2)}</dd></div></dl></section>`;
}

function participation() {
  const completed = account === 'active' ? 3 : account === 'setup' ? 1 : 0;
  return `<section class="naro-panel participation" aria-labelledby="participation-title"><div class="panel-heading"><h2 id="participation-title">${esc(t('setup.title'))}</h2>${icon('account')}</div><ol class="steps">${['connected','inviter','activated'].map((step, index) => `<li class="${index < completed ? 'is-complete' : ''}"><span class="step-marker" aria-hidden="true">${index < completed ? icon('check') : index + 1}</span><span>${esc(t(`setup.${step}${index < completed ? '' : '.action'}`))}</span>${index < completed ? `<span class="sr-only">${esc(t('setup.completed'))}</span>` : ''}</li>`).join('')}</ol><p class="muted small">${esc(t(account === 'active' ? 'setup.ready' : account === 'setup' ? 'setup.incomplete' : 'setup.public'))}</p>${link('account', 'setup.account')}</section>`;
}

function holdings() {
  return `<section class="naro-panel holdings-panel" aria-labelledby="holdings-title"><div class="panel-heading"><h2 id="holdings-title">${esc(t('holdings.title'))}</h2>${icon('holdings')}</div>${account === 'active' ? `<dl class="balance-list"><div><dt>${esc(t('holdings.settled'))}</dt><dd>${amount(sample.settled)}</dd></div><div><dt>${esc(t('holdings.live'))}</dt><dd>${amount(sample.wallet)}</dd></div></dl><p class="muted small">${esc(t('holdings.note'))}</p>` : `<div class="empty-state">${icon('wallet')}<p>${esc(t(account === 'public' ? 'holdings.pending' : 'holdings.none'))}</p></div>`}</section>`;
}

function communitySummary() {
  return `<section class="naro-panel community-panel" aria-labelledby="community-title"><div class="panel-heading"><h2 id="community-title">${esc(t('community.title'))}</h2>${icon('community')}</div>${account === 'active' ? `<div class="community-stats"><div><span class="muted small">${esc(t('community.direct'))}</span><strong class="naro-number">${number(sample.members)}</strong></div><div><span class="muted small">${esc(t('community.balance'))}</span><strong class="naro-number">${number(sample.community)} <span class="unit">NARO</span></strong></div></div>` : `<div class="empty-state"><p>${esc(t(account === 'public' ? 'empty.private' : 'community.locked'))}</p></div>`}<div class="panel-footer">${link('community', 'community.open')}${account === 'active' ? `<button class="copy-button" type="button" data-action="copy">${icon('copy')}<span>${esc(t('community.invite'))}</span></button>` : ''}</div></section>`;
}

function networkSummary(full = false) {
  const stats = [['network.supply', number(sample.supply), 'NARO'], ['network.burned', number(sample.burned), 'NARO'], ['network.holders', number(sample.holders), ''], ['network.stage', t('network.phase'), '']];
  return `<section class="network-panel ${full ? 'naro-panel' : ''}" aria-labelledby="network-title"><div class="section-heading"><div><h2 id="network-title">${esc(t('network.title'))}</h2><p class="muted small">${esc(t('network.note'))}</p></div>${full ? `<span class="naro-badge naro-badge--info">${esc(t('demo.only'))}</span>` : link('network', 'network.open')}</div><dl class="network-stats">${stats.map(([label, value, unit]) => `<div><dt>${esc(t(label))}</dt><dd class="naro-number">${esc(value)}${unit ? `<span class="unit">${unit}</span>` : ''}</dd></div>`).join('')}</dl>${full ? `<p class="muted small network-disclaimer">${esc(t('network.disclaimer'))}</p>` : ''}</section>`;
}

function rewardHistory() {
  return `<section class="naro-panel history-panel" id="reward-history" aria-labelledby="history-title"><div class="section-heading"><h2 id="history-title">${esc(t('rewards.history'))}</h2><span class="naro-badge naro-badge--info">${esc(t('demo.only'))}</span></div>${account === 'active' ? `<div class="table-wrap"><table><caption class="sr-only">${esc(t('rewards.history'))}</caption><thead><tr><th scope="col">${esc(t('rewards.date'))}</th><th scope="col">${esc(t('rewards.category'))}</th><th scope="col" class="numeric">${esc(t('rewards.amount'))}</th><th scope="col">${esc(t('rewards.status'))}</th></tr></thead><tbody>${[['hero.holdings',sample.holdingsReward],['hero.community',sample.communityReward],['hero.rank',sample.rankReward]].map(([category, value]) => `<tr><td>${esc(date())}</td><td>${esc(t(category))}</td><td class="numeric">${number(value,2)} NARO</td><td><span class="naro-badge naro-badge--warning">${esc(t('rewards.unclaimed'))}</span></td></tr>`).join('')}</tbody></table></div>` : `<p class="empty-message">${esc(t('empty.private'))}</p>`}<p class="muted small">${esc(t('rewards.historyNote'))}</p></section>`;
}

function accountDetails() {
  const connected = account !== 'public';
  return `<section class="naro-panel account-panel"><dl class="account-list"><div><dt>${esc(t('account.wallet'))}</dt><dd>${connected ? `<bdi class="address">0x1111111111111111111111111111111111111111</bdi><span class="muted small">${esc(t('account.placeholder'))}</span>` : esc(t('account.noWallet'))}</dd></div><div><dt>${esc(t('account.chain'))}</dt><dd>BNB Smart Chain Testnet</dd></div><div><dt>${esc(t('account.activation'))}</dt><dd><span class="naro-badge ${account === 'active' ? 'naro-badge--success' : 'naro-badge--warning'}">${esc(t(account === 'active' ? 'account.active' : 'account.pending'))}</span></dd></div><div><dt>${esc(t('account.inviter'))}</dt><dd>${account === 'active' ? `<bdi class="address">0x2222222222222222222222222222222222222222</bdi>` : esc(t('account.unbound'))}</dd></div></dl><div class="account-actions naro-actions">${account === 'setup' ? `<button type="button" class="naro-button naro-button--primary" data-action="activation">${esc(t('hero.setup.action'))}</button>` : ''}${link('rewards','account.history','naro-button naro-button--secondary')}<button type="button" class="text-button" data-action="wallet">${esc(t('wallet.connect'))}</button></div></section>`;
}

function render() {
  document.documentElement.lang = locale;
  document.documentElement.dir = 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('nav[aria-label]').forEach(element => { element.setAttribute('aria-label', t('nav.main')); });
  document.querySelector('.reviewbar').setAttribute('aria-label', t('review.controls'));
  document.querySelectorAll('.brand,.mobile-brand a').forEach(element => element.setAttribute('aria-label', `NARO ${t('nav.overview')}`));
  document.querySelector('[data-action="close"]').setAttribute('aria-label', t('close'));
  document.getElementById('wallet-label').textContent = wallet.state.address ? shortAddress(wallet.state.address) : t('wallet.connect');
  localeSelect.setAttribute('aria-label', t('language'));
  const nav = views.map(target => `<a href="#${target}" ${target === view ? 'aria-current="page"' : ''}>${icon(icons[target])}<span>${esc(t(`nav.${target}`))}</span></a>`).join('');
  document.getElementById('desktop-nav').innerHTML = nav;
  document.getElementById('mobile-nav').innerHTML = nav;
  const titleKey = view === 'overview' ? 'overview.title' : view === 'community' ? 'community.page.title' : view === 'network' ? 'network.page.title' : `${view}.title`;
  const descriptionKey = view === 'overview' ? 'overview.description' : view === 'community' ? 'community.page.description' : view === 'network' ? 'network.page.description' : `${view}.description`;
  document.getElementById('breadcrumb').textContent = t(`nav.${view}`);
  document.title = `NARO | ${t(`nav.${view}`)}`;
  let content = '';
  if (view === 'overview') content = `<div class="overview-grid">${hero()}${participation()}</div><div class="summary-grid">${holdings()}${communitySummary()}</div>${networkSummary()}`;
  if (view === 'rewards') content = `<div class="overview-grid">${hero(true)}<section class="naro-panel notice-panel">${icon('info')}<h2>${esc(t('rewards.preview'))}</h2><p class="muted" id="claim-limit">${esc(t('rewards.previewNote'))}</p></section></div>${rewardHistory()}`;
  if (view === 'community') content = `<div class="summary-grid">${communitySummary()}<section class="naro-panel"><div class="panel-heading"><h2>${esc(t('community.inviter'))}</h2>${icon('account')}</div><p class="address">${account === 'active' ? '0x2222222222222222222222222222222222222222' : esc(t('account.unbound'))}</p><p class="muted small">${esc(t(account === 'active' ? 'community.inviterNote' : 'community.locked'))}</p></section></div><section class="naro-panel members-panel"><h2>${esc(t('community.members'))}</h2><p class="member-count">${account === 'active' ? esc(t(`community.members.${new Intl.PluralRules(locale).select(sample.members)}`, {count:number(sample.members)})) : esc(t('community.empty'))}</p><p class="muted small">${esc(t('community.membersNote'))}</p></section>`;
  if (view === 'network') content = `${networkSummary(true)}<section class="naro-panel rules-panel"><h2>${esc(t('network.rules'))}</h2><p class="muted">${esc(t('network.rulesNote'))}</p></section>`;
  if (view === 'account') content = `${wallet.state.address ? liveAccount() : ''}<p class="sample-account-note muted">${esc(t('wallet.sample'))}. ${esc(t('wallet.sampleNote'))}</p>${accountDetails()}`;
  main.innerHTML = `<div class="page-heading"><div><h1>${esc(t(titleKey))}</h1><p>${esc(t(descriptionKey))}</p></div><span class="sample-label">${icon('sample')}${esc(t('demo.only'))}</span></div>${content}<div class="snapshot"><span>${esc(t('snapshot.label'))} <time datetime="${snapshot.toISOString()}">${esc(date())}</time></span><span>${esc(t('snapshot.timezone'))}</span></div>`;
}

const shortAddress = value => `${value.slice(0,6)}…${value.slice(-4)}`;
const networkName = () => wallet.state.chainId === TESTNET.chainId ? t('wallet.correct') : t('wallet.wrong', {chain:wallet.state.chainId || '?'});
function liveAccount() {
  return `<section class="naro-panel live-account"><h2>${esc(t('wallet.real'))}</h2><p class="address">${esc(wallet.state.address)}</p><p>${esc(networkName())}</p><p class="muted small">${esc(t('wallet.liveNote'))}</p><dl><div><dt>${esc(t('account.activation'))}</dt><dd>${esc(t('wallet.unverified'))}</dd></div></dl></section>`;
}
function renderWallet() {
  const {address,busy,error} = wallet.state;
  const focused = dialogContent.contains(document.activeElement) ? document.activeElement.dataset.walletId || document.activeElement.dataset.action : null;
  const providers = discovery?.entries || [];
  const options = providers.map(entry => `<li><button class="naro-wallet-option" type="button" data-action="connect-provider" data-wallet-id="${entry.id}" ${busy ? 'disabled' : ''}>${entry.image ? `<img src="${esc(entry.image)}" alt="" width="40" height="40">` : `<span class="wallet-avatar">${icon('wallet')}</span>`}<span class="wallet-option-copy"><strong>${esc(entry.name)}</strong><span>${esc(t('wallet.detected'))}</span></span>${icon('arrow')}</button></li>`).join('');
  dialogContent.innerHTML = `<h2 id="dialog-title">${esc(t(address ? 'wallet.connected' : 'wallet.title'))}</h2><p>${esc(t(address ? 'wallet.liveNote' : 'wallet.note'))}</p><div id="wallet-feedback" role="status" aria-live="polite">${busy ? `<p>${icon('wallet')}${esc(t('wallet.waiting'))}</p>` : error ? `<p class="wallet-error">${esc(t('wallet.error.'+error))}</p>` : ''}</div>${address ? `<div class="wallet-session"><span class="section-label">${esc(wallet.state.name)}</span><bdi class="address">${esc(address)}</bdi><span class="${wallet.state.chainId === TESTNET.chainId ? 'wallet-success' : 'wallet-warning'}">${esc(networkName())}</span></div>${wallet.state.chainId !== TESTNET.chainId ? `<button class="naro-button naro-button--primary" data-action="switch-network" ${busy ? 'disabled' : ''}>${esc(t('wallet.switch'))}</button>` : ''}<button class="naro-button naro-button--secondary" data-action="forget-wallet" ${busy ? 'disabled' : ''}>${esc(t('wallet.disconnect'))}</button><p class="small muted">${esc(t('wallet.forgetNote'))}</p>` : `<section class="wallet-group"><h3>${esc(t('wallet.available'))}</h3>${options ? `<ul class="wallet-list">${options}</ul>` : `<p class="wallet-empty">${esc(t('wallet.none'))}</p>`}<button class="text-link text-button" data-action="refresh-wallets" ${busy ? 'disabled' : ''}>${esc(t('wallet.refresh'))}</button></section><section class="wallet-group"><h3>${esc(t('wallet.getHelp'))}</h3><ul class="wallet-list wallet-install-list">${[['MetaMask','https://metamask.io/download/','metamask.svg'],['Trust Wallet','https://trustwallet.com/download','trust-wallet.svg'],['Rabby Wallet','https://rabby.io/','rabby.png'],['Coinbase Wallet','https://www.coinbase.com/wallet/downloads','coinbase-wallet.png']].map(([name,url,logo]) => `<li><a class="naro-wallet-option" href="${url}" target="_blank" rel="noopener noreferrer"><img class="wallet-brand-logo" src="./assets/wallets/${logo}" alt="" width="40" height="40"><span class="wallet-option-copy"><strong>${esc(name)}</strong><span>${esc(t('wallet.install',{name}))}</span></span>${icon('external')}</a></li>`).join('')}</ul></section><div class="wallet-qr"><strong>${esc(t('wallet.qr'))}</strong><p class="small muted">${esc(t('wallet.qrNote'))}</p></div>`}<p class="wallet-security small muted">${esc(t('wallet.security'))}</p>`;
  dialogContent.setAttribute('aria-busy', String(busy));
  if (focused) {
    const target = [...dialogContent.querySelectorAll('[data-action]')].find(el => (el.dataset.walletId || el.dataset.action) === focused && !el.disabled);
    (target || dialog.querySelector('[data-action="close"]')).focus({preventScroll:true});
  }
}

function openDialog(kind, trigger) {
  previousTrigger = trigger;
  dialogKind = kind;
  if (kind === 'wallet') {
    discovery.refresh();
    renderWallet();
  }
  if (kind === 'activation') {
    dialogContent.innerHTML = `<h2 id="dialog-title">${esc(t('activation.title'))}</h2><p>${esc(t('activation.note'))}</p><form id="activation-form" novalidate><div class="naro-field"><label for="activation-code">${esc(t('activation.code'))}</label><input id="activation-code" class="naro-input" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="${esc(t('activation.placeholder'))}" aria-describedby="activation-feedback"><p id="activation-feedback" class="naro-field__hint" aria-live="polite">${esc(t('activation.hint'))}</p></div><button class="naro-button naro-button--secondary" type="submit">${esc(t('activation.check'))}</button></form><dl class="quote-list"><div><dt>${esc(t('activation.fee'))}</dt><dd>${esc(t('activation.unavailable'))}</dd></div><div><dt>${esc(t('activation.gas'))}</dt><dd>${esc(t('activation.gasNote'))}</dd></div></dl><button class="naro-button" type="button" disabled>${esc(t('activation.disabled'))}</button><p class="muted small">${esc(t('activation.boundary'))}</p>`;
  }
  if (kind === 'help') {
    dialogContent.innerHTML = `<h2 id="dialog-title">${esc(t('help.title'))}</h2><p>${esc(t('help.intro'))}</p><details open><summary>${esc(t('help.rewards'))}</summary><p>${esc(t('help.rewardsAnswer'))}</p></details><details><summary>${esc(t('help.inviter'))}</summary><p>${esc(t('help.inviterAnswer'))}</p></details><div class="official-links"><a href="https://naro-jh2z240.gamma.site/" target="_blank" rel="noopener noreferrer">${esc(t('help.docs'))}${icon('external')}</a><a href="https://x.com/Naro_Officials" target="_blank" rel="noopener noreferrer">${esc(t('help.x'))}${icon('external')}</a></div><h3>${esc(t('help.languages'))}</h3><p class="muted small">English · 简体中文 · 繁體中文 · 한국어 · 日本語 · Tiếng Việt · हिन्दी · اردو · Bahasa Indonesia</p><p class="muted small">${esc(t('help.languageNote'))}</p>`;
  }
  dialog.showModal();
  dialog.querySelector('[data-action="close"]').focus({preventScroll:true});
}

dialog.addEventListener('close', () => { (previousTrigger?.isConnected ? previousTrigger : document.getElementById('wallet-button')).focus({preventScroll:true}); });
document.addEventListener('click', async event => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;
  event.preventDefault();
  const action = trigger.dataset.action;
  if (['wallet','activation','help'].includes(action)) return openDialog(action, trigger);
  if (action === 'close') return dialog.close();
  if (action === 'connect-provider') { const entry = discovery.entries.find(item => item.id === trigger.dataset.walletId); if (entry) await wallet.connect(entry); return; }
  if (action === 'switch-network') return wallet.switchNetwork();
  if (action === 'refresh-wallets') { discovery.refresh(); renderWallet(); return; }
  if (action === 'forget-wallet') { wallet.forget(); announce(t('wallet.forgotten')); return; }
  if (action === 'preview-connect' || action === 'preview-disconnect') {
    account = action === 'preview-connect' ? 'setup' : 'public';
    stateSelect.value = account;
    dialog.close();
    render();
    document.getElementById('wallet-button').focus({preventScroll:true});
    announce(t('review.note'));
  }
  if (action === 'copy') {
    const invitation = `${location.origin}${location.pathname}?invite=DEMONARO#overview`;
    try {
      await navigator.clipboard.writeText(invitation);
      announce(t('community.copied'));
    } catch {
      previousTrigger = trigger;
      dialogContent.innerHTML = `<h2 id="dialog-title">${esc(t('copy.label'))}</h2><p>${esc(t('community.copyFallback'))}</p><label class="naro-field">${esc(t('copy.label'))}<input class="naro-input" readonly value="${esc(invitation)}"></label>`;
      dialog.showModal();
    }
  }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'activation-form') return;
  event.preventDefault();
  const input = document.getElementById('activation-code');
  const feedback = document.getElementById('activation-feedback');
  const valid = /^[a-z0-9]{4,16}$/i.test(input.value.trim());
  input.setAttribute('aria-invalid', String(!valid));
  feedback.dataset.state = valid ? 'success' : 'error';
  feedback.textContent = t(valid ? 'activation.valid' : 'activation.invalid');
  if (!valid) input.focus();
});
document.addEventListener('input', event => {
  if (event.target.id !== 'activation-code') return;
  event.target.removeAttribute('aria-invalid');
  const feedback = document.getElementById('activation-feedback');
  feedback.removeAttribute('data-state');
  feedback.textContent = t('activation.hint');
});
stateSelect.addEventListener('change', () => { account = stateSelect.value; render(); announce(t('review.note')); });
localeSelect.addEventListener('change', () => { locale = localeSelect.value; render(); announce(t('locale.changed')); });
window.addEventListener('hashchange', () => {
  const target = location.hash.slice(1);
  if (!views.includes(target)) return;
  view = target;
  render();
  main.focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
});
discovery = discoverWallets(window, () => { if (dialog.open && dialogKind === 'wallet') renderWallet(); });
render();
