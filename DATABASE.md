# WorshipLive Database Documentation

## Overview

WorshipLive uses **RxDB** as its local-first database solution with **Dexie** as the underlying storage engine. The database runs in the browser and uses IndexedDB for client-side persistence, enabling offline-first functionality for worship service management.

### Technology Stack
- **RxDB**: Reactive database for JavaScript
- **Dexie**: IndexedDB wrapper for browser storage
- **Storage Engine**: Dexie storage plugin with AJV validation
- **Dev Mode**: RxDB DevMode plugin (development only)

### Key Features
- **Local-first**: All data stored locally in the browser
- **Reactive**: Real-time subscriptions to data changes
- **Offline-capable**: Full offline support with IndexedDB persistence
- **Validated**: AJV schema validation on all database operations
- **Single Instance**: Multi-instance disabled to prevent conflicts

---

## Database Initialization

The database is initialized via the `getDatabase()` function in [src/components/database.jsx](src/components/database.jsx).

```javascript
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
    // Create collections with schemas
    await db.addCollections({
      songs: { schema: songSchema },
      playlists: { schema: playlistSchema },
      backgrounds: { schema: backgroundSchema }
    });
    return db;
  });
  
  return dbPromise;
}
```

**Caching**: The database promise is cached using a closure variable to ensure only one database instance exists throughout the application lifecycle.

---

## Collections & Schemas

### 1. Songs Collection

Stores all worship songs and hymns with their lyrics, metadata, and presentation settings.

