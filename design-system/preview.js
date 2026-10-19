const status = document.getElementById('demo-status');
document.querySelectorAll('[data-demo-action]').forEach(button => button.addEventListener('click', () => {
  status.textContent = button.dataset.demoAction === 'connect'
    ? 'Connection button preview. No wallet request was sent.'
    : 'Secondary action preview. No reward data was requested.';
}));
const input = document.getElementById('invite-code');
const hint = document.getElementById('invite-hint');
document.getElementById('invite-form').addEventListener('submit', event => {
  event.preventDefault();
  const valid = /^[a-z0-9]{4,16}$/i.test(input.value.trim());
  input.setAttribute('aria-invalid', String(!valid));
  hint.dataset.state = valid ? 'success' : 'error';
  hint.textContent = valid ? 'Format valid. This preview does not verify the inviter.' : 'Enter 4–16 letters or digits.';
  status.textContent = valid ? 'Format check passed. No binding or activation occurred.' : 'Invite code format is invalid. Enter 4–16 letters or digits.';
  if (!valid) input.focus();
});
input.addEventListener('input', () => {
  input.removeAttribute('aria-invalid');
  hint.removeAttribute('data-state');
  hint.textContent = 'Use 4–16 letters or digits.';
});
const states = {
  ready: ['Ready to review', 'Review the amount and network before confirming.', 'Review claim', false, false],
  wallet: ['Confirm in your wallet', 'The wallet request is separate from transaction confirmation.', 'Awaiting wallet', true, true],
  pending: ['Transaction pending', 'Keep the transaction reference available while waiting for a receipt.', 'Waiting for receipt', true, true],
  confirmed: ['Claim confirmed', 'Show success only after verifying the receipt and refreshed account state.', 'Claim confirmed', true, false],
  error: ['Transaction failed', 'Explain the failure and preserve the context for a safe retry.', 'Review and retry', false, false]
};
const claimButton = document.getElementById('claim-button');
const select = document.getElementById('claim-state');
select.addEventListener('change', () => {
  const [heading, description, label, disabled, busy] = states[select.value];
  document.getElementById('claim-heading').textContent = heading;
  document.getElementById('claim-description').textContent = description;
  claimButton.replaceChildren();
  if (busy) {
    const spinner = document.createElement('span');
    spinner.className = 'naro-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    claimButton.append(spinner);
  }
  claimButton.append(document.createTextNode(label));
  claimButton.disabled = disabled;
  claimButton.setAttribute('aria-busy', String(busy));
  status.textContent = `${heading} state preview. No transaction was sent.`;
});
claimButton.addEventListener('click', () => {
  status.textContent = 'Action preview only. No claim, signature, or transaction was requested.';
});
