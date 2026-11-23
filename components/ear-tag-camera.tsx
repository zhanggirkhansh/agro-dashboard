"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { readEarTagNumbers } from "@/lib/ear-tag-ocr";

type Props = {
  searchContext: string;
  onNumber: (number: string) => void;
};

export default function EarTagCamera({ searchContext, onNumber }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const scan = useRef<AbortController | null>(null);
  const latestSearchContext = useRef(searchContext);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [candidates, setCandidates] = useState<string[]>([]);

  useEffect(() => {
    latestSearchContext.current = searchContext;
  }, [searchContext]);

  useEffect(() => () => {
    scan.current?.abort();
    scan.current = null;
  }, []);

  function applyNumber(number: string) {
    onNumber(number);
    setCandidates([]);
    setMessage("Проверьте номер " + number + " и выберите животное из результатов.");
  }

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (!photo || scan.current) return;

    const controller = new AbortController();
    const contextAtCapture = searchContext;
    scan.current = controller;
    setBusy(true);
    setCandidates([]);
    setMessage("");
    const timeout = window.setTimeout(() => controller.abort(), 35000);

    try {
      const numbers = await readEarTagNumbers(photo, controller.signal);
      if (scan.current !== controller) return;

      if (numbers.length === 1 && latestSearchContext.current === contextAtCapture) {
        applyNumber(numbers[0]);
      } else if (numbers.length > 0) {
        setCandidates(numbers);
        setMessage("Выберите номер с бирки.");
      } else {
        setMessage("Номер не распознан. Сфотографируйте цифры крупнее или введите номер вручную.");
      }
    } catch {
      if (scan.current === controller) {
        setMessage("Не удалось прочитать фото. Попробуйте ещё раз или введите номер вручную.");
      }
    } finally {
      window.clearTimeout(timeout);
      if (scan.current === controller) {
        scan.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Фото ушной бирки"
        onChange={handlePhoto}
        hidden
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
      >
        <Camera size={17} aria-hidden="true" />
        {busy ? "Распознаём номер…" : "Сфотографировать бирку"}
      </button>
      <p role="status" className="text-sm text-[#6b7280]">
        {message || (busy ? "" : "Снимите цифры крупным планом.")}
      </p>
      {candidates.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Распознанные номера" role="group">
          {candidates.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => applyNumber(number)}
              className="rounded-lg bg-[#f8faf7] px-3 py-2 text-sm font-semibold text-[#1f4d3a]"
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
