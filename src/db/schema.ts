import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Users table - Core authentication and user management
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // 'admin', 'student', 'alumni', 'faculty'
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'active'
  branch: text("branch"),
  cohort: text("cohort"),
  yearOfPassing: integer("year_of_passing"),
  department: text("department"),
  headline: text("headline"),
  bio: text("bio"),
  skills: text("skills", { mode: "json" }), // JSON array
  profileImageUrl: text("profile_image_url"),
  coverImageUrl: text("cover_image_url"),
  resumeUrl: text("resume_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  phone: text("phone"),
  onlineStatus: integer("online_status", { mode: "boolean" }).default(false),
  lastSeen: text("last_seen"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Pending users table - Users awaiting approval
export const pendingUsers = sqliteTable("pending_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  requestedRole: text("requested_role").notNull(),
  submittedData: text("submitted_data", { mode: "json" }), // JSON for additional data
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  submittedAt: text("submitted_at").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: text("reviewed_at"),
});

// Sessions table - Manage user sessions
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Audit log table - Track admin actions
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: integer("actor_id")
    .notNull()
    .references(() => users.id),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(), // 'approve_user', 'reject_user', 'delete_post'
  entityType: text("entity_type").notNull(), // 'user', 'post', 'job'
  entityId: text("entity_id"),
  details: text("details", { mode: "json" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: text("timestamp").notNull(),
});

// Activity log table - Track user activities for analytics
export const activityLog = sqliteTable("activity_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull(),
  action: text("action").notNull(), // 'login', 'view_profile', 'apply_job', 'post_created'
  metadata: text("metadata", { mode: "json" }),
  timestamp: text("timestamp").notNull(),
});

// Posts & Social Feed
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageUrls: text("image_urls", { mode: "json" }), // JSON array for multiple images
  tags: text("tags", { mode: "json" }), // JSON array for hashtags
  sharesCount: integer("shares_count").default(0),
  category: text("category").notNull(), // 'announcement', 'achievement', 'question', 'discussion', 'project'
  branch: text("branch"),
  visibility: text("visibility").notNull().default("public"), // 'public', 'connections', 'private'
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const postReactions = sqliteTable("post_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  reactionType: text("reaction_type").notNull(), // 'like', 'heart', 'celebrate'
  createdAt: text("created_at").notNull(),
});

// Connections/Network
export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requesterId: integer("requester_id")
    .notNull()
    .references(() => users.id),
  responderId: integer("responder_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected'
  message: text("message"),
  createdAt: text("created_at").notNull(),
  respondedAt: text("responded_at"),
});

// Jobs System
export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postedById: integer("posted_by_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  jobType: text("job_type").notNull(), // 'full-time', 'internship', 'part-time'
  salary: text("salary"),
  skills: text("skills", { mode: "json" }), // JSON array
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  branch: text("branch"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id),
  applicantId: integer("applicant_id")
    .notNull()
    .references(() => users.id),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  resumeSummary: text("resume_summary"), // AI-generated resume summary
  matchingScore: integer("matching_score"), // 0-100 score based on job match
  skillsMatch: text("skills_match", { mode: "json" }), // JSON array of matched skills
  experienceMatch: text("experience_match"), // Experience level match analysis
  strengthsWeaknesses: text("strengths_weaknesses", { mode: "json" }), // JSON object with strengths and weaknesses
  aiAnalysis: text("ai_analysis", { mode: "json" }), // Complete AI analysis data
  referralCode: text("referral_code"), // Referral code used
  status: text("status").notNull().default("applied"), // 'applied', 'screening', 'interview', 'rejected', 'accepted'
  appliedAt: text("applied_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Events System
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizerId: integer("organizer_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  category: text("category").notNull(), // 'workshop', 'webinar', 'meetup', 'conference', 'social'
  maxAttendees: integer("max_attendees"),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false),
  price: text("price"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'cancelled'
  branch: text("branch"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  createdAt: text("created_at").notNull(),
});

export const rsvps = sqliteTable("rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("registered"), // 'registered', 'attended', 'cancelled'
  paymentStatus: text("payment_status").notNull().default("na"), // 'pending', 'completed', 'na'
  rsvpedAt: text("rsvped_at").notNull(),
});

// Mentorship
export const mentorshipRequests = sqliteTable("mentorship_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  mentorId: integer("mentor_id")
    .notNull()
    .references(() => users.id),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'completed'
  createdAt: text("created_at").notNull(),
  respondedAt: text("responded_at"),
});

