const fixtures = [
  { id: 'handoff', name: 'Site handoff.md', owner: 'owner', viewers: ['viewer'], body: 'FICTIONAL HANDOFF\n\nKeep the sample drawings and the open-questions list together. Review unresolved notes before making a decision.', answer: 'The fictional handoff groups sample drawings with open questions. It asks for a review of unresolved notes before a decision.' },
  { id: 'workshop', name: 'Workshop notes.txt', owner: 'owner', viewers: [], body: 'FICTIONAL WORKSHOP NOTES\n\nSeparate assumptions from evidence. Label unanswered questions. Do not turn a draft note into a promise.', answer: 'The fictional workshop notes distinguish assumptions from evidence, label unanswered questions, and avoid treating drafts as promises.' },
  { id: 'checklist', name: 'Review checklist.txt', owner: 'viewer', viewers: [], body: 'FICTIONAL REVIEW CHECKLIST\n\nCheck the source. Confirm who may read it. Keep the original record. Ask for clarification when the evidence is incomplete.', answer: 'The fictional checklist covers source review, read access, preserving originals, and clarifying incomplete evidence.' },
];
let persona = 'owner';
let selected = 'handoff';
let question = null;
const byId = (id) => document.getElementById(id);
const canRead = (fixture) => fixture.owner === persona || fixture.viewers.includes(persona);
const canManage = (fixture) => fixture.owner === persona;
function textElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}
function renderAnswer() {
  if (!question) return;
  const fixture = fixtures.find((item) => item.id === question);
  byId('answer-text').textContent = canRead(fixture)
    ? fixture.answer
    : 'No permitted fixture context for this persona. This preset example does not guess an answer from a restricted document.';
  byId('answer-source').textContent = canRead(fixture) ? `Fictional source: ${fixture.name}` : 'No fictional source available to this persona.';
}
function render() {
  const filter = byId('filter').value.trim().toLowerCase();
  const visible = fixtures.filter((fixture) => fixture.name.toLowerCase().includes(filter));
  const nodes = visible.map((fixture) => {
    const item = document.createElement('li');
    const button = textElement('button', fixture.name);
    button.type = 'button';
    button.className = 'document-button';
    button.setAttribute('aria-pressed', String(selected === fixture.id));
    button.append(textElement('span', canManage(fixture) ? 'OWNER EXAMPLE' : canRead(fixture) ? 'READ-ONLY EXAMPLE' : 'NO READ ACCESS / EXAMPLE'));
    button.addEventListener('click', () => {
      selected = fixture.id;
      render();
      byId('documents').querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
    });
    item.append(button);
    return item;
  });
  byId('documents').replaceChildren(...nodes);
  byId('document-count').textContent = `${visible.length} of ${fixtures.length} public fixtures shown`;
  const fixture = fixtures.find((item) => item.id === selected);
  byId('detail-title').textContent = fixture.name;
  byId('detail-access').textContent = canManage(fixture) ? 'Example: owner can manage' : canRead(fixture) ? 'Example: viewer can read, not manage' : 'Example: read access denied';
  byId('detail-body').textContent = canRead(fixture) ? fixture.body : 'This fictional persona cannot read this example. Switch personas to explore the different states. All fixture text remains public in the source.';
  byId('share-preview').disabled = !canManage(fixture);
  byId('share-status').textContent = '';
  byId('permission-rows').replaceChildren(...fixtures.map((item) => {
    const row = document.createElement('tr');
    row.append(textElement('th', item.name));
    row.firstElementChild.scope = 'row';
    for (const allowed of [canRead(item), canManage(item)]) {
      const cell = textElement('td', allowed ? 'Example: allowed' : 'Example: denied');
      cell.dataset.allowed = String(allowed);
      row.append(cell);
    }
    return row;
  }));
  renderAnswer();
}
document.querySelectorAll('[data-persona]').forEach((button) => {
  button.addEventListener('click', () => {
    persona = button.dataset.persona;
    document.querySelectorAll('[data-persona]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    render();
  });
});
document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach((item) => {
      const active = item === button;
      item.setAttribute('aria-pressed', String(active));
      byId(`${item.dataset.view}-panel`).hidden = !active;
    });
  });
});
document.querySelectorAll('[data-question]').forEach((button) => {
  button.addEventListener('click', () => { question = button.dataset.question; renderAnswer(); });
});
byId('filter').addEventListener('input', render);
byId('share-preview').addEventListener('click', () => {
  byId('share-status').textContent = 'Preview only. No share was created and no permissions were changed.';
});
render();
