import { useTranslation } from "react-i18next";

export default function AlbedoExplainer() {
  const { t } = useTranslation();
  return (
    <div className="albedo-explainer">
      <h3>{t("albedoExplainer.title1")}</h3>
      <p>{t("albedoExplainer.p1")}</p>
      <h3>{t("albedoExplainer.title2")}</h3>
      <p>{t("albedoExplainer.p2")}</p>
    </div>
  );
}
