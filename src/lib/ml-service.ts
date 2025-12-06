/**
 * ML Service for Alumni Connect
 * Provides profile matching, recommendations, and analytics
 */

interface UserProfile {
  id: number;
  name: string;
  role: string;
  branch?: string;
  skills?: string[];
  bio?: string;
  headline?: string;
  yearOfPassing?: number;
}

interface MatchScore {
  userId: number;
  score: number;
  reasons: string[];
}

interface ProfileRating {
  userId: number;
  overallScore: number;
  completeness: number;
  engagement: number;
  expertise: number;
  networkStrength: number;
  breakdown: {
    profileComplete: boolean;
    hasSkills: boolean;
    hasBio: boolean;
    hasConnections: boolean;
    hasActivity: boolean;
  };
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Create TF-IDF vectors for text similarity
 */
function createTFIDFVector(text: string, vocabulary: string[]): number[] {
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  const wordCount = new Map<string, number>();

  words.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  return vocabulary.map((term) => {
    const tf = wordCount.get(term) || 0;
    return tf / words.length;
  });
}

/**
 * Calculate Jaccard similarity for skill matching
 */
function jaccardSimilarity(set1: string[], set2: string[]): number {
  const s1 = new Set(set1.map((s) => s.toLowerCase()));
  const s2 = new Set(set2.map((s) => s.toLowerCase()));

  const intersection = new Set([...s1].filter((x) => s2.has(x)));
  const union = new Set([...s1, ...s2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Match profiles based on skills, interests, and background
 */
export function matchProfiles(
  currentUser: UserProfile,
  candidates: UserProfile[]
): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const candidate of candidates) {
    if (candidate.id === currentUser.id) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Skill similarity (40% weight)
    if (currentUser.skills && candidate.skills) {
      const skillSimilarity = jaccardSimilarity(
        currentUser.skills,
        candidate.skills
      );
      score += skillSimilarity * 40;

      if (skillSimilarity > 0.3) {
        const commonSkills = currentUser.skills.filter((s) =>
          candidate.skills?.some((cs) => cs.toLowerCase() === s.toLowerCase())
        );
        reasons.push(
          `${commonSkills.length} common skills: ${commonSkills.slice(0, 3).join(", ")}`
        );
      }
    }

    // 2. Branch similarity (20% weight)
    if (currentUser.branch && candidate.branch) {
      if (currentUser.branch === candidate.branch) {
        score += 20;
        reasons.push(`Same branch: ${currentUser.branch}`);
      }
    }

    // 3. Role complementarity (20% weight)
    if (currentUser.role === "student" && candidate.role === "alumni") {
      score += 20;
      reasons.push("Alumni mentor available");
    } else if (currentUser.role === "alumni" && candidate.role === "student") {
      score += 15;
      reasons.push("Student seeking guidance");
    } else if (currentUser.role === candidate.role) {
      score += 10;
      reasons.push("Peer connection");
    }

    // 4. Bio/headline similarity (20% weight)
    if (currentUser.bio && candidate.bio) {
      const allText = [
        currentUser.bio,
        candidate.bio,
        currentUser.headline || "",
        candidate.headline || "",
      ].join(" ");
      const vocabulary = Array.from(
        new Set(
          allText
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 2)
        )
      );

      const vec1 = createTFIDFVector(
        (currentUser.bio || "") + " " + (currentUser.headline || ""),
        vocabulary
      );
      const vec2 = createTFIDFVector(
        (candidate.bio || "") + " " + (candidate.headline || ""),
        vocabulary
      );

      const textSimilarity = cosineSimilarity(vec1, vec2);
      score += textSimilarity * 20;

      if (textSimilarity > 0.3) {
        reasons.push("Similar interests and background");
      }
    }

    matches.push({
      userId: candidate.id,
      score: Math.round(score * 10) / 10,
      reasons,
    });
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Rate user profile based on completeness and engagement
 */
export function rateProfile(
  user: UserProfile,
  stats: {
    connectionCount: number;
    postCount: number;
    commentCount: number;
    skillCount: number;
    endorsementCount: number;
  }
): ProfileRating {
  let completeness = 0;
  let engagement = 0;
  let expertise = 0;
  let networkStrength = 0;

  const breakdown = {
    profileComplete: false,
    hasSkills: false,
    hasBio: false,
    hasConnections: false,
    hasActivity: false,
  };

  // 1. Profile Completeness (25 points)
  if (user.name) completeness += 5;
  if (user.headline) completeness += 5;
  if (user.bio && user.bio.length > 50) {
    completeness += 10;
    breakdown.hasBio = true;
  }
  if (user.branch) completeness += 5;

  breakdown.profileComplete = completeness >= 20;

  // 2. Engagement Score (25 points)
  engagement += Math.min(stats.postCount * 3, 10); // Max 10 points
  engagement += Math.min(stats.commentCount * 2, 10); // Max 10 points
  engagement += Math.min(stats.connectionCount, 5); // Max 5 points

  breakdown.hasActivity = stats.postCount > 0 || stats.commentCount > 0;

  // 3. Expertise Score (25 points)
  if (stats.skillCount > 0) {
    expertise += Math.min(stats.skillCount * 2, 15); // Max 15 points
    breakdown.hasSkills = true;
  }
  expertise += Math.min(stats.endorsementCount * 2, 10); // Max 10 points

  // 4. Network Strength (25 points)
  networkStrength += Math.min(stats.connectionCount * 2, 20); // Max 20 points
  if (stats.connectionCount > 5) {
    networkStrength += 5;
    breakdown.hasConnections = true;
  }

  const overallScore = completeness + engagement + expertise + networkStrength;

  return {
    userId: user.id,
    overallScore: Math.round(overallScore),
    completeness: Math.round(completeness),
    engagement: Math.round(engagement),
    expertise: Math.round(expertise),
    networkStrength: Math.round(networkStrength),
    breakdown,
  };
}

/**
 * Generate personalized recommendations
 */
export function generateRecommendations(
  user: UserProfile,
  allUsers: UserProfile[],
  userConnections: number[]
): {
  connectWith: MatchScore[];
  similarProfiles: MatchScore[];
  mentors: MatchScore[];
} {
  // Filter out already connected users
  const availableUsers = allUsers.filter(
    (u) => u.id !== user.id && !userConnections.includes(u.id)
  );

  // Get all matches
  const matches = matchProfiles(user, availableUsers);

  // Top connections to make
  const connectWith = matches.slice(0, 10);

  // Similar profiles (same role)
  const similarProfiles = matches
    .filter((m) => {
      const candidate = allUsers.find((u) => u.id === m.userId);
      return candidate?.role === user.role;
    })
    .slice(0, 5);

  // Potential mentors (alumni with high scores)
  const mentors = matches
    .filter((m) => {
      const candidate = allUsers.find((u) => u.id === m.userId);
      return candidate?.role === "alumni";
    })
    .slice(0, 5);

  return {
    connectWith,
    similarProfiles,
    mentors,
  };
}

/**
 * Analyze skill trends across the platform
 */
export function analyzeSkillTrends(users: UserProfile[]): {
  topSkills: { skill: string; count: number; percentage: number }[];
  emergingSkills: string[];
  skillsByBranch: Record<string, string[]>;
} {
  const skillCount = new Map<string, number>();
  const skillsByBranch: Record<string, Set<string>> = {};

  users.forEach((user) => {
    if (user.skills) {
      user.skills.forEach((skill) => {
        const normalized = skill.toLowerCase();
        skillCount.set(normalized, (skillCount.get(normalized) || 0) + 1);

        if (user.branch) {
          if (!skillsByBranch[user.branch]) {
            skillsByBranch[user.branch] = new Set();
          }
          skillsByBranch[user.branch].add(skill);
        }
      });
    }
  });

  const totalUsers = users.length;
  const topSkills = Array.from(skillCount.entries())
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / totalUsers) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Emerging skills (mentioned by 10-30% of users)
  const emergingSkills = topSkills
    .filter((s) => s.percentage >= 10 && s.percentage <= 30)
    .map((s) => s.skill);

  const skillsByBranchArray: Record<string, string[]> = {};
  Object.entries(skillsByBranch).forEach(([branch, skills]) => {
    skillsByBranchArray[branch] = Array.from(skills);
  });

  return {
    topSkills,
    emergingSkills,
    skillsByBranch: skillsByBranchArray,
  };
}
