"use client";

import { useEffect, useId, useMemo, useState, type Ref } from "react";
import { matchMoves, resolveMoveName, type MoveOption } from "@/lib/move-match";
import { inputClass } from "./ui";

/**
 * A text input with a suggestion list of moves. This replaces a native
 * <datalist>, which iOS Safari barely shows and other browsers filter
 * inconsistently, so suggestions behave the same on every device.
 */
export function MoveCombobox({
  id,
  name,
  options,
  value,
  onChange,
  inputRef,
  placeholder,
  required,
}: {
  id: string;
  name: string;
  options: MoveOption[];
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const matches = useMemo(() => matchMoves(options, value), [options, value]);
  const resolved = resolveMoveName(options, value);
  // with a partial name typed, the top suggestion is what Enter picks
  const highlighted =
    activeIndex >= 0 ? activeIndex : value.trim() && !resolved && matches.length > 0 ? 0 : -1;
  const showList = open && matches.length > 0;
  const optionId = (i: number) => `${listId}-${i}`;

  useEffect(() => {
    if (showList && highlighted >= 0) {
      document.getElementById(optionId(highlighted))?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showList, highlighted]);

  function choose(moveName: string) {
    onChange(moveName);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(Math.min(highlighted + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(Math.max(highlighted - 1, 0));
    } else if (e.key === "Escape" && showList) {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Enter" && showList && highlighted >= 0) {
      // pick the suggestion instead of submitting the form
      e.preventDefault();
      choose(matches[highlighted].name);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && highlighted >= 0 ? optionId(highlighted) : undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        className={inputClass()}
      />
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-line bg-panel py-1 shadow-lg"
        >
          {matches.map((m, i) => (
            <li
              key={m.name}
              id={optionId(i)}
              role="option"
              aria-selected={i === highlighted}
              // keep focus in the input so the tap doesn't blur and close the list first
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(m.name)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer px-3 py-2 text-[15px] ${i === highlighted ? "bg-denim/10" : ""}`}
            >
              {m.name}
              {m.alias ? (
                <span className="ml-1.5 font-display text-xs text-muted">also called {m.alias}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