#### Schema Definition
```javascript
{
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
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (max 100 characters) |
| `title` | string | Yes | Song title |
| `author` | string | No | Song author/composer |
| `stanzas` | array | No | Array of song stanzas/verses |
| `stanzas[].type` | string | No | Stanza type (e.g., "verse", "chorus") |
| `stanzas[].label` | string | No | Stanza label (e.g., "Verse 1", "Chorus") |
| `stanzas[].lines` | string | No | Full text of the stanza |
| `default_background` | string | No | Default background ID for presentation |
| `category` | string | No | Song category (worship, hymn, contemporary, gospel, christmas, easter, other) |
| `created_date` | string | No | ISO 8601 timestamp when song was created |
| `updated_date` | string | No | ISO 8601 timestamp when song was last updated |

#### Example Document
```json
{
  "id": "1j2k3l4m5n6o7p8q9r0s",
  "title": "Amazing Grace",
  "author": "John Newton",
  "category": "hymn",
  "stanzas": [
    {
      "type": "verse",
      "label": "Verse 1",
      "lines": "Amazing grace, how sweet the sound\nThat saved a wretch like me"
    },
    {
      "type": "chorus",
      "label": "Chorus",
      "lines": "Grace, grace, God's grace"
    }
  ],
  "default_background": "bg_sunset_01",
  "created_date": "2024-12-23T10:30:00.000Z",
  "updated_date": "2024-12-23T15:45:00.000Z"
}
```

#### Usage in Application
- **Create**: New songs added via Songs page editor
- **Read**: Songs displayed in song list and presented during services
- **Update**: Song details and lyrics edited in SongEditor component
- **Delete**: Songs removed from library
- **Query**: Sorted by creation date (descending), filtered by category or search terms

---

### 2. Playlists Collection

Stores service playlists which are ordered collections of songs for a specific worship service or date.

#### Schema Definition
```javascript
{
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
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (max 100 characters) |
| `name` | string | Yes | Playlist name (e.g., "Sunday Service - Dec 23") |
| `date` | string | No | ISO 8601 date for the service |
| `song_ids` | array | No | Ordered array of song IDs in this playlist |
| `created_date` | string | No | ISO 8601 timestamp when playlist was created |
| `updated_date` | string | No | ISO 8601 timestamp when playlist was last modified |

#### Example Document
```json
{
  "id": "2a3b4c5d6e7f8g9h0i1j",
  "name": "Sunday Morning Service - Dec 23",
  "date": "2024-12-23",
  "song_ids": [
    "1j2k3l4m5n6o7p8q9r0s",
    "3x4y5z6a7b8c9d0e1f2g",
    "5m6n7o8p9q0r1s2t3u4v"
  ],
  "created_date": "2024-12-20T14:00:00.000Z",
  "updated_date": "2024-12-23T08:15:00.000Z"
}
```

#### Relationships
- **Songs**: References songs by their IDs in the `song_ids` array
- **Resolution**: When displaying a playlist, song IDs must be resolved to full song documents from the Songs collection

#### Usage in Application
- **Create**: Playlists created via Playlists page
- **Read**: Displayed on home page and in playlist editor
- **Update**: Songs reordered and edited in PlaylistEditor component
- **Delete**: Playlists removed from library
- **Query**: Sorted by date (descending), filtered by upcoming/past status
- **Presentation**: Used to present songs in order during services

---

### 3. Backgrounds Collection

Stores presentation backgrounds (images and videos) used during song presentation.

#### Schema Definition
```javascript
{
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
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (max 100 characters) |
| `name` | string | Yes | Display name for the background |
| `type` | string | No | Media type (image or video) |
| `url` | string | Yes | URL or data URL of the background media |
| `category` | string | No | Background category (nature, abstract, church, cross, sky, water, custom) |
| `created_date` | string | No | ISO 8601 timestamp when background was added |

#### Example Documents

**Preset Background (from Unsplash)**
```json
{
  "id": "bg_sunset_01",
  "name": "Sunset Sky",
  "type": "image",
  "url": "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80",
  "category": "sky",
  "created_date": "2024-12-20T00:00:00.000Z"
}
```

**Custom Uploaded Background (Data URL)**
```json
{
  "id": "1a2b3c4d5e6f7g8h9i0j",
  "name": "Custom Church Photo",
  "type": "image",
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "category": "custom",
  "created_date": "2024-12-23T10:30:00.000Z"
}
```

#### Preset Backgrounds
The application includes preset backgrounds from Unsplash:
- Sunset Sky (sky category)
- Mountain Sunrise (nature category)
- Church Interior (church category)
- Beautiful Cross (cross category)
- Ocean Waves (water category)
- Abstract Patterns (abstract category)

#### Storage
- **Preset backgrounds**: Stored as URLs pointing to external Unsplash images
- **Custom backgrounds**: Converted to Data URLs using FileReader API and stored locally in IndexedDB

#### Usage in Application
- **Create**: Custom backgrounds uploaded via BackgroundPicker component
- **Read**: Listed in background picker modal
- **Update**: Not typically updated after creation
- **Delete**: Removed when user selects a different background
- **Query**: Filtered by category and type
- **Presentation**: Applied as the visual background during song display

---

## Helper Functions

### `getDatabase()`
Returns a promise that resolves to the database instance.

```javascript
const db = await getDatabase();
```

**Features**:
- Lazy initialization on first call
- Caches database instance for subsequent calls
- Ensures single database instance throughout application

**Usage**:
```javascript
const db = await getDatabase();
db.songs.find().$.subscribe(songs => {
  // React to song changes
});
```

---

### `generateId()`
Generates unique identifiers using timestamp and random components.

```javascript
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
```

**Format**: Base-36 encoded timestamp + random alphanumeric string
**Example**: `1j2k3l4m5n6o7p8q9r0s`

**Usage**:
```javascript
const newSong = {
  id: generateId(),
  title: 'My New Song'
};
```

---

### `getCurrentTimestamp()`
Returns the current timestamp in ISO 8601 format for recording creation and update times.

```javascript
export function getCurrentTimestamp() {
  return new Date().toISOString();
}
```

**Format**: ISO 8601 (e.g., `2024-12-23T15:45:00.000Z`)

**Usage**:
```javascript
const newSong = {
  id: generateId(),
  title: 'My New Song',
  created_date: getCurrentTimestamp(),
  updated_date: getCurrentTimestamp()
};
```

---

## Common Operations

### Reading Data with Reactive Subscriptions

```javascript
// Get all songs, sorted by creation date
const subscription = db.songs.find({
  sort: [{ created_date: 'desc' }]
}).$.subscribe(songs => {
  setSongs(songs.map(doc => doc.toJSON()));
});

// Clean up subscription
subscription.unsubscribe();
```

### Creating Documents

```javascript
await db.songs.insert({
  id: generateId(),
  title: 'Amazing Grace',
  author: 'John Newton',
  category: 'hymn',
  stanzas: [...],
  created_date: getCurrentTimestamp(),
  updated_date: getCurrentTimestamp()
});
```

### Updating Documents

```javascript
await db.songs.findOne(songId).update({
  $set: {
    title: 'Updated Title',
    updated_date: getCurrentTimestamp()
  }
});
```

### Deleting Documents

```javascript
await db.songs.findOne(songId).remove();
```

### Querying with Filters

```javascript
// Find songs by category
const worshipSongs = await db.songs.find({
  selector: { category: 'worship' }
}).exec();

// Find with limit and sort
const recentSongs = await db.songs.find({
  sort: [{ created_date: 'desc' }],
  limit: 5
}).exec();
```

---

## Data Flow in Pages

### Songs Page
1. Initialize database connection
2. Subscribe to all songs with sorting
3. Display song list
4. Allow creation, editing, and deletion
5. Maintain reactive updates as changes occur

### Playlists Page
1. Initialize database connection
2. Subscribe to all playlists with date sorting
3. Display playlist list
4. Allow creation and deletion
5. Show upcoming vs. past playlists

### Playlist Editor
1. Load specific playlist by ID
2. Subscribe to playlist changes
3. Subscribe to all songs for selection
4. Allow drag-and-drop reordering of songs
5. Save song order to `song_ids` array
6. Update `updated_date` on changes

### Present Page
1. Load either a single song or a playlist
2. Subscribe to real-time song updates
3. Display current song with background
4. Support navigation between songs
5. Use broadcast channels for multi-screen synchronization

### Background Picker
1. Load preset backgrounds
2. Subscribe to custom backgrounds collection
3. Allow file upload conversion to Data URL
4. Store custom backgrounds in database
5. Return selected background URL to parent component

### Present View - Advanced Database Usage

The Present view ([src/pages/Present.jsx](src/pages/Present.jsx)) is the main presentation controller and uses the database extensively for real-time presentation management.

#### Initialization and Data Loading

```javascript
const urlParams = new URLSearchParams(window.location.search);
const playlistId = urlParams.get('playlist');
const songId = urlParams.get('song');

// Generate consistent session ID for multi-screen sync
const sessionId = playlistId || songId || 'quick-present';
```

The Present view supports two modes:
- **Playlist Mode** (`?playlist=<id>`): Present all songs from a playlist in order
- **Single Song Mode** (`?song=<id>`): Present a single song

#### Dual Subscription Pattern

The view establishes two parallel database subscriptions:

```javascript
// Subscribe to ALL songs (for single song mode and song lookup)
songsSub = db.songs.find().$.subscribe(docs => {
  const songsData = docs.map(d => d.toJSON());
  setAllSongs(songsData);
  
  if (songId) {
    setSongs(songsData.filter(s => s.id === songId));
  }
});

// Subscribe to specific PLAYLIST (for playlist mode)
if (playlistId) {
  playlistSub = db.playlists.findOne(playlistId).$.subscribe(doc => {
    if (doc) {
      const playlist = doc.toJSON();
      setCurrentPlaylist(playlist);
    }
  });
}
```

This dual subscription approach enables:
1. **Reactive updates**: If songs are edited while presenting, display updates automatically
2. **Playlist awareness**: Changes to playlist content (reordering, adding/removing songs) take effect immediately
3. **Song lookup**: All songs are cached to resolve song IDs from the playlist's `song_ids` array

#### Song Resolution from Playlist

```javascript
// When playlist data changes, resolve song IDs to full song objects
useEffect(() => {
  if (currentPlaylist?.song_ids && allSongs.length > 0) {
    const orderedSongs = currentPlaylist.song_ids
      .map(id => allSongs.find(s => s.id === id))
      .filter(Boolean);  // Remove any undefined entries
    setSongs(orderedSongs);
  }
}, [currentPlaylist, allSongs]);
```

This ensures:
- Songs are presented in the exact order defined in the playlist's `song_ids` array
- Missing songs are gracefully filtered out (if a song was deleted)
- The presentation order automatically reflects playlist modifications

#### Data Accessed During Presentation

```javascript
const currentSong = songs[currentSongIndex];
const currentStanza = currentSong?.stanzas?.[currentStanzaIndex];
const background = liveBackground || currentSong?.default_background;
```

The view accesses:
- **Song Title** (`currentSong.title`): Displayed in the song list
- **Stanzas** (`currentSong.stanzas[]`): Contains verse/chorus text and metadata
- **Default Background** (`currentSong.default_background`): Fallback background ID
- **Playlist Name** (`currentPlaylist.name`): Shown in the UI header

#### Multi-Screen Synchronization

The Present view uses BroadcastChannel API with the database to sync across windows:

```javascript
// Session ID derived from database content (playlist or song)
const sessionId = playlistId || songId || 'quick-present';

// Create named broadcast channel for this presentation session
const channel = new BroadcastChannel(`presentation-${sessionId}`);

// Send presentation state to other windows
const state = {
  stanza: currentStanza,
  background,
  songTitle: currentSong?.title,
  song: currentSong,
  stanzaIndex: currentStanzaIndex,
  isBlank,
  clearText,
  showTitleSlide: currentStanzaIndex === -1
};

broadcastChannel.postMessage({ 
  type: 'PRESENTATION_UPDATE', 
  state 
});
```

This enables:
- **Controller Window**: Present.jsx controls navigation
- **Mirror Display**: Separate window shows the presentation on another screen
- **Teleprompter**: Separate window shows text with scroll controls
- **Real-time Sync**: All windows stay synchronized via database subscriptions

#### Navigation and Stanza Management

The view manages presentation flow through stanza indices:

```javascript
// -1 = Title slide, 0+ = Stanza index
const [currentStanzaIndex, setCurrentStanzaIndex] = useState(-1);

const goNext = () => {
  if (!currentSong) return;
  const stanzas = currentSong.stanzas || [];
  
  // Move through stanzas in current song
  if (currentStanzaIndex < stanzas.length - 1) {
    setCurrentStanzaIndex(currentStanzaIndex + 1);
  } 
  // Move to next song's title slide
  else if (currentSongIndex < songs.length - 1) {
    setCurrentSongIndex(currentSongIndex + 1);
    setCurrentStanzaIndex(-1);  // Show title
  }
};
```

#### Keyboard Controls

```javascript
// Arrow keys and space: Navigate stanzas
// B key: Toggle blank screen
// Escape: Clear blank screen
const handleKeyDown = (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    goNext();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    goPrevious();
  } else if (e.key === 'b' || e.key === 'B') {
    setIsBlank(prev => !prev);
  }
};
```

#### Background Handling

The view supports live background changes while presenting:

```javascript
// Use live override if set, otherwise use song's default
const background = liveBackground || currentSong?.default_background;

