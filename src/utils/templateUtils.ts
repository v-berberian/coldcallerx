export interface NameParts {
  firstName: string;
  lastName: string;
}

/**
 * Split a full name into first and last components.
 */
export function parseLeadName(fullName: string): NameParts {
  const name = (fullName || '').trim();
  if (!name) {
    return { firstName: '', lastName: '' };
  }
  const parts = name.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

/**
 * Normalize common placeholder typos and variants to a canonical single-brace token form.
 * Examples:
 * - {first.name) -> {first.name}
 * - { first_name } -> {first_name}
 */
export function normalizePlaceholders(input: string): string {
  if (!input) return '';
  let result = input;
  // Allow a mistaken closing parenthesis to end a placeholder
  result = result.replace(/\{([^\n{})]*)\)/g, '{$1}');
  // Trim whitespace inside braces
  result = result.replace(/\{\s*([^{}]*?)\s*\}/g, '{$1}');
  return result;
}

export type InterpolationContext = {
  name?: string;
  company?: string | null;
  selectedPhone?: string;
};

/**
 * Interpolate a template string using lead-like fields. Supports synonyms:
 * {first}, {first_name}, {first.name}
 * {last}, {last_name}, {last.name}
 * {name}
 * {company}, {company.name}
 * {phone}, {selected_phone}
 * Case-insensitive and ignores extra whitespace inside braces.
 */
export function interpolateTemplate(template: string, context: InterpolationContext): string {
  if (!template) return '';

  const normalized = normalizePlaceholders(template);

  const { name = '', company = '', selectedPhone = '' } = context;
  const { firstName, lastName } = parseLeadName(name);

  const valueByKey: Record<string, string> = {
    // name variants
    'name': name,
    // first name variants
    'first': firstName,
    'first_name': firstName,
    'first.name': firstName,
    // last name variants
    'last': lastName,
    'last_name': lastName,
    'last.name': lastName,
    // company variants
    'company': company || '',
    'company.name': company || '',
    // phone variants
    'phone': selectedPhone || '',
    'selected_phone': selectedPhone || '',
  };

  return normalized.replace(/\{\s*([a-zA-Z_.]+)\s*\}/g, (_match, rawKey: string) => {
    const key = (rawKey || '').toLowerCase();
    if (key in valueByKey) {
      return valueByKey[key] ?? '';
    }
    // Unknown token: remove token gracefully
    return '';
  });
}