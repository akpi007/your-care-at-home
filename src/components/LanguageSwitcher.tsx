import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Globe, Check } from "lucide-react";
import { useState } from "react";

const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const active = LANGUAGES.find((l) => l.code === language);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground" aria-label={t("nav.language")}>
          <Globe className="h-4 w-4" />
          {!compact && <span className="ml-1">{active?.code.toUpperCase()}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => {
              setLanguage(l.code);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <span>
              {l.native}
              {l.native !== l.label && <span className="ml-1 text-muted-foreground">({l.label})</span>}
            </span>
            {language === l.code && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
