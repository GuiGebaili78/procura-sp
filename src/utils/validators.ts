export function validateCep(cep: string): boolean {
  return /^\d{5}-\d{3}$/.test(cep);
}

export function formatCep(value: string): string {
  let formatted = value.replace(/\D/g, "");
  if (formatted.length > 5) {
    formatted = formatted.substring(0, 5) + "-" + formatted.substring(5, 8);
  }
  return formatted;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 11;
}