// Background change triggers broadcast update
const handleBackgroundChange = (backgroundId) => {
  setLiveBackground(backgroundId);
};
```

#### Real-Time Updates Example

If a song's stanzas are edited while presenting:
1. Edit occurs in Songs page → Database updated
2. Present view's `db.songs.find()` subscription triggers
3. `setAllSongs()` called with updated data
4. React re-renders with new stanza content
5. BroadcastChannel sends update to all open windows
6. Mirror and Teleprompter windows receive update via BroadcastChannel listener

#### Cleanup on Unmount

```javascript
return () => {
  if (playlistSub) playlistSub.unsubscribe();
  if (songsSub) songsSub.unsubscribe();
  if (broadcastChannel) broadcastChannel.close();
};
```

Critical for:
- Preventing memory leaks from active subscriptions
- Closing database connections when leaving present view
- Closing broadcast channel to free system resources

#### Session Management

The session ID uniquely identifies a presentation session:

```javascript
const sessionId = playlistId || songId || 'quick-present';
```

This allows:
- Multiple independent presentations to run simultaneously
- Each with its own BroadcastChannel (`presentation-${sessionId}`)
- Clean separation between different worship services or rehearsals

---

## Storage & Persistence

### Storage Location
- **Browser**: IndexedDB (automatic)
- **Database Name**: `worshiplive`
- **Scope**: Per-origin (domain + protocol)

### Persistent Data
All collections persist automatically via IndexedDB:
- Songs library
- Playlists and their song orders
- Custom backgrounds (as Data URLs)

### Data Retention
- Data persists across browser sessions
- Data is cleared when user clears browser data/cache
- Each user on the same device has separate data (different IndexedDB instances)

---

## Validation

### AJV Schema Validation
All database operations are validated against their schemas using AJV:
- Type checking (string, array, object, etc.)
- Enum validation for category and type fields
- Required field validation
- Max length validation for IDs

### Validation Errors
Validation errors will be caught in try-catch blocks during insert/update operations:

```javascript
try {
  await db.songs.insert(invalidSong);
} catch (error) {
  console.error('Validation failed:', error);
  // Handle error
}
```

---

## Development Mode

In development environment (`import.meta.env.DEV`), the RxDB DevMode plugin is enabled, which:
- Provides enhanced error messages
- Validates schema compliance more strictly
- Logs database operations
- Helps identify potential issues early

This is useful for debugging but can be disabled by removing the dev mode plugin initialization.

---

## Performance Considerations

### Indexing
- Primary keys are automatically indexed
- Consider adding secondary indexes for frequently queried fields if performance becomes an issue

### Subscriptions
- Always unsubscribe from subscriptions in cleanup functions to prevent memory leaks
- Use specific queries instead of loading all documents when possible

### Batch Operations
- For multiple insertions, consider batching operations
- Update documents individually when specific fields change

### Data URL Limits
- Custom backgrounds stored as Data URLs can be large
- IndexedDB has size limits (typically 50MB+, browser-dependent)
- Monitor custom background storage to prevent quota exceeded errors

---

---

## Present View Architecture Diagram

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INDEXEDDB STORAGE                             │
│  ┌──────────────────┬──────────────────┬──────────────────────────────┐ │
│  │   SONGS          │   PLAYLISTS      │   BACKGROUNDS                 │ │
│  │  collection      │  collection      │   collection                  │ │
│  │                  │                  │                               │ │
│  │ ├─ id            │ ├─ id            │ ├─ id                         │ │
│  │ ├─ title         │ ├─ name          │ ├─ name                       │ │
│  │ ├─ author        │ ├─ date          │ ├─ type (image/video)         │ │
│  │ ├─ stanzas[]     │ ├─ song_ids[]    │ ├─ url                        │ │
│  │ │ ├─ type        │ ├─ created_date  │ ├─ category                   │ │
│  │ │ ├─ label       │ └─ updated_date  │ └─ created_date               │ │
│  │ │ └─ lines       │                  │                               │ │
│  │ ├─ category      │                  │                               │ │
│  │ ├─ default_bg    │                  │                               │ │
│  │ ├─ created_date  │                  │                               │ │
│  │ └─ updated_date  │                  │                               │ │
│  └──────────────────┴──────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         ▲                                ▲
         │                                │
    SUBSCRIPTION 1:               SUBSCRIPTION 2:
    db.songs.find()               db.playlists.findOne(id)
         │                                │
         └────────────┬────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────────────────┐
│                     PRESENT VIEW COMPONENT                               │
│  (src/pages/Present.jsx)                                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STATE MANAGEMENT                                                 │  │
│  │                                                                  │  │
│  │  allSongs[] ◄──── Songs subscription (all songs)               │  │
│  │  currentPlaylist ◄── Playlist subscription                     │  │
│  │  songs[] ◄────── Resolved from playlist.song_ids              │  │
│  │  currentSongIndex ──► Index in songs[]                        │  │
│  │  currentStanzaIndex ──► Index in song.stanzas[] (-1=title)    │  │
│  │  liveBackground ──► Override background ID                    │  │
│  │  isBlank ──► True if screen should be blank                   │  │
│  │  clearText ──► Clear text before next stanza                  │  │
│  │                                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ COMPUTED VALUES                                                  │  │
│  │                                                                  │  │
│  │  currentSong = songs[currentSongIndex]                          │  │
│  │  currentStanza = currentSong.stanzas[currentStanzaIndex]        │  │
│  │  background = liveBackground || currentSong.default_background │  │
│  │                                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ NAVIGATION FUNCTIONS                                             │  │
│  │                                                                  │  │
│  │  goNext() ───► Advance to next stanza or song                  │  │
│  │  goPrevious() ─► Go back to previous stanza or song            │  │
│  │  goToStanza(songIdx, stanzaIdx) ─► Jump to specific location   │  │
│  │                                                                 │  │
│  │  Keyboard Shortcuts:                                            │  │
│  │  • Arrow Right / Space / Page Down ─► goNext()                 │  │
│  │  • Arrow Left / Page Up ─► goPrevious()                        │  │
│  │  • B Key ─► Toggle blank screen                                │  │
│  │  • Escape ─► Clear blank screen                                │  │
│  │                                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────┬──────────────────────┬──────────────────┬────────────┘
                   │                      │                  │
                   │                      │                  │
          RENDER 1 │           RENDER 2 │        RENDER 3│
                   │                      │                  │
┌──────────────────▼─────┐  ┌─────────────▼─────────┐  ┌────▼──────────────┐
│  PRESENTATION          │  │  SONG LIST (Left      │  │  SLIDE STRIP      │
│  DISPLAY               │  │  Sidebar)             │  │  (Bottom)         │
│                        │  │                       │  │                   │
│ ┌────────────────────┐ │  │ Songs:                │  │ Title | V1 | Cho│ │
│ │ Background Image  │ │  │ ├─ Song 1             │  │       (active)   │ │
│ │                   │ │  │ ├─ Song 2 (current)   │  │                   │
│ │                   │ │  │ └─ Song 3             │  │ Auto-scrolls to  │
│ │                   │ │  │                       │  │ active stanza    │
│ │  [Song Title]     │ │  │ Stanzas in current:   │  │                   │
│ │                   │ │  │ ├─ Title (active)     │  │ Reflects current│ │
│ │  Stanza Text Here │ │  │ ├─ Verse 1            │  │ presentation     │ │
│ │                   │ │  │ └─ Chorus             │  │ position         │ │
│ │                   │ │  │                       │  │                   │
│ │                   │ │  │ On Click:             │  │ On Click:         │
│ │                   │ │  │ goToStanza(idx, -1)   │  │ goToStanza()      │
│ │                   │ │  │ goToStanza(idx, idx)  │  │                   │
│ └────────────────────┘ │  │                       │  │                   │
│                        │  └───────────────────────┘  └───────────────────┘
│ (Updates via Broadcast)   (Updates via State)      (Updates via State)
│                        │
│ Controls & Buttons:    │
│ • Home Button          │
│ • Mirror Window        │
│ • Teleprompter         │
│ • Fullscreen           │
│ • Background Picker    │
│                        │
└────────────────────────┘
         ▲
         │
         │ postMessage via BroadcastChannel
         │
```

