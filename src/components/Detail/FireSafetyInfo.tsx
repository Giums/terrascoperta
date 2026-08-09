import { Trans, useTranslation } from "react-i18next";

/**
 * Contenuto verificato su due fonti ufficiali (Dipartimento Protezione Civile
 * e campagna nazionale Io Non Rischio), non riscritto a memoria — vedi i link
 * in fondo. Condiviso tra FireDetail (casi studio) e HotspotDetail (focolai
 * live), stessa informazione indipendentemente da cosa hai cliccato.
 */
export default function FireSafetyInfo() {
  const { t } = useTranslation();
  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>{t("safety.fire.title")}</h3>
      <p>
        <Trans i18nKey="safety.fire.p1" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.fire.p2" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.fire.p3" components={{ b: <strong /> }} />
      </p>
      <p>
        <em>{t("safety.fire.redCross")}</em>
      </p>
      <p>
        <em>
          <Trans
            i18nKey="safety.fire.source"
            components={{
              a1: (
                <a
                  href="https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-incendio-boschivo/"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
              a2: (
                <a
                  href="https://www.iononrischio.gov.it/it/preparati/incendi-boschivi/cosa-fare/"
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
