
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableItem(props: { id: string, index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3 relative transition-colors ${
        isDragging ? 'bg-white/20 border-white/30 shadow-xl scale-[1.02]' : 'hover:bg-white/10'
      }`}
    >
      <div 
        className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 p-1 -ml-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>
      <div className="w-6 text-center text-xs opacity-50 font-mono select-none">{props.index + 1}</div>
      <div title={props.id} className="truncate text-sm opacity-90 flex-1">{props.id}</div>
    </div>
  );
}
