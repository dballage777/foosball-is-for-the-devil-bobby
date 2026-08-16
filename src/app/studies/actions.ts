"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible/books";

const createSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  book_slug: z.string().trim().optional().or(z.literal("")),
  chapter: z.coerce.number().int().positive().optional(),
  passage_ref: z.string().trim().max(120).optional().or(z.literal("")),
  study_date: z.string().trim().optional().or(z.literal("")),
  recurring_schedule: z.string().trim().max(120).optional().or(z.literal("")),
  privacy: z.enum(["private", "public"]).default("private"),
});

export async function createStudy(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account");

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    book_slug: formData.get("book_slug") ?? "",
    chapter: formData.get("chapter") || undefined,
    passage_ref: formData.get("passage_ref") ?? "",
    study_date: formData.get("study_date") ?? "",
    recurring_schedule: formData.get("recurring_schedule") ?? "",
    privacy: (formData.get("privacy") as string) ?? "private",
  });
  if (!parsed.success) {
    throw new Error("Please check the study details and try again.");
  }
  const v = parsed.data;
  if (v.book_slug && !getBook(v.book_slug)) {
    throw new Error("Unknown book selected.");
  }

  const { data, error } = await supabase
    .from("bible_studies")
    .insert({
      owner_id: user.id,
      name: v.name,
      description: v.description || null,
      book_slug: v.book_slug || null,
      chapter: v.chapter ?? null,
      passage_ref: v.passage_ref || null,
      study_date: v.study_date || null,
      recurring_schedule: v.recurring_schedule || null,
      privacy: v.privacy,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create the study. Please try again.");
  }
  revalidatePath("/studies");
  redirect(`/studies/${data.id}`);
}

export async function joinStudy(token: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/account`);

  const { data, error } = await supabase.rpc("join_study_with_token", {
    p_token: token,
  });
  if (error) {
    throw new Error(error.message || "Could not join this study.");
  }
  revalidatePath("/studies");
  redirect(`/studies/${data as string}`);
}

export async function leaveStudy(studyId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  await supabase
    .from("bible_study_members")
    .delete()
    .eq("study_id", studyId)
    .eq("user_id", user.id);
  revalidatePath("/studies");
  redirect("/studies");
}

const postSchema = z.object({
  study_id: z.string().uuid(),
  category: z.enum(["stood_out", "discussion"]),
  body: z.string().trim().min(1).max(8000),
});

export async function addDiscussionPost(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account");

  const parsed = postSchema.safeParse({
    study_id: formData.get("study_id"),
    category: formData.get("category"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error("Please enter a message.");

  const { error } = await supabase.from("study_discussion_posts").insert({
    study_id: parsed.data.study_id,
    user_id: user.id,
    category: parsed.data.category,
    body: parsed.data.body,
  });
  if (error) throw new Error("Could not post. Are you a member of this study?");
  revalidatePath(`/studies/${parsed.data.study_id}`);
}

const appSchema = z.object({
  study_id: z.string().uuid(),
  body: z.string().trim().min(1).max(8000),
});

export async function addApplication(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account");

  const parsed = appSchema.safeParse({
    study_id: formData.get("study_id"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error("Please enter your application.");

  const { error } = await supabase.from("study_applications").insert({
    study_id: parsed.data.study_id,
    user_id: user.id,
    body: parsed.data.body,
  });
  if (error) throw new Error("Could not save. Are you a member of this study?");
  revalidatePath(`/studies/${parsed.data.study_id}`);
}
