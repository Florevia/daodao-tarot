"use client";

import { useI18n } from "@/lib/i18n";
import { contextGroups, type ReadingContext } from "@/lib/reading-context";
import { cn } from "cn";

export function ContextForm({
  spreadId,
  context,
  onChange,
}: {
  spreadId: string;
  context: ReadingContext;
  onChange: (next: ReadingContext) => void;
}) {
  const { locale, t } = useI18n();
  const groups = contextGroups(spreadId);
  const optional = groups.every((group) => !group.required);

  return (
    <div className="mt-8" data-testid="context-form">
      <h2 className="text-lg text-primary">{t.contextTitle}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{optional ? t.contextOptional : t.contextHint}</p>
      {groups.map((group) => (
        <fieldset key={group.key} className="mt-4">
          <legend className="text-sm text-primary">{group.label[locale]}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected = context[group.key] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn("context-chip", selected && "is-selected")}
                  aria-pressed={selected}
                  data-testid={`context-${group.key}-${option.id}`}
                  onClick={() => {
                    if (!group.required && selected) {
                      const next = { ...context };
                      delete next[group.key];
                      onChange(next);
                      return;
                    }
                    onChange({ ...context, [group.key]: option.id });
                  }}
                >
                  {option[locale]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
