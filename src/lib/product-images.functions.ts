import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  fileName: z.string().min(1).max(120),
  contentType: z.string().min(3).max(80),
  dataBase64: z.string().min(10),
});

export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Forbidden");

    if (!data.contentType.startsWith("image/")) throw new Error("Only images are allowed");

    const binary = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    if (binary.byteLength > 8 * 1024 * 1024) throw new Error("Image too large");

    const ext = (data.fileName.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from("product-images").upload(path, binary, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);

    return { url: `/api/public/product-image/${path}` };
  });
