const fs = require('fs');
const path = require('path');

const seed = require('../data/seed');

const STORE_FILE = process.env.CIRCULAI_STORE_FILE || path.join(__dirname, '..', 'data', 'store.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureStoreFile() {
  const directory = path.dirname(STORE_FILE);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(clone(seed), null, 2));
  }
}

function loadStore() {
  ensureStoreFile();
  const raw = fs.readFileSync(STORE_FILE, 'utf8');
  return JSON.parse(raw);
}

function saveStore(nextState) {
  ensureStoreFile();
  fs.writeFileSync(STORE_FILE, JSON.stringify(nextState, null, 2));
  return nextState;
}

async function updateStore(mutator) {
  const state = loadStore();
  const result = await mutator(state);
  saveStore(state);
  return result;
}

function resetStore() {
  return saveStore(clone(seed));
}

module.exports = {
  STORE_FILE,
  loadStore,
  saveStore,
  updateStore,
  resetStore
};
