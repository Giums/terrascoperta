import { useState } from "react";
import { useTranslation } from "react-i18next";
import Shell from "./components/Layout/Shell";
import MapView from "./components/Map/MapContainer";
import CityMarkers from "./components/Map/CityMarkers";
import WaterBodyMarkers from "./components/Map/WaterBodyMarkers";
import MediterraneanMarkers from "./components/Map/MediterraneanMarkers";
import VolcanoMarkers from "./components/Map/VolcanoMarkers";
import VolcanoThermalPathMarkers from "./components/Map/VolcanoThermalPathMarkers";
import FireMarkers from "./components/Map/FireMarkers";
import CanadairMarkers from "./components/Map/CanadairMarkers";
import WildfireHotspotMarkers from "./components/Map/WildfireHotspotMarkers";
import EarthquakeMarkers from "./components/Map/EarthquakeMarkers";
import DesertificationMarkers from "./components/Map/DesertificationMarkers";
import HydroRiskMarkers from "./components/Map/HydroRiskMarkers";
import AddressMarker from "./components/Map/AddressMarker";
import FlyTo, { type FlyTarget } from "./components/Map/FlyTo";
import SatelliteOverlay, { type SatelliteLayerId } from "./components/Map/SatelliteOverlay";
import GlacierOverlay from "./components/Map/GlacierOverlay";
import type { GlacierEpoch } from "./utils/glacier-layers";
import SatelliteLoadingIndicator from "./components/Map/SatelliteLoadingIndicator";
import MapCenterTracker from "./components/Map/MapCenterTracker";
import LayerControls from "./components/Map/LayerControls";
import UnifiedSearch from "./components/Search/UnifiedSearch";
import CityDetail from "./components/Detail/CityDetail";
import AddressDetail from "./components/Detail/AddressDetail";
import WaterBodyDetail from "./components/Detail/WaterBodyDetail";
import MediterraneanDetail from "./components/Detail/MediterraneanDetail";
import VolcanoDetail from "./components/Detail/VolcanoDetail";
import FireDetail from "./components/Detail/FireDetail";
import HotspotDetail from "./components/Detail/HotspotDetail";
import DesertificationDetail from "./components/Detail/DesertificationDetail";
import HydroRiskDetail from "./components/Detail/HydroRiskDetail";
import EarthquakeDetail from "./components/Detail/EarthquakeDetail";
import InfoPanel from "./components/Info/InfoPanel";
import PrivacyPolicy from "./components/Info/PrivacyPolicy";
import { cities } from "./data/cities";
import type { City } from "./data/cities";
import { waterBodies } from "./data/water-bodies";
import type { WaterBody } from "./data/water-bodies";
import { mediterraneanZones } from "./data/mediterranean-zones";
import type { MediterraneanZone } from "./data/mediterranean-zones";
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
import { useWildfireHotspots, type WildfireHotspot } from "./hooks/useWildfireHotspots";
import { useItalyEarthquakes, type EarthquakeEvent } from "./hooks/useItalyEarthquakes";
import { useVolcanoThermalHistory } from "./hooks/useVolcanoThermalHistory";
import "./App.css";

type Module = "calore" | "acqua" | "vulcani" | "incendi" | "desertificazione" | "idrogeologico" | "terremoti";

// label/title/subtitle vivono in locales/*/translation.json sotto "modules.<id>"
// — qui restano solo icona e layer di default, non testo da tradurre.
const MODULES: { id: Module; icon: string; defaultLayer: SatelliteLayerId }[] = [
  {
    id: "calore",
    icon: "🌡️",
    defaultLayer: sentinelHubAvailable ? "s3-lst" : "none",
  },
  {
    id: "acqua",
    icon: "💧",
    defaultLayer: sentinelHubAvailable ? "s2-ndwi" : "none",
  },
  {
    id: "vulcani",
    icon: "🌋",
    defaultLayer: sentinelHubAvailable ? "s2-true-color" : "none",
  },
  {
    id: "incendi",
    icon: "🔥",
    defaultLayer: sentinelHubAvailable ? "s2-nbr" : "none",
  },
  {
    id: "desertificazione",
    icon: "🏜️",
    defaultLayer: sentinelHubAvailable ? "s2-ndvi" : "none",
  },
  {
    id: "idrogeologico",
    icon: "🌊",
    defaultLayer: sentinelHubAvailable ? "s2-true-color" : "none",
  },
  {
    id: "terremoti",
    icon: "🌍",
    defaultLayer: "none",
  },
];

function defaultLayerDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