export const mentorshipSessions = sqliteTable("mentorship_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: integer("request_id")
    .notNull()
    .references(() => mentorshipRequests.id),
  scheduledAt: text("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // minutes
  notes: text("notes"),
  studentRating: integer("student_rating"), // 1-5
  mentorRating: integer("mentor_rating"), // 1-5
  studentFeedback: text("student_feedback"),
  mentorFeedback: text("mentor_feedback"),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled'
  completedAt: text("completed_at"),
});

// Teams & Projects
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  projectName: text("project_name"),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'archived'
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull(),
});

export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull().default("member"), // 'leader', 'member', 'mentor'
  joinedAt: text("joined_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => users.id),
  status: text("status").notNull().default("todo"), // 'todo', 'in-progress', 'review', 'done'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const taskComments = sqliteTable("task_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

// Project Submissions
export const projectSubmissions = sqliteTable("project_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  submittedBy: integer("submitted_by")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  repositoryUrl: text("repository_url"),
  demoUrl: text("demo_url"),
  documentUrl: text("document_url"),
  technologies: text("technologies", { mode: "json" }), // JSON array
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'revision_requested'
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: text("reviewed_at"),
  reviewComments: text("review_comments"),
  grade: text("grade"),
  submittedAt: text("submitted_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Messaging
export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatType: text("chat_type").notNull(), // 'direct', 'group'
  name: text("name"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
});

export const chatMembers = sqliteTable("chat_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chats.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  joinedAt: text("joined_at").notNull(),
  lastReadAt: text("last_read_at"),
  isTyping: integer("is_typing", { mode: "boolean" }).default(false),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chats.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // 'text', 'image', 'file'
  fileUrl: text("file_url"),
  mediaUrl: text("media_url"),
  imageUrl: text("image_url"), // For message images
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
  editedAt: text("edited_at"),
});

// Campaigns & Donations
export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goalAmount: integer("goal_amount").notNull(),
  currentAmount: integer("current_amount").notNull().default(0),
  category: text("category").notNull(), // 'education', 'infrastructure', 'scholarship', 'emergency'
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'completed', 'cancelled'
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: text("created_at").notNull(),
});

export const donations = sqliteTable("donations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  donorId: integer("donor_id")
    .notNull()
    .references(() => users.id),
  amount: integer("amount").notNull(),
  message: text("message"),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false),
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  transactionId: text("transaction_id"),
  createdAt: text("created_at").notNull(),
});

// Notifications
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // 'connection', 'job', 'event', 'mentorship', 'message', 'post'
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: text("related_id"),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull(),
});

