// Flotta aerea antincendio italiana (Vigili del Fuoco / Protezione Civile).
// Canadair CL-415: la flotta reale è di 19 velivoli (I-DPCA...I-DPCT); qui ci
// sono solo i 13 con codice ICAO24 (Mode-S) verificato tramite adsbdb.com —
// meglio ometterne 6 che inventare un codice che identificherebbe un aereo
// sbagliato. Stessa regola per gli elicotteri Erickson/Sikorsky S-64F
// Skycrane: la flotta VVF ne ha 5-6 in dotazione, qui solo i 2 verificati
// (I-CFAI e I-CFAN esistono ma non risultano su adsbdb.com).
export type AircraftType = "canadair" | "elicottero";

export interface CanadairAircraft {
  registration: string;
  icao24: string;
  type: AircraftType;
}

export const canadairFleet: CanadairAircraft[] = [
  { registration: "I-DPCC", icao24: "300337", type: "canadair" },
  { registration: "I-DPCD", icao24: "30023d", type: "canadair" },
  { registration: "I-DPCE", icao24: "30023e", type: "canadair" },
  { registration: "I-DPCF", icao24: "30024a", type: "canadair" },
  { registration: "I-DPCG", icao24: "30024b", type: "canadair" },
  { registration: "I-DPCH", icao24: "30024c", type: "canadair" },
  { registration: "I-DPCN", icao24: "3003b6", type: "canadair" },
  { registration: "I-DPCO", icao24: "30023f", type: "canadair" },
  { registration: "I-DPCP", icao24: "300240", type: "canadair" },
  { registration: "I-DPCQ", icao24: "300241", type: "canadair" },
  { registration: "I-DPCR", icao24: "30043d", type: "canadair" },
  { registration: "I-DPCS", icao24: "30041d", type: "canadair" },
  { registration: "I-DPCT", icao24: "300242", type: "canadair" },
  { registration: "I-CFAG", icao24: "300582", type: "elicottero" },
  { registration: "I-CFAM", icao24: "30083d", type: "elicottero" },
];
