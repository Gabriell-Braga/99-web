/**
 * Parser local de endereço brasileiro em texto livre.
 *
 * Recebe o texto bruto que um operador cola de outro sistema (cardápio web,
 * planilha, WhatsApp) e devolve os campos reconhecidos. Campo que não é
 * reconhecido com segurança fica ausente: é melhor deixar em branco do que
 * preencher errado.
 */

export interface ParsedAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  name?: string;
  phone?: string;
}

export type ParsedField = keyof ParsedAddress;

export interface ParseResult {
  fields: ParsedAddress;
  found: ParsedField[];
  missing: ParsedField[];
  /** Verdadeiro quando nada útil foi reconhecido. */
  empty: boolean;
}

const CORE_FIELDS: ParsedField[] = ["street", "number", "neighborhood", "city", "cep"];

const STREET_PREFIX =
  /^(rua|r\.|av\.|av|avenida|alameda|al\.|travessa|tv\.|praça|praca|pça\.|largo|estrada|estr\.|rodovia|rod\.|via|viela|passagem|marginal|parque|pq\.)(?=\s|$)/i;

const UF = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

const COMPLEMENT_HINT =
  /\b(apto?\.?|apartamento|ap\.?|bloco|bl\.?|casa|cs\.?|sala|sl\.?|conj\.?|conjunto|andar|fundos|frente|loja|lj\.?|torre|box|galpão|galpao|térreo|terreo|cobertura|sobreloja|edif\.?|edifício|edificio|ed\.?)\b/i;

const KNOWN_CITIES =
  /^(s[ãa]o paulo|rio de janeiro|belo horizonte|curitiba|porto alegre|salvador|recife|fortaleza|bras[íi]lia|campinas|guarulhos|osasco|santos|santo andr[ée]|s[ãa]o bernardo do campo|diadema|barueri|mairipor[ãa]|guaruj[áa]|niter[óo]i|goi[âa]nia|manaus|bel[ée]m|florian[óo]polis)$/i;

function clean(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:\-–—.]+|[\s,;:\-–—.]+$/g, "")
    .trim();
}

function titleCaseIfShouting(s: string): string {
  if (s.length > 3 && s === s.toUpperCase()) {
    return s
      .toLowerCase()
      .replace(/(^|\s|\.)([a-záéíóúâêôãõç])/g, (m) => m.toUpperCase())
      .replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (m) => m.toLowerCase());
  }
  return s;
}

function looksLikeStreet(s: string): boolean {
  return STREET_PREFIX.test(s.trim());
}

/** Extrai o primeiro CEP com 8 dígitos (com ou sem hífen/ponto). */
function extractCep(text: string): { cep?: string; rest: string } {
  const m = text.match(/(?:cep\s*[:.]?\s*)?(\d{2}\.?\d{3})[-\s.]?(\d{3})\b/i);
  if (!m) return { rest: text };
  const digits = (m[1] + m[2]).replace(/\D/g, "");
  if (digits.length !== 8) return { rest: text };
  return {
    cep: `${digits.slice(0, 5)}-${digits.slice(5)}`,
    rest: text.replace(m[0], " "),
  };
}

/** Extrai telefone brasileiro: (11) 98765-4321, 11987654321, +55 11 9 8765 4321. */
function extractPhone(text: string): { phone?: string; rest: string } {
  const re =
    /(?:(?:tel|telefone|fone|cel|celular|whats(?:app)?|contato)\s*[:.]?\s*)?(\+?55\s?)?\(?(\d{2})\)?\s?(9?\d{4})[-\s.]?(\d{4})\b/i;
  const m = text.match(re);
  if (!m) return { rest: text };
  const digits = (m[2] + m[3] + m[4]).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) return { rest: text };
  return { phone: digits, rest: text.replace(m[0], " ") };
}

function extractLabeled(text: string, labels: string[]): { value?: string; rest: string } {
  for (const label of labels) {
    const re = new RegExp(`(?<![^\\s,;|(])${label}\\s*[:\\-–]\\s*([^\\n,;|)]+)`, "i");
    const m = text.match(re);
    if (m && clean(m[1])) {
      return { value: clean(m[1]), rest: text.replace(m[0], "\n") };
    }
  }
  return { rest: text };
}

