import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MasjidDetail from './pages/MasjidDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/masjid/:id" element={<MasjidDetail />} />
    </Routes>
  );
}

export default App;
