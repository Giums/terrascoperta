import { Trans, useTranslation } from "react-i18next";

/** Contenuto verificato su fonti ufficiali (Dipartimento Protezione Civile), non riscritto a memoria — vedi i link in fondo. */
export default function HydroRiskSafetyInfo() {
  const { t } = useTranslation();
  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>{t("safety.hydroRisk.floodTitle")}</h3>
      <p>
        <Trans i18nKey="safety.hydroRisk.p1" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.hydroRisk.p2" components={{ b: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="safety.hydroRisk.p3" components={{ b: <strong /> }} />
      </p>

      <h3>{t("safety.hydroRisk.landslideTitle")}</h3>
      <p>{t("safety.hydroRisk.p4")}</p>

      <p>
        <Trans i18nKey="safety.hydroRisk.p5" components={{ b: <strong /> }} />
      </p>
      <p>
        <em>{t("safety.hydroRisk.redCross")}</em>
      </p>
      <p>
        <em>
          <Trans
            i18nKey="safety.hydroRisk.source"
            components={{
              a1: (
                <a
                  href="https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-alluvione/"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
              a2: (
                <a
                  href="https://www.protezionecivile.gov.it/jcms/it/view_cosa_fare_idrogeologico.wp?contentId=APP278"
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
