"use client";

import { withLocaleParams } from "@/lib/with-locale-params";
import { DistributionsListView } from "@/components/features/distributions-list-view";

function AbattageListePage() {
  return <DistributionsListView />;
}

export default withLocaleParams(AbattageListePage);
