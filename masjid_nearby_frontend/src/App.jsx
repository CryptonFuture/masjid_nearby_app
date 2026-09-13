import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MasjidDetail from './pages/MasjidDetail';
import QiblaCompass from "./components/QiblaCompass";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/masjid/:id" element={<MasjidDetail />} />
       <Route
        path="/qibla"
        element={<QiblaCompass />}
      />
    </Routes>
  );
}

export default App;
