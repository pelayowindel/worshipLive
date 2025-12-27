import Songs from './pages/Songs';
import Playlists from './pages/Playlists';
import PlaylistEditor from './pages/PlaylistEditor';
import Present from './pages/Present';
import MirrorDisplay from './pages/MirrorDisplay';
import Home from './pages/Home';
import Teleprompter from './pages/Teleprompter';
import __Layout from './Layout.jsx';
import Dashboard from './pages/Dashboard';


export const PAGES = {
  "Home": Home,
  "Dashboard": Dashboard,
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