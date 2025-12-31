// Centralized realistic data service for consistent platform-wide data
export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  students: {
    total: number;
    active: number;
    graduated: number;
    seeking_mentorship: number;
    seeking_jobs: number;
  };
  alumni: {
    total: number;
    active: number;
    mentoring: number;
    hiring: number;
    donating: number;
  };
  faculty: {
    total: number;
    active: number;
  };
  relationships: {
    total_connections: number;
    active_mentorships: number;
    successful_placements: number;
    avg_relationship_duration: string;
    success_rate: number;
  };
  engagement: {
    daily_active_users: number;
    avg_session_duration: string;
    messages_sent_daily: number;
    events_attended_monthly: number;
    platform_retention_rate: number;
  };
  jobs: {
    total_posted: number;
    active_postings: number;
    applications_submitted: number;
    successful_placements: number;
    avg_salary: string;
  };
  events: {
    total_events: number;
    upcoming_events: number;
    total_attendees: number;
    avg_attendance_rate: number;
  };
}

export interface IndustryData {
  name: string;
  alumni_count: number;
  student_count: number;
  active_connections: number;
  job_postings: number;
  placement_rate: number;
  avg_salary: string;
  growth_rate: number;
}

export interface RelationshipTimeline {
  period: string;
  connections: number;
  active_rate: number;
  success_rate: number;
  avg_duration: string;
  description: string;
}

export interface EngagementMetric {
  metric: string;
  current_value: string;
  benchmark: string;
  performance: "excellent" | "good" | "needs_improvement";
  trend: "up" | "down" | "stable";
  change_percentage: string;
}

class RealisticDataService {
  private static instance: RealisticDataService;
  private baseDate = new Date("2024-01-01");

  public static getInstance(): RealisticDataService {
    if (!RealisticDataService.instance) {
      RealisticDataService.instance = new RealisticDataService();
    }
    return RealisticDataService.instance;
  }

  // Generate realistic platform statistics
  getPlatformStats(): PlatformStats {
    const currentDate = new Date();
    const monthsSinceStart = Math.floor(
      (currentDate.getTime() - this.baseDate.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );

    // Base numbers that grow over time
    const baseStudents = 1200 + monthsSinceStart * 45;
    const baseAlumni = 800 + monthsSinceStart * 25;
    const baseFaculty = 45 + Math.floor(monthsSinceStart * 1.2);

    return {
      totalUsers: baseStudents + baseAlumni + baseFaculty,
      activeUsers: Math.floor((baseStudents + baseAlumni) * 0.68), // 68% active rate
      newUsersThisMonth: 42 + Math.floor(Math.random() * 15),

      students: {
        total: baseStudents,
        active: Math.floor(baseStudents * 0.72),
        graduated: Math.floor(baseStudents * 0.15),
        seeking_mentorship: Math.floor(baseStudents * 0.34),
        seeking_jobs: Math.floor(baseStudents * 0.28),
      },

      alumni: {
        total: baseAlumni,
        active: Math.floor(baseAlumni * 0.63),
        mentoring: Math.floor(baseAlumni * 0.31),
        hiring: Math.floor(baseAlumni * 0.18),
        donating: Math.floor(baseAlumni * 0.12),
      },

      faculty: {
        total: baseFaculty,
        active: Math.floor(baseFaculty * 0.89),
      },

      relationships: {
        total_connections: Math.floor((baseStudents + baseAlumni) * 0.43),
        active_mentorships: 387,
        successful_placements: 89,
        avg_relationship_duration: "8.3 months",
        success_rate: 84.2,
      },

      engagement: {
        daily_active_users: Math.floor((baseStudents + baseAlumni) * 0.34),
        avg_session_duration: "24m 32s",
        messages_sent_daily: 1456,
        events_attended_monthly: 892,
        platform_retention_rate: 78.4,
      },

      jobs: {
        total_posted: 234,
        active_postings: 67,
        applications_submitted: 1823,
        successful_placements: 89,
        avg_salary: "$78,500",
      },

      events: {
        total_events: 156,
        upcoming_events: 12,
        total_attendees: 3247,
        avg_attendance_rate: 68.2,
      },
    };
  }

  // Get industry breakdown data
  getIndustryData(): IndustryData[] {
    return [
      {
        name: "Technology",
        alumni_count: 342,
        student_count: 456,
        active_connections: 123,
        job_postings: 45,
        placement_rate: 78.3,
        avg_salary: "$92,000",
        growth_rate: 15.2,
      },
      {
        name: "Finance",
        alumni_count: 198,
        student_count: 234,
        active_connections: 89,
        job_postings: 23,
        placement_rate: 82.1,
        avg_salary: "$87,500",
        growth_rate: 8.7,
      },
      {
        name: "Healthcare",
        alumni_count: 156,
        student_count: 189,
        active_connections: 67,
        job_postings: 18,
        placement_rate: 71.4,
        avg_salary: "$76,200",
        growth_rate: 12.3,
      },
      {
        name: "Education",
        alumni_count: 134,
        student_count: 167,
        active_connections: 45,
        job_postings: 12,
        placement_rate: 69.8,
        avg_salary: "$58,900",
        growth_rate: 5.1,
      },
      {
        name: "Consulting",
        alumni_count: 123,
        student_count: 145,
        active_connections: 56,
        job_postings: 15,
        placement_rate: 85.2,
        avg_salary: "$95,300",
        growth_rate: 18.9,
      },
      {
        name: "Manufacturing",
        alumni_count: 98,
        student_count: 123,
        active_connections: 34,
        job_postings: 9,
        placement_rate: 73.6,
        avg_salary: "$68,400",
        growth_rate: 3.2,
      },
      {
        name: "Non-Profit",
        alumni_count: 87,
        student_count: 98,
        active_connections: 28,
        job_postings: 6,
        placement_rate: 65.3,
        avg_salary: "$52,100",
        growth_rate: 7.8,
      },
      {
        name: "Government",
        alumni_count: 76,
        student_count: 89,
        active_connections: 23,
        job_postings: 8,
        placement_rate: 71.2,
        avg_salary: "$64,800",
        growth_rate: 2.1,
      },
    ];
  }

  // Get relationship timeline data
  getRelationshipTimeline(): RelationshipTimeline[] {
    return [
      {
        period: "0-3 months",
        connections: 234,
        active_rate: 89.2,
        success_rate: 76.8,
        avg_duration: "2.1 months",
        description: "Initial connection and rapport building phase",
      },
      {
        period: "3-6 months",
        connections: 187,
        active_rate: 76.4,
        success_rate: 82.3,
        avg_duration: "4.7 months",
        description: "Active mentoring and skill development",
      },
      {
        period: "6-12 months",
        connections: 156,
        active_rate: 68.1,
        success_rate: 87.9,
        avg_duration: "8.9 months",
        description: "Career guidance and job search support",
      },
      {
        period: "12+ months",
        connections: 89,
        active_rate: 45.2,
        success_rate: 91.5,
        avg_duration: "18.3 months",
        description: "Long-term professional relationship and networking",
      },
    ];
  }

  // Get engagement metrics with benchmarks
  getEngagementMetrics(): EngagementMetric[] {
    return [
      {
        metric: "Average Session Duration",
        current_value: "24m 32s",
        benchmark: "18m 45s",
        performance: "excellent",
        trend: "up",
        change_percentage: "+8.3%",
      },
      {
        metric: "Monthly Active Users",
        current_value: "1,923",
        benchmark: "1,500",
        performance: "excellent",
        trend: "up",
        change_percentage: "+12.7%",
      },
      {
        metric: "Message Response Rate",
        current_value: "76.4%",
        benchmark: "65%",
        performance: "good",
        trend: "up",
        change_percentage: "+5.2%",
      },
      {
        metric: "Event Attendance Rate",
        current_value: "68.2%",
        benchmark: "55%",
        performance: "excellent",
        trend: "up",
        change_percentage: "+3.8%",
      },
      {
        metric: "Profile Completion Rate",
        current_value: "84.7%",
        benchmark: "70%",
        performance: "excellent",
        trend: "stable",
        change_percentage: "+1.2%",
      },
      {
        metric: "Feature Adoption Rate",
        current_value: "59.3%",
        benchmark: "45%",
        performance: "good",
        trend: "up",
        change_percentage: "+7.1%",
      },
      {
        metric: "User Retention (30-day)",
        current_value: "78.4%",
        benchmark: "65%",
        performance: "excellent",
        trend: "up",
        change_percentage: "+4.6%",
      },
      {
        metric: "Support Ticket Resolution",
        current_value: "94.2%",
        benchmark: "85%",
        performance: "excellent",
        trend: "stable",
        change_percentage: "+0.8%",
      },
    ];
  }

  // Get realistic user growth data for charts
  getUserGrowthData(months: number = 12) {
    const data = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      // Simulate realistic growth with some variance
      const baseGrowth = 35 + (months - i) * 2;
      const variance = Math.floor(Math.random() * 15) - 7; // ±7 variance
      const newUsers = Math.max(15, baseGrowth + variance);

      data.push({
        month: monthName,
        students: Math.floor(newUsers * 0.65),
        alumni: Math.floor(newUsers * 0.35),
        total: newUsers,
      });
    }

    return data;
  }

