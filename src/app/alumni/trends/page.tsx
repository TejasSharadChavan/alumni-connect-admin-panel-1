"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { IndustryTrends } from "@/components/shared/industry-trends";

export default function AlumniTrendsPage() {
  return (
    <RoleLayout role="alumni">
      <div className="container mx-auto p-6">
        <IndustryTrends />
      </div>
    </RoleLayout>
  );
}