// Payments
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  relatedType: text("related_type").notNull(), // 'event', 'donation', 'mentorship'
  relatedId: text("related_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed', 'refunded'
  gateway: text("gateway"), // 'razorpay', 'stripe', etc.
  transactionId: text("transaction_id"),
  gatewayResponse: text("gateway_response", { mode: "json" }), // JSON response from gateway
  receiptUrl: text("receipt_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Files Management - For uploaded images, documents, attachments
export const files = sqliteTable("files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // 'image', 'document', 'video', 'audio'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  url: text("url").notNull(),
  storagePath: text("storage_path").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailPath: text("thumbnail_path"),
  relatedType: text("related_type"), // 'post', 'message', 'profile', 'resume', 'task'
  relatedId: text("related_id"),
  metadata: text("metadata", { mode: "json" }), // Additional metadata (width, height, duration, etc.)
  uploadedAt: text("uploaded_at").notNull(),
});

// ML Models Tracking - Store ML model metadata and performance metrics
export const mlModels = sqliteTable("ml_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelName: text("model_name").notNull(), // 'profile_matcher', 'sentiment_analyzer', 'topic_model', etc.
  modelType: text("model_type").notNull(), // 'classification', 'clustering', 'similarity', 'regression'
  version: text("version").notNull(),
  algorithm: text("algorithm").notNull(), // 'tfidf', 'word2vec', 'logistic_regression', 'lda', etc.
  filePath: text("file_path").notNull(), // Path to saved model file
  parameters: text("parameters", { mode: "json" }), // Model hyperparameters
  metrics: text("metrics", { mode: "json" }), // Performance metrics (accuracy, precision, recall, F1, etc.)
  trainingDataCount: integer("training_data_count"),
  features: text("features", { mode: "json" }), // Features used for training
  status: text("status").notNull().default("active"), // 'training', 'active', 'deprecated'
  trainedBy: integer("trained_by").references(() => users.id),
  trainedAt: text("trained_at").notNull(),
  lastUsedAt: text("last_used_at"),
  description: text("description"),
});

// Task Attachments
export const taskAttachments = sqliteTable("task_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  fileId: integer("file_id")
    .notNull()
    .references(() => files.id),
  uploadedBy: integer("uploaded_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
});

// Message Reactions (for chat emoji reactions)
export const messageReactions = sqliteTable("message_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: integer("message_id")
    .notNull()
    .references(() => messages.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  emoji: text("emoji").notNull(),
  createdAt: text("created_at").notNull(),
});

// User Skills - Separate table for better ML analysis
export const userSkills = sqliteTable("user_skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  skillName: text("skill_name").notNull(),
  proficiencyLevel: text("proficiency_level"), // 'beginner', 'intermediate', 'advanced', 'expert'
  yearsOfExperience: integer("years_of_experience"),
  endorsements: integer("endorsements").default(0),
  addedAt: text("added_at").notNull(),
});

// Skill Endorsements
export const skillEndorsements = sqliteTable("skill_endorsements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  skillId: integer("skill_id")
    .notNull()
    .references(() => userSkills.id),
  endorsedBy: integer("endorsed_by")
    .notNull()
    .references(() => users.id),
  endorsedAt: text("endorsed_at").notNull(),
});

// Referrals - Alumni can create referral codes for students
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alumniId: integer("alumni_id")
    .notNull()
    .references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id), // Link to specific job (optional)
  code: text("code").notNull().unique(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  description: text("description"),
  maxUses: integer("max_uses").default(10),
  usedCount: integer("used_count").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull(),
});

// Referral Usage - Track when students use referral codes
export const referralUsage = sqliteTable("referral_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referralId: integer("referral_id")
    .notNull()
    .references(() => referrals.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  applicationId: integer("application_id").references(() => applications.id),
  usedAt: text("used_at").notNull(),
});

// Industry Skills - Alumni post current industry-required skills
export const industrySkills = sqliteTable("industry_skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postedBy: integer("posted_by")
    .notNull()
    .references(() => users.id),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(), // 'technical', 'soft_skill', 'tool', 'framework', 'language'
  industry: text("industry").notNull(), // 'software', 'data_science', 'design', 'marketing', etc.
  demandLevel: text("demand_level").notNull(), // 'high', 'medium', 'low'
  description: text("description"),
  relatedSkills: text("related_skills", { mode: "json" }), // JSON array
  averageSalaryImpact: text("average_salary_impact"), // e.g., "+15%", "$10k-20k"
  learningResources: text("learning_resources", { mode: "json" }), // JSON array of URLs
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Industry Skill Votes - Track who voted on skills
export const industrySkillVotes = sqliteTable("industry_skill_votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  skillId: integer("skill_id")
    .notNull()
    .references(() => industrySkills.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  voteType: text("vote_type").notNull(), // 'upvote', 'downvote'
  createdAt: text("created_at").notNull(),
});
