interface HomeAction {
  name: string;
  cost: string;
  tempEffect: string;
  acSaving: string;
  difficulty: "Fai da te" | "Professionista";
}

const ACTIONS: HomeAction[] = [
  {
    name: "Vernice bianca sul tetto",
    cost: "€ 5–15/m²",
    tempEffect: "−2 a −5 °C",
    acSaving: "−20–40%",
    difficulty: "Fai da te",
  },
  {
    name: "Membrana riflettente professionale",
    cost: "€ 20–40/m²",
    tempEffect: "−3 a −6 °C",
    acSaving: "−25–45%",
    difficulty: "Professionista",
  },
  {
    name: "Tetto verde estensivo (sedum)",
    cost: "€ 80–150/m²",
    tempEffect: "−3 a −7 °C",
    acSaving: "−30–50%",
    difficulty: "Professionista",
  },
  {
    name: "Rampicanti su facciate sud/ovest",
    cost: "€ 10–30/pianta",
    tempEffect: "−2 a −4 °C sulla parete",
    acSaving: "—",
    difficulty: "Fai da te",
  },
  {
    name: "Albero a foglia caduca (lato sud)",
    cost: "€ 50–200/albero",
    tempEffect: "−2 a −4 °C sotto chioma",
    acSaving: "−15–35%",
    difficulty: "Fai da te",
  },
  {
    name: "Pellicola riflettente vetri",
    cost: "€ 10–30/m²",
    tempEffect: "−1 a −3 °C",
    acSaving: "—",
    difficulty: "Fai da te",
  },
];

export default function HomeActions() {
  return (
    <div className="home-actions">
      <div className="home-actions__table" role="table">
        <div className="home-actions__row home-actions__row--head" role="row">
          <span role="columnheader">Intervento</span>
          <span role="columnheader">Costo</span>
          <span role="columnheader">Temp. interna</span>
          <span role="columnheader">Risparmio AC</span>
          <span role="columnheader">Difficoltà</span>
        </div>
        {ACTIONS.map((action) => (
          <div className="home-actions__row" role="row" key={action.name}>
            <span role="cell">{action.name}</span>
            <span role="cell">{action.cost}</span>
            <span role="cell">{action.tempEffect}</span>
            <span role="cell">{action.acSaving}</span>
            <span
              role="cell"
              className={
                action.difficulty === "Fai da te"
                  ? "home-actions__tag home-actions__tag--diy"
                  : "home-actions__tag home-actions__tag--pro"
              }
            >
              {action.difficulty}
            </span>
          </div>
        ))}
      </div>
      <p className="home-actions__note">
        Albedo alto = superficie chiara = riflette la luce = più fresco. Albedo basso = superficie
        scura = assorbe la luce = più caldo.
      </p>
    </div>
  );
}
