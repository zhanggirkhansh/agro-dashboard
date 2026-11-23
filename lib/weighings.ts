import { supabase } from "@/lib/supabase";

type Measurement = {
  weighing_date: string;
  weight: number;
  comment: string | null;
};

type WeighingChange =
  | { operation: "insert"; animalId: number; measurement: Measurement }
  | { operation: "update"; id: number; measurement: Measurement }
  | { operation: "delete"; id: number };

export async function mutateWeighing(change: WeighingChange): Promise<string | null> {
  const failure = change.operation === "delete"
    ? "Не удалось удалить взвешивание."
    : "Не удалось сохранить взвешивание.";

  const measurement = change.operation === "delete" ? undefined : change.measurement;
  if (measurement && (!Number.isFinite(measurement.weight) || measurement.weight <= 0)) {
    return "Вес должен быть больше нуля.";
  }

  const { error } = await supabase.rpc("mutate_weighing", {
    p_operation: change.operation,
    p_id: change.operation === "insert" ? undefined : change.id,
    p_animal_id: change.operation === "insert" ? change.animalId : undefined,
    p_weighing_date: measurement?.weighing_date,
    p_weight: measurement?.weight,
    p_comment: measurement?.comment,
  });

  if (!error) return null;
  // Keep the forms usable if the app deploys before the database migration.
  if (error.code !== "PGRST202") return failure;

  const weighings = supabase.from("weighings");
  const query = change.operation === "insert"
    ? weighings.insert({ animal_id: change.animalId, ...change.measurement })
    : change.operation === "update"
      ? weighings.update(change.measurement).eq("id", change.id)
      : weighings.delete().eq("id", change.id);
  const { data, error: writeError } = await query.select("animal_id").single();
  if (writeError || !data) return failure;
  if (data.animal_id === null) return null;

  const animalId = data.animal_id;
  const incomplete = "Запись изменена, но текущий вес животного обновить не удалось.";
  const { data: latest, error: latestError } = await supabase
    .from("weighings")
    .select("weight")
    .eq("animal_id", animalId)
    .order("weighing_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) return incomplete;

  let weight = latest?.weight ?? null;
  if (!latest) {
    const { data: animal, error: animalError } = await supabase
      .from("livestock")
      .select("start_weight")
      .eq("id", animalId)
      .single();
    if (animalError || !animal) return incomplete;
    weight = animal.start_weight;
  }

  const { error: updateError } = await supabase
    .from("livestock")
    .update({ current_weight: weight })
    .eq("id", animalId)
    .select("id")
    .single();
  return updateError ? incomplete : null;
}
