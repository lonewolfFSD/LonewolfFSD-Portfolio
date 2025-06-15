import { useEffect } from "react";

export default function AdBanner() {
  useEffect(() => {
    try {
      // Ensure the adsbygoogle array exists
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, []);

  return (
    <>
      {/* Load script only once via index.html or _document.tsx */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6132908164486023"
        data-ad-slot="6949292351"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
}
