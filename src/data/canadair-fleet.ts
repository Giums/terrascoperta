// Flotta Canadair CL-415 della Protezione Civile italiana. La flotta reale è
// di 19 velivoli (immatricolazioni I-DPCA...I-DPCT); qui ci sono solo i 13 con
// codice ICAO24 (Mode-S) verificato tramite adsbdb.com — meglio ometterne 6
// che inventare un codice che identificherebbe un aereo sbagliato.
export interface CanadairAircraft {
  registration: string;
  icao24: string;
}

export const canadairFleet: CanadairAircraft[] = [
  { registration: "I-DPCC", icao24: "300337" },
  { registration: "I-DPCD", icao24: "30023d" },
  { registration: "I-DPCE", icao24: "30023e" },
  { registration: "I-DPCF", icao24: "30024a" },
  { registration: "I-DPCG", icao24: "30024b" },
  { registration: "I-DPCH", icao24: "30024c" },
  { registration: "I-DPCN", icao24: "3003b6" },
  { registration: "I-DPCO", icao24: "30023f" },
  { registration: "I-DPCP", icao24: "300240" },
  { registration: "I-DPCQ", icao24: "300241" },
  { registration: "I-DPCR", icao24: "30043d" },
  { registration: "I-DPCS", icao24: "30041d" },
  { registration: "I-DPCT", icao24: "300242" },
];
