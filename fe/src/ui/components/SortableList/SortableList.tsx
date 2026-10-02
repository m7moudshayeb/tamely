import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { Icon } from "../../icons";
import styles from "./SortableList.module.css";

export interface SortableItem {
  id: string;
  /** Used for the handle's accessible name: "Move Speed". */
  label: string;
  node: ReactNode;
}

function Row({ item }: { item: SortableItem }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} className={[styles.row, isDragging ? styles.dragging : ""].join(" ")} style={{ transform: CSS.Transform.toString(transform), transition }} data-sortable-id={item.id}>
      <button ref={setActivatorNodeRef} type="button" className={styles.handle} aria-label={`Move ${item.label}`} {...attributes} {...listeners}>
        <Icon name="grip" size={16} />
      </button>
      <div className={styles.body}>{item.node}</div>
    </div>
  );
}

/** Vertical list people can reorder by dragging the handle, by touch, or with Space + arrow keys. */
export function SortableList({ items, onReorder, label }: { items: SortableItem[]; onReorder: (ids: string[]) => void; label: string }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((i) => i.id);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={onDragEnd}
      accessibility={{ screenReaderInstructions: { draggable: `To move a link in ${label}, press Space, use the arrow keys, then press Space again.` } }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={styles.list}>{items.map((i) => <Row key={i.id} item={i} />)}</div>
      </SortableContext>
    </DndContext>
  );
}

/** A single row lined up with sortable rows, for lists with only one item. */
export function SortableSpacerRow({ children }: { children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.spacer} aria-hidden />
      <div className={styles.body}>{children}</div>
    </div>
  );
}
