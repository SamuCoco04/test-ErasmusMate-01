"use client";

import dynamic from "next/dynamic";

const MapExplorerLeaflet = dynamic(
  () => import("@/components/social/map/map-explorer-leaflet").then((m) => m.MapExplorerLeaflet),
  {
    ssr: false,
    loading: () => <p className="text-sm text-muted-foreground">Loading map explorer…</p>,
  },
);

export default function MapExplorerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Map Explorer</h1>
        <p className="text-muted-foreground">
          Explore only public Erasmus-relevant places and linked community content. No route planning, no live
          tracking, and no personal precise-location exposure.
        </p>
      </div>
      <MapExplorerLeaflet />
    </div>
  );
}
