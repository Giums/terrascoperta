import { useState } from "react";
import Shell from "./components/Layout/Shell";
import MapView from "./components/Map/MapContainer";
import CityMarkers from "./components/Map/CityMarkers";
import AddressMarker from "./components/Map/AddressMarker";
import FlyTo, { type FlyTarget } from "./components/Map/FlyTo";
import SatelliteOverlay, { type SatelliteLayerId } from "./components/Map/SatelliteOverlay";
import LayerControls from "./components/Map/LayerControls";
import CitySearch from "./components/Search/CitySearch";
import AddressSearch from "./components/Search/AddressSearch";
import CityDetail from "./components/Detail/CityDetail";
import AddressDetail from "./components/Detail/AddressDetail";
import InfoPanel from "./components/Info/InfoPanel";
import { cities } from "./data/cities";
import type { City } from "./data/cities";
import { sentinelHubAvailable } from "./utils/satellite-layers";
import type { AddressResult } from "./utils/geocode";
import "./App.css";

function defaultLayerDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  // Di default mostriamo subito la temperatura di superficie: il calore va visto,
  // non scoperto in un menu. NASA GIBS (CDN, nessuna autenticazione) è la scelta
  // più veloce da caricare; chi ha configurato Sentinel Hub può passare a un
  // layer a risoluzione maggiore dal selettore.
  const [layer, setLayer] = useState<SatelliteLayerId>("gibs-lst-day");
  const [date, setDate] = useState(defaultLayerDate());

  function selectCity(city: City) {
    setShowInfo(false);
    setSelectedAddress(null);
    setSelectedCity(city);
  }

  function selectAddress(result: AddressResult) {
    setShowInfo(false);
    setSelectedCity(null);
    setSelectedAddress(result);
    setFlyTarget({ lat: result.lat, lng: result.lng, zoom: 17 });
    // A zoom da singolo edificio la mappa di calore (~1km/pixel) è solo un blocco
    // di colore poco utile: mostriamo la foto satellitare reale se disponibile,
    // altrimenti la mappa base (via/edifici) invece del layer termico a bassa risoluzione.
    setLayer(sentinelHubAvailable ? "s2-true-color" : "none");
  }

  function openInfo() {
    setSelectedCity(null);
    setSelectedAddress(null);
    setShowInfo(true);
  }

  const panel = selectedAddress ? (
    <AddressDetail address={selectedAddress} cities={cities} onClose={() => setSelectedAddress(null)} />
  ) : selectedCity ? (
    <CityDetail city={selectedCity} onClose={() => setSelectedCity(null)} />
  ) : showInfo ? (
    <InfoPanel onClose={() => setShowInfo(false)} />
  ) : undefined;

  return (
    <Shell
      header={
        <>
          <div className="app-title">
            <span className="app-title__icon" aria-hidden="true">
              🌡️
            </span>
            <div>
              <h1>Isole di calore urbane</h1>
              <p>Città italiane · dati satellitari e meteo live</p>
            </div>
          </div>
          <div className="app-header__controls">
            <CitySearch cities={cities} onSelect={selectCity} />
            <AddressSearch onSelect={selectAddress} />
            <button type="button" className="app-info-button" onClick={openInfo}>
              Cos'è l'UHI?
            </button>
          </div>
        </>
      }
      map={
        <>
          <MapView>
            <SatelliteOverlay layer={layer} date={date} />
            <CityMarkers cities={cities} onSelect={selectCity} />
            {selectedAddress && (
              <AddressMarker lat={selectedAddress.lat} lng={selectedAddress.lng} label={selectedAddress.label} />
            )}
            <FlyTo target={flyTarget} />
          </MapView>
          <LayerControls layer={layer} onLayerChange={setLayer} date={date} onDateChange={setDate} />
        </>
      }
      panel={panel}
    />
  );
}

export default App;
