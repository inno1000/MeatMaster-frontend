"use client";

import { withLocaleParams } from "@/lib/with-locale-params";
import { AbattageSimpleFlow } from "@/components/simple/abattage-simple-flow";

function AbattageEnregistrerPage() {
  return <AbattageSimpleFlow />;
}

export default withLocaleParams(AbattageEnregistrerPage);