### Multi-Window Broadcast Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PRESENT VIEW (Controller)                          │
│                                                                       │
│  State changes (navigation, background, blank):                      │
│  currentSongIndex, currentStanzaIndex, isBlank, etc.               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ useEffect hook triggered on state change                    │    │
│  │                                                              │    │
│  │ const state = {                                             │    │
│  │   stanza: currentStanza,                                    │    │
│  │   background,                                               │    │
│  │   songTitle: currentSong?.title,                            │    │
│  │   song: currentSong,                                        │    │
│  │   stanzaIndex: currentStanzaIndex,                          │    │
│  │   isBlank,                                                  │    │
│  │   clearText,                                                │    │
│  │   showTitleSlide: currentStanzaIndex === -1                │    │
│  │ };                                                          │    │
│  │                                                              │    │
│  │ broadcastChannel.postMessage({                              │    │
│  │   type: 'PRESENTATION_UPDATE',                              │    │
│  │   state                                                     │    │
│  │ });                                                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                    Session ID: presentation-${sessionId}
                                │
                ┌───────────────┼───────────────┐
                │               │               │
         ┌──────▼─────┐  ┌──────▼──────┐  ┌────▼──────────┐
         │   MIRROR   │  │ TELEPROMPTER│  │  OTHER WINDOWS│
         │  DISPLAY   │  │   WINDOW    │  │               │
         │            │  │             │  │               │
         │ Listens on │  │ Listens on  │  │ Listens on    │
         │ Broadcast  │  │ Broadcast   │  │ Broadcast     │
         │ Channel    │  │ Channel     │  │ Channel       │
         │            │  │             │  │               │
         │ Updates:   │  │ Updates:    │  │               │
         │ • Display  │  │ • Text      │  │ • Can mirror │
         │ • Stanza   │  │ • Scroll    │  │   or show    │
         │ • BG       │  │ • Position  │  │   different  │
         │            │  │             │  │   content    │
         └────────────┘  └─────────────┘  └───────────────┘
