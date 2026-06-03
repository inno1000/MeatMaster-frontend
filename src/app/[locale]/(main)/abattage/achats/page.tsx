"use client";

import { withLocaleParams } from "@/lib/with-locale-params";
import { AchatSimpleFlow } from "@/components/simple/achat-simple-flow";

function AbattageAchatsPage() {
  return <AchatSimpleFlow />;
}

export default withLocaleParams(AbattageAchatsPage);
