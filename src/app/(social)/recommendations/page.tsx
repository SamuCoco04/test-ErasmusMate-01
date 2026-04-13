"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { socialService } from "@/lib/services/social-service";
import { useSocialContentStoreState, type ContentItem, type ErasmusRelevantCategory, type SocialContentType } from "@/lib/state/social-content-store";

const CURRENT_USER_ID = "SOC-STU-001";
const CURRENT_USER_NAME = "Maria Rodriguez";

const CATEGORY_OPTIONS: ErasmusRelevantCategory[] = ["accommodation", "transport", "bureaucracy", "academics", "daily_living"];
const TYPE_OPTIONS: SocialContentType[] = ["recommendation", "opinion"];

const formSchema = z.object({
  type: z.enum(["recommendation", "opinion"]),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living"]),
  placeName: z.string().trim().min(3, "Place name is required."),
  city: z.string().trim().min(2, "City is required."),
  destinationCountry: z.string().trim().min(2, "Destination country is required."),
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
  body: z.string().trim().min(8, "Provide practical Erasmus-relevant detail."),
});

type FormValues = z.infer<typeof formSchema>;

const stateBadgeStyles: Record<ContentItem["state"], string> = {
  published: "bg-emerald-100 text-emerald-800",
  hidden: "bg-amber-100 text-amber-900",
  removed: "bg-red-100 text-red-800",
  auto_obscured_pending_review: "bg-orange-100 text-orange-900",
  draft: "bg-slate-100 text-slate-700",
};

function defaultValuesFromItem(item?: ContentItem): FormValues {
  return {
    type: item?.type ?? "recommendation",
    category: item?.category ?? "accommodation",
    placeName: item?.placeContext.placeName ?? "",
    city: item?.placeContext.city ?? "",
    destinationCountry: item?.placeContext.destinationCountry ?? "",
    title: item?.title ?? "",
    body: item?.body ?? "",
  };
}

export default function RecommendationsPage() {
  const socialState = useSocialContentStoreState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reportReasonById, setReportReasonById] = useState<Record<string, string>>({});

  const editingItem = useMemo(
    () => socialState.contentItems.find((item) => item.id === editingId),
    [editingId, socialState.contentItems],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValuesFromItem(),
  });

  const saveContentMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editingItem) {
        socialService.editOwnContent(editingItem.id, {
          actorId: CURRENT_USER_ID,
          type: values.type,
          category: values.category,
          placeContext: {
            placeName: values.placeName,
            city: values.city,
            destinationCountry: values.destinationCountry,
          },
          title: values.title,
          body: values.body,
        });
        return;
      }

      socialService.createContent({
        type: values.type,
        authorId: CURRENT_USER_ID,
        authorName: CURRENT_USER_NAME,
        category: values.category,
        placeContext: {
          placeName: values.placeName,
          city: values.city,
          destinationCountry: values.destinationCountry,
        },
        title: values.title,
        body: values.body,
      });
    },
    onSuccess: () => {
      setEditingId(null);
      form.reset(defaultValuesFromItem());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      socialService.deleteOwnContent(contentId, CURRENT_USER_ID);
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ contentId, isFavorite }: { contentId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        socialService.unfavorite(contentId, CURRENT_USER_ID);
      } else {
        socialService.favorite(contentId, CURRENT_USER_ID);
      }
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ contentId, reason }: { contentId: string; reason: string }) => {
      socialService.reportContent(contentId, reason, CURRENT_USER_ID);
    },
    onSuccess: (_, { contentId }) => {
      setReportReasonById((prev) => {
        const next = { ...prev };
        delete next[contentId];
        return next;
      });
    },
  });

  const handleStartEdit = (item: ContentItem) => {
    setEditingId(item.id);
    form.reset(defaultValuesFromItem(item));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset(defaultValuesFromItem());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Recommendations & Tips</h1>
        <p className="text-muted-foreground">Create and moderate Erasmus-relevant recommendations/opinions without mixing with official institutional procedure navigation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? "Edit your content" : "Create social-support content"}</CardTitle>
          <CardDescription>Only Erasmus-relevant categories and approved place context fields are accepted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => saveContentMutation.mutate(values))}>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                        {TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="placeName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Place</FormLabel>
                  <FormControl><Input placeholder="e.g. UB Main Library" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="e.g. Barcelona" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="destinationCountry" render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination country</FormLabel>
                  <FormControl><Input placeholder="e.g. Spain" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Practical recommendation title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <textarea
                        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Share a practical Erasmus-relevant tip or opinion"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={saveContentMutation.isPending}>{editingItem ? "Save changes" : "Create content"}</Button>
                {editingItem && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel edit</Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content feed (moderation-sensitive)</CardTitle>
          <CardDescription>States are shown explicitly: published, hidden, removed, and auto-obscured pending review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialState.contentItems.map((item) => {
            const canManage = item.authorId === CURRENT_USER_ID && !item.moderationLocked && !item.retentionLocked;
            const isFavorite = (socialState.favoriteByUser[CURRENT_USER_ID] ?? []).includes(item.id);
            const actionsDisabledByState = item.state === "removed" || item.state === "auto_obscured_pending_review" || item.state === "hidden";

            return (
              <div key={item.id} className="space-y-3 rounded-md border bg-white p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <Badge className={stateBadgeStyles[item.state]}>{item.state}</Badge>
                </div>
                <p className="text-muted-foreground">{item.body}</p>
                <p className="text-muted-foreground">Type: {item.type} · Category: {item.category}</p>
                <p className="text-muted-foreground">Place: {item.placeContext.placeName}, {item.placeContext.city} ({item.placeContext.destinationCountry})</p>
                <p className="text-muted-foreground">Reports: {item.reports} · Favorites: {item.favoritesCount}</p>
                <p className="text-muted-foreground">Author: {item.authorName}</p>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => favoriteMutation.mutate({ contentId: item.id, isFavorite })} disabled={actionsDisabledByState}>
                    {isFavorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reportMutation.mutate({ contentId: item.id, reason: reportReasonById[item.id]?.trim() || "Needs moderator review" })}
                    disabled={actionsDisabledByState}
                  >
                    Report
                  </Button>
                  <Input
                    aria-label={`Report reason for "${item.title}"`}
                    className="max-w-xs"
                    value={reportReasonById[item.id] ?? ""}
                    placeholder="Report reason"
                    onChange={(event) => setReportReasonById((prev) => ({ ...prev, [item.id]: event.target.value }))}
                    disabled={actionsDisabledByState}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleStartEdit(item)} disabled={!canManage}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={!canManage}
                  >
                    Delete
                  </Button>
                </div>

                {!canManage && item.authorId === CURRENT_USER_ID && (
                  <p className="text-xs text-amber-700">Ownership guard active: this content is locked by moderation/retention state and cannot be edited or deleted.</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
