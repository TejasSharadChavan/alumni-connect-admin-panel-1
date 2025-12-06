interface User {
  headline?: string;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  profileImageUrl?: string;
}

export function calculateProfileCompleteness(user: User | null): number {
  if (!user) return 20; // Base score for having an account

  let score = 20; // Base score

  if (user.headline) score += 15;
  if (user.bio) score += 20;
  if (user.skills && user.skills.length > 0) {
    score += 10 * Math.min(user.skills.length, 3); // Max 30 points for skills
  }
  if (user.linkedinUrl) score += 10;
  if (user.githubUrl) score += 10;
  if (user.profileImageUrl) score += 15;

  return Math.min(100, score);
}
