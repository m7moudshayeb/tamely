import { Button, Sheet } from "@ui";

/** Small "are you sure" panel for destructive changes. */
export function ConfirmDelete({ open, title, detail, onCancel, onConfirm, busy }: { open: boolean; title: string; detail: string; onCancel: () => void; onConfirm: () => void; busy: boolean }) {
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      size="sm"
      title={title}
      subtitle={detail}
      footer={
        <>
          <Button variant="gray" onClick={onCancel}>Keep it</Button>
          <Button variant="danger" icon="trash" onClick={onConfirm} loading={busy}>Delete</Button>
        </>
      }
    />
  );
}
