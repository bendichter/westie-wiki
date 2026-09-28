/**
 * Gmail ignores dots and anything after "+" in the local part, so
 * "j.o.e+x@gmail.com" reaches joe@gmail.com. Signup bots use dotted variants
 * to sign one real inbox up many times; comparing canonical forms stops that.
 */
export function canonicalEmail(email: string): string {
  const [local, domain] = email.toLowerCase().split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `${local.split("+")[0].replace(/\./g, "")}@gmail.com`;
  }
  return email.toLowerCase();
}
