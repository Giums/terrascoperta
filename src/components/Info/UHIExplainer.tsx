import { useTranslation } from "react-i18next";

export default function UHIExplainer() {
  const { t } = useTranslation();
  return (
    <div className="uhi-explainer">
      <h3>{t("uhiExplainer.title1")}</h3>
      <p>{t("uhiExplainer.p1")}</p>
      <h3>{t("uhiExplainer.title2")}</h3>
      <ul>
        <li>{t("uhiExplainer.li1")}</li>
        <li>{t("uhiExplainer.li2")}</li>
        <li>{t("uhiExplainer.li3")}</li>
        <li>{t("uhiExplainer.li4")}</li>
      </ul>
      <h3>{t("uhiExplainer.title3")}</h3>
      <p>{t("uhiExplainer.p2")}</p>
      <h3>{t("uhiExplainer.title4")}</h3>
      <p>{t("uhiExplainer.p3")}</p>
    </div>
  );
}
