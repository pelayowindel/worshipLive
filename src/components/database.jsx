import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Add required plugins
addRxPlugin(RxDBUpdatePlugin);

// Add dev mode plugin in development
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

// Song schema
const songSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string'
    },
    author: {
      type: 'string'
    },
    stanzas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          label: { type: 'string' },
          lines: { type: 'string' }
        }
      }
    },
    default_background: {
      type: 'string'
    },
    category: {
      type: 'string',
      enum: ['worship', 'hymn', 'contemporary', 'gospel', 'christmas', 'easter', 'other'],
      default: 'worship'
    },
    created_date: {
      type: 'string'
    },
    updated_date: {
      type: 'string'
    }
  },
  required: ['id', 'title']
};

// Playlist schema
const playlistSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    date: {
      type: 'string'
    },
    song_ids: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    created_date: {
      type: 'string'
    },
    updated_date: {
      type: 'string'
    }
  },
  required: ['id', 'name']
};

// Background schema
const backgroundSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: ['image', 'video'],
      default: 'image'
    },
    url: {
      type: 'string'
    },
    category: {
      type: 'string',
      enum: ['nature', 'abstract', 'church', 'cross', 'sky', 'water', 'custom'],
      default: 'custom'
    },
    created_date: {
      type: 'string'
    }
  },
  required: ['id', 'name', 'url']
};

let dbPromise = null;

export async function getDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = createRxDatabase({
    name: 'worshiplive',
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie()
    }),
    multiInstance: false,
    ignoreDuplicate: true
  }).then(async (db) => {
    // Create collections
    await db.addCollections({
      songs: {
        schema: songSchema
      },
      playlists: {
        schema: playlistSchema
      },
      backgrounds: {
        schema: backgroundSchema
      }
    });

    return db;
  });

  return dbPromise;
}

// Helper function to generate ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper to get current timestamp
export function getCurrentTimestamp() {
  return new Date().toISOString();
}