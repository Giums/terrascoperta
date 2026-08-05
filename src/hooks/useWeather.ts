import { useEffect, useState } from "react";

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  shortwaveRadiation: number;
  tempMax: number;
  tempMin: number;
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(lat: number, lng: number): WeatherState {
  const [state, setState] = useState<WeatherState>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,shortwave_radiation` +
      `&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome&forecast_days=1`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero dati meteo");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setState({
          data: {
            temperature: json.current.temperature_2m,
            apparentTemperature: json.current.apparent_temperature,
            humidity: json.current.relative_humidity_2m,
            windSpeed: json.current.wind_speed_10m,
            shortwaveRadiation: json.current.shortwave_radiation,
            tempMax: json.daily.temperature_2m_max[0],
            tempMin: json.daily.temperature_2m_min[0],
          },
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ data: null, loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return state;
}