```

### Song Resolution Flow (Playlist Mode)

```
URL: ?playlist=playlist-id-123

Step 1: Parse URL
  playlistId = "playlist-id-123"

Step 2: Subscribe to Playlist Document
  db.playlists.findOne("playlist-id-123").$.subscribe(doc)
  
  Retrieved document:
  {
    id: "playlist-id-123",
    name: "Sunday Service",
    song_ids: ["song-1", "song-2", "song-3"],
    date: "2024-12-23"
  }
  
  setCurrentPlaylist(playlistData)

Step 3: Subscribe to ALL Songs (in parallel)
  db.songs.find().$.subscribe(docs)
  
  Retrieved documents:
  {
    id: "song-1",
    title: "Amazing Grace",
    stanzas: [...]
  }
  {
    id: "song-2",
    title: "Holy Holy Holy",
    stanzas: [...]
  }
  {
    id: "song-3",
    title: "Jesus Loves Me",
    stanzas: [...]
  }
  
  setAllSongs(allSongsData)

Step 4: Resolution Effect (triggers when either changes)
  When currentPlaylist changes:
    currentPlaylist.song_ids = ["song-1", "song-2", "song-3"]
  
  When allSongs changes:
    allSongs = [all song documents]
  
  Resolution mapping:
    orderedSongs = currentPlaylist.song_ids.map(id => 
      allSongs.find(s => s.id === id)
    ).filter(Boolean)
  
  Result:
    songs[] = [
      { id: "song-1", title: "Amazing Grace", stanzas: [...] },
      { id: "song-2", title: "Holy Holy Holy", stanzas: [...] },
      { id: "song-3", title: "Jesus Loves Me", stanzas: [...] }
    ]

