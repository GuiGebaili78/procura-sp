export function formatDistanceMetersToKm(distanceMeters?: number | string) {
  if (distanceMeters == null) return "—";
  const val =
    typeof distanceMeters === "string"
      ? Number(distanceMeters)
      : distanceMeters;
  if (isNaN(val)) return "—";
  if (val < 1000) return `${Math.round(val)} m`;
  return `${(val / 1000).toFixed(1)} km`;
}

export function formatDateISO(dateIso?: string) {
  if (!dateIso) return "—";
  try {
    const d = new Date(dateIso);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dateIso;
  }
}

export function formatTimeISO(dateIso?: string) {
  if (!dateIso) return "—";
  try {
    const d = new Date(dateIso);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateIso;
  }
}

export function formatCep(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  return digits.substring(0, 5) + "-" + digits.substring(5, 8);
}