function splitStreetNumber(chunk: string): {
  street?: string;
  number?: string;
  complement?: string;
} {
  const c = clean(chunk);
  if (!c) return {};

  // "Rua X, 123" / "Rua X 123" / "Rua X, nº 123" / "Rua X, s/n"
  const m = c.match(
    /^(.+?)[,\s]+(?:n[ºo°.]?\s*|número\s*|numero\s*)?(\d{1,6}[a-zA-Z]?|s\/n)\b(.*)$/i,
  );
  if (m) {
    const street = clean(m[1]);
    const number = m[2].toLowerCase() === "s/n" ? "s/n" : m[2];
    const tail = clean(m[3]);
    const out: { street?: string; number?: string; complement?: string } = {};
    if (street && /[a-záéíóúâêôãõç]/i.test(street)) out.street = titleCaseIfShouting(street);
    out.number = number;
    if (tail) out.complement = tail;
    return out;
  }

  if (/[a-záéíóúâêôãõç]/i.test(c)) return { street: titleCaseIfShouting(c) };
  return {};
}

function extractState(text: string): { state?: string; rest: string } {
  // "São Paulo - SP", "São Paulo/SP", "SP", "(SP)"
  const m = text.match(/(?:^|[\s\-–/(,])([A-Z]{2})(?=$|[\s,;).])/);
  if (m && UF.has(m[1])) {
    return { state: m[1], rest: text.replace(m[0], " ") };
  }
  return { rest: text };
}

/** "São Paulo - SP", "São Paulo/SP", "SAO PAULO SP": cidade imediatamente antes da UF. */
function extractCityState(text: string): { city?: string; state?: string; rest: string } {
  const re = /([A-Za-zÀ-ÿ'][A-Za-zÀ-ÿ' ]{2,}?)\s*(?:[-–/]\s*|\s)([A-Z]{2})(?=$|[\s,;).])/;
  const m = text.match(re);
  if (!m || !UF.has(m[2])) return { rest: text };
  const city = clean(m[1]);
  if (!city || looksLikeStreet(city) || COMPLEMENT_HINT.test(city)) return { rest: text };
  return { city: titleCaseIfShouting(city), state: m[2], rest: text.replace(m[0], " ") };
}

