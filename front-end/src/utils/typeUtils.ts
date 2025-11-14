export function parseBoolean(value: string | null | undefined): boolean | null {
  if (value == null) return null;

  switch (value.trim().toLowerCase()) {
    case "true":
    case "1":
    case "yes":
    case "y":
      return true;

    case "false":
    case "0":
    case "no":
    case "n":
      return false;

    default:
      return null; // or throw an error if you prefer
  }
}
