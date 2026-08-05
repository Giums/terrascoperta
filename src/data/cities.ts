// Dataset dei capoluoghi di provincia italiani.
// Coordinate: centro città. Popolazione: dato comunale, ordine di grandezza ISTAT
// (valori arrotondati, non aggiornati in tempo reale — usare come stima).
export interface City {
  name: string;
  lat: number;
  lng: number;
  population: number;
  coastal: boolean;
  region: string;
  province: string;
}

export const cities: City[] = [
  // Piemonte
  { name: "Torino", lat: 45.0703, lng: 7.6869, population: 848196, coastal: false, region: "Piemonte", province: "TO" },
  { name: "Alessandria", lat: 44.9133, lng: 8.6154, population: 92000, coastal: false, region: "Piemonte", province: "AL" },
  { name: "Asti", lat: 44.9002, lng: 8.2065, population: 76000, coastal: false, region: "Piemonte", province: "AT" },
  { name: "Biella", lat: 45.5658, lng: 8.0539, population: 44000, coastal: false, region: "Piemonte", province: "BI" },
  { name: "Cuneo", lat: 44.3841, lng: 7.5423, population: 56000, coastal: false, region: "Piemonte", province: "CN" },
  { name: "Novara", lat: 45.4469, lng: 8.6222, population: 104000, coastal: false, region: "Piemonte", province: "NO" },
  { name: "Verbania", lat: 45.9219, lng: 8.5511, population: 30000, coastal: false, region: "Piemonte", province: "VB" },
  { name: "Vercelli", lat: 45.3204, lng: 8.4212, population: 46000, coastal: false, region: "Piemonte", province: "VC" },
  // Valle d'Aosta
  { name: "Aosta", lat: 45.7372, lng: 7.3201, population: 34000, coastal: false, region: "Valle d'Aosta", province: "AO" },
  // Lombardia
  { name: "Milano", lat: 45.4642, lng: 9.1900, population: 1371000, coastal: false, region: "Lombardia", province: "MI" },
  { name: "Bergamo", lat: 45.6983, lng: 9.6773, population: 120000, coastal: false, region: "Lombardia", province: "BG" },
  { name: "Brescia", lat: 45.5416, lng: 10.2118, population: 196000, coastal: false, region: "Lombardia", province: "BS" },
  { name: "Como", lat: 45.8081, lng: 9.0852, population: 84000, coastal: false, region: "Lombardia", province: "CO" },
  { name: "Cremona", lat: 45.1335, lng: 10.0422, population: 72000, coastal: false, region: "Lombardia", province: "CR" },
  { name: "Lecco", lat: 45.8566, lng: 9.3931, population: 48000, coastal: false, region: "Lombardia", province: "LC" },
  { name: "Lodi", lat: 45.3141, lng: 9.5036, population: 45000, coastal: false, region: "Lombardia", province: "LO" },
  { name: "Mantova", lat: 45.1564, lng: 10.7914, population: 49000, coastal: false, region: "Lombardia", province: "MN" },
  { name: "Monza", lat: 45.5845, lng: 9.2744, population: 123000, coastal: false, region: "Lombardia", province: "MB" },
  { name: "Pavia", lat: 45.1847, lng: 9.1582, population: 73000, coastal: false, region: "Lombardia", province: "PV" },
  { name: "Sondrio", lat: 46.1712, lng: 9.8728, population: 21000, coastal: false, region: "Lombardia", province: "SO" },
  { name: "Varese", lat: 45.8206, lng: 8.8250, population: 80000, coastal: false, region: "Lombardia", province: "VA" },
  // Trentino-Alto Adige
  { name: "Trento", lat: 46.0679, lng: 11.1211, population: 118000, coastal: false, region: "Trentino-Alto Adige", province: "TN" },
  { name: "Bolzano", lat: 46.4983, lng: 11.3548, population: 107000, coastal: false, region: "Trentino-Alto Adige", province: "BZ" },
  // Veneto
  { name: "Venezia", lat: 45.4408, lng: 12.3155, population: 258000, coastal: true, region: "Veneto", province: "VE" },
  { name: "Belluno", lat: 46.1391, lng: 12.2158, population: 35000, coastal: false, region: "Veneto", province: "BL" },
  { name: "Padova", lat: 45.4064, lng: 11.8768, population: 214000, coastal: false, region: "Veneto", province: "PD" },
  { name: "Rovigo", lat: 45.0705, lng: 11.7905, population: 50000, coastal: false, region: "Veneto", province: "RO" },
  { name: "Treviso", lat: 45.6669, lng: 12.2431, population: 85000, coastal: false, region: "Veneto", province: "TV" },
  { name: "Verona", lat: 45.4384, lng: 10.9916, population: 258000, coastal: false, region: "Veneto", province: "VR" },
  { name: "Vicenza", lat: 45.5455, lng: 11.5354, population: 111000, coastal: false, region: "Veneto", province: "VI" },
  // Friuli-Venezia Giulia
  { name: "Trieste", lat: 45.6495, lng: 13.7768, population: 199000, coastal: true, region: "Friuli-Venezia Giulia", province: "TS" },
  { name: "Gorizia", lat: 45.9410, lng: 13.6208, population: 34000, coastal: false, region: "Friuli-Venezia Giulia", province: "GO" },
  { name: "Pordenone", lat: 45.9564, lng: 12.6577, population: 51000, coastal: false, region: "Friuli-Venezia Giulia", province: "PN" },
  { name: "Udine", lat: 46.0711, lng: 13.2346, population: 99000, coastal: false, region: "Friuli-Venezia Giulia", province: "UD" },
  // Liguria
  { name: "Genova", lat: 44.4056, lng: 8.9463, population: 561000, coastal: true, region: "Liguria", province: "GE" },
  { name: "Imperia", lat: 43.8891, lng: 8.0308, population: 42000, coastal: true, region: "Liguria", province: "IM" },
  { name: "La Spezia", lat: 44.1024, lng: 9.8241, population: 93000, coastal: true, region: "Liguria", province: "SP" },
  { name: "Savona", lat: 44.3084, lng: 8.4805, population: 59000, coastal: true, region: "Liguria", province: "SV" },
  // Emilia-Romagna
  { name: "Bologna", lat: 44.4949, lng: 11.3426, population: 393000, coastal: false, region: "Emilia-Romagna", province: "BO" },
  { name: "Ferrara", lat: 44.8381, lng: 11.6198, population: 128000, coastal: false, region: "Emilia-Romagna", province: "FE" },
  { name: "Forlì", lat: 44.2226, lng: 12.0407, population: 118000, coastal: false, region: "Emilia-Romagna", province: "FC" },
  { name: "Modena", lat: 44.6471, lng: 10.9252, population: 185000, coastal: false, region: "Emilia-Romagna", province: "MO" },
  { name: "Parma", lat: 44.8015, lng: 10.3279, population: 198000, coastal: false, region: "Emilia-Romagna", province: "PR" },
  { name: "Piacenza", lat: 45.0526, lng: 9.6929, population: 105000, coastal: false, region: "Emilia-Romagna", province: "PC" },
  { name: "Ravenna", lat: 44.4184, lng: 12.2035, population: 156000, coastal: true, region: "Emilia-Romagna", province: "RA" },
  { name: "Reggio Emilia", lat: 44.6989, lng: 10.6297, population: 171000, coastal: false, region: "Emilia-Romagna", province: "RE" },
  { name: "Rimini", lat: 44.0678, lng: 12.5695, population: 150000, coastal: true, region: "Emilia-Romagna", province: "RN" },
  // Toscana
  { name: "Firenze", lat: 43.7696, lng: 11.2558, population: 366000, coastal: false, region: "Toscana", province: "FI" },
  { name: "Arezzo", lat: 43.4633, lng: 11.8797, population: 98000, coastal: false, region: "Toscana", province: "AR" },
  { name: "Grosseto", lat: 42.7603, lng: 11.1136, population: 81000, coastal: true, region: "Toscana", province: "GR" },
  { name: "Livorno", lat: 43.5485, lng: 10.3106, population: 152000, coastal: true, region: "Toscana", province: "LI" },
  { name: "Lucca", lat: 43.8429, lng: 10.5027, population: 87000, coastal: false, region: "Toscana", province: "LU" },
  { name: "Massa", lat: 44.0367, lng: 10.1411, population: 68000, coastal: true, region: "Toscana", province: "MS" },
  { name: "Pisa", lat: 43.7228, lng: 10.4017, population: 90000, coastal: true, region: "Toscana", province: "PI" },
  { name: "Pistoia", lat: 43.9333, lng: 10.9171, population: 90000, coastal: false, region: "Toscana", province: "PT" },
  { name: "Prato", lat: 43.8777, lng: 11.1023, population: 195000, coastal: false, region: "Toscana", province: "PO" },
  { name: "Siena", lat: 43.3188, lng: 11.3308, population: 53000, coastal: false, region: "Toscana", province: "SI" },
  // Umbria
  { name: "Perugia", lat: 43.1122, lng: 12.3888, population: 165000, coastal: false, region: "Umbria", province: "PG" },
  { name: "Terni", lat: 42.5636, lng: 12.6427, population: 109000, coastal: false, region: "Umbria", province: "TR" },
  // Marche
  { name: "Ancona", lat: 43.6158, lng: 13.5189, population: 100000, coastal: true, region: "Marche", province: "AN" },
  { name: "Ascoli Piceno", lat: 42.8536, lng: 13.5758, population: 47000, coastal: false, region: "Marche", province: "AP" },
  { name: "Fermo", lat: 43.1607, lng: 13.7186, population: 37000, coastal: false, region: "Marche", province: "FM" },
  { name: "Macerata", lat: 43.3006, lng: 13.4531, population: 40000, coastal: false, region: "Marche", province: "MC" },
  { name: "Pesaro", lat: 43.9101, lng: 12.9133, population: 95000, coastal: true, region: "Marche", province: "PU" },
  // Lazio
  { name: "Roma", lat: 41.9028, lng: 12.4964, population: 2748000, coastal: true, region: "Lazio", province: "RM" },
  { name: "Frosinone", lat: 41.6401, lng: 13.3506, population: 46000, coastal: false, region: "Lazio", province: "FR" },
  { name: "Latina", lat: 41.4676, lng: 12.9037, population: 126000, coastal: true, region: "Lazio", province: "LT" },
  { name: "Rieti", lat: 42.4008, lng: 12.8617, population: 47000, coastal: false, region: "Lazio", province: "RI" },
  { name: "Viterbo", lat: 42.4207, lng: 12.1077, population: 63000, coastal: false, region: "Lazio", province: "VT" },
  // Abruzzo
  { name: "L'Aquila", lat: 42.3498, lng: 13.3995, population: 69000, coastal: false, region: "Abruzzo", province: "AQ" },
  { name: "Chieti", lat: 42.3510, lng: 14.1678, population: 50000, coastal: false, region: "Abruzzo", province: "CH" },
  { name: "Pescara", lat: 42.4643, lng: 14.2142, population: 119000, coastal: true, region: "Abruzzo", province: "PE" },
  { name: "Teramo", lat: 42.6589, lng: 13.7042, population: 54000, coastal: false, region: "Abruzzo", province: "TE" },
  // Molise
  { name: "Campobasso", lat: 41.5602, lng: 14.6684, population: 47000, coastal: false, region: "Molise", province: "CB" },
  { name: "Isernia", lat: 41.5947, lng: 14.2306, population: 21000, coastal: false, region: "Molise", province: "IS" },
  // Campania
  { name: "Napoli", lat: 40.8518, lng: 14.2681, population: 909000, coastal: true, region: "Campania", province: "NA" },
  { name: "Avellino", lat: 40.9146, lng: 14.7925, population: 54000, coastal: false, region: "Campania", province: "AV" },
  { name: "Benevento", lat: 41.1298, lng: 14.7826, population: 59000, coastal: false, region: "Campania", province: "BN" },
  { name: "Caserta", lat: 41.0723, lng: 14.3308, population: 74000, coastal: false, region: "Campania", province: "CE" },
  { name: "Salerno", lat: 40.6824, lng: 14.7681, population: 124000, coastal: true, region: "Campania", province: "SA" },
  // Puglia
  { name: "Bari", lat: 41.1171, lng: 16.8719, population: 316000, coastal: true, region: "Puglia", province: "BA" },
  { name: "Barletta", lat: 41.3193, lng: 16.2802, population: 94000, coastal: true, region: "Puglia", province: "BT" },
  { name: "Brindisi", lat: 40.6320, lng: 17.9370, population: 84000, coastal: true, region: "Puglia", province: "BR" },
  { name: "Foggia", lat: 41.4622, lng: 15.5446, population: 147000, coastal: false, region: "Puglia", province: "FG" },
  { name: "Lecce", lat: 40.3519, lng: 18.1720, population: 94000, coastal: false, region: "Puglia", province: "LE" },
  { name: "Taranto", lat: 40.4738, lng: 17.2300, population: 187000, coastal: true, region: "Puglia", province: "TA" },
  // Basilicata
  { name: "Potenza", lat: 40.6404, lng: 15.8054, population: 66000, coastal: false, region: "Basilicata", province: "PZ" },
  { name: "Matera", lat: 40.6664, lng: 16.6043, population: 60000, coastal: false, region: "Basilicata", province: "MT" },
  // Calabria
  { name: "Catanzaro", lat: 38.9098, lng: 16.5877, population: 88000, coastal: true, region: "Calabria", province: "CZ" },
  { name: "Cosenza", lat: 39.2989, lng: 16.2539, population: 66000, coastal: false, region: "Calabria", province: "CS" },
  { name: "Crotone", lat: 39.0808, lng: 17.1269, population: 60000, coastal: true, region: "Calabria", province: "KR" },
  { name: "Reggio Calabria", lat: 38.1113, lng: 15.6619, population: 176000, coastal: true, region: "Calabria", province: "RC" },
  { name: "Vibo Valentia", lat: 38.6756, lng: 16.1017, population: 33000, coastal: true, region: "Calabria", province: "VV" },
  // Sicilia
  { name: "Palermo", lat: 38.1157, lng: 13.3615, population: 630000, coastal: true, region: "Sicilia", province: "PA" },
  { name: "Agrigento", lat: 37.3111, lng: 13.5765, population: 59000, coastal: true, region: "Sicilia", province: "AG" },
  { name: "Caltanissetta", lat: 37.4903, lng: 14.0625, population: 60000, coastal: false, region: "Sicilia", province: "CL" },
  { name: "Catania", lat: 37.5079, lng: 15.0830, population: 298000, coastal: true, region: "Sicilia", province: "CT" },
  { name: "Enna", lat: 37.5674, lng: 14.2814, population: 25000, coastal: false, region: "Sicilia", province: "EN" },
  { name: "Messina", lat: 38.1938, lng: 15.5540, population: 216000, coastal: true, region: "Sicilia", province: "ME" },
  { name: "Ragusa", lat: 36.9257, lng: 14.7278, population: 73000, coastal: false, region: "Sicilia", province: "RG" },
  { name: "Siracusa", lat: 37.0755, lng: 15.2866, population: 116000, coastal: true, region: "Sicilia", province: "SR" },
  { name: "Trapani", lat: 38.0176, lng: 12.5365, population: 68000, coastal: true, region: "Sicilia", province: "TP" },
  // Sardegna
  { name: "Cagliari", lat: 39.2238, lng: 9.1217, population: 148000, coastal: true, region: "Sardegna", province: "CA" },
  { name: "Nuoro", lat: 40.3210, lng: 9.3306, population: 35000, coastal: false, region: "Sardegna", province: "NU" },
  { name: "Oristano", lat: 39.9034, lng: 8.5905, population: 30000, coastal: true, region: "Sardegna", province: "OR" },
  { name: "Sassari", lat: 40.7267, lng: 8.5591, population: 122000, coastal: true, region: "Sardegna", province: "SS" },
  { name: "Carbonia", lat: 39.1673, lng: 8.5219, population: 27000, coastal: false, region: "Sardegna", province: "SU" },
];
