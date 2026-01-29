import { HashRouter, Routes, Route } from 'react-router-dom'
import Stats from './Stats'
import Map from './Map'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Stats />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </HashRouter>
  )
}

export default App
