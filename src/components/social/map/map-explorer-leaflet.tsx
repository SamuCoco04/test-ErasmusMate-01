"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Flag, ShieldCheck, Star } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mapLinkedRecommendationsFixture } from "@/lib/mock/social/map";
import type { MapLinkedOpinion, SocialMapCategory } from "@/types/social";

const SELECT_CLASS = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

const defaultIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapContentTypeFilter = MapLinkedOpinion["contentType"] | "all";

export function MapExplorerLeaflet() {
  const [destination, setDestination] = useState("Spain");
  const [city, setCity] = useState("Barcelona");
  const [category, setCategory] = useState<SocialMapCategory | "all">("all");
  const [minRating, setMinRating] = useState(4);
  const [contentType, setContentType] = useState<MapContentTypeFilter>("all");
  const [fromDate, setFromDate] = useState("2026-03-01");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(mapLinkedRecommendationsFixture[0]?.id ?? null);

  const filteredPins = useMemo(
    () =>
      mapLinkedRecommendationsFixture.filter((pin) => {
        const matchesDestination = !destination
          || pin.destinationCountry.toLowerCase().includes(destination.toLowerCase());
        const matchesCity = !city || pin.city.toLowerCase().includes(city.toLowerCase());
        const matchesCategory = category === "all" || pin.category === category;
        const matchesRating = pin.rating >= minRating;
        const matchesContentType = contentType === "all" || pin.contentType === contentType;
        const matchesDateFrom = pin.date >= fromDate;
        const matchesSpecificDate = !selectedDate || pin.date === selectedDate;
        const moderationEligible = pin.state === "published";

        return (
          matchesDestination
          && matchesCity
          && matchesCategory
          && matchesRating
          && matchesContentType
          && matchesDateFrom
          && matchesSpecificDate
          && moderationEligible
        );
      }),
    [category, city, contentType, destination, fromDate, minRating, selectedDate],
  );

  const selectedPin = filteredPins.find((pin) => pin.id === selectedPinId) ?? filteredPins[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="flex gap-2 p-4 text-sm text-amber-900">
          <ShieldCheck className="mt-0.5 h-4 w-4" />
          <p>
            Guardrails: map pins are institutional-context places only (campus, student housing, mobility offices,
            public services). User-defined arbitrary points and personal geolocation are blocked.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine Erasmus-relevant map content by destination context and moderation-safe metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Spain" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Barcelona" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select id="category" className={SELECT_CLASS} value={category} onChange={(e) => setCategory(e.target.value as SocialMapCategory | "all")}>
                <option value="all">All categories</option>
                <option value="accommodation">Accommodation</option>
                <option value="academics">Academics</option>
                <option value="bureaucracy">Bureaucracy</option>
                <option value="daily_living">Daily living</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rating">Minimum rating</Label>
              <select id="rating" className={SELECT_CLASS} value={String(minRating)} onChange={(e) => setMinRating(Number(e.target.value))}>
                <option value="3">3.0+</option>
                <option value="3.5">3.5+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contentType">Content type</Label>
              <select id="contentType" className={SELECT_CLASS} value={contentType} onChange={(e) => setContentType(e.target.value as MapContentTypeFilter)}>
                <option value="all">Recommendations + opinions</option>
                <option value="recommendation">Recommendations</option>
                <option value="opinion">Opinions</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fromDate">Published from date</Label>
              <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectedDate">Exact date (optional)</Label>
              <Input id="selectedDate" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>Map canvas (OpenStreetMap)</CardTitle>
            <CardDescription>
              Public Erasmus place contexts only. Click a marker to preview it. Markers represent approved content-place
              associations, not student live positions.
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              Map tiles are served by{" "}
              <a href="https://www.openstreetmap.org/copyright" className="underline" target="_blank" rel="noopener noreferrer">
                OpenStreetMap
              </a>{" "}
              — your browser will contact their tile servers. No personal data beyond standard HTTP request metadata (IP,
              user-agent) is shared.
            </p>
          </CardHeader>
          <CardContent className="h-[520px] p-0">
            <MapContainer center={[41.3874, 2.1686]} zoom={13} className="h-full w-full" scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredPins.map((pin) => (
                <Marker
                  key={pin.id}
                  icon={defaultIcon}
                  position={[pin.latHint, pin.lngHint]}
                  eventHandlers={{ click: () => setSelectedPinId(pin.id) }}
                >
                  <Popup>
                    <p className="font-medium">{pin.placeName}</p>
                    <p>{pin.city}, {pin.destinationCountry}</p>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {filteredPins.length === 0 && (
              <p className="-mt-16 px-4 text-sm text-muted-foreground">No markers match the current filters.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item preview</CardTitle>
            <CardDescription>Preview the selected marker and navigate to the related recommendation/opinion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {selectedPin ? (
              <>
                <div className="space-y-2 rounded-md border bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{selectedPin.contentType}</Badge>
                    <Badge variant="secondary">{selectedPin.category}</Badge>
                  </div>
                  <p className="font-medium text-slate-900">{selectedPin.placeName}</p>
                  <p className="text-muted-foreground">{selectedPin.city}, {selectedPin.destinationCountry}</p>
                  <p className="text-muted-foreground">{selectedPin.text}</p>
                  <p className="flex items-center gap-1 text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {selectedPin.rating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Published {selectedPin.date}</p>
                </div>

                <div className="grid gap-2">
                  <Button asChild>
                    <Link href={selectedPin.relatedContentHref}>Open related item ({selectedPin.relatedContentId})</Link>
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Flag className="h-4 w-4" />
                    Report content-place association
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No mapped items match the selected filters.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
