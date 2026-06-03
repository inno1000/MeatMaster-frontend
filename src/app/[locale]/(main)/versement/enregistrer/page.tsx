"use client";

import { withLocaleParams } from "@/lib/with-locale-params";
import { VersementSimpleFlow } from "@/components/simple/versement-simple-flow";

function VersementEnregistrerPage() {
  return <VersementSimpleFlow />;
}

export default withLocaleParams(VersementEnregistrerPage);
