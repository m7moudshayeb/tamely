import { Hono } from "hono";
import type { ActionResult } from "@tamely/shared/types";
import { readBody, str } from "../../shared/lib/body";
import type { AppEnv } from "../../shared/types/env";
import { ensureOwnSite } from "../sites/service";
import { checkAction } from "./check";
import { openProposal } from "./proposal";
import { runAction } from "./run";

export const actionsRoutes = new Hono<AppEnv>()
  /** Direct action from a screen; pressing the button is the confirmation. */
  .post("/", async (c) => {
    const action = checkAction(await readBody(c));
    const { accountId } = c.get("session");
    const site = await ensureOwnSite(c.get("cf"), accountId, action.zoneId);
    return c.json<ActionResult>({ message: await runAction(c.get("cf"), accountId, site, action) });
  })
  /** Confirmed proposal from the assistant or the briefing. */
  .post("/confirm", async (c) => {
    const token = str((await readBody<{ token: string }>(c)).token, 8000);
    const { accountId } = c.get("session");
    const action = await openProposal(token, accountId, c.get("secret"));
    const site = await ensureOwnSite(c.get("cf"), accountId, action.zoneId);
    return c.json<ActionResult>({ message: await runAction(c.get("cf"), accountId, site, action) });
  });