  // Get realistic job market data
  getJobMarketData() {
    return {
      totalJobs: 234,
      activeJobs: 67,
      averageSalary: 78500,
      salaryRange: {
        min: 45000,
        max: 150000,
        median: 72000,
      },
      topSkillsInDemand: [
        { skill: "JavaScript", demand: 89, growth: "+15%" },
        { skill: "Python", demand: 76, growth: "+22%" },
        { skill: "React", demand: 67, growth: "+18%" },
        { skill: "Node.js", demand: 54, growth: "+12%" },
        { skill: "AWS", demand: 48, growth: "+28%" },
        { skill: "SQL", demand: 45, growth: "+8%" },
        { skill: "Docker", demand: 38, growth: "+35%" },
        { skill: "Machine Learning", demand: 32, growth: "+42%" },
      ],
      placementsByIndustry: this.getIndustryData().map((industry) => ({
        industry: industry.name,
        placements: Math.floor(
          (industry.placement_rate * industry.job_postings) / 100
        ),
        rate: industry.placement_rate,
      })),
    };
  }

  // Get realistic mentorship data
  getMentorshipData() {
    return {
      totalMentorships: 387,
      activeMentorships: 312,
      completedMentorships: 156,
      averageDuration: "8.3 months",
      successRate: 84.2,
      satisfactionScore: 4.7,
      mentorshipsByStage: [
        { stage: "Getting Started", count: 89, percentage: 23 },
        { stage: "Active Mentoring", count: 134, percentage: 35 },
        { stage: "Career Transition", count: 89, percentage: 23 },
        { stage: "Long-term Support", count: 75, percentage: 19 },
      ],
      outcomeMetrics: {
        jobOffers: 67,
        salaryIncrease: "+23%",
        skillImprovement: 4.6,
        networkExpansion: "+156%",
        confidenceBoost: 4.8,
      },
    };
  }
}

export const realisticData = RealisticDataService.getInstance();
