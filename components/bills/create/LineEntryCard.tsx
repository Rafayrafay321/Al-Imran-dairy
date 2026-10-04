import { Trash2 } from "lucide-react";
import { type MilkTypeRecord } from "@/actions/masterDataActions";
import { type LineDraft } from "@/hooks/useNewWeeklyBill";
import { formatRupees } from "@/lib/data/money";

interface LineEntryCardProps {
  line: LineDraft;
  index: number;
  weekStart: string;
  weekEnd: string;
  milkTypes: MilkTypeRecord[];
  isOwner: boolean;
  onUpdate: (index: number, partial: Partial<Pick<LineDraft, "entryDate" | "milkTypeId" | "liters" | "rate">>) => void;
  onRemove: (index: number) => void;
}

export function LineEntryCard({ line, index, weekStart, weekEnd, milkTypes, isOwner, onUpdate, onRemove }: LineEntryCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-700">Entry {index + 1}</span>
        <button type="button" onClick={() => onRemove(index)} aria-label={`Delete entry ${index + 1}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <label className="block text-xs font-semibold text-stone-600">
        Date
        <input type="date" min={weekStart} max={weekEnd} value={line.entryDate} onChange={(event) => onUpdate(index, { entryDate: event.target.value })} className="mt-1 h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm" />
      </label>

      <fieldset>
        <legend className="mb-1 text-xs font-semibold text-stone-600">Milk Type</legend>
        <div className="grid grid-cols-2 gap-2">
          {milkTypes.map((milk) => (
            <button key={milk.id} type="button" onClick={() => onUpdate(index, { milkTypeId: milk.id })} className={`min-h-12 rounded-xl border px-3 text-sm font-bold ${line.milkTypeId === milk.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-stone-200 bg-white text-stone-700"}`}>
              {milk.name}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block text-xs font-semibold text-stone-600">
        Liters
        <input type="number" inputMode="decimal" min="0" step="0.01" value={line.liters || ""} onChange={(event) => onUpdate(index, { liters: Number(event.target.value) })} placeholder="0" className="mt-1 h-16 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-center text-[40px] font-bold leading-none text-stone-900" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-stone-600">
          Rate per liter
          <input type="number" inputMode="decimal" min="0.01" step="0.01" readOnly={!isOwner} value={line.rate || ""} onChange={(event) => onUpdate(index, { rate: Number(event.target.value) })} className="mt-1 h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-bold read-only:text-stone-500" />
          {line.isSpecialRate && <span className="mt-1 block text-[11px] font-semibold text-emerald-700">Special rate</span>}
        </label>
        <div className="rounded-xl bg-blue-50 p-3 text-right">
          <p className="text-xs text-stone-600">Amount</p>
          <p className="mt-1 text-base font-extrabold text-blue-700">Rs {formatRupees(line.amount)}</p>
        </div>
      </div>
    </div>
  );
}
