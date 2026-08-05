import { useWeather } from "../../hooks/useWeather";

interface WeatherLiveProps {
  lat: number;
  lng: number;
}

export default function WeatherLive({ lat, lng }: WeatherLiveProps) {
  const { data, loading, error } = useWeather(lat, lng);

  if (loading) return <p className="weather-live__status">Caricamento meteo in tempo reale…</p>;
  if (error || !data)
    return <p className="weather-live__status">Dati meteo non disponibili al momento.</p>;

  return (
    <div className="weather-live">
      <div className="weather-live__main">
        <span className="weather-live__temp">{data.temperature.toFixed(1)}°C</span>
        <span className="weather-live__feel">percepita {data.apparentTemperature.toFixed(1)}°C</span>
      </div>
      <dl className="weather-live__grid">
        <div>
          <dt>Massima oggi</dt>
          <dd>{data.tempMax.toFixed(1)}°C</dd>
        </div>
        <div>
          <dt>Minima oggi</dt>
          <dd>{data.tempMin.toFixed(1)}°C</dd>
        </div>
        <div>
          <dt>Umidità</dt>
          <dd>{data.humidity}%</dd>
        </div>
        <div>
          <dt>Vento</dt>
          <dd>{data.windSpeed.toFixed(0)} km/h</dd>
        </div>
        <div>
          <dt>Radiazione solare</dt>
          <dd>{data.shortwaveRadiation.toFixed(0)} W/m²</dd>
        </div>
      </dl>
      <p className="weather-live__source">Dati live: Open-Meteo</p>
    </div>
  );
}
