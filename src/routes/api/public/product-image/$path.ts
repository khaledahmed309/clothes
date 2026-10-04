import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/product-image/$path")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params.path;
        if (!path || path.includes("/") || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("product-images").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
