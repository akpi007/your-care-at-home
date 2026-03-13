import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export interface Filters {
  priceRange: [number, number];
  minRating: number;
  availableOnly: boolean;
}

const defaultFilters: Filters = {
  priceRange: [0, 500],
  minRating: 0,
  availableOnly: false,
};

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const ProfessionalsFilter = ({ filters, onChange }: Props) => {
  const [local, setLocal] = useState<Filters>(filters);
  const [open, setOpen] = useState(false);

  const apply = () => {
    onChange(local);
    setOpen(false);
  };

  const reset = () => {
    setLocal(defaultFilters);
    onChange(defaultFilters);
    setOpen(false);
  };

  const hasActive =
    filters.minRating > 0 || filters.availableOnly || filters.priceRange[0] > 0 || filters.priceRange[1] < 500;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActive && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Filter Professionals</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Price */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Price Range: ${local.priceRange[0]} – ${local.priceRange[1]}
            </Label>
            <Slider
              min={0}
              max={500}
              step={10}
              value={local.priceRange}
              onValueChange={(v) => setLocal({ ...local, priceRange: v as [number, number] })}
              className="mt-3"
            />
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Minimum Rating: {local.minRating > 0 ? `${local.minRating}+` : "Any"}
            </Label>
            <div className="flex gap-2 mt-2">
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={local.minRating === r ? "default" : "outline"}
                  onClick={() => setLocal({ ...local, minRating: r })}
                  className="text-xs"
                >
                  {r === 0 ? "Any" : `${r}★`}
                </Button>
              ))}
            </div>
          </div>

          {/* Available Only */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Available only</Label>
            <Switch
              checked={local.availableOnly}
              onCheckedChange={(v) => setLocal({ ...local, availableOnly: v })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={apply} variant="hero" className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={reset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { defaultFilters };
export default ProfessionalsFilter;