function App() {
  const { t, i18n } = useTranslation();
  const [module, setModule] = useState<Module>("calore");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(null);
  const [selectedMedZone, setSelectedMedZone] = useState<MediterraneanZone | null>(null);
  const [selectedVolcano, setSelectedVolcano] = useState<Volcano | null>(null);
  const [selectedFire, setSelectedFire] = useState<FireEvent | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<WildfireHotspot | null>(null);
  const [selectedZone, setSelectedZone] = useState<DesertificationZone | null>(null);
  const [selectedHydroCase, setSelectedHydroCase] = useState<HydroRiskCase | null>(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeEvent | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  // Ogni hook interroga in polling anche in background: attivarli solo quando
  // servono davvero evita richieste + re-render dell'intero albero (mappa
  // inclusa) mentre l'utente sta su una scheda che non li usa.
  const { aircraft: canadairAircraft } = useCanadairPositions(module === "incendi");
  // Anche quando è selezionato un indirizzo (pannello "Allerte vicino a te" in
  // AddressDetail) — la ricerca è raggiungibile da qualunque modulo, quindi
  // il dato serve indipendentemente da quale sia il modulo attivo.
  const { hotspots: wildfireHotspots, loading: wildfireHotspotsLoading } = useWildfireHotspots(
    module === "incendi" || module === "vulcani" || Boolean(selectedAddress),
  );
  const { events: earthquakes, loading: earthquakesLoading } = useItalyEarthquakes(
    module === "terremoti" || Boolean(selectedAddress),
  );
  // Solo quando un vulcano è selezionato — non un polling nazionale come sopra,
  // qui interessa lo storico intorno a un punto preciso.
  const {
    hotspots: volcanoThermalHistory,
    loading: volcanoThermalHistoryLoading,
    error: volcanoThermalHistoryError,
  } = useVolcanoThermalHistory(selectedVolcano?.lat ?? null, selectedVolcano?.lng ?? null);
  // Il satellite VIIRS rileva qualsiasi fonte di calore intenso, quindi lava e
  // crateri attivi finiscono negli stessi dati dei roghi — li separiamo per
  // distanza dal vulcano più vicino: entro il raggio è "vulcano attivo", oltre
  // è "incendio". VOLCANO_THERMAL_RADIUS_KM copre l'edificio vulcanico e le
  // colate sui fianchi senza inghiottire incendi non correlati nelle vicinanze.
  const VOLCANO_THERMAL_RADIUS_KM = 10;
  // Nome vulcano -> FRP massima (MW) tra i punti caldi rilevati nel raggio —
  // il MAX di un singolo pixel è un indicatore migliore di "c'è un punto
  // davvero caldo" rispetto alla somma di tanti punti deboli sparsi.
  const volcanoActivity = new Map<string, number>();
  for (const v of volcanoes) {
    const nearby = wildfireHotspots.filter((h) => haversineKm(v.lat, v.lng, h.lat, h.lon) <= VOLCANO_THERMAL_RADIUS_KM);
    if (nearby.length > 0) volcanoActivity.set(v.name, Math.max(...nearby.map((h) => h.frp)));
  }
  const nonVolcanicHotspots = wildfireHotspots.filter(
    (h) => !volcanoes.some((v) => haversineKm(v.lat, v.lng, h.lat, h.lon) <= VOLCANO_THERMAL_RADIUS_KM),
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  // Di default mostriamo subito la temperatura di superficie reale (Sentinel-3
  // LST): il calore va visto, non scoperto in un menu.
  const [layer, setLayer] = useState<SatelliteLayerId>(MODULES[0].defaultLayer);
  const [date, setDate] = useState(defaultLayerDate());
  // Centro mappa corrente: usato solo da LayerControls (compareMode "sea") per
  // mostrare la zona di mare più vicina a dove sta guardando l'utente. Default
  // = centro Italia, stesso di ITALY_CENTER in MapContainer.tsx.
  const [mapCenter, setMapCenter] = useState({ lat: 42.5, lng: 12.5 });
  // Indipendente dal layer satellitare: i contorni dei ghiacciai servono
  // proprio sopra un'immagine recente, non al posto suo.
  const [glacierEpoch, setGlacierEpoch] = useState<GlacierEpoch | null>(null);

  function clearSelection() {
    setShowInfo(false);
    setShowPrivacy(false);
    setSelectedCity(null);
    setSelectedAddress(null);
    setSelectedWaterBody(null);
    setSelectedMedZone(null);
    setSelectedVolcano(null);
    setSelectedFire(null);
    setSelectedHotspot(null);
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
    // Il layer si attiva a volo concluso (FlyTo onArrive sotto), non subito —
    // altrimenti Sentinel Hub calcola tile per ogni zoom intermedio attraversato
    // durante l'animazione, sprecate perché l'utente non le vede mai.
  }

  function selectWaterBody(waterBody: WaterBody) {
    clearSelection();
    setSelectedWaterBody(waterBody);
  }

  function selectMedZone(zone: MediterraneanZone) {
    clearSelection();
    setSelectedMedZone(zone);
  }

  function selectVolcano(volcano: Volcano) {
    clearSelection();
    setSelectedVolcano(volcano);
  }

  function selectFire(fire: FireEvent) {
    clearSelection();
    setSelectedFire(fire);
  }

  function selectHotspot(hotspot: WildfireHotspot) {
    clearSelection();
    setSelectedHotspot(hotspot);
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

  function openPrivacy() {
    clearSelection();
    setShowPrivacy(true);
  }

  const panel = selectedAddress ? (
    <AddressDetail
      address={selectedAddress}
      cities={cities}
      wildfireHotspots={wildfireHotspots}
      wildfireHotspotsLoading={wildfireHotspotsLoading}
      earthquakes={earthquakes}
      earthquakesLoading={earthquakesLoading}
      onClose={() => setSelectedAddress(null)}
    />
  ) : selectedCity ? (
    <CityDetail
      city={selectedCity}
      focus={module === "desertificazione" || module === "idrogeologico" ? module : "calore"}
      onClose={() => setSelectedCity(null)}
    />
  ) : selectedWaterBody ? (
    <WaterBodyDetail waterBody={selectedWaterBody} onClose={() => setSelectedWaterBody(null)} />
  ) : selectedMedZone ? (
    <MediterraneanDetail zone={selectedMedZone} onClose={() => setSelectedMedZone(null)} />
  ) : selectedVolcano ? (
    <VolcanoDetail
      volcano={selectedVolcano}
      frp={volcanoActivity.get(selectedVolcano.name) ?? null}
      thermalHistory={volcanoThermalHistory}
      thermalHistoryLoading={volcanoThermalHistoryLoading}
      thermalHistoryError={volcanoThermalHistoryError}
      onClose={() => setSelectedVolcano(null)}
    />
  ) : selectedFire ? (
    <FireDetail fire={selectedFire} onClose={() => setSelectedFire(null)} />
  ) : selectedHotspot ? (
    <HotspotDetail hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
  ) : selectedZone ? (
    <DesertificationDetail zone={selectedZone} onClose={() => setSelectedZone(null)} />
  ) : selectedHydroCase ? (
    <HydroRiskDetail item={selectedHydroCase} onClose={() => setSelectedHydroCase(null)} />
  ) : selectedEarthquake ? (
    <EarthquakeDetail event={selectedEarthquake} onClose={() => setSelectedEarthquake(null)} />
  ) : showInfo ? (
    <InfoPanel onClose={() => setShowInfo(false)} />
  ) : showPrivacy ? (
    <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
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
              <h1>{t(`modules.${currentModule.id}.title`)}</h1>
              <p>{t(`modules.${currentModule.id}.subtitle`)}</p>
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
                  {m.icon} {t(`modules.${m.id}.label`)}
                </button>
              ))}
            </div>
            <UnifiedSearch cities={cities} onSelectCity={selectCity} onSelectAddress={selectAddress} />
            {module === "calore" && (
              <button type="button" className="app-info-button" onClick={openInfo}>
                {t("app.whatIsUHI")}
              </button>
            )}
            <button type="button" className="app-info-button" onClick={openPrivacy}>
              {t("app.privacyButton")}
            </button>
            <button
              type="button"
              className="app-info-button"
              onClick={() => i18n.changeLanguage(i18n.language.startsWith("it") ? "en" : "it")}
            >
              {t("app.languageToggle")}
            </button>
          </div>
        </>
      }
      map={
        <>
          <MapView>
            <SatelliteOverlay layer={layer} date={date} />
            <GlacierOverlay epoch={glacierEpoch} />
            <SatelliteLoadingIndicator />
            <MapCenterTracker onChange={setMapCenter} />
            {(module === "calore" || module === "desertificazione" || module === "idrogeologico") && (
              <CityMarkers cities={cities} onSelect={selectCity} />
            )}
            {module === "acqua" && <WaterBodyMarkers waterBodies={waterBodies} onSelect={selectWaterBody} />}
            {module === "acqua" && (
              <MediterraneanMarkers zones={mediterraneanZones} onSelect={selectMedZone} />
            )}
            {module === "vulcani" && (
              <VolcanoMarkers volcanoes={volcanoes} activity={volcanoActivity} onSelect={selectVolcano} />
            )}
            {selectedVolcano && <VolcanoThermalPathMarkers hotspots={volcanoThermalHistory} />}
            {module === "incendi" && (
              <>
                <WildfireHotspotMarkers hotspots={nonVolcanicHotspots} onSelect={selectHotspot} />
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
            <FlyTo
              target={flyTarget}
              onArrive={() => {
                // A zoom da singolo edificio la mappa di calore (~1km/pixel) è solo
                // un blocco di colore poco utile: mostriamo la foto satellitare reale
                // se disponibile, altrimenti la mappa base invece del layer termico.
                setLayer(sentinelHubAvailable ? "s2-true-color" : "none");
              }}
            />
          </MapView>
          <LayerControls
            layer={layer}
            onLayerChange={setLayer}
            date={date}
            onDateChange={setDate}
            compareMode={module === "calore" ? "heat" : module === "acqua" ? "sea" : "none"}
            mapCenter={mapCenter}
            glacierEpoch={glacierEpoch}
            onGlacierEpochChange={setGlacierEpoch}
          />
        </>
      }
      panel={panel}
    />
  );
}

export default App;
