// src/components/Select.tsx
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Select.css";

export type SelectOption<T> = {
  label: string;
  value: T;
  subLabel?: string;
  disabled?: boolean;
  group?: string;
};

type Props<T> = {
  label?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  variant?: "default" | "compact" | "soft" | "danger" | "light";
  isEqual?: (a: T, b: T) => boolean;
};

function defaultIsEqual<T>(a: T, b: T) {
  return Object.is(a, b);
}

export default function Select<T>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled,
  searchable,
  className,
  variant = "default",
  isEqual = defaultIsEqual,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(() => {
    if (value == null) return null;
    return options.find((o) => isEqual(o.value, value)) ?? null;
  }, [value, options, isEqual]);

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  // --- positioning (fixed, via portal) ---
  const [pos, setPos] = useState<{ left: number; top: number; width: number; openUp: boolean }>({
    left: 0,
    top: 0,
    width: 240,
    openUp: false,
  });

  const computePos = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const approxListH = 280; // dropdown + search
    const spaceBelow = window.innerHeight - r.bottom;
    const helpsOpenUp = spaceBelow < approxListH && r.top > approxListH;

    setPos({
      left: Math.round(r.left),
      top: Math.round(helpsOpenUp ? r.top : r.bottom),
      width: Math.round(r.width),
      openUp: helpsOpenUp,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    computePos();
  }, [isOpen, computePos]);

  useEffect(() => {
    if (!isOpen) return;
    const onWin = () => computePos();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [isOpen, computePos]);

  // close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIdx(0);
    if (searchable) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  const toggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((v) => !v);
  }, [disabled]);

  const pick = useCallback(
    (opt: SelectOption<T>) => {
      if (opt.disabled) return;
      onChange(opt.value);
      setIsOpen(false);
      setQuery("");
    },
    [onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          open();
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[activeIdx];
        if (opt) pick(opt);
        return;
      }
    },
    [disabled, isOpen, open, filtered, activeIdx, pick]
  );

  return (
    <div className={`cs ${variant ? `cs--${variant}` : ""} ${className ?? ""}`}>
      {label ? <label className="cs__label">{label}</label> : null}

      <button
        ref={btnRef}
        type="button"
        className={`cs__btn ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className={`cs__value ${selected ? "" : "is-placeholder"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`cs__chev ${isOpen ? "is-open" : ""}`}>▾</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popRef}
            className="cs__pop"
            style={{
              left: pos.left,
              width: pos.width,
              top: pos.openUp ? undefined : pos.top + 6,
              bottom: pos.openUp ? window.innerHeight - pos.top + 6 : undefined,
            }}
            role="listbox"
            onKeyDown={onKeyDown}
          >
            {searchable && (
              <div className="cs__searchWrap">
                <input
                  ref={searchRef}
                  className="cs__search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                />
              </div>
            )}

            <div className={`cs__list ${pos.openUp ? "cs__list--up" : ""}`}>
              {filtered.length === 0 ? (
                <div className="cs__empty">No options</div>
              ) : (
                filtered.map((o, idx) => {
                  const isSel = selected != null && isEqual(selected.value, o.value);
                  const isAct = idx === activeIdx;

                  return (
                    <button
                      key={`${o.label}-${idx}`}
                      type="button"
                      className={`cs__opt ${isSel ? "is-selected" : ""} ${isAct ? "is-active" : ""} ${
                        o.disabled ? "is-disabled" : ""
                      }`}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(o)}
                      disabled={o.disabled}
                    >
                      <span className="cs__optMain">
                        {o.label}
                        {o.subLabel ? <span className="cs__optSub">{o.subLabel}</span> : null}
                      </span>
                      {isSel ? <span className="cs__tick">✓</span> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
