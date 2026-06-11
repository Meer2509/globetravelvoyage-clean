export interface ExpertService {
  id: string;
  name: string;
  desc: string;
  price: string;
  popular: boolean;
}

const PREFIX = "gtv-service:";

export function encodeExpertService(service: ExpertService): string {
  return `${PREFIX}${JSON.stringify(service)}`;
}

export function decodeExpertService(raw: string): ExpertService | null {
  if (!raw.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(raw.slice(PREFIX.length)) as ExpertService;
    if (!parsed.id || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function parseExpertServices(values: string[] | null | undefined): ExpertService[] {
  if (!values?.length) return [];
  return values
    .map((v) => decodeExpertService(v))
    .filter((s): s is ExpertService => s !== null);
}

export function serializeExpertServices(services: ExpertService[]): string[] {
  return services.map(encodeExpertService);
}

export function newExpertService(partial?: Partial<ExpertService>): ExpertService {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    name: partial?.name ?? "",
    desc: partial?.desc ?? "",
    price: partial?.price ?? "",
    popular: partial?.popular ?? false,
  };
}
