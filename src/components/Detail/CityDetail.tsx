import { useState } from "react";
import type { City } from "../../data/cities";
import { estimateUHI } from "../../utils/uhi-model";
import { simulateMitigation } from "../../utils/simulator";
import WeatherLive from "./WeatherLive";
import HistoricalComparison from "./HistoricalComparison";
import Simulator from "./Simulator";
import DissipationChart from "./DissipationChart";
import CostEstimator from "./CostEstimator";
import HomeActions from "./HomeActions";
import SolarPanelNote from "./SolarPanelNote";
import "./CityDetail.css";

interface CityDetailProps {
  city: City;
  onClose: () => void;
}

export default function CityDetail({ city, onClose }: CityDetailProps) {
  const uhi = estimateUHI(city);
  // Deve restare in sincronia con i valori di default degli slider in Simulator.tsx:
  // la riduzione va calcolata subito, non lasciata a 0 finché l'utente non tocca uno
  // slider, altrimenti CostEstimator divide per un risparmio nullo (payback assurdo).
  const [sim, setSim] = useState({ green: 10, albedo: 10, reduction: simulateMitigation(uhi, 10, 10) });

  return (
    <div className="city-detail">
      <div className="city-detail__header">
        <div>
          <h2>{city.name}</h2>
          <p className="city-detail__meta">
            {city.province} · {city.region} · {city.population.toLocaleString("it-IT")} ab.
            {city.coastal ? " · costiera" : ""}
          </p>
        </div>
        <button type="button" className="city-detail__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="city-detail__section">
        <h3>Meteo in tempo reale</h3>
        <WeatherLive lat={city.lat} lng={city.lng} />
      </section>

      <section className="city-detail__section">
        <h3>Estate di ieri vs estate di oggi</h3>
        <HistoricalComparison lat={city.lat} lng={city.lng} />
      </section>

      <section className="city-detail__section city-detail__urgency">
        <p>
          <strong>Ogni estate senza interventi il divario cresce.</strong> A {city.name} l'UHI
          stimata è già +{uhi.toFixed(1)}°C — e senza mitigazione tende a peggiorare, non a
          restare stabile. Muovi gli slider qui sotto: anche un intervento piccolo, iniziato oggi,
          vale più dello stesso intervento fatto tra cinque anni.
        </p>
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
        <h3>Costi e benefici stimati</h3>
        <CostEstimator city={city} green={sim.green} albedo={sim.albedo} uhiReduction={sim.reduction} />
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
        <h3>Cosa puoi fare a casa tua</h3>
        <HomeActions />
        <SolarPanelNote green={sim.green} albedo={sim.albedo} />
      </section>
    </div>
  );
}