Step 5: Use Resolved Songs
  currentSongIndex = 0
  currentSong = songs[0] = Amazing Grace document
  currentStanza = currentSong.stanzas[0]
  
  Display with full song data
```

### State Transition Diagram

```
                    ┌─────────────────┐
                    │   TITLE SLIDE   │
                    │ stanzaIndex=-1  │
                    └────────┬────────┘
                             │
                        goNext()
                             │
                    ┌────────▼────────┐
                    │   VERSE 1       │
                    │ stanzaIndex=0   │
                    └────────┬────────┘
                             │
                        goNext()
                             │
                    ┌────────▼────────┐
                    │   CHORUS        │
                    │ stanzaIndex=1   │
                    └────────┬────────┘
                             │
                        goNext()
                             │
                    ┌────────▼────────────────────┐
                    │  NEXT SONG TITLE SLIDE      │
                    │ songIndex++, stanzaIndex=-1 │
                    └─────────────────────────────┘
                             │
                        (repeat for all songs)
                             │
                    ┌────────▼────────────┐
                    │  END OF PLAYLIST    │
                    │ No more navigation  │
                    └─────────────────────┘

GoNext Logic:
  if stanzaIndex < stanzas.length - 1:
    stanzaIndex++  (next stanza in current song)
  else if songIndex < songs.length - 1:
    songIndex++
    stanzaIndex = -1  (show title of next song)
  else:
    (end of presentation)

