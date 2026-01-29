import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const TILE_SIZE = 256

type MapData = {
  type: 'image'
  url: string
  dimensions: { width: number; height: number }
} | {
  type: 'tiles'
  tiles: Record<string, string> // "z/x/y" -> dataURL
  maxZoom: number
  bounds: [number, number]
}

export default function Map() {
  const navigate = useNavigate()
  const [mapData, setMapData] = useState<MapData | null>(() => {
    const saved = localStorage.getItem('mapData')
    return saved ? JSON.parse(saved) : null
  })
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveMapData = (data: MapData) => {
    setMapData(data)
    try {
      localStorage.setItem('mapData', JSON.stringify(data))
    } catch (e) {
      console.warn('Map too large for localStorage, will not persist')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    if (file.name.endsWith('.zip')) {
      // Handle ZIP file (tiles)
      try {
        const zip = await JSZip.loadAsync(file)
        const tiles: Record<string, string> = {}

        // Find all tile files (supports tiles/z/x/y.png or z/x/y.png)
        const tileFiles = Object.keys(zip.files).filter(name =>
          name.match(/\d+\/\d+\/\d+\.png$/)
        )

        // First pass: determine maxZoom
        let maxZoom = 0
        for (const path of tileFiles) {
          const match = path.match(/(\d+)\/(\d+)\/(\d+)\.png$/)
          if (match) {
            const z = parseInt(match[1], 10)
            maxZoom = Math.max(maxZoom, z)
          }
        }

        // Second pass: load tiles and track bounds at maxZoom
        let maxX = 0
        let maxY = 0
        for (const path of tileFiles) {
          const match = path.match(/(\d+)\/(\d+)\/(\d+)\.png$/)
          if (match) {
            const z = parseInt(match[1], 10)
            const x = parseInt(match[2], 10)
            const y = parseInt(match[3], 10)

            if (z === maxZoom) {
              maxX = Math.max(maxX, x)
              maxY = Math.max(maxY, y)
            }

            const blob = await zip.files[path].async('blob')
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(blob)
            })

            tiles[`${z}/${x}/${y}`] = dataUrl
          }
        }

        console.log('Loaded tiles:', Object.keys(tiles).length, 'maxZoom:', maxZoom, 'bounds:', maxX, maxY)

        saveMapData({
          type: 'tiles',
          tiles,
          maxZoom,
          bounds: [(maxX + 1) * TILE_SIZE, (maxY + 1) * TILE_SIZE]
        })
      } catch (err) {
        console.error('Failed to load zip:', err)
        alert('Failed to load tile zip file')
      }
    } else {
      // Handle image file
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const img = new Image()
        img.onload = () => {
          saveMapData({
            type: 'image',
            url: dataUrl,
            dimensions: { width: img.width, height: img.height }
          })
          setLoading(false)
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
      return
    }

    setLoading(false)
  }

  const clearMap = () => {
    localStorage.removeItem('mapData')
    setMapData(null)
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
  }

  const downloadImage = () => {
    if (!mapData || mapData.type !== 'image') return
    const link = document.createElement('a')
    link.href = mapData.url
    link.download = 'map.png'
    link.click()
  }

  const exportTiles = async () => {
    if (!mapData || mapData.type !== 'image') return

    setExporting(true)
    setExportProgress(0)

    const zip = new JSZip()
    const tilesFolder = zip.folder('tiles')!

    const img = new Image()
    img.src = mapData.url

    await new Promise((resolve) => {
      img.onload = resolve
    })

    const { width, height } = mapData.dimensions
    const maxDimension = Math.max(width, height)
    const maxZoom = Math.ceil(Math.log2(maxDimension / TILE_SIZE))
    const minZoom = 0

    let totalTiles = 0
    let processedTiles = 0

    for (let z = minZoom; z <= maxZoom; z++) {
      const scale = Math.pow(2, z)
      const scaledWidth = (width / maxDimension) * TILE_SIZE * scale
      const scaledHeight = (height / maxDimension) * TILE_SIZE * scale
      const tilesX = Math.ceil(scaledWidth / TILE_SIZE)
      const tilesY = Math.ceil(scaledHeight / TILE_SIZE)
      totalTiles += tilesX * tilesY
    }

    for (let z = minZoom; z <= maxZoom; z++) {
      const zoomFolder = tilesFolder.folder(z.toString())!
      const scale = Math.pow(2, z)
      const scaledWidth = (width / maxDimension) * TILE_SIZE * scale
      const scaledHeight = (height / maxDimension) * TILE_SIZE * scale
      const tilesX = Math.ceil(scaledWidth / TILE_SIZE)
      const tilesY = Math.ceil(scaledHeight / TILE_SIZE)

      for (let x = 0; x < tilesX; x++) {
        const xFolder = zoomFolder.folder(x.toString())!

        for (let y = 0; y < tilesY; y++) {
          const canvas = document.createElement('canvas')
          canvas.width = TILE_SIZE
          canvas.height = TILE_SIZE
          const ctx = canvas.getContext('2d')!

          const srcX = (x * TILE_SIZE / scaledWidth) * width
          const srcY = (y * TILE_SIZE / scaledHeight) * height
          const srcW = (TILE_SIZE / scaledWidth) * width
          const srcH = (TILE_SIZE / scaledHeight) * height

          ctx.fillStyle = '#1a1a2e'
          ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, TILE_SIZE, TILE_SIZE)

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png')
          })

          xFolder.file(`${y}.png`, blob)
          processedTiles++
          setExportProgress(Math.round((processedTiles / totalTiles) * 100))
        }
      }
    }

    const styleJson = {
      version: 8,
      sources: {
        'custom-map': {
          type: 'raster',
          tiles: ['tiles/{z}/{x}/{y}.png'],
          tileSize: TILE_SIZE,
          maxzoom: maxZoom,
          bounds: [0, 0, width, height]
        }
      },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#1a1a2e' } },
        { id: 'map-layer', type: 'raster', source: 'custom-map' }
      ]
    }

    zip.file('style.json', JSON.stringify(styleJson, null, 2))
    zip.file('README.md', `# Custom Map Tiles\n\nTile size: ${TILE_SIZE}x${TILE_SIZE}\nMax zoom: ${maxZoom}\nOriginal: ${width}x${height}\n\nServe with: \`npx serve .\``)

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'map-tiles.zip')

    setExporting(false)
    setExportProgress(0)
  }

  const exportTilesFromTiles = async () => {
    if (!mapData || mapData.type !== 'tiles') return

    setExporting(true)
    const zip = new JSZip()
    const tilesFolder = zip.folder('tiles')!

    const entries = Object.entries(mapData.tiles)
    let processed = 0

    for (const [path, dataUrl] of entries) {
      const [z, x, y] = path.split('/')
      const zFolder = tilesFolder.folder(z) || tilesFolder.folder(z)!
      const xFolder = zFolder.folder(x) || zFolder.folder(x)!

      const response = await fetch(dataUrl)
      const blob = await response.blob()
      xFolder.file(`${y}.png`, blob)

      processed++
      setExportProgress(Math.round((processed / entries.length) * 100))
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'map-tiles.zip')

    setExporting(false)
    setExportProgress(0)
  }

  useEffect(() => {
    if (!mapData || !mapContainer.current) return

    const container = mapContainer.current

    // Clean up any existing map first
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Also check if container has leftover leaflet state
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id
    }

    if (mapData.type === 'image') {
      const { width, height } = mapData.dimensions
      const bounds: L.LatLngBoundsExpression = [[0, 0], [height, width]]

      const map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 4,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        attributionControl: false
      })

      L.imageOverlay(mapData.url, bounds).addTo(map)
      map.fitBounds(bounds)
      mapRef.current = map
    } else {
      // Tile-based map
      const { tiles, maxZoom, bounds: tileBounds } = mapData
      const [tilesX, tilesY] = [tileBounds[0] / TILE_SIZE, tileBounds[1] / TILE_SIZE]

      // In Leaflet CRS.Simple, coordinates need to be scaled so that at zoom 0,
      // the map fits appropriately. We scale by 2^maxZoom.
      const scale = Math.pow(2, maxZoom)
      const worldWidth = (tilesX * TILE_SIZE) / scale
      const worldHeight = (tilesY * TILE_SIZE) / scale

      console.log('Initializing tile map:', { maxZoom, tilesX, tilesY, worldWidth, worldHeight, tileCount: Object.keys(tiles).length })
      console.log('Sample tiles:', Object.keys(tiles).slice(0, 10))

      const map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: maxZoom,
        zoomSnap: 1,
        zoomDelta: 1,
        attributionControl: false
      })

      // Use GridLayer with createTile for full control over tile creation
      const CustomGridLayer = L.GridLayer.extend({
        createTile: function(coords: { z: number; x: number; y: number }) {
          const tile = document.createElement('img')
          tile.style.width = TILE_SIZE + 'px'
          tile.style.height = TILE_SIZE + 'px'

          // Calculate number of tiles at this zoom level
          const zoomScale = Math.pow(2, maxZoom - coords.z)
          const tilesYAtZoom = Math.ceil(tilesY / zoomScale)

          // Leaflet CRS.Simple has Y=0 at bottom, our tiles have Y=0 at top
          // Invert Y: storedY = (tilesYAtZoom - 1) - leafletY
          const storedY = (tilesYAtZoom - 1) - coords.y
          const key = `${coords.z}/${coords.x}/${storedY}`
          const url = tiles[key]

          if (url) {
            tile.src = url
          }

          return tile
        }
      })

      new (CustomGridLayer as any)({
        tileSize: TILE_SIZE,
        maxZoom: maxZoom,
        noWrap: true
      }).addTo(map)

      // Set bounds in world coordinates (scaled down from pixels)
      const mapBounds: L.LatLngBoundsExpression = [[0, 0], [worldHeight, worldWidth]]
      map.fitBounds(mapBounds)
      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [mapData])

  const buttonStyle = {
    padding: '8px 16px',
    background: 'rgb(25, 25, 35)',
    color: '#e8d5b7',
    border: '1px solid rgba(232, 213, 183, 0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, background: '#1a1a2e' }}>
      <button onClick={() => navigate('/')} style={{ ...buttonStyle, position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
        Stats
      </button>

      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <input
          type="file"
          accept="image/*,.zip"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()} style={buttonStyle} disabled={loading}>
          {loading ? 'Loading...' : mapData ? 'Change' : 'Upload'}
        </button>
        {mapData && (
          <>
            {mapData.type === 'image' && (
              <button onClick={downloadImage} style={{ ...buttonStyle, background: 'rgb(25, 35, 45)' }}>
                Download
              </button>
            )}
            <button
              onClick={mapData.type === 'image' ? exportTiles : exportTilesFromTiles}
              disabled={exporting}
              style={{ ...buttonStyle, background: exporting ? 'rgb(35, 35, 45)' : 'rgb(25, 45, 35)', cursor: exporting ? 'wait' : 'pointer' }}
            >
              {exporting ? `Exporting ${exportProgress}%` : 'Export Tiles'}
            </button>
            <button onClick={clearMap} style={{ ...buttonStyle, background: 'rgb(50, 25, 25)' }}>
              Clear
            </button>
          </>
        )}
      </div>

      {mapData ? (
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#e8d5b7',
          fontFamily: 'Georgia, serif'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🗺️</div>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Map Loaded</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            Upload a map image or a ZIP of tiles
          </div>
          <button onClick={() => fileInputRef.current?.click()} style={{ ...buttonStyle, padding: '12px 24px', fontSize: '1rem' }}>
            Upload Map
          </button>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1rem' }}>
            Supports: PNG, JPG, or ZIP (tiles/{'{z}/{x}/{y}'}.png)
          </div>
        </div>
      )}
    </div>
  )
}
