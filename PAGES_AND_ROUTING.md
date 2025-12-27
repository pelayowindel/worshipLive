# WorshipLive Pages, Components, and Routing Guide

## Table of Contents
1. [Routing Architecture](#routing-architecture)
2. [Page Structure](#page-structure)
3. [Component Organization](#component-organization)
4. [Pages Overview](#pages-overview)
5. [Component Reference](#component-reference)
6. [Data Flow Between Pages](#data-flow-between-pages)
7. [Navigation Patterns](#navigation-patterns)

---

## Routing Architecture

### Configuration-Driven Routing

The routing system is defined in [src/pages.config.js](src/pages.config.js) and used in [src/App.jsx](src/App.jsx):

```javascript
// src/pages.config.js
export const PAGES = {
  "Home": Home,
  "Songs": Songs,
  "Playlists": Playlists,
  "PlaylistEditor": PlaylistEditor,
  "Present": Present,
  "MirrorDisplay": MirrorDisplay,
  "Teleprompter": Teleprompter,
}

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: __Layout,
};
```

### Route Setup

Routes are dynamically generated from the pages configuration:

```javascript
// src/App.jsx
const { Pages, Layout, mainPage } = pagesConfig;

<Router>
  <Routes>
    {/* Root route */}
    <Route path="/" element={
      <LayoutWrapper currentPageName={mainPageKey}>
        <MainPage />
      </LayoutWrapper>
    } />
    
    {/* Dynamic routes for all pages */}
    {Object.entries(Pages).map(([path, Page]) => (
      <Route
        key={path}
        path={`/${path}`}
        element={
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        }
      />
    ))}
    
    {/* Fallback 404 */}
    <Route path="*" element={<PageNotFound />} />
  </Routes>
</Router>
```

### Route Table

| Route | Component | Purpose | Layout |
|-------|-----------|---------|--------|
| `/` | Home | Dashboard, quick access | Shown |
| `/Home` | Home | Dashboard, quick access | Shown |
| `/Songs` | Songs | Manage song library | Shown |
| `/Playlists` | Playlists | Manage service playlists | Shown |
| `/PlaylistEditor` | PlaylistEditor | Edit specific playlist | Shown |
| `/Present` | Present | Present songs/playlists | Hidden |
| `/MirrorDisplay` | MirrorDisplay | Display on second screen | Hidden |
| `/Teleprompter` | Teleprompter | Text-only display with scroll | Hidden |
| `/*` | PageNotFound | 404 page | Shown |

---

## Page Structure

### Layout Wrapper Pattern

All pages use the LayoutWrapper component which conditionally renders the navigation:

```javascript
const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;
```

### Navigation Hiding

Presentation pages hide the navigation bar:

```javascript
// src/Layout.jsx
const hideNav = ['Present', 'MirrorDisplay', 'Teleprompter'].includes(currentPageName);

if (hideNav) {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
```

### Navigation Bar

The layout provides a sticky navigation bar with:

```javascript
const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Songs', icon: Music, page: 'Songs' },
  { name: 'Playlists', icon: ListMusic, page: 'Playlists' },
];
```

Features:
- **Logo Link**: Always links to Home
- **Active Indicator**: Shows current page with highlight
- **Responsive**: Icons for mobile, text for desktop
- **Tooltip Support**: Keyboard shortcuts info

---

## Component Organization

### Directory Structure

```
src/
├── components/
│   ├── database.jsx                    # Database initialization and helpers
│   ├── UserNotRegisteredError.jsx      # Auth error component
│   ├── presentation/                   # Presentation-specific components
│   │   ├── BackgroundPicker.jsx        # Background selection modal
│   │   ├── PresentationDisplay.jsx     # Main display renderer
│   │   ├── SlidePreview.jsx            # Slide thumbnail preview
│   │   ├── SongCard.jsx                # Song display card
│   │   ├── SongEditor.jsx              # Song creation/editing modal
│   │   └── StanzaEditor.jsx            # Stanza management component
│   └── ui/                             # Radix UI primitive components
│       ├── accordion.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       ├── form.jsx
│       ├── input.jsx
│       ├── select.jsx
│       ├── tabs.jsx
│       ├── toast.jsx
│       ├── toaster.jsx
│       └── ... (30+ UI components)
├── pages/
│   ├── Home.jsx                        # Dashboard
│   ├── Songs.jsx                       # Song library management
│   ├── Playlists.jsx                   # Playlist management
│   ├── PlaylistEditor.jsx              # Edit playlist contents
│   ├── Present.jsx                     # Main presentation controller
│   ├── MirrorDisplay.jsx               # Secondary display for projector
│   └── Teleprompter.jsx                # Presenter notes display
└── Layout.jsx                          # Application layout and navigation
```

### Component Hierarchy

```
App (Router, Providers)
│
├─ QueryClientProvider
├─ NavigationTracker
├─ Toaster
│
└─ Routes
   ├─ Home
   │  └─ Layout
   │     ├─ Navigation
   │     └─ Home Page
   │
   ├─ Songs
   │  └─ Layout
   │     ├─ Navigation
   │     └─ Songs Page
   │        ├─ SongCard
   │        ├─ SongEditor
   │        │  └─ StanzaEditor
   │        └─ Search/Filter
   │
   ├─ Playlists
   │  └─ Layout
   │     ├─ Navigation
   │     └─ Playlists Page
   │        └─ PlaylistCard
   │
   ├─ PlaylistEditor
   │  └─ Layout
   │     ├─ Navigation
   │     └─ PlaylistEditor Page
   │        ├─ SongCard (draggable)
   │        └─ Search
   │
   ├─ Present
   │  └─ PresentationLayout (no navigation)
   │     ├─ PresentationDisplay (main display)
   │     ├─ SlidePreview (thumbnails)
   │     ├─ SongList (sidebar)
   │     ├─ SlideStrip (bottom carousel)
   │     ├─ Controls (buttons)
   │     └─ BackgroundPicker (modal)
   │
   ├─ MirrorDisplay
   │  └─ PresentationDisplay (synced via BroadcastChannel)
   │
   ├─ Teleprompter
   │  └─ Text Display (synced via BroadcastChannel)
   │
   └─ PageNotFound
```

---

## Pages Overview

### Home Page

**File**: [src/pages/Home.jsx](src/pages/Home.jsx)

**Purpose**: Dashboard showing recent songs and upcoming playlists

**Features**:
- Recent songs list (last 5, sorted by date)
- Upcoming playlists (sorted by date)
- Quick action buttons
- Feature highlights
- Links to other pages

**Database Usage**:
```javascript
// Recent songs with limit
db.songs.find({
  sort: [{ created_date: 'desc' }],
  limit: 5
}).$.subscribe(docs => setSongs(...))

// Recent playlists
db.playlists.find({
  sort: [{ date: 'desc' }],
  limit: 5
}).$.subscribe(docs => setPlaylists(...))
```

**Key Props**: None (self-contained)

**Navigation**:
- "View All Songs" → `/Songs`
- "View All Playlists" → `/Playlists`
- Song click → `/Present?song=<id>`
- Playlist click → `/PlaylistEditor?id=<id>`

---

### Songs Page

**File**: [src/pages/Songs.jsx](src/pages/Songs.jsx)

**Purpose**: Manage the song library - create, edit, delete, and search

**Features**:
- Display all songs in library
- Search and filter functionality
- Create new songs with button
- Edit existing songs inline
- Delete songs
- Sort by creation date
- Real-time updates as database changes

**Database Operations**:
```javascript
// Subscribe to all songs
db.songs.find({
  sort: [{ created_date: 'desc' }]
}).$.subscribe(docs => setSongs(...))

// Create new song
await db.songs.insert({
  id: generateId(),
  title, author, stanzas, category,
  created_date: getCurrentTimestamp(),
  updated_date: getCurrentTimestamp()
})

// Update existing song
await db.songs.findOne(id).update({
  $set: { title, author, stanzas, ..., updated_date }
})

// Delete song
await db.songs.findOne(id).remove()
```

**Child Components**:
- **SongCard**: Displays individual song with preview and actions
- **SongEditor**: Modal for creating/editing songs
  - Uses **StanzaEditor** for managing stanzas

**Navigation**:
- Edit button → Opens SongEditor modal
- Delete button → Removes song
- Back button → `/Playlists`

---

### Playlists Page

**File**: [src/pages/Playlists.jsx](src/pages/Playlists.jsx)

**Purpose**: Manage service playlists - create, delete, and organize

**Features**:
- Display all playlists
- Create new playlist with name and date
- Delete playlists
- Filter upcoming vs. past playlists
- Sort by date
- Real-time updates

**Database Operations**:
```javascript
// Subscribe to all playlists
db.playlists.find({
  sort: [{ date: 'desc' }]
}).$.subscribe(docs => setPlaylists(...))

// Create new playlist
await db.playlists.insert({
  id: generateId(),
  name, date,
  song_ids: [],
  created_date: getCurrentTimestamp(),
  updated_date: getCurrentTimestamp()
})

// Delete playlist
await db.playlists.findOne(id).remove()
```

**Child Components**:
- **PlaylistCard**: Shows playlist info with action buttons

**Navigation**:
- Playlist click → `/PlaylistEditor?id=<id>`
- Present button → `/Present?playlist=<id>`
- Back button → `/Home`

---

### PlaylistEditor Page

**File**: [src/pages/PlaylistEditor.jsx](src/pages/PlaylistEditor.jsx)

**Purpose**: Edit the contents and order of songs in a playlist

**Features**:
- Load specific playlist by ID from URL (`?id=<playlistId>`)
- Display all available songs with search
- Drag-and-drop to reorder songs
- Add/remove songs from playlist
- Save changes to database
- Keyboard shortcuts for quick access
- Real-time playlist updates

**Database Operations**:
```javascript
// Load specific playlist
db.playlists.findOne(playlistId).$.subscribe(doc => {
  setCurrentPlaylist(doc.toJSON())
})

// Load all songs (for selection)
db.songs.find({
  sort: [{ created_date: 'desc' }]
}).$.subscribe(docs => setAllSongs(...))

// Update playlist song order
await db.playlists.findOne(playlistId).update({
  $set: {
    song_ids: newOrderedIds,
    updated_date: getCurrentTimestamp()
  }
})
```

**Child Components**:
- **DragDropContext**: Uses hello-pangea/dnd for drag-and-drop
- **SongCard**: Songs displayed in the playlist
- **Search Input**: Filter available songs

**URL Parameters**:
- `?id=<playlistId>` - Required to load playlist

**Navigation**:
- Back button → `/Playlists`
- Home button → `/Home`
- Present button → `/Present?playlist=<playlistId>`

---

### Present Page (Presentation Controller)

**File**: [src/pages/Present.jsx](src/pages/Present.jsx)

**Purpose**: Main presentation control center for live worship services

**Features**:
- Display current song with stanza
- Navigate between stanzas and songs
- Manage background images/videos
- Control blank screen
- View song list and slide thumbnails
- Open mirror display window
- Open teleprompter window
- Multi-screen synchronization via BroadcastChannel
- Keyboard shortcuts
- Slide strip with auto-scroll

**Database Operations**:
```javascript
// Subscribe to all songs (for single song mode)
db.songs.find().$.subscribe(docs => setAllSongs(...))

// Subscribe to specific playlist
db.playlists.findOne(playlistId).$.subscribe(doc => {
  setCurrentPlaylist(doc.toJSON())
})

// Resolution of song IDs to full documents
const orderedSongs = currentPlaylist.song_ids
  .map(id => allSongs.find(s => s.id === id))
  .filter(Boolean)
```

**URL Parameters**:
- `?playlist=<playlistId>` - Present playlist
- `?song=<songId>` - Present single song
- No params → 'quick-present' mode (empty)

**Session Management**:
```javascript
const sessionId = playlistId || songId || 'quick-present'
const channel = new BroadcastChannel(`presentation-${sessionId}`)
```

**Child Components**:
- **PresentationDisplay**: Main display area showing current stanza
- **SlidePreview**: Thumbnail preview of individual stanzas
- **SongCard**: List of songs in playlist
- **BackgroundPicker**: Modal for selecting backgrounds

**Navigation**:
- Home button → `/Home`
- Mirror button → Opens MirrorDisplay window
- Teleprompter button → Opens Teleprompter window
- Song/stanza click → Navigate to that location

**State Management**:
```javascript
const [currentSongIndex, setCurrentSongIndex] = useState(0)
const [currentStanzaIndex, setCurrentStanzaIndex] = useState(-1) // -1 = title
const [isBlank, setIsBlank] = useState(false)
const [clearText, setClearText] = useState(true)
const [liveBackground, setLiveBackground] = useState('')
```

---

### MirrorDisplay Page

**File**: [src/pages/MirrorDisplay.jsx](src/pages/MirrorDisplay.jsx)

**Purpose**: Display presentation on secondary screen (projector)

**Features**:
- Listens to BroadcastChannel from Present page
- Syncs display with main presentation
- Fullscreen support
- Auto-fullscreen on click
- Minimal UI (no controls)
- Same rendering as Present's main display

**BroadcastChannel**:
```javascript
const sessionId = new URLSearchParams(window.location.search).get('session')
const channel = new BroadcastChannel(`presentation-${sessionId}`)

channel.onmessage = (event) => {
  if (event.data?.type === 'PRESENTATION_UPDATE') {
    setState(event.data.state)
  }
}
```

**Child Components**:
- **PresentationDisplay**: Synced display (same component as Present)

**URL Parameters**:
- `?session=<sessionId>` - Session to mirror

**Opening from Present**:
```javascript
window.open(
  createPageUrl(`MirrorDisplay?session=${sessionId}`),
  '_blank',
  'width=1280,height=720,menubar=no,toolbar=no,location=no'
)
```

---

### Teleprompter Page

**File**: [src/pages/Teleprompter.jsx](src/pages/Teleprompter.jsx)

**Purpose**: Text-only display for presenter's notes and lyrics

**Features**:
- Display current stanza text in large font
- Auto-scroll to current position
- Hide when in blank screen mode
- Show title slide when applicable
- Minimal UI
- Syncs with Present page via BroadcastChannel
- Vertical scrolling for long stanzas

**BroadcastChannel**:
```javascript
const sessionId = new URLSearchParams(window.location.search).get('session')
const channel = new BroadcastChannel(`presentation-${sessionId}`)

channel.onmessage = (event) => {
  if (event.data?.type === 'PRESENTATION_UPDATE') {
    const { state } = event.data
    setCurrentSong(state.song)
    setCurrentStanzaIndex(state.stanzaIndex)
    setIsBlank(state.isBlank)
    setShowTitleSlide(state.showTitleSlide)
  }
}
```

**Display Content**:
- Title slide: Shows song title
- Blank screen: Shows nothing (black)
- Normal: Shows current stanza lines with auto-scroll

**URL Parameters**:
- `?session=<sessionId>` - Session to follow

**Opening from Present**:
```javascript
window.open(
  createPageUrl(`Teleprompter?session=${sessionId}`),
  '_blank',
  'width=800,height=900,menubar=no,toolbar=no,location=no'
)
```

---

## Component Reference

### Presentation Components

#### PresentationDisplay

**Location**: [src/components/presentation/PresentationDisplay.jsx](src/components/presentation/PresentationDisplay.jsx)

**Purpose**: Render song lyrics with background

**Props**:
```typescript
interface PresentationDisplayProps {
  stanza?: { lines: string }
  background?: string
  songTitle?: string
  isBlank?: boolean
  clearText?: boolean
  showTitleSlide?: boolean
}
```

**Features**:
- Displays stanza text with background image/video
- Falls back to gradient if no background
- Shows song title on title slide
- Black screen when isBlank is true
- Text clearing transition

---

#### SongCard

**Location**: [src/components/presentation/SongCard.jsx](src/components/presentation/SongCard.jsx)

**Purpose**: Display song information in a card format

**Props**:
```typescript
interface SongCardProps {
  song: Song
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isSelected?: boolean
}
```

**Features**:
- Shows song title and author
- Preview of first stanza
- Action buttons (edit, delete, select)
- Category badge
- Hover effects

---

#### SongEditor

**Location**: [src/components/presentation/SongEditor.jsx](src/components/presentation/SongEditor.jsx)

**Purpose**: Create or edit a song with its stanzas

**Props**:
```typescript
interface SongEditorProps {
  song?: Song
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (songData: SongData) => void
}
```

**Features**:
- Form for song title and author
- Category selection (worship, hymn, etc.)
- Stanza management with StanzaEditor
- Add/remove stanzas
- Save and cancel buttons

**Child Component**:
- **StanzaEditor**: Manages individual stanzas

---

#### StanzaEditor

**Location**: [src/components/presentation/StanzaEditor.jsx](src/components/presentation/StanzaEditor.jsx)

**Purpose**: Edit individual song stanza

**Props**:
```typescript
interface StanzaEditorProps {
  stanza: Stanza
  onChange: (stanza: Stanza) => void
  onRemove: () => void
}
```

**Features**:
- Edit stanza type (verse, chorus, etc.)
- Edit stanza label
- Edit stanza lines (multi-line textarea)
- Remove stanza button

---

#### SlidePreview

**Location**: [src/components/presentation/SlidePreview.jsx](src/components/presentation/SlidePreview.jsx)

**Purpose**: Thumbnail preview of a stanza

**Props**:
```typescript
interface SlidePreviewProps {
  stanza: Stanza
  background?: string
  isActive?: boolean
  onClick?: () => void
}
```

**Features**:
- Small preview with background
- Text truncation
- Active state highlight
- Click to select

---

#### BackgroundPicker

**Location**: [src/components/presentation/BackgroundPicker.jsx](src/components/presentation/BackgroundPicker.jsx)

**Purpose**: Select or upload background images/videos

**Props**:
```typescript
interface BackgroundPickerProps {
  value: string
  onChange: (url: string) => void
  trigger?: ReactNode
}
```

**Features**:
- Preset backgrounds from Unsplash
- Custom background upload
- File to Data URL conversion
- Database storage of custom backgrounds
- Category filtering
- Real-time preview

**Database Integration**:
```javascript
// Upload custom background
await db.backgrounds.insert({
  id: generateId(),
  name: file.name,
  url: dataUrl, // Data URL for local storage
  type: file.type.startsWith('video') ? 'video' : 'image',
  category: 'custom',
  created_date: getCurrentTimestamp()
})
```

---

### UI Components

The `src/components/ui/` directory contains Radix UI primitive components:

- **button.jsx** - Button with variants
- **input.jsx** - Text input field
- **dialog.jsx** - Modal dialog
- **card.jsx** - Card container
- **accordion.jsx** - Expandable sections
- **tabs.jsx** - Tab navigation
- **select.jsx** - Dropdown select
- **form.jsx** - Form wrapper with validation
- **toast.jsx** - Toast notifications
- **toaster.jsx** - Toast container
- **tooltip.jsx** - Tooltip popover
- **drawer.jsx** - Slide-in panel
- **dropdown-menu.jsx** - Dropdown menu
- **popover.jsx** - Floating panel
- **scroll-area.jsx** - Scrollable container
- And 20+ more Radix UI primitives...

All UI components are styled with Tailwind CSS and follow a consistent design system.

---

## Data Flow Between Pages

### Home to Songs/Playlists

```
Home Page (Dashboard)
↓
User clicks "View All Songs" or "View All Playlists"
↓
navigate('/Songs') or navigate('/Playlists')
↓
Songs/Playlists Page loads and fetches database
```

### Playlists to PlaylistEditor

```
Playlists Page
↓
User clicks specific playlist
↓
navigate(`/PlaylistEditor?id=${playlist.id}`)
↓
PlaylistEditor loads playlist from URL param
↓
useEffect reads playlistId from URL
↓
Subscribes to db.playlists.findOne(playlistId)
```

### PlaylistEditor to Present

```
PlaylistEditor Page
↓
User clicks "Present" button
↓
navigate(`/Present?playlist=${playlistId}`)
↓
Present loads and reads playlistId from URL
↓
Subscribes to specific playlist
↓
Resolves song_ids to full song documents
↓
Displays presentation
```

### Present to MirrorDisplay/Teleprompter

```
Present Page
↓
Creates BroadcastChannel(`presentation-${sessionId}`)
↓
User clicks "Mirror" or "Teleprompter" button
↓
window.open(`/MirrorDisplay?session=${sessionId}`)
↓
MirrorDisplay/Teleprompter loads
↓
Creates BroadcastChannel(`presentation-${sessionId}`)
↓
Listens for PRESENTATION_UPDATE messages
↓
Syncs display with Present page
```

### Real-Time Database Updates

```
Song edited in Songs page
↓
db.songs.findOne(id).update() called
↓
RxDB updates IndexedDB
↓
Subscription triggers in Present page
↓
setAllSongs() updates state
↓
React re-renders with new content
↓
useEffect broadcasts update via BroadcastChannel
↓
MirrorDisplay/Teleprompter receive update
↓
All displays show new content in real-time
```

---

## Navigation Patterns

### URL-Based Parameters

**Playlist Navigation**:
```javascript
// Open playlist editor
navigate(`/PlaylistEditor?id=${playlistId}`)

// Present playlist
navigate(`/Present?playlist=${playlistId}`)
```

**Song Navigation**:
```javascript
// Present single song
navigate(`/Present?song=${songId}`)
```

**Session Navigation** (secondary windows only):
```javascript
// MirrorDisplay listens to Present
window.open(`/MirrorDisplay?session=${sessionId}`)

// Teleprompter listens to Present
window.open(`/Teleprompter?session=${sessionId}`)
```

### Navigation Helper

**Location**: [src/utils/index.ts](src/utils/index.ts)

**Function**: `createPageUrl(pageName, params)`

Creates proper URLs for navigation:
```javascript
createPageUrl('Home')                    // '/'
createPageUrl('Songs')                   // '/Songs'
createPageUrl('PlaylistEditor?id=123')   // '/PlaylistEditor?id=123'
createPageUrl('Present?playlist=456')    // '/Present?playlist=456'
```

### Link Component Usage

```javascript
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'

<Link to={createPageUrl('Songs')}>
  <Button>Go to Songs</Button>
</Link>
```

### Keyboard Shortcuts

**Present Page**:
- **Arrow Right / Space / Page Down**: Next stanza
- **Arrow Left / Page Up**: Previous stanza
- **B Key**: Toggle blank screen
- **Escape**: Clear blank screen

**PlaylistEditor**:
- **Drag and Drop**: Reorder songs

---

## Component Composition

### HOC Pattern - LayoutWrapper

The layout is applied via a higher-order component pattern:

```javascript
const LayoutWrapper = ({ children, currentPageName }) => 
  Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>
```

This allows:
- Conditional layout rendering
- Page-aware navigation
- Hiding nav on presentation pages
- Consistent styling across pages

### Provider Pattern

The App component wraps everything with providers:

```javascript
<QueryClientProvider client={queryClientInstance}>
  <Router>
    <NavigationTracker />
    {/* Routes */}
  </Router>
  <Toaster />
</QueryClientProvider>
```

Provides:
- **QueryClientProvider**: React Query for async state
- **Router**: React Router for navigation
- **NavigationTracker**: Track page views
- **Toaster**: Toast notification system

### Context Usage

**AuthContext** ([src/lib/AuthContext.jsx](src/lib/AuthContext.jsx)):
- User authentication state
- App settings from backend
- Used for authorization checks

**Example**:
```javascript
const { user, isAuthenticated } = useAuth()
```

---

## Best Practices

### Page Development Checklist

When creating a new page:

1. **Create file** in `src/pages/PageName.jsx`
2. **Register in** `src/pages.config.js`
3. **Add to PAGES object** with correct name
4. **Initialize database** in useEffect:
   ```javascript
   useEffect(() => {
     const db = await getDatabase()
     // Subscribe to collections
     return () => { /* cleanup */ }
   }, [])
   ```
5. **Handle loading state** while fetching data
6. **Use proper cleanup** in effect return functions
7. **Add navigation** with `createPageUrl()`
8. **Test route** at `/<PageName>`

### Component Best Practices

1. **Accept props** for data and callbacks
2. **Handle null/undefined** states
3. **Clean up subscriptions** in useEffect cleanup
4. **Use Toast** for user feedback
5. **Add loading indicators** for async operations
6. **Memoize expensive computations** if needed
7. **Use TypeScript** for props (JSDoc comments)

### Error Handling

- **useAuth()** for auth state - redirects if not authenticated
- **Try-catch** around database operations
- **Toast.error()** for user-facing errors
- **ErrorBoundary** for rendering errors

---

## Performance Optimization

### Database Subscriptions

Use specific queries to limit data:

```javascript
// ✅ Good - Limited data
db.songs.find({
  sort: [{ created_date: 'desc' }],
  limit: 5
}).$.subscribe(...)

// ❌ Avoid - Loading all data
db.songs.find().$.subscribe(...)
```

### Component Splitting

Break large pages into smaller components:
- PresentationDisplay (reusable)
- SlidePreview (reusable)
- SongCard (reusable)

### Memoization

Use React.memo for components that receive same props:

```javascript
export const SlidePreview = React.memo(function SlidePreview(props) {
  // Component code
})
```

### Cleanup

Always unsubscribe from subscriptions:

```javascript
useEffect(() => {
  let subscription
  const init = async () => {
    const db = await getDatabase()
    subscription = db.songs.find().$.subscribe(...)
  }
  init()
  
  return () => {
    if (subscription) subscription.unsubscribe()
  }
}, [])
```

---

## Troubleshooting

### Page Not Found

- Check `pages.config.js` for correct export
- Verify route name matches page file name
- Check URL spelling

### Data Not Loading

- Verify database subscription is active
- Check browser console for errors
- Confirm IndexedDB has data (DevTools)
- Check useEffect cleanup functions

### Navigation Not Working

- Use `createPageUrl()` helper function
- Verify page name matches PAGES config
- Check that routes are in correct order
- Ensure BrowserRouter is wrapping Routes

### Window Sync Not Working

- Verify sessionId is passed in URL
- Check BroadcastChannel name matches
- Confirm both windows have same session ID
- Check browser supports BroadcastChannel API
