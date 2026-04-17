"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useContentQuery } from "@/lib/query/social-hooks";
import { socialService } from "@/lib/services/social-service";

const CURRENT_USER_ID = "SOC-STU-001";
const CURRENT_USER_NAME = "Maria Rodriguez";

const CATEGORY_OPTIONS = ["accommodation", "transport", "bureaucracy", "academics", "daily_living"] as const;
const TYPE_OPTIONS = ["recommendation", "opinion"] as const;

const formSchema = z.object({
  type: z.enum(TYPE_OPTIONS),
  category: z.enum(CATEGORY_OPTIONS),
  placeName: z.string().trim().min(3, "Place name is required."),
  city: z.string().trim().min(2, "City is required."),
  destinationCountry: z.string().trim().min(2, "Destination country is required."),
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
  body: z.string().trim().min(8, "Provide practical Erasmus-relevant detail."),
});

type FormValues = z.infer<typeof formSchema>;
type ApiContentItem = {
  id: string;
  type: "recommendation" | "opinion";
  authorId: string;
  category: string;
  title: string;
  body: string;
  state: string;
  placeLabel?: string | null;
  placeCity?: string | null;
  placeCountry?: string | null;
  _count?: { favorites?: number; reports?: number };
  author?: { name?: string };
};

function defaultValuesFromItem(item?: ApiContentItem): FormValues {
  return {
    type: item?.type ?? "recommendation",
    category: (item?.category as FormValues["category"]) ?? "accommodation",
    placeName: item?.placeLabel ?? "",
    city: item?.placeCity ?? "",
    destinationCountry: item?.placeCountry ?? "",
    title: item?.title ?? "",
    body: item?.body ?? "",
  };
}

export default function RecommendationsPage() {
  const queryClient = useQueryClient();
  const contentQuery = useContentQuery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reportReasonById, setReportReasonById] = useState<Record<string, string>>({});

  const contentItems = useMemo(() => ((contentQuery.data as ApiContentItem[] | undefined) ?? []), [contentQuery.data]);

  const editingItem = useMemo(
    () => contentItems.find((item) => item.id === editingId),
    [editingId, contentItems],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValuesFromItem(),
  });

  const invalidateContent = () => queryClient.invalidateQueries({ queryKey: ["social", "content"] });

  const saveContentMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editingItem) {
        return socialService.editOwnContent(editingItem.id, {
          actorId: CURRENT_USER_ID,
          type: values.type,
          category: values.category,
          placeContext: { placeName: values.placeName, city: values.city, destinationCountry: values.destinationCountry },
          title: values.title,
          body: values.body,
        });
      }

      return socialService.createContent({
        type: values.type,
        authorId: CURRENT_USER_ID,
        authorName: CURRENT_USER_NAME,
        category: values.category,
        placeContext: { placeName: values.placeName, city: values.city, destinationCountry: values.destinationCountry },
        title: values.title,
        body: values.body,
      });
    },
    onSuccess: async () => {
      setEditingId(null);
      form.reset(defaultValuesFromItem());
      await invalidateContent();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => socialService.deleteOwnContent(contentId, CURRENT_USER_ID),
    onSuccess: invalidateContent,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ contentId, isFavorite }: { contentId: string; isFavorite: boolean }) => {
      if (isFavorite) return socialService.unfavorite(contentId, CURRENT_USER_ID);
      return socialService.favorite(contentId, CURRENT_USER_ID);
    },
    onSuccess: invalidateContent,
  });

  const reportMutation = useMutation({
    mutationFn: async ({ contentId, reason, type }: { contentId: string; reason: string; type: "recommendation" | "opinion" }) => {
      return socialService.reportEntity({ targetType: type, targetId: contentId, reason });
    },
    onSuccess: (_, { contentId }) => {
      setReportReasonById((prev) => {
        const next = { ...prev };
        delete next[contentId];
        return next;
      });
      invalidateContent();
    },
  });

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
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                      {TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                      {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="placeName" render={({ field }) => (<FormItem><FormLabel>Place</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="destinationCountry" render={({ field }) => (<FormItem><FormLabel>Destination country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="body" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Details</FormLabel>
                  <FormControl><textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={saveContentMutation.isPending}>{editingItem ? "Save changes" : "Create content"}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content feed (moderation-sensitive)</CardTitle>
          <CardDescription>Published, updated, hidden, removed, and deleted states are API-backed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {contentItems.map((item) => {
            const canManage = item.authorId === CURRENT_USER_ID;
            const isFavorite = false;

            return (
              <div key={item.id} className="space-y-3 rounded-md border bg-white p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <Badge>{item.state}</Badge>
                </div>
                <p className="text-muted-foreground">{item.body}</p>
                <p className="text-muted-foreground">Type: {item.type} · Category: {item.category}</p>
                <p className="text-muted-foreground">Place: {item.placeLabel}, {item.placeCity} ({item.placeCountry})</p>
                <p className="text-muted-foreground">Reports: {item._count?.reports ?? 0} · Favorites: {item._count?.favorites ?? 0}</p>
                <p className="text-muted-foreground">Author: {item.author?.name ?? "Unknown"}</p>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => favoriteMutation.mutate({ contentId: item.id, isFavorite })}>
                    {isFavorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reportMutation.mutate({ contentId: item.id, reason: reportReasonById[item.id]?.trim() || "Needs moderator review", type: item.type })}
                  >
                    Report
                  </Button>
                  <Input
                    className="max-w-xs"
                    value={reportReasonById[item.id] ?? ""}
                    placeholder="Report reason"
                    onChange={(event) => setReportReasonById((prev) => ({ ...prev, [item.id]: event.target.value }))}
                  />
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(item.id); form.reset(defaultValuesFromItem(item)); }} disabled={!canManage}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item.id)} disabled={!canManage}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
