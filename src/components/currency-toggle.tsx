"use client";

import { useEffect, useState } from "react";

const options = ["INR", "USD"] as const;

type Currency = (typeof options)[number];

function getInitialCurrency(): Currency {
  if (typeof window === "undefined") {
    return "INR";
  }
  const stored = window.localStorage.getItem("displayCurrency") as Currency | null;
  return stored || "INR";
}

export default function CurrencyToggle({
  onChange,
}: {
  onChange?: (currency: Currency) => void;
}) {
  const [currency, setCurrency] = useState<Currency>("INR");

  useEffect(() => {
    const initial = getInitialCurrency();
    setCurrency(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("displayCurrency", currency);
    document.cookie = `displayCurrency=${currency}; path=/; max-age=31536000`;
    window.dispatchEvent(new Event("displayCurrencyChange"));
    onChange?.(currency);

    (async () => {
      try {
        const response = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayCurrency: currency }),
        });
        const { handleUnauthorized } = await import("@/lib/client-auth");
        handleUnauthorized(response);
      } catch {
        // Ignore background preference updates.
      }
    })();
  }, [currency, onChange]);

  return (
    <div className="flex items-center rounded-full bg-ink-850 p-1 text-xs">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setCurrency(option)}
          className={`rounded-full px-3 py-1 font-semibold transition ${
            currency === option
              ? "bg-teal-400 text-ink-950"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
