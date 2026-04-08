import Link from "next/link";
import { Flag, MapPin, ShieldCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MapContentType = "recommendation" | "opinion";
type MapCategory = "accommodation" | "academics" | "bureaucracy" | "daily_living" | "transport";

type MapPinItem = {
  id: string;
  placeName: string;
  destination: string;
  city: string;
  category: MapCategory;
  rating: number;
  contentType: MapContentType;
  date: string;
  excerpt: string;
  x: number;
  y: number;
  detailHref: string;
};

const mapPins: MapPinItem[] = [
  {
    id: "MAP-REC-001",
    placeName: "Universitat de Barcelona — Main Library",
    destination: "Spain",
    city: "Barcelona",
    category: "academics",
    rating: 4.6,
    contentType: "recommendation",
    date: "2026-04-04",
    excerpt: "Quiet study blocks and reliable Erasmus desk support during registration week.",
    x: 24,
    y: 36,
    detailHref: "/recommendations?detail=MAP-REC-001",
  },
  {
    id: "MAP-OPI-002",
    placeName: "Sant Jordi Residence",
    destination: "Spain",
    city: "Barcelona",
    category: "accommodation",
    rating: 4.2,
    contentType: "opinion",
    date: "2026-04-02",
    excerpt: "Affordable for Erasmus students, but complete check-in paperwork early to avoid delays.",
    x: 56,
    y: 42,
    detailHref: "/recommendations?detail=MAP-OPI-002",
  },
  {
    id: "MAP-REC-003",
    placeName: "Sants Mobility Office",
    destination: "Spain",
    city: "Barcelona",
    category: "bureaucracy",
    rating: 4.4,
    contentType: "recommendation",
    date: "2026-03-30",
    excerpt: "Helpful queue guidance for residence and registration documentation workflows.",
    x: 72,
    y: 58,
    detailHref: "/recommendations?detail=MAP-REC-003",
  },
  {
    id: "MAP-OPI-004",
    placeName: "Diagonal Student Hub",
    destination: "Spain",
    city: "Barcelona",
    category: "daily_living",
    rating: 4.1,
    contentType: "opinion",
    date: "2026-03-27",
    excerpt: "Good orientation meetups and practical tips from current Erasmus participants.",
    x: 40,
    y: 68,
    detailHref: "/recommendations?detail=MAP-OPI-004",
  },
];

const activeFilters = {
  destination: "Spain",
  city: "Barcelona",
  category: "all",
  minRating: 4,
  contentType: "all",
  fromDate: "2026-03-01",
};

const filteredPins = mapPins.filter((pin) => {
  const matchesDestination = pin.destination === activeFilters.destination;
  const matchesCity = pin.city === activeFilters.city;
  const matchesCategory = activeFilters.category === "all" || pin.category === activeFilters.category;
  const matchesRating = pin.rating >= activeFilters.minRating;
  const matchesContentType = activeFilters.contentType === "all" || pin.contentType === activeFilters.contentType;
  const matchesDate = pin.date >= activeFilters.fromDate;

  return matchesDestination && matchesCity && matchesCategory && matchesRating && matchesContentType && matchesDate;
});

const selectedPin = filteredPins[0];

export default function MapExplorerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Map Explorer</h1>
        <p className="text-muted-foreground">
          Explore only public Erasmus-relevant places and linked community content. No route planning, no live tracking, and no personal precise-location exposure.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="flex gap-2 p-4 text-sm text-amber-900">
          <ShieldCheck className="mt-0.5 h-4 w-4" />
          <p>
            Guardrails: map pins are institutional-context places only (campus, student housing, mobility offices, public services). User-defined arbitrary points and personal geolocation are blocked.
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
              <Input id="destination" value={activeFilters.destination} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={activeFilters.city} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select id="category" className="h-10 w-full rounded-md border bg-white px-3" defaultValue={activeFilters.category}>
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
              <select id="rating" className="h-10 w-full rounded-md border bg-white px-3" defaultValue={String(activeFilters.minRating)}>
                <option value="3">3.0+</option>
                <option value="3.5">3.5+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contentType">Content type</Label>
              <select id="contentType" className="h-10 w-full rounded-md border bg-white px-3" defaultValue={activeFilters.contentType}>
                <option value="all">Recommendations + opinions</option>
                <option value="recommendation">Recommendations</option>
                <option value="opinion">Opinions</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fromDate">Published from date</Label>
              <Input id="fromDate" type="date" defaultValue={activeFilters.fromDate} />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>Map canvas (mocked pins)</CardTitle>
            <CardDescription>
              Public Erasmus place contexts only. Pins represent approved content-place associations, not student live positions.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative h-[520px] bg-slate-100 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] p-0">
            {filteredPins.map((pin) => (
              <button
                key={pin.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white p-1.5 shadow"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                aria-label={`Pin: ${pin.placeName}`}
                type="button"
              >
                <MapPin className="h-4 w-4 text-slate-900" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item preview</CardTitle>
            <CardDescription>Preview selected map content and navigate to recommendation/opinion detail.</CardDescription>
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
                  <p className="text-muted-foreground">
                    {selectedPin.city}, {selectedPin.destination}
                  </p>
                  <p className="text-muted-foreground">{selectedPin.excerpt}</p>
                  <p className="flex items-center gap-1 text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {selectedPin.rating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Published {selectedPin.date}</p>
                </div>

                <div className="grid gap-2">
                  <Button asChild>
                    <Link href={selectedPin.detailHref}>Open recommendation/opinion detail</Link>
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
