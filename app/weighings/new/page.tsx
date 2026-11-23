"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { LIVESTOCK_STATUS } from "@/constants/status";
import { supabase } from "@/lib/supabase";
import { mutateWeighing } from "@/lib/weighings";

type Animal = {
  id: number;
  animal_code: string;
  current_weight: number | null;
  batch: string | null;
  status: string | null;
};

type Batch = { id: number; batch_name: string };

type AnimalResults = {
  key: string;
  animals: Animal[];
  failed: boolean;
};

const ANIMAL_FIELDS = "id, animal_code, current_weight, batch, status";
const BATCH_PAGE_SIZE = 400;
const INPUT_CLASS = "w-full rounded-2xl border border-[#d9e2d2] bg-white px-3 py-2.5 outline-none focus:border-[#1f4d3a]";

async function loadBatchAnimals(batchId: number, signal: AbortSignal): Promise<Animal[] | null> {
  const animals: Animal[] = [];
  let total: number | null = null;

  do {
    const offset = animals.length;
    const { data, error, count } = await supabase
      .from("livestock")
      .select(ANIMAL_FIELDS, offset === 0 ? { count: "exact" } : {})
      .eq("batch_id", batchId)
      .order("animal_code")
      .order("id")
      .range(offset, offset + BATCH_PAGE_SIZE - 1)
      .abortSignal(signal);
    if (error) return null;
    if (offset === 0) total = count;
    if (!data.length) break;
    animals.push(...data);
  } while (total === null || animals.length < total);

  return animals;
}

