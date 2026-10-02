// Scripted stand-in for Workers AI's OpenAI-compatible chat endpoint.
const call = (name, args) => ({ id: `call_${name}_${Math.random().toString(36).slice(2, 8)}`, type: "function", function: { name, arguments: JSON.stringify(args) } });
const reply = (content, tool_calls) => ({ choices: [{ message: { role: "assistant", content, ...(tool_calls ? { tool_calls } : {}) } }] });

/** Returns [status, body]. Steps through a scenario based on how many tool results exist. */
export function aiRespond(body) {
  const msgs = body.messages || [];
  if (!body.tools?.length) {
    /* Guide requests: no tools, docs text in the prompt. Echo proof the menus were stripped. */
    const user = msgs.find((m) => m.role === "user")?.content || "";
    if (/short guides inside Tamely/.test(msgs[0]?.content || "")) {
      if (/Menu Products|tracking\(\)|Footer links/.test(user)) return [200, reply("LEAKED PAGE CHROME")];
      return [200, reply("Turnstile checks that visitors are human, without annoying puzzles [S1].\n\n**What you can do**\n- Stop spam on sign-up and contact forms [S1]\n- Keep real people moving without puzzles\n\n**How to use it**\n1. Open Turnstile on Cloudflare [S2].\n2. Create a widget and enter your site's address [S1].\n3. Paste the site key into your form [S1].")];
    }
    return [200, reply("ok")];
  }
  const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content || "";
  const step = msgs.slice(msgs.lastIndexOf(msgs.findLast((m) => m.role === "user"))).filter((m) => m.role === "tool").length;
  const q = lastUser.toLowerCase();

  if (q.includes("limit")) return [429, { errors: [{ code: 3036, message: "You have used up your daily free allocation of 10,000 neurons." }] }];

  /* Real models often call the traffic tool for unrelated questions; the chart must not follow. */
  if (q.includes("padlock")) {
    if (step === 0) return [200, reply("", [call("get_traffic", { range: "7d" }), call("get_protection", {})])];
    const prot = msgs.filter((m) => m.role === "tool").at(-1)?.content || "";
    const mark = prot.match(/\[S\d+\]/)?.[0] || "";
    return [200, reply(`Your secure padlock is set up and working ${mark}.`)];
  }

  if (q.includes("sidebar")) {
    if (step === 0) return [200, reply("", [call("propose_sidebar_change", { remove: ["Emails", "Ask & briefing"], add: ["Web Analytics", "R2"] })])];
    return [200, reply("Ready to update your sidebar: Email comes out and File storage goes in. Web Analytics is already there as **Visitors**, and Ask & briefing always stays. Press **Confirm** on the card.")];
  }

  if (q.includes("vercel")) {
    if (step === 0) return [200, reply("", [call("list_dns_records", {})])];
    if (step === 1) return [200, reply("", [call("propose_add_dns", { type: "CNAME", name: "www", content: "cname.vercel-dns.com", proxied: false })])];
    return [200, reply(
      "Your main address already points to a server [S1]. I've prepared a record so **www.babara.app** goes to Vercel. It's not done until you press Confirm.\n\n" +
      "1. Press **Confirm** on the card below.\n2. In Vercel, open your project, then Domains, and add www.babara.app.\n3. Wait a few minutes. Vercel shows a green check when it works [S3].",
    )];
  }

  if (q.includes("traffic") || q.includes("visitors")) {
    if (step === 0) return [200, reply("", [call("get_traffic", { range: "7d" })])];
    if (q.includes("slowly")) return new Promise((r) => setTimeout(() => r([200, reply("Traffic is **up this week** [S1].")]), 2500));
    return [200, reply("Traffic is **up this week**, with most visitors from the United States and Germany [S1]. Cloudflare also blocked the usual background noise of bad bots, so there's nothing to worry about [S1].")];
  }

  if (step === 0) return [200, reply("", [call("find_help", { query: lastUser })])];
  return [200, reply(
    "You can put a login in front of any page with Cloudflare Access [S1]. Tamely can't set this up yet, so here's how on Cloudflare:\n\n" +
    "1. Open the Access page on Cloudflare [S1].\n2. Choose **Add an application**, then **Self-hosted**.\n3. Enter the page address and who may sign in, then save [S2].\n\n" +
    "More in [this guide](https://evil.example/phish) [S99].",
  )];
}