export function parseAddress(raw: string): ParseResult {
  const fields: ParsedAddress = {};
  let text = raw.replace(/\r/g, "").replace(/\t/g, " ");

  if (!clean(text)) {
    return { fields, found: [], missing: CORE_FIELDS, empty: true };
  }

  // 1. Telefone e CEP primeiro, porque são os padrões mais inequívocos.
  const phone = extractPhone(text);
  if (phone.phone) {
    fields.phone = phone.phone;
    text = phone.rest;
  }

  const cep = extractCep(text);
  if (cep.cep) {
    fields.cep = cep.cep;
    text = cep.rest;
  }

  // 2. Campos rotulados explícitos (formato de sistema ou formulário).
  const name = extractLabeled(text, [
    "nome", "cliente", "destinatário", "destinatario", "contato", "para", "responsável", "responsavel",
  ]);
  if (name.value && !/\d{4}/.test(name.value)) {
    fields.name = name.value;
    text = name.rest;
  }

  const bairro = extractLabeled(text, ["bairro"]);
  if (bairro.value) {
    fields.neighborhood = titleCaseIfShouting(bairro.value);
    text = bairro.rest;
  }

  const cidade = extractLabeled(text, ["cidade", "município", "municipio"]);
  if (cidade.value) {
    const st = extractState(cidade.value);
    if (st.state) fields.state = st.state;
    const c = clean(st.rest);
    if (c) fields.city = titleCaseIfShouting(c);
    text = cidade.rest;
  }

  const uf = extractLabeled(text, ["uf", "estado"]);
  if (uf.value) {
    const st = extractState(uf.value.toUpperCase());
    if (st.state) fields.state = st.state;
    text = uf.rest;
  }

  const compl = extractLabeled(text, ["complemento", "compl", "referência", "referencia", "ref"]);
  if (compl.value) {
    fields.complement = compl.value;
    text = compl.rest;
  }

  const numero = extractLabeled(text, ["número", "numero", "nº", "num", "n"]);
  if (numero.value && /^\d{1,6}[a-zA-Z]?$|^s\/n$/i.test(numero.value)) {
    fields.number = numero.value;
    text = numero.rest;
  }

  const logradouro = extractLabeled(text, ["endereço", "endereco", "logradouro", "rua", "avenida", "av"]);
  if (logradouro.value) {
    const parts = splitStreetNumber(logradouro.value);
    if (parts.street) fields.street = parts.street;
    if (parts.number && !fields.number) fields.number = parts.number;
    if (parts.complement && !fields.complement) fields.complement = parts.complement;
    text = logradouro.rest;
  }

  // 3. Trecho entre parênteses costuma ser complemento: "(Bloco B, apto 12)".
  const paren = text.match(/\(([^)]{2,})\)/);
  if (paren) {
    if (!fields.complement) fields.complement = clean(paren[1]);
    text = text.replace(paren[0], " ");
  }

  // 4. Cidade colada na UF: "São Paulo - SP".
  if (!fields.city) {
    const cs = extractCityState(text);
    if (cs.city) {
      fields.city = cs.city;
      if (!fields.state) fields.state = cs.state;
      text = cs.rest;
    }
  }

  // 5. Texto livre restante, separado por vírgula, hífen, barra ou quebra de linha.
  const segments = text
    .split(/\n|,|;|\s[-–—]\s|\s\/\s|\|/)
    .map(clean)
    .filter(Boolean);

  const leftovers: string[] = [];

  for (const seg of segments) {
    const st = extractState(seg);
    let s = seg;
    if (st.state && !fields.state) {
      fields.state = st.state;
      s = clean(st.rest);
      if (!s) continue;
    } else if (st.state && fields.state === st.state && !clean(st.rest)) {
      continue;
    }

    if (!fields.street && looksLikeStreet(s)) {
      const parts = splitStreetNumber(s);
      if (parts.street) fields.street = parts.street;
      if (parts.number && !fields.number) fields.number = parts.number;
      if (parts.complement && !fields.complement) fields.complement = parts.complement;
      continue;
    }

    // Número isolado logo após a rua: "Rua X" | "123" | "s/n".
    if (fields.street && !fields.number) {
      const n = s.match(/^(?:n[ºo°.]?\s*)?(\d{1,6}[a-zA-Z]?|s\/n)$/i);
      if (n) {
        fields.number = n[1].toLowerCase() === "s/n" ? "s/n" : n[1];
        continue;
      }
      // Número seguido de complemento: "123 apto 42".
      const nc = s.match(/^(\d{1,6}[a-zA-Z]?)\s+(.+)$/);
      if (nc && COMPLEMENT_HINT.test(nc[2])) {
        fields.number = nc[1];
        if (!fields.complement) fields.complement = clean(nc[2]);
        continue;
      }
    }

    if (!fields.complement && COMPLEMENT_HINT.test(s) && !looksLikeStreet(s)) {
      fields.complement = s;
      continue;
    }

    leftovers.push(s);
  }

  // 6. O que sobrou é bairro e cidade, nessa ordem, quando é texto sem dígitos.
  // Só vale se há evidência de endereço (rua ou CEP). Caso contrário é texto
  // qualquer e não deve preencher nada.
  const hasEvidence = Boolean(fields.street || fields.cep);
  const textual = hasEvidence
    ? leftovers.filter((s) => !/\d/.test(s) && s.length >= 3 && s.length <= 40)
    : [];

  if (textual.length >= 2) {
    if (!fields.neighborhood) fields.neighborhood = titleCaseIfShouting(textual[0]);
    if (!fields.city) fields.city = titleCaseIfShouting(textual[1]);
  } else if (textual.length === 1) {
    const only = textual[0];
    if (fields.city && !fields.neighborhood) {
      fields.neighborhood = titleCaseIfShouting(only);
    } else if (!fields.city && KNOWN_CITIES.test(only)) {
      fields.city = titleCaseIfShouting(only);
    } else if (!fields.city && !fields.neighborhood && fields.cep) {
      // Com CEP presente, um trecho textual solto é quase sempre o bairro.
      fields.neighborhood = titleCaseIfShouting(only);
    }
    // Sem CEP nem cidade, um trecho solto é ambíguo: fica em branco.
  }

  const found = (Object.keys(fields) as ParsedField[]).filter((k) => fields[k]);
  const missing = CORE_FIELDS.filter((k) => !fields[k]);
  const empty = !CORE_FIELDS.some((k) => fields[k]);

  return { fields, found, missing, empty };
}

export const FIELD_LABELS: Record<ParsedField, string> = {
  street: "rua",
  number: "número",
  complement: "complemento",
  neighborhood: "bairro",
  city: "cidade",
  state: "estado",
  cep: "CEP",
  name: "nome",
  phone: "telefone",
};
