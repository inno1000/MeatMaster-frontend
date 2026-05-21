import { notFound } from "next/navigation";
import { AbattageDetailView } from "@/components/features/abattage-detail-view";
import {
  getSlaughterAnimalById,
  MOCK_SLAUGHTER_ANIMALS,
} from "@/lib/mock-data/slaughter";

export function generateStaticParams() {
  return MOCK_SLAUGHTER_ANIMALS.map((a) => ({ id: String(a.id) }));
}

export default async function AbattageDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const animal = getSlaughterAnimalById(id);
  if (!animal) {
    notFound();
  }
  return <AbattageDetailView animal={animal} />;
}
