import { useState } from "react";
import Shell from "./components/Layout/Shell";
import MapView from "./components/Map/MapContainer";
import CityMarkers from "./components/Map/CityMarkers";
import WaterBodyMarkers from "./components/Map/WaterBodyMarkers";
import VolcanoMarkers from "./components/Map/VolcanoMarkers";
import FireMarkers from "./components/Map/FireMarkers";
import CanadairMarkers from "./components/Map/CanadairMarkers";
import WildfireHotspotMarkers from "./components/Map/WildfireHotspotMarkers";
import EarthquakeMarkers from "./components/Map/EarthquakeMarkers";
import DesertificationMarkers from "./components/Map/DesertificationMarkers";
import HydroRiskMarkers from "./components/Map/HydroRiskMarkers";
import AddressMarker from "./components/Map/AddressMarker";
import FlyTo, { type FlyTarget } from "./components/Map/FlyTo";
import SatelliteOverlay, { type SatelliteLayerId } from "./components/Map/SatelliteOverlay";
import LayerControls from "./components/Map/LayerControls";
import UnifiedSearch from "./components/Search/UnifiedSearch";
import CityDetail from "./components/Detail/CityDetail";
import AddressDetail from "./components/Detail/AddressDetail";
import WaterBodyDetail from "./components/Detail/WaterBodyDetail";
import VolcanoDetail from "./components/Detail/VolcanoDetail";
import FireDetail from "./components/Detail/FireDetail";
import DesertificationDetail from "./components/Detail/DesertificationDetail";
import HydroRiskDetail from "./components/Detail/HydroRiskDetail";
import EarthquakeDetail from "./components/Detail/EarthquakeDetail";
import InfoPanel from "./components/Info/InfoPanel";
import { cities } from "./data/cities";
import type { City } from "./data/cities";
import { waterBodies } from "./data/water-bodies";
import type { WaterBody } from "./data/water-bodies";
import { volcanoes } from "./data/volcanoes";
import type { Volcano } from "./data/volcanoes";
import { fires } from "./data/fires";
import type { FireEvent } from "./data/fires";
import { desertificationZones } from "./data/desertification-zones";
import type { DesertificationZone } from "./data/desertification-zones";
import { hydroRiskCases } from "./data/hydro-risk";
import type { HydroRiskCase } from "./data/hydro-risk";
import { sentinelHubAvailable } from "./utils/satellite-layers";
import { haversineKm } from "./utils/geo";
import type { AddressResult } from "./utils/geocode";
import { useCanadairPositions } from "./hooks/useCanadairPositions";
import { useWildfireHotspots } from "./hooks/useWildfireHotspots";
import { useItalyEarthquakes, type EarthquakeEvent } from "./hooks/useItalyEarthquakes";
import "./App.css";

type Module = "calore" | "acqua" | "vulcani" | "incendi" | "desertificazione" | "idrogeologico" | "terremoti";

const MODULES: { id: Module; label: string; icon: string; title: string; subtitle: string; defaultLayer: SatelliteLayerId }[] = [
  {
    id: "calore",
    label: "Calore",
    icon: "🌡️",
    title: "Isole di calore urbane",
    subtitle: "Città italiane · dati satellitari e meteo live",
    defaultLayer: sentinelHubAvailable ? "s3-lst" : "none",
  },
  {
    id: "acqua",
    label: "Acqua",
    icon: "💧",
    title: "Monitoraggio acqua",
    subtitle: "Fiumi e laghi italiani · dati satellitari NDWI",
    defaultLayer: sentinelHubAvailable ? "s2-ndwi" : "none",
  },
  {
    id: "vulcani",
    label: "Vulcani",
    icon: "🌋",
    title: "Vulcani italiani",
    subtitle: "Sismicità INGV live · dati satellitari termici",
    defaultLayer: sentinelHubAvailable ? "s2-true-color" : "none",
  },
  {
    id: "incendi",
    label: "Incendi",
    icon: "🔥",
    title: "Incendi boschivi",
    subtitle: "Casi studio recenti · cicatrici da incendio via satellite (NBR)",
    defaultLayer: sentinelHubAvailable ? "s2-nbr" : "none",
  },
  {
    id: "desertificazione",
    label: "Desertificazione",
    icon: "🏜️",
    title: "Desertificazione",
    subtitle: "Aree a rischio ISPRA · salute della vegetazione (NDVI)",
    defaultLayer: sentinelHubAvailable ? "s2-ndvi" : "none",
  },
  {
    id: "idrogeologico",
    label: "Rischio idrogeologico",
    icon: "🌊",
    title: "Rischio idrogeologico",
    subtitle: "Alluvioni e frane · dal suolo nudo al dissesto",
    defaultLayer: sentinelHubAvailable ? "s2-true-color" : "none",
  },
  {
    id: "terremoti",
    label: "Terremoti",
    icon: "🌍",
    title: "Terremoti in Italia",
    subtitle: "Sismicità INGV in tempo reale · ultimi 7 giorni",
    defaultLayer: "none",
  },
];

function defaultLayerDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

function App() {
  const [module, setModule] = useState<Module>("calore");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(null);
  const [selectedVolcano, setSelectedVolcano] = useState<Volcano | null>(null);
  const [selectedFire, setSelectedFire] = useState<FireEvent | null>(null);
  const [selectedZone, setSelectedZone] = useState<DesertificationZone | null>(null);
  const [selectedHydroCase, setSelectedHydroCase] = useState<HydroRiskCase | null>(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeEvent | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const { aircraft: canadairAircraft } = useCanadairPositions();
  const { hotspots: wildfireHotspots } = useWildfireHotspots();
  const { events: earthquakes } = useItalyEarthquakes();
  // Il satellite VIIRS rileva qualsiasi fonte di calore intenso, quindi lava e
  // crateri attivi finiscono negli stessi dati dei roghi — li separiamo per
  // distanza dal vulcano più vicino: entro il raggio è "vulcano attivo", oltre
  // è "incendio". VOLCANO_THERMAL_RADIUS_KM copre l'edificio vulcanico e le
  // colate sui fianchi senza inghiottire incendi non correlati nelle vicinanze.
  const VOLCANO_THERMAL_RADIUS_KM = 10;
  const activeVolcanoNames = new Set(
    volcanoes
      .filter((v) => wildfireHotspots.some((h) => haversineKm(v.lat, v.lng, h.lat, h.lon) <= VOLCANO_THERMAL_RADIUS_KM))
      .map((v) => v.name),
  );
  const nonVolcanicHotspots = wildfireHotspots.filter(
    (h) => !volcanoes.some((v) => haversineKm(v.lat, v.lng, h.lat, h.lon) <= VOLCANO_THERMAL_RADIUS_KM),
  );
  const [showInfo, setShowInfo] = useState(false);
  // Di default mostriamo subito la temperatura di superficie reale (Sentinel-3
  // LST): il calore va visto, non scoperto in un menu.
  const [layer, setLayer] = useState<SatelliteLayerId>(MODULES[0].defaultLayer);
  const [date, setDate] = useState(defaultLayerDate());

  function clearSelection() {
    setShowInfo(false);
    setSelectedCity(null);
    setSelectedAddress(null);
    setSelectedWaterBody(null);
    setSelectedVolcano(null);
    setSelectedFire(null);
    setSelectedZone(null);
    setSelectedHydroCase(null);
    setSelectedEarthquake(null);
  }

  function selectModule(m: Module) {
    clearSelection();
    setModule(m);
    setLayer(MODULES.find((mod) => mod.id === m)!.defaultLayer);
  }

  function selectCity(city: City) {
    clearSelection();
    setSelectedCity(city);
  }

  function selectAddress(result: AddressResult) {
    clearSelection();
    setSelectedAddress(result);
    setFlyTarget({ lat: result.lat, lng: result.lng, zoom: 17 });
    // A zoom da singolo edificio la mappa di calore (~1km/pixel) è solo un blocco
    // di colore poco utile: mostriamo la foto satellitare reale se disponibile,
    // altrimenti la mappa base (via/edifici) invece del layer termico a bassa risoluzione.
    setLayer(sentinelHubAvailable ? "s2-true-color" : "none");
  }

  function selectWaterBody(waterBody: WaterBody) {
    clearSelection();
    setSelectedWaterBody(waterBody);
  }

  function selectVolcano(volcano: Volcano) {
    clearSelection();
    setSelectedVolcano(volcano);
  }

  function selectFire(fire: FireEvent) {
    clearSelection();
    setSelectedFire(fire);
  }

  function selectZone(zone: DesertificationZone) {
    clearSelection();
    setSelectedZone(zone);
  }

  function selectHydroCase(item: HydroRiskCase) {
    clearSelection();
    setSelectedHydroCase(item);
  }

  function selectEarthquake(event: EarthquakeEvent) {
    clearSelection();
    setSelectedEarthquake(event);
  }

  function openInfo() {
    clearSelection();
    setShowInfo(true);
  }

  const panel = selectedAddress ? (
    <AddressDetail address={selectedAddress} cities={cities} onClose={() => setSelectedAddress(null)} />
  ) : selectedCity ? (
    <CityDetail city={selectedCity} onClose={() => setSelectedCity(null)} />
  ) : selectedWaterBody ? (
    <WaterBodyDetail waterBody={selectedWaterBody} onClose={() => setSelectedWaterBody(null)} />
  ) : selectedVolcano ? (
    <VolcanoDetail
      volcano={selectedVolcano}
      hasActivity={activeVolcanoNames.has(selectedVolcano.name)}
      onClose={() => setSelectedVolcano(null)}
    />
  ) : selectedFire ? (
    <FireDetail fire={selectedFire} onClose={() => setSelectedFire(null)} />
  ) : selectedZone ? (
    <DesertificationDetail zone={selectedZone} onClose={() => setSelectedZone(null)} />
  ) : selectedHydroCase ? (
    <HydroRiskDetail item={selectedHydroCase} onClose={() => setSelectedHydroCase(null)} />
  ) : selectedEarthquake ? (
    <EarthquakeDetail event={selectedEarthquake} onClose={() => setSelectedEarthquake(null)} />
  ) : showInfo ? (
    <InfoPanel onClose={() => setShowInfo(false)} />
  ) : undefined;

  const currentModule = MODULES.find((m) => m.id === module)!;

  return (
    <Shell
      header={
        <>
          <div className="app-title">
            <span className="app-title__icon" aria-hidden="true">
              {currentModule.icon}
            </span>
            <div>
              <h1>{currentModule.title}</h1>
              <p>{currentModule.subtitle}</p>
            </div>
          </div>
          <div className="app-header__controls">
            <div className="module-tabs">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={module === m.id ? "module-tabs__active" : ""}
                  onClick={() => selectModule(m.id)}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
            {module === "calore" && (
              <>
                <UnifiedSearch cities={cities} onSelectCity={selectCity} onSelectAddress={selectAddress} />
                <button type="button" className="app-info-button" onClick={openInfo}>
                  Cos'è l'UHI?
                </button>
              </>
            )}
          </div>
        </>
      }
      map={
        <>
          <MapView>
            <SatelliteOverlay layer={layer} date={date} />
            {module === "calore" && <CityMarkers cities={cities} onSelect={selectCity} />}
            {module === "acqua" && <WaterBodyMarkers waterBodies={waterBodies} onSelect={selectWaterBody} />}
            {module === "vulcani" && (
              <VolcanoMarkers volcanoes={volcanoes} activeNames={activeVolcanoNames} onSelect={selectVolcano} />
            )}
            {module === "incendi" && (
              <>
                <WildfireHotspotMarkers hotspots={nonVolcanicHotspots} />
                <FireMarkers fires={fires} onSelect={selectFire} />
                <CanadairMarkers aircraft={canadairAircraft} />
              </>
            )}
            {module === "desertificazione" && (
              <DesertificationMarkers zones={desertificationZones} onSelect={selectZone} />
            )}
            {module === "idrogeologico" && (
              <HydroRiskMarkers cases={hydroRiskCases} onSelect={selectHydroCase} />
            )}
            {module === "terremoti" && <EarthquakeMarkers events={earthquakes} onSelect={selectEarthquake} />}
            {selectedAddress && (
              <AddressMarker lat={selectedAddress.lat} lng={selectedAddress.lng} label={selectedAddress.label} />
            )}
            <FlyTo target={flyTarget} />
          </MapView>
          <LayerControls
            layer={layer}
            onLayerChange={setLayer}
            date={date}
            onDateChange={setDate}
            showYearSlider={module === "calore"}
          />
        </>
      }
      panel={panel}
    />
  );
}

export default App;