function validId(value: string | null): number | null {
  if (!value || !/^[0-9]+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default function NewWeighingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetBatchId = validId(searchParams.get("batch_id"));
  const presetAnimalId = validId(searchParams.get("animal_id"));

  const [mode, setMode] = useState<"animal" | "batch">(presetBatchId ? "batch" : "animal");
  const [date, setDate] = useState(() => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Almaty" }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [animalSearch, setAnimalSearch] = useState("");
  const [showAnimalList, setShowAnimalList] = useState(false);
  const [searchResult, setSearchResult] = useState<AnimalResults | null>(null);
  const [presetResult, setPresetResult] = useState<AnimalResults | null>(null);
  const [animalChoice, setAnimalChoice] = useState<Animal | null | undefined>();
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");

  const [batchesResult, setBatchesResult] = useState<{ batches: Batch[]; failed: boolean } | null>(null);
  const [batchId, setBatchId] = useState(presetBatchId ? String(presetBatchId) : "");
  const [batchResult, setBatchResult] = useState<AnimalResults | null>(null);
  const [batchWeights, setBatchWeights] = useState<Record<number, string>>({});

  const search = animalSearch.trim();
  const matchingAnimals = searchResult?.key === search ? searchResult : null;
  const preset = presetResult?.key === String(presetAnimalId) ? presetResult : null;
  const selectedAnimal = animalChoice === undefined ? preset?.animals[0] : animalChoice;
  const selectedBatch = batchResult?.key === batchId ? batchResult : null;

  useEffect(() => {
    const animalId = presetAnimalId;
    if (!animalId) return;
    const controller = new AbortController();
    async function load(animalId: number) {
      const { data, error } = await supabase
        .from("livestock")
        .select(ANIMAL_FIELDS)
        .eq("id", animalId)
        .abortSignal(controller.signal)
        .maybeSingle();
      if (!controller.signal.aborted) {
        setPresetResult({ key: String(animalId), animals: data ? [data] : [], failed: !!error });
      }
    }
    void load(animalId);
    return () => controller.abort();
  }, [presetAnimalId]);

  useEffect(() => {
    if (mode !== "animal" || (!search && !showAnimalList)) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      let query = supabase
        .from("livestock")
        .select(ANIMAL_FIELDS)
        .order("animal_code")
        .order("id");
      if (search) {
        const literalSearch = search.replace(/[\\%_]/g, "\\$&");
        query = query.ilike("animal_code", "%" + literalSearch + "%").limit(30);
      }
      const { data, error } = await query.abortSignal(controller.signal);
      if (!controller.signal.aborted) {
        setSearchResult({ key: search, animals: data ?? [], failed: !!error });
      }
    }, 220);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [mode, search, showAnimalList]);

  useEffect(() => {
    if (mode !== "batch") return;
    const controller = new AbortController();
    async function load() {
      const { data, error } = await supabase
        .from("batches")
        .select("id, batch_name")
        .order("batch_name")
        .abortSignal(controller.signal);
      if (!controller.signal.aborted) setBatchesResult({ batches: data ?? [], failed: !!error });
    }
    void load();
    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    if (mode !== "batch" || !batchId) return;
    const controller = new AbortController();
    void loadBatchAnimals(Number(batchId), controller.signal).then((animals) => {
      if (!controller.signal.aborted) {
        setBatchResult({ key: batchId, animals: animals ?? [], failed: animals === null });
      }
    });
    return () => controller.abort();
  }, [mode, batchId]);

  const batchEntries = (selectedBatch?.animals ?? [])
    .filter((animal) => (batchWeights[animal.id] ?? "").trim() !== "")
    .map((animal) => ({ animal_id: animal.id, weight: Number(batchWeights[animal.id]) }));

  function chooseAnimal(animal: Animal) {
    setAnimalChoice(animal);
    setAnimalSearch("");
    setShowAnimalList(false);
    setError("");
  }

  function chooseSearchResult(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const results = matchingAnimals?.animals ?? [];
    const exact = results.filter((animal) => animal.animal_code.toLowerCase() === search.toLowerCase());
    if (exact.length === 1) chooseAnimal(exact[0]);
    else if (results.length === 1) chooseAnimal(results[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");

    if (!date) {
      setError("Укажите дату взвешивания.");
      return;
    }

    if (mode === "animal" && !selectedAnimal) {
      setError("Найдите животное и выберите его из результатов.");
      return;
    }

    if (mode === "batch" && batchEntries.length === 0) {
      setError("Введите новый вес хотя бы для одного животного.");
      return;
    }

    if (mode === "batch" && batchEntries.some((entry) => !Number.isFinite(entry.weight) || entry.weight <= 0)) {
      setError("В заполненных строках вес должен быть больше нуля.");
      return;
    }

    setLoading(true);
    let failure: string | null = null;

    if (mode === "batch") {
      const { error: saveError } = await supabase.rpc("record_batch_weighings", {
        p_batch_id: Number(batchId),
        p_weighing_date: date,
        p_weights: batchEntries,
      });

      if (saveError?.code === "PGRST202") {
        failure = "Сохранение по партиям станет доступно после обновления базы.";
      } else if (saveError?.message === "Animal is no longer available in this batch") {
        failure = "Состав партии изменился. Загрузите список партии заново.";
      } else if (saveError) {
        failure = "Не удалось сохранить взвешивания партии.";
      }
    } else if (selectedAnimal) {
      failure = await mutateWeighing({
        operation: "insert",
        animalId: selectedAnimal.id,
        measurement: { weighing_date: date, weight: Number(weight), comment: comment.trim() || null },
      });
    }

    if (failure) {
      setError(failure);
      setLoading(false);
      return;
    }

    router.push("/weighings");
    router.refresh();
  }

  return (
    <section>
      <PageHeader eyebrow="Контроль привеса" title="Добавить взвешивание" />
      <div className="mb-5 flex flex-wrap gap-2" aria-label="Режим взвешивания" role="group">
        {([["animal", "Одно животное"], ["batch", "По партии"]] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            disabled={loading}
            onClick={() => { setMode(value); setError(""); }}
            className={mode === value
              ? "rounded-xl bg-[#1f4d3a] px-4 py-2.5 text-sm font-medium text-white"
              : "rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        <SectionCard title={mode === "batch" ? "Взвешивание партии" : "Взвешивание животного"}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={loading} className="min-w-0 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {mode === "batch" ? (
                  <div>
                    <label htmlFor="weighing-batch" className="block text-sm font-medium">Партия</label>
                    <select
                      id="weighing-batch"
                      value={batchId}
                      required
                      disabled={!batchesResult || batchesResult.failed}
                      className={"mt-2 " + INPUT_CLASS}
                      onChange={(event) => {
                        setBatchId(event.target.value);
                        setBatchWeights({});
                        setError("");
                      }}
                    >
                      <option value="">{batchesResult ? "Выберите партию" : "Загрузка партий…"}</option>
                      {batchesResult?.batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <label className="block text-sm font-medium">
                    Поиск по коду или номеру бирки
                    <input
                      type="search"
                      value={animalSearch}
                      placeholder="Например, 001"
                      className={"mt-2 " + INPUT_CLASS}
                      onKeyDown={chooseSearchResult}
                      onChange={(event) => {
                        setAnimalSearch(event.target.value);
                        setAnimalChoice(null);
                        setError("");
                      }}
                    />
                  </label>
                )}

                <label className="block text-sm font-medium">
                  {mode === "batch" ? "Дата для всей партии" : "Дата взвешивания"}
                  <input
                    type="date"
                    value={date}
                    required
                    className={"mt-2 " + INPUT_CLASS}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
              </div>

              {mode === "animal" && (
                <>
                  {!search && !selectedAnimal && !showAnimalList && (
                    <button
                      type="button"
                      className="text-sm font-medium text-[#1f4d3a] underline underline-offset-4"
                      onClick={() => setShowAnimalList(true)}
                    >
                      Показать список животных
                    </button>
                  )}
                  {(search || showAnimalList) && (
                    <div aria-live="polite">
                      {!matchingAnimals || matchingAnimals.failed || matchingAnimals.animals.length === 0 ? (
                        <p className="text-sm text-[#6b7280]">
                          {!matchingAnimals ? "Поиск…" : matchingAnimals.failed ? "Не удалось выполнить поиск." : "Животные не найдены."}
                        </p>
                      ) : (
                        <ul className="max-h-52 divide-y divide-[#e6ebdf] overflow-auto rounded-2xl border border-[#e6ebdf]">
                          {matchingAnimals.animals.map((animal) => (
                            <li key={animal.id}>
                              <button
                                type="button"
                                onClick={() => chooseAnimal(animal)}
                                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-[#f6f9f4] dark:hover:bg-[#1e3326]"
                              >
                                <span className="font-semibold">{animal.animal_code}</span>
                                <span className="text-sm text-[#6b7280]">
                                  {[animal.batch, animal.status === LIVESTOCK_STATUS.SOLD ? animal.status : null].filter(Boolean).join(" · ")}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {!search && !selectedAnimal && animalChoice === undefined && presetAnimalId && (
                    <p role="status" className="text-sm text-[#6b7280]">
                      {preset ? "Не удалось загрузить выбранное животное. Воспользуйтесь поиском." : "Загрузка животного…"}
                    </p>
                  )}

                  {selectedAnimal && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f8faf7] px-4 py-3">
                      <p className="font-semibold">
                        {selectedAnimal.animal_code}
                        {selectedAnimal.batch ? <span className="ml-2 text-sm font-normal text-[#6b7280]">{selectedAnimal.batch}</span> : null}
                      </p>
                      <p className="text-sm text-[#6b7280]">Текущий вес {selectedAnimal.current_weight ?? "—"}{selectedAnimal.current_weight != null ? " кг" : ""}</p>
                    </div>
                  )}

                  <label className="block max-w-xs text-sm font-medium">
                    Новый вес, кг
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={weight}
                      required
                      className={"mt-2 " + INPUT_CLASS}
                      onChange={(event) => setWeight(event.target.value)}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Комментарий
                    <textarea
                      value={comment}
                      rows={3}
                      className={"mt-2 " + INPUT_CLASS}
                      onChange={(event) => setComment(event.target.value)}
                    />
                  </label>
                </>
              )}

              {mode === "batch" && (
                <>
                  {batchesResult?.failed && <p role="alert" className="text-sm text-[#b91c1c]">Не удалось загрузить партии.</p>}
                  {batchesResult && !batchesResult.failed && batchesResult.batches.length === 0 && (
                    <p className="text-sm text-[#6b7280]">Нет доступных партий.</p>
                  )}
                  {batchId && !selectedBatch && <p role="status" className="text-sm text-[#6b7280]">Загрузка животных партии…</p>}
                  {selectedBatch?.failed && <p role="alert" className="text-sm text-[#b91c1c]">Не удалось загрузить животных партии.</p>}
                  {selectedBatch && !selectedBatch.failed && selectedBatch.animals.length === 0 && (
                    <p className="text-sm text-[#6b7280]">В этой партии пока нет животных.</p>
                  )}
                  {selectedBatch && selectedBatch.animals.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-[#6b7280]">
                        Заполнено {batchEntries.length} из {selectedBatch.animals.length}. Пустые строки будут пропущены.
                      </p>
                      <div className="overflow-x-auto rounded-2xl border border-[#e6ebdf]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#f8faf7] text-[#6b7280]">
                            <tr>
                              <th scope="col" className="px-3 py-2.5">Бирка</th>
                              <th scope="col" className="px-3 py-2.5">Текущий вес, кг</th>
                              <th scope="col" className="w-32 px-3 py-2.5 sm:w-44">Новый вес, кг</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e6ebdf]">
                            {selectedBatch.animals.map((animal) => (
                              <tr key={animal.id}>
                                <th scope="row" className="break-all px-3 py-2 text-left font-medium">
                                  {animal.animal_code}
                                  {animal.status === LIVESTOCK_STATUS.SOLD && (
                                    <span className="block text-xs font-normal text-[#6b7280]">{animal.status}</span>
                                  )}
                                </th>
                                <td className="px-3 py-2">{animal.current_weight ?? "—"}</td>
                                <td className="px-3 py-2">
                                  <input
                                    aria-label={"Новый вес для бирки " + animal.animal_code}
                                    type="number"
                                    step="any"
                                    inputMode="decimal"
                                    value={batchWeights[animal.id] ?? ""}
                                    className={INPUT_CLASS}
                                    onChange={(event) => {
                                      const value = event.target.value;
                                      setBatchWeights((previous) => ({ ...previous, [animal.id]: value }));
                                      setError("");
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </fieldset>

            {error && (
              <p role="alert" className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || (mode === "batch" ? batchEntries.length === 0 : !selectedAnimal)}
                className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Сохранение…" : mode === "batch" ? "Сохранить взвешивания" : "Сохранить взвешивание"}
              </button>
              <Link href="/weighings" className="rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]">Отмена</Link>
            </div>
          </form>
        </SectionCard>
      </div>
    </section>
  );
}
