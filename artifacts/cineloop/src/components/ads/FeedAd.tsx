import React from "react";

export default function FeedAd() {
  return (
    <div
      className="w-full h-[320px] flex items-center justify-center bg-neutral-900 text-white"
      style={{
        borderTop: "1px solid #222",
        borderBottom: "1px solid #222"
      }}
    >
      <div className="text-center">
        <p className="text-xs opacity-60 mb-2">Sponsored</p>

        {/* Web AdSense placeholder */}
        <div id="adsense-slot" />

        {/* Mobile AdMob placeholder */}
        <div id="admob-slot" />
      </div>
    </div>
  );
}