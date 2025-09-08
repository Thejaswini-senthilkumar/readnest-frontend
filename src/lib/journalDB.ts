// src/lib/journalDB.ts
import { openDB, IDBPDatabase } from 'idb';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  wordCount: number;
  keywords?: { [word: string]: number }; // simple freq map (for future search/embeddings)
}

const DB_NAME = 'readnest-journals';
const STORE = 'journals';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const s = db.createObjectStore(STORE, { keyPath: 'id' });
          s.createIndex('by-updated', 'updatedAt');
          s.createIndex('by-title', 'title');
        }
      }
    });
  }
  return dbPromise;
}

function extractKeywords(text: string, topN = 30) {
  // very simple tokenization + frequency — replace later with real embeddings if needed
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const freq: Record<string, number> = {};
  for (const t of tokens) {
    if (t.length <= 2) continue; // ignore tiny tokens
    freq[t] = (freq[t] || 0) + 1;
  }

  // keep topN only
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN);
  const out: Record<string, number> = {};
  for (const [k, v] of sorted) out[k] = v;
  return out;
}

export async function getAllJournals(): Promise<JournalEntry[]> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');
  const items = await tx.store.getAll();
  // sort by updatedAt desc
  items.sort((a: JournalEntry, b: JournalEntry) => (b.updatedAt > a.updatedAt ? 1 : -1));
  return items;
}

export async function getJournal(id: string): Promise<JournalEntry | undefined> {
  const db = await getDB();
  return db.get(STORE, id);
}

export async function createJournal(title: string, content = ''): Promise<JournalEntry> {
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: `j_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    title: title || 'Untitled',
    content,
    createdAt: now,
    updatedAt: now,
    wordCount: content ? content.split(/\s+/).filter(Boolean).length : 0,
    keywords: extractKeywords(content || '')
  };
  const db = await getDB();
  await db.put(STORE, entry);
  return entry;
}

export async function updateJournal(entry: JournalEntry): Promise<JournalEntry> {
  const now = new Date().toISOString();
  const updated: JournalEntry = {
    ...entry,
    updatedAt: now,
    wordCount: entry.content ? entry.content.split(/\s+/).filter(Boolean).length : 0,
    keywords: extractKeywords(entry.content || '')
  };
  const db = await getDB();
  await db.put(STORE, updated);
  return updated;
}

export async function deleteJournal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}
