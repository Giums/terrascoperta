import { useState } from "react";
import type { City } from "../../data/cities";
import type { AddressResult } from "../../utils/geocode";
import type { WildfireHotspot } from "../../hooks/useWildfireHotspots";
import type { EarthquakeEvent } from "../../hooks/useItalyEarthquakes";
import { nearestCity } from "../../utils/geo";
import { estimateUHI } from "../../utils/uhi-model";
import { simulateMitigation } from "../../utils/simulator";
import WeatherLive from "./WeatherLive";
import HistoricalComparison from "./HistoricalComparison";
import Simulator from "./Simulator";
import DissipationChart from "./DissipationChart";
import PersonalSavings from "./PersonalSavings";
import HomeActions from "./HomeActions";
import SolarPanelNote from "./SolarPanelNote";
import AddressAlerts from "./AddressAlerts";
import HydrogeologicalRisk from "./HydrogeologicalRisk";
import DesertificationRisk from "./DesertificationRisk";
import "./CityDetail.css";

interface AddressDetailProps {
  address: AddressResult;
  cities: City[];
  wildfireHotspots: WildfireHotspot[];
  wildfireHotspotsLoading: boolean;
  earthquakes: EarthquakeEvent[];
  earthquakesLoading: boolean;
  onClose: () => void;
}

export default function AddressDetail({
  address,
  cities,
  wildfireHotspots,
  wildfireHotspotsLoading,
  earthquakes,
  earthquakesLoading,
  onClose,
}: AddressDetailProps) {
  const { city: reference, distanceKm } = nearestCity(address.lat, address.lng, cities);
  const uhi = estimateUHI(reference);
  const [sim, setSim] = useState({ green: 10, albedo: 10, reduction: simulateMitigation(uhi, 10, 10) });
  const shortLabel = address.label.split(",").slice(0, 2).join(",");

  return (
    <div className="city-detail">
      <div className="city-detail__header">
        <div>
          <h2>{shortLabel}</h2>
          <p className="city-detail__meta">
            Riferimento UHI: {reference.name} ({distanceKm < 1 ? "<1" : distanceKm.toFixed(0)} km)
          </p>
        </div>
        <button type="button" className="city-detail__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <AddressAlerts
        lat={address.lat}
        lng={address.lng}
        wildfireHotspots={wildfireHotspots}
        wildfireHotspotsLoading={wildfireHotspotsLoading}
        earthquakes={earthquakes}
        earthquakesLoading={earthquakesLoading}
      />

      <HydrogeologicalRisk lat={address.lat} lng={address.lng} />
      <DesertificationRisk lat={address.lat} lng={address.lng} />

      <section className="city-detail__section city-detail__urgency">
        <p>
          Non abbiamo un modello UHI per il singolo indirizzo: usiamo come riferimento la stima
          della città più vicina, <strong>{reference.name}</strong> (+{uhi.toFixed(1)}°C). Meteo e
          serie storica qui sotto invece sono calcolati esattamente sulle coordinate del tuo
          indirizzo, non sulla città di riferimento.
        </p>
      </section>

      <section className="city-detail__section">
        <h3>Meteo in tempo reale qui</h3>
        <WeatherLive lat={address.lat} lng={address.lng} />
      </section>

      <section className="city-detail__section">
        <h3>Estate di ieri vs estate di oggi, qui</h3>
        <HistoricalComparison lat={address.lat} lng={address.lng} />
      </section>

      <section className="city-detail__section">
        <h3>Simulatore di mitigazione</h3>
        <Simulator
          uhi={uhi}
          onChange={(green, albedo, reduction) => setSim({ green, albedo, reduction })}
        />
        <DissipationChart green={sim.green} albedo={sim.albedo} />
      </section>

      <section className="city-detail__section">
        <h3>Quanto risparmi tu</h3>
        <PersonalSavings referenceCity={reference} green={sim.green} albedo={sim.albedo} uhiReduction={sim.reduction} />
      </section>

      <section className="city-detail__section city-detail__cycle">
        <h3>Il circolo vizioso del condizionamento</h3>
        <p>
          Ogni condizionatore estrae calore dall'interno e lo scarica all'esterno. In un quartiere
          denso, migliaia di unità esterne scaldano l'aria della strada. Questo alza la temperatura
          esterna → i condizionatori devono lavorare di più → consumano più energia → scaldano
          ancora di più l'aria. Gli interventi di mitigazione (albedo, verde) spezzano questo
          circolo.
        </p>
      </section>

      <section className="city-detail__section">
        <h3>Cosa puoi fare, qui</h3>
        <HomeActions />
        <SolarPanelNote green={sim.green} albedo={sim.albedo} />
      </section>

      <p className="weather-live__source">
        Geocoding: OpenStreetMap Nominatim.
      </p>
    </div>
  );
}
