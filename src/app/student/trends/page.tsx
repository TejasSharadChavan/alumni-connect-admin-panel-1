"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { IndustryTrends } from "@/components/shared/industry-trends";

export default function StudentTrendsPage() {
  return (
    <RoleLayout role="student">
      <div className="container mx-auto p-6">
        <IndustryTrends />
      </div>
    </RoleLayout>
  );
}
