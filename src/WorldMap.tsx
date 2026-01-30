import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'

const GOLARION_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    golarion: {
      type: 'vector',
      url: 'pmtiles://https://map.pathfinderwiki.com/golarion.pmtiles',
      attribution:
        '<a href="https://paizo.com/licenses/communityuse">Paizo CUP</a>, <a href="https://github.com/pf-wikis/mapping#acknowledgments">Acknowledgments</a>',
    },
  },
  sprite: 'https://map.pathfinderwiki.com/sprites/sprites',
  glyphs: 'https://map.pathfinderwiki.com/fonts/{fontstack}/{range}.pbf',
  transition: { duration: 300, delay: 0 },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': 'rgb(110, 160, 245)' },
    },
    {
      id: 'fill_geometry',
      source: 'golarion',
      'source-layer': 'geometry',
      type: 'fill',
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      paint: { 'fill-color': ['get', 'color'], 'fill-antialias': false },
    },
    {
      id: 'line_nation-borders',
      source: 'golarion',
      'source-layer': 'borders',
      type: 'line',
      filter: ['==', ['get', 'borderType'], 3],
      paint: {
        'line-color': 'rgb(170, 170, 170)',
        'line-width': ['interpolate', ['exponential', 2], ['zoom'], 3, 0.375, 5, 2],
      },
      layout: { 'line-cap': 'round' },
    },
    {
      id: 'line_subregion-borders',
      source: 'golarion',
      'source-layer': 'borders',
      type: 'line',
      filter: ['==', ['get', 'borderType'], 2],
      paint: {
        'line-color': 'rgb(170, 170, 170)',
        'line-width': ['interpolate', ['exponential', 2], ['zoom'], 0, 0.375, 3, 2],
      },
      layout: { 'line-cap': 'round' },
    },
    {
      id: 'line_borders-regions',
      source: 'golarion',
      'source-layer': 'borders',
      type: 'line',
      filter: ['==', ['get', 'borderType'], 1],
      paint: {
        'line-color': [
          'interpolate',
          ['exponential', 2],
          ['zoom'],
          4,
          'rgb(107, 42, 33)',
          5,
          'rgb(170, 170, 170)',
        ],
        'line-width': ['interpolate', ['exponential', 2], ['zoom'], 4, 3, 5, 2],
      },
      layout: { 'line-cap': 'round' },
    },
    {
      id: 'line_province-borders',
      source: 'golarion',
      'source-layer': 'borders',
      type: 'line',
      filter: ['==', ['get', 'borderType'], 4],
      minzoom: 4,
      paint: {
        'line-color': 'rgb(170, 170, 170)',
        'line-opacity': ['interpolate', ['exponential', 2], ['zoom'], 4, 0, 6, 1],
        'line-dasharray': [5, 10],
      },
      layout: { 'line-cap': 'round' },
    },
    {
      id: 'symbol_line-labels',
      source: 'golarion',
      'source-layer': 'line-labels',
      type: 'symbol',
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'symbol-placement': 'line',
        'text-max-angle': 20,
        'text-field': ['get', 'label'],
        'text-font': ['NotoSans-Medium'],
        'symbol-spacing': 300,
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 16],
      },
      paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': ['get', 'halo'],
        'text-halo-width': ['interpolate', ['linear'], ['zoom'], 5, 0.125, 10, 1],
      },
    },
    {
      id: 'location-icons',
      source: 'golarion',
      'source-layer': 'locations',
      type: 'symbol',
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-pitch-alignment': 'map',
        'icon-overlap': 'always',
        'icon-ignore-placement': true,
        'icon-size': [
          'interpolate',
          ['exponential', 2],
          ['zoom'],
          0, ['^', 2, ['-', -3, ['get', 'filterMinzoom']]],
          1, ['^', 2, ['-', -2, ['get', 'filterMinzoom']]],
          2, ['min', 1, ['^', 2, ['-', -1, ['get', 'filterMinzoom']]]],
          3, ['min', 1, ['^', 2, ['-', 0, ['get', 'filterMinzoom']]]],
          4, ['min', 1, ['^', 2, ['-', 1, ['get', 'filterMinzoom']]]],
          5, ['min', 1, ['^', 2, ['-', 2, ['get', 'filterMinzoom']]]],
          6, ['min', 1, ['^', 2, ['-', 3, ['get', 'filterMinzoom']]]],
          7, ['min', 1, ['^', 2, ['-', 4, ['get', 'filterMinzoom']]]],
          8, ['min', 1, ['^', 2, ['-', 5, ['get', 'filterMinzoom']]]],
          9, ['min', 1, ['^', 2, ['-', 6, ['get', 'filterMinzoom']]]],
          10, ['min', 1, ['^', 2, ['-', 7, ['get', 'filterMinzoom']]]],
        ],
      },
      paint: {},
    },
    {
      id: 'symbol_labels',
      source: 'golarion',
      'source-layer': 'labels',
      type: 'symbol',
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'text-field': ['get', 'label'],
        'text-rotate': ['get', 'angle'],
        'text-rotation-alignment': 'map',
        'text-font': ['NotoSans-Medium'],
        'text-size': 16,
      },
      paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': ['get', 'halo'],
        'text-halo-width': 1.5,
      },
    },
    {
      id: 'location-labels',
      source: 'golarion',
      'source-layer': 'locations',
      type: 'symbol',
      filter: [
        'all',
        ['>', ['zoom'], ['+', ['get', 'filterMinzoom'], 3]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['NotoSans-Medium'],
        'text-size': 14,
        'text-variable-anchor': ['left', 'right'],
        'text-radial-offset': 0.5,
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': 'rgb(255, 255, 255)',
        'text-halo-color': 'rgb(10, 10, 10)',
        'text-halo-width': 0.8,
      },
    },
    {
      id: 'symbol_province-labels',
      source: 'golarion',
      'source-layer': 'province-labels',
      type: 'symbol',
      minzoom: 4,
      maxzoom: 7,
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['NotoSans-Medium'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 5, 7, 20],
        'text-rotation-alignment': 'map',
        'text-variable-anchor': ['center', 'top', 'bottom'],
        'symbol-z-order': 'source',
      },
      paint: {
        'text-color': 'rgb(255, 255, 255)',
        'text-halo-color': 'rgb(17, 42, 97)',
        'text-halo-width': ['interpolate', ['linear'], ['zoom'], 5, 0.375, 7, 1.5],
      },
    },
    {
      id: 'symbol_nation-labels',
      source: 'golarion',
      'source-layer': 'nation-labels',
      type: 'symbol',
      minzoom: 3,
      maxzoom: 6,
      filter: ['any', ['!', ['get', 'inSubregion']], ['>', ['zoom'], 4]],
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['NotoSans-Medium'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 5, 25],
        'text-rotation-alignment': 'map',
        'text-variable-anchor': ['center', 'top', 'bottom'],
        'symbol-z-order': 'source',
      },
      paint: {
        'text-color': 'rgb(255, 255, 255)',
        'text-halo-color': 'rgb(17, 42, 97)',
        'text-halo-width': ['interpolate', ['linear'], ['zoom'], 4, 0.75, 5, 1.875],
      },
    },
    {
      id: 'symbol_subregion-labels',
      source: 'golarion',
      'source-layer': 'subregion-labels',
      type: 'symbol',
      minzoom: 3,
      maxzoom: 5,
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['NotoSans-Medium'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 5, 25],
        'text-rotation-alignment': 'map',
        'text-variable-anchor': ['center', 'top', 'bottom'],
        'symbol-z-order': 'source',
      },
      paint: {
        'text-color': 'rgb(255, 255, 255)',
        'text-halo-color': 'rgb(17, 42, 97)',
        'text-halo-width': ['interpolate', ['linear'], ['zoom'], 4, 0.75, 5, 1.875],
      },
    },
    {
      id: 'symbol_region-labels',
      source: 'golarion',
      'source-layer': 'region-labels',
      type: 'symbol',
      minzoom: 1,
      maxzoom: 3,
      filter: [
        'all',
        ['any', ['!', ['has', 'filterMinzoom']], ['>=', ['zoom'], ['get', 'filterMinzoom']]],
        ['any', ['!', ['has', 'filterMaxzoom']], ['<=', ['zoom'], ['get', 'filterMaxzoom']]],
      ],
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['NotoSans-Medium'],
        'text-size': 20,
        'text-rotation-alignment': 'map',
        'text-variable-anchor': ['center', 'top', 'bottom'],
        'symbol-z-order': 'source',
      },
      paint: {
        'text-color': 'rgb(107, 42, 33)',
        'text-halo-color': 'rgb(213, 195, 138)',
        'text-halo-width': 1.5,
      },
    },
  ],
}

export default function WorldMap() {
  const navigate = useNavigate()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: GOLARION_STYLE,
      center: [44.08, -27.16],
      zoom: 12.2,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
      maplibregl.removeProtocol('pmtiles')
      mapRef.current = null
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, background: '#1a1a2e' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          background: 'rgb(25, 25, 35)',
          color: '#e8d5b7',
          border: '1px solid rgba(232, 213, 183, 0.3)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'Georgia, serif',
          fontSize: '0.9rem',
        }}
      >
        Stats
      </button>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
