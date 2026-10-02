import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { ChatEvent, ChatRequest } from "@tamely/shared/types";
import { MSG } from "../../shared/constants/copy";
import { ZONE_ID } from "../../shared/constants/security";
import { aiModels } from "../../shared/lib/ai-models";
import { readBody } from "../../shared/lib/body";
import { AppError } from "../../shared/lib/errors";
import type { AppEnv } from "../../shared/types/env";
import { listSites } from "../sites/service";
import { runChat } from "./agent";

export const assistantRoutes = new Hono<AppEnv>().post("/chat", async (c) => {
  const body = await readBody<ChatRequest>(c);
  const { accountId } = c.get("session");
  const cf = c.get("cf");
  const sites = await listSites(cf, accountId);
  const zoneId = typeof body.zoneId === "string" && ZONE_ID.test(body.zoneId) ? body.zoneId : null;
  const site = sites.find((s) => s.id === zoneId) || null;
  const models = aiModels(c.env);

  return streamSSE(c, async (stream) => {
    const pending: Promise<void>[] = [];
    const emit = (e: ChatEvent) => void pending.push(stream.writeSSE({ event: e.type, data: JSON.stringify(e) }));
    try {
      await runChat({ cf, accountId, secret: c.get("secret"), sites, site, models, turns: Array.isArray(body.turns) ? body.turns : [] }, emit);
    } catch (e) {
      if (!(e instanceof AppError)) console.error("assistant", e);
      emit({ type: "error", message: e instanceof AppError ? e.message : MSG.aiDown, fix: e instanceof AppError ? e.fix : undefined });
    }
    emit({ type: "done" });
    await Promise.all(pending);
  });
});
