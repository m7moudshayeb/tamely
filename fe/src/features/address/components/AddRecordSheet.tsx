import { useState, type FormEvent } from "react";
import type { DnsType, NewDnsRecord, Site } from "@tamely/shared/types";
import { useAction } from "@shared/hooks/useAction";
import { Button, FormError, Group, ListRow, Select, Sheet, Switch, TextField } from "@ui";
import styles from "./AddRecordSheet.module.css";
import { PRESETS, RECORD_TYPES } from "../recordTypes";

/** Pick what the record should do; only that type's fields appear. */
export function AddRecordSheet({ site, open, onClose }: { site: Site; open: boolean; onClose: () => void }) {
  const act = useAction();
  const [type, setType] = useState<DnsType>("CNAME");
  const [values, setValues] = useState({ name: "", content: "", priority: "10" });
  const [proxied, setProxied] = useState(true);
  const def = RECORD_TYPES[type];

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setType(p.type);
    setValues({ name: p.name, content: p.content, priority: "10" });
    setProxied(p.proxied);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const record: NewDnsRecord = { type, name: values.name.trim() || "@", content: values.content.trim() };
    if (def.proxiable) record.proxied = proxied;
    if (type === "MX") record.priority = Number(values.priority || 10);
    act.mutate({ kind: "add_dns", zoneId: site.id, record }, { onSuccess: () => { onClose(); setValues({ name: "", content: "", priority: "10" }); } });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add a record"
      subtitle={`Tell ${site.name} where something lives.`}
      footer={
        <>
          <Button variant="gray" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-record" loading={act.isPending} disabled={!values.content.trim()}>Add record</Button>
        </>
      }
    >
      <form id="add-record" onSubmit={submit} className={styles.form}>
        <Select label="Start from a template (optional)" value={null} placeholder="Vercel, Shopify, Google email…" onChange={applyPreset} options={PRESETS.map((p) => ({ value: p.id, label: p.label, icon: RECORD_TYPES[p.type].icon }))} />
        <Select
          label="What should it do?"
          value={type}
          onChange={(t) => setType(t)}
          options={(Object.keys(RECORD_TYPES) as DnsType[]).map((t) => ({ value: t, label: RECORD_TYPES[t].label, description: RECORD_TYPES[t].description, icon: RECORD_TYPES[t].icon }))}
        />
        {def.fields.map((f) => (
          <TextField
            key={`${type}-${f.key}`}
            label={f.label}
            placeholder={f.placeholder}
            hint={f.hint}
            value={values[f.key]}
            inputMode={f.key === "priority" ? "numeric" : undefined}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            suffix={f.key === "name" && values.name && values.name !== "@" ? <span>.{site.name}</span> : undefined}
          />
        ))}
        {def.proxiable && (
          <Group footer="Hides your server and blocks attacks. Turn off if your provider asks for 'DNS only' (Vercel and Shopify usually do).">
            <ListRow title="Protect with Cloudflare" trailing={<Switch label="Protect with Cloudflare" checked={proxied} onChange={setProxied} />} />
          </Group>
        )}
        <FormError message={act.isError ? (act.error as Error).message : null} />
      </form>
    </Sheet>
  );
}