GoPrevious Logic:
  if stanzaIndex > -1:
    stanzaIndex--  (previous stanza)
  else if songIndex > 0:
    songIndex--
    stanzaIndex = (prev song's stanzas.length - 1)  (last stanza of previous song)
  else:
    (at beginning)
```

### Real-Time Update Scenario

```
Timeline: Editing Song While Presenting

t=0s: Presenter at "Amazing Grace" Verse 1
     Present View displays: Amazing Grace, stanzas[0]

t=5s: Editor (another window) edits "Amazing Grace"
     Changes: "stanzas[0].lines" from "Amazing grace, how sweet the sound"
             to "Amazing grace, how sweet the sound (UPDATED)"

t=6s: RxDB detects change in songs collection
     Triggers db.songs.find().$ subscription in Present View

t=7s: setAllSongs() called with updated data
     allSongs now contains updated "Amazing Grace" document

t=8s: songs[] array updates (same index, new content)
     currentSong = songs[0] (updated document)

t=9s: currentStanza computed value updates
     currentStanza.lines = "Amazing grace, how sweet the sound (UPDATED)"

t=10s: React re-renders PresentationDisplay with new stanza text
      Presenter sees the updated lyric in real-time

t=11s: useEffect hook detects change
      broadcastChannel.postMessage() sends updated state to:
      - Mirror Display window
      - Teleprompter window
      - Any other connected windows

t=12s: Mirror and Teleprompter receive PRESENTATION_UPDATE
      They update their display to show the new lyric
```

---

## Future Enhancements

1. **Cloud Sync**: Add synchronization with a backend server
2. **Multi-device Sync**: Enable real-time sync across devices
3. **Backup/Restore**: Implement export/import functionality
4. **Migration**: Create schema migration strategy for version updates
5. **Advanced Querying**: Add full-text search for song titles and lyrics
6. **Analytics**: Track popular songs and service patterns

---

## References

- [RxDB Documentation](https://rxdb.info/)
- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [JSON Schema](https://json-schema.org/)
- [AJV Validator](https://ajv.js.org/)
