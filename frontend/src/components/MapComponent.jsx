import React, { useEffect, useRef, useState } from 'react'

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })
}

export default function MapComponent({ apiKey, onRouteSelected, liveLocation }){
  const mapRef = useRef(null)
  const mapDivRef = useRef(null)
  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const markerRef = useRef(null)

  useEffect(()=>{
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      console.warn('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file')
      return
    }
    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    let map, directionsService, directionsRenderer, fromAutocomplete, toAutocomplete
    let mounted = true
  loadScript(src).then(()=>{
      if (!mounted) return
      map = new window.google.maps.Map(mapDivRef.current, { center: { lat: 28.6304, lng: 77.3726 }, zoom: 12 })
      directionsService = new window.google.maps.DirectionsService()
      directionsRenderer = new window.google.maps.DirectionsRenderer({ map })

      const fromInput = document.getElementById('rm-from')
      const toInput = document.getElementById('rm-to')
      fromAutocomplete = new window.google.maps.places.Autocomplete(fromInput)
      toAutocomplete = new window.google.maps.places.Autocomplete(toInput)

      fromAutocomplete.addListener('place_changed', ()=>{
        const place = fromAutocomplete.getPlace()
        setFromText(place.formatted_address || place.name || fromInput.value)
        tryRoute()
      })
      toAutocomplete.addListener('place_changed', ()=>{
        const place = toAutocomplete.getPlace()
        setToText(place.formatted_address || place.name || toInput.value)
        tryRoute()
      })

      function tryRoute(){
        const origin = fromInput.value
        const destination = toInput.value
        if (!origin || !destination) return
        directionsService.route({ origin, destination, travelMode: window.google.maps.TravelMode.DRIVING }, (res, status)=>{
          if (status === 'OK'){
            directionsRenderer.setDirections(res)
            const route = res.routes[0]
            // build a simple route object: overview_polyline and bounds
            const routeObj = {
              summary: route.summary,
              legs: route.legs.map(l=>({ start_address: l.start_address, end_address: l.end_address, distance: l.distance, duration: l.duration })),
              overview_polyline: route.overview_polyline && route.overview_polyline.points,
              bounds: route.bounds && { ne: route.bounds.getNorthEast().toJSON(), sw: route.bounds.getSouthWest().toJSON() }
            }
            onRouteSelected && onRouteSelected({ from: origin, to: destination, route: routeObj })
          }
        })
      }
  mapRef.current = { map, directionsService, directionsRenderer }
    }).catch(err=>{ console.error('Failed loading Google Maps', err) })

    return ()=>{ mounted = false }
  },[apiKey])

  // handle liveLocation updates (moving marker)
  useEffect(()=>{
    if (!mapRef.current || !window.google) return
    const { map } = mapRef.current
    if (!liveLocation || !liveLocation.lat || !liveLocation.lng) {
      // if no live location, remove marker
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      return
    }
    const pos = new window.google.maps.LatLng(liveLocation.lat, liveLocation.lng)
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({ map, position: pos, title: 'Driver', zIndex: 9999 })
      // optional: use a distinct icon
      try{
        markerRef.current.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2B6CB0',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff'
        })
      }catch(e){ /* ignore if API doesn't support */ }
      // center map on first update
      map.panTo(pos)
    } else {
      // smooth move: directly set position (Google Maps will handle redraw)
      markerRef.current.setPosition(pos)
    }
  },[liveLocation])

  // Show fallback UI if no API key is configured
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input 
            value={fromText} 
            onChange={e=>setFromText(e.target.value)} 
            placeholder="From" 
            className="flex-1 p-2 rounded" 
            style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <input 
            value={toText} 
            onChange={e=>setToText(e.target.value)} 
            placeholder="To" 
            className="flex-1 p-2 rounded" 
            style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex items-center justify-center h-80 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px dashed var(--border-color)' }}>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Google Maps Not Configured</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              To enable map features, please configure your Google Maps API key in the .env file
            </p>
            <div className="p-3 rounded text-xs text-left" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <code style={{ color: 'var(--text-secondary)' }}>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input 
          id="rm-from" 
          value={fromText} 
          onChange={e=>setFromText(e.target.value)} 
          placeholder="From" 
          className="flex-1 p-2 rounded" 
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />
        <input 
          id="rm-to" 
          value={toText} 
          onChange={e=>setToText(e.target.value)} 
          placeholder="To" 
          className="flex-1 p-2 rounded" 
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />
      </div>
      <div ref={mapDivRef} style={{ height: 320 }} className="rounded overflow-hidden" />
    </div>
  )
}
