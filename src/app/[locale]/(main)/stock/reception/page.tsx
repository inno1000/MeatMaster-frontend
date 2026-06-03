"use client";

import { withLocaleParams } from "@/lib/with-locale-params";
import { ReceptionSimpleFlow } from "@/components/simple/reception-simple-flow";

function StockReceptionPage() {
  return <ReceptionSimpleFlow />;
}

export default withLocaleParams(StockReceptionPage);
