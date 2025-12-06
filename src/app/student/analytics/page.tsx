"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { SkillGapDashboard } from "@/components/student/skill-gap-dashboard";

export default function StudentAnalyticsPage() {
  return (
    <RoleLayout role="student">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Career Analytics & Skill Gap Analysis
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights to accelerate your career growth
          </p>
        </div>
        <SkillGapDashboard />
      </div>
    </RoleLayout>
  );
}
