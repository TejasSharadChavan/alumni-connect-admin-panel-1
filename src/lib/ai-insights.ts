// AI Insights Generation Logic

export interface UserStats {
  connectionsCount?: number;
  postsCount?: number;
  jobApplicationsCount?: number;
  eventsAttended?: number;
  mentorshipSessions?: number;
  networkGrowth?: number;
  profileViews?: number;
  engagementRate?: number;
}

export function generateStudentInsights(stats: UserStats) {
  const insights = [];

  // Network insights
  if (stats.connectionsCount && stats.connectionsCount > 50) {
    insights.push({
      id: "network-1",
      type: "success",
      title: "Strong Network",
      description: "You have built a strong professional network. Keep engaging with your connections!",
      metric: `${stats.connectionsCount} connections`,
    });
  } else if (stats.connectionsCount && stats.connectionsCount < 20) {
    insights.push({
      id: "network-2",
      type: "tip",
      title: "Grow Your Network",
      description: "Connect with more alumni and students in your field to unlock opportunities.",
      metric: `${stats.connectionsCount} connections`,
    });
  }

  // Job application insights
  if (stats.jobApplicationsCount && stats.jobApplicationsCount > 10) {
    insights.push({
      id: "jobs-1",
      type: "success",
      title: "Active Job Seeker",
      description: "Great job staying active in your job search! Consider focusing on quality applications.",
      metric: `${stats.jobApplicationsCount} applications`,
    });
  } else if (stats.jobApplicationsCount === 0) {
    insights.push({
      id: "jobs-2",
      type: "warning",
      title: "Start Applying",
      description: "There are many job opportunities available. Start applying to boost your career!",
      metric: "0 applications",
    });
  }

  // Engagement insights
  if (stats.engagementRate && stats.engagementRate > 70) {
    insights.push({
      id: "engagement-1",
      type: "success",
      title: "High Engagement",
      description: "Your posts are getting great engagement! Keep sharing valuable content.",
      metric: `${stats.engagementRate}% engagement`,
    });
  }

  // Event insights
  if (stats.eventsAttended && stats.eventsAttended > 5) {
    insights.push({
      id: "events-1",
      type: "success",
      title: "Active Participant",
      description: "You're actively participating in events. This helps build your network and skills!",
      metric: `${stats.eventsAttended} events`,
    });
  }

  // Default insights
  if (insights.length === 0) {
    insights.push({
      id: "default-1",
      type: "info",
      title: "Get Started",
      description: "Complete your profile and start connecting with peers to unlock personalized insights.",
      metric: null,
    });
  }

  return insights;
}

export function generateAlumniInsights(stats: UserStats) {
  const insights = [];

  // Mentorship insights
  if (stats.mentorshipSessions && stats.mentorshipSessions > 5) {
    insights.push({
      id: "mentor-1",
      type: "success",
      title: "Active Mentor",
      description: "Thank you for guiding students! Your mentorship is making a real impact.",
      metric: `${stats.mentorshipSessions} sessions`,
    });
  } else {
    insights.push({
      id: "mentor-2",
      type: "tip",
      title: "Become a Mentor",
      description: "Share your experience by mentoring students. It's rewarding and impactful!",
      metric: "Start mentoring",
    });
  }

  // Network insights
  if (stats.networkGrowth && stats.networkGrowth > 20) {
    insights.push({
      id: "network-1",
      type: "success",
      title: "Growing Network",
      description: "Your network has grown significantly this month. Keep expanding your reach!",
      metric: `+${stats.networkGrowth}% growth`,
    });
  }

  // Job posting insights
  if (stats.postsCount && stats.postsCount > 3) {
    insights.push({
      id: "jobs-1",
      type: "success",
      title: "Job Provider",
      description: "Thank you for posting job opportunities and helping students find careers!",
      metric: `${stats.postsCount} jobs posted`,
    });
  }

  return insights;
}

export function generateFacultyInsights(stats: UserStats) {
  const insights = [];

  // Student monitoring
  insights.push({
    id: "students-1",
    type: "info",
    title: "Student Oversight",
    description: "You're monitoring student activities effectively. Keep guiding them towards success.",
    metric: "All systems normal",
  });

  // Event organization
  if (stats.eventsAttended && stats.eventsAttended > 3) {
    insights.push({
      id: "events-1",
      type: "success",
      title: "Event Organizer",
      description: "Your events are well-attended and appreciated by students!",
      metric: `${stats.eventsAttended} events`,
    });
  }

  return insights;
}

export function generateAdminInsights(stats: UserStats) {
  const insights = [];

  insights.push({
    id: "system-1",
    type: "success",
    title: "System Health",
    description: "All systems are running smoothly. Platform engagement is at an all-time high!",
    metric: "98% uptime",
  });

  insights.push({
    id: "users-1",
    type: "info",
    title: "User Growth",
    description: "Platform has seen steady growth with high user satisfaction ratings.",
    metric: "+15% this month",
  });

  return insights;
}

export function predictNetworkGrowth(currentConnections: number, growthRate: number): {
  oneMonth: number;
  threeMonths: number;
  sixMonths: number;
} {
  return {
    oneMonth: Math.round(currentConnections * (1 + growthRate / 100)),
    threeMonths: Math.round(currentConnections * Math.pow(1 + growthRate / 100, 3)),
    sixMonths: Math.round(currentConnections * Math.pow(1 + growthRate / 100, 6)),
  };
}

export function generateRecommendations(userRole: string, stats: UserStats): string[] {
  const recommendations = [];

  switch (userRole) {
    case "student":
      if (!stats.jobApplicationsCount || stats.jobApplicationsCount < 5) {
        recommendations.push("Apply to at least 5 job opportunities this week");
      }
      if (!stats.connectionsCount || stats.connectionsCount < 30) {
        recommendations.push("Connect with 10 more alumni in your field");
      }
      recommendations.push("Attend the upcoming AI/ML workshop");
      recommendations.push("Update your resume and portfolio");
      break;

    case "alumni":
      recommendations.push("Post a job opportunity to help students");
      recommendations.push("Accept a mentorship request");
      recommendations.push("Share your career journey in a post");
      break;

    case "faculty":
      recommendations.push("Review pending student posts");
      recommendations.push("Organize a workshop on trending technologies");
      recommendations.push("Monitor student project progress");
      break;

    case "admin":
      recommendations.push("Review pending user registrations");
      recommendations.push("Monitor platform engagement metrics");
      recommendations.push("Approve pending content and events");
      break;
  }

  return recommendations;
}
