"use client";

import { withLocaleParams } from "@/lib/with-locale-params";
import { VenteSimpleFlow } from "@/components/simple/vente-simple-flow";

function VenteEnregistrerPage() {
  return <VenteSimpleFlow />;
}

export default withLocaleParams(VenteEnregistrerPage);
