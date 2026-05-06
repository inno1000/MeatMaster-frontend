import type { ButcherFormInput } from "@/lib/schemas/butcher";

export type MockButcherRecord = Record<string, unknown>;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let mockButchers: MockButcherRecord[] = [
  {
    id: 1,
    name: "Boucherie Halal",
    city: "Ngaoundéré",
    phone: "(+237) 695956707",
    email: "contact@halal.example",
    address: "Quartier Yoko",
  },
  {
    id: 2,
    name: "Boucherie Centrale",
    city: "Douala",
    phone: "(+237) 612345678",
    email: "centrale@example.com",
    address: "Rue 5",
  },
  {
    id: 3,
    name: "Boucherie du Marché",
    city: "Yaoundé",
    phone: "(+237) 678901234",
    email: "marche@example.com",
    address: "Marché Central",
  },
];

export const fetchMockButchers = async (): Promise<MockButcherRecord[]> => {
  await delay(250);
  return mockButchers.map((row) => ({ ...row }));
};

export const createMockButcher = async (
  input: ButcherFormInput,
): Promise<MockButcherRecord> => {
  await delay(450);
  const id =
    mockButchers.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
  const row: MockButcherRecord = {
    id,
    name: input.name,
    city: input.city,
    address: input.address,
    postal_code: input.postal_code,
    phone: input.phone,
    email: input.email,
    website: input.website?.trim()
      ? `https://${input.website.replace(/^https?:\/\//, "")}`
      : undefined,
    opening_hours: `${input.openingHour} - ${input.closingHour}`,
    openingDays: input.openingDays,
    owner: input.owner,
    specialties: input.specialties.join(", "),
  };
  mockButchers = [...mockButchers, row];
  return row;
};
