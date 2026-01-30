import { HashRouter, Routes, Route } from 'react-router-dom'
import Stats from './Stats'
import Map from './Map'
import WorldMap from './WorldMap'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Stats />} />
        <Route path="/map" element={<Map />} />
        <Route path="/worldmap" element={<WorldMap />} />
      </Routes>
    </HashRouter>
  )
}

export default App
