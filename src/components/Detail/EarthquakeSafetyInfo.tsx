import { Trans, useTranslation } from "react-i18next";

/** Contenuto verificato su due fonti ufficiali (Dipartimento Protezione Civile e Io Non Rischio), non riscritto a memoria — vedi i link in fondo. */
export default function EarthquakeSafetyInfo() {
  const { t } = useTranslation();
  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>{t("safety.earthquake.title")}</h3>
      <p>
        <Trans i18nKey="safety.earthquake.p1" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.earthquake.p2" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.earthquake.p3" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.earthquake.p4" components={{ b: <strong /> }} />
      </p>
      <p>
        <em>{t("safety.earthquake.redCross")}</em>
      </p>
      <p>
        <em>
          <Trans
            i18nKey="safety.earthquake.source"
            components={{
              a1: (
                <a
                  href="https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-terremoto/"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
              a2: (
                <a
                  href="https://www.iononrischio.gov.it/it/preparati/terremoto/cosa-fare/"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
            }}
          />
        </em>
      </p>
    </section>
  );
}
