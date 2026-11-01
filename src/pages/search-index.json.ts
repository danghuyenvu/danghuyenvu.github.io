
import { getCollection } from "astro:content";

export async function GET() {
  const entries = await getCollection("writeups");

  const searchIndex = entries.map((entry) => {
    const data = entry.data;

    const categories = data.category
      ? Array.isArray(data.category)
        ? data.category
        : [data.category]
      : [];

    const tags = data.tags
      ? Array.isArray(data.tags)
        ? data.tags
        : [data.tags]
      : [];

    const searchText = [
      data.title,
      data.summary,
      data.difficulty,
      data.platform,
      data.os,
      data.creator,
      data.machine,
      data.tldr,
      ...categories,
      ...tags,
      entry.body,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return {
      slug: entry.id,
      searchText,
    };
  });

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
