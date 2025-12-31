# AI-Powered Resume Analysis & Job Matching System

## Overview

This feature implements a comprehensive AI-powered resume analysis system that helps students understand how well their resumes match job requirements and enables alumni/job creators to efficiently evaluate candidates with intelligent ratings.

## Features

### For Students (Job Applicants)

#### 1. **Smart Resume Analysis**

- **Real-time AI Analysis**: Upload your resume (PDF) and get instant AI-powered analysis
- **Job Match Scoring**: Get a 0-100% match score based on job requirements
- **Skills Matching**: See which of your skills match the job requirements
- **Experience Analysis**: Get feedback on how your experience aligns with the role
- **Strengths & Weaknesses**: Identify your strong points and areas for improvement
- **Personalized Recommendations**: Receive actionable advice to improve your application

#### 2. **Enhanced Job Application Process**

- Upload resume during job application
- Get instant analysis before submitting
- Include AI analysis data with your application
- Professional resume summary generation

### For Alumni/Job Creators

#### 1. **Intelligent Applicant Management**

- **Smart Filtering**: Filter applicants by match score, status, and other criteria
- **AI-Generated Insights**: View AI analysis for each applicant
- **Rating-Based Sorting**: Sort candidates by their AI match scores
- **Comprehensive Applicant Profiles**: See detailed analysis including strengths, weaknesses, and recommendations

#### 2. **Advanced Applicant Dashboard**

- **Statistics Overview**: View application statistics and score distributions
- **Status Management**: Update application status (Applied → Screening → Interview → Accepted/Rejected)
- **Detailed Candidate View**: Access complete AI analysis, resume, cover letter, and contact information
- **Referral Tracking**: See which applicants used referral codes

## Technical Implementation

### AI Analysis Components

#### 1. **Resume Text Extraction**

- PDF parsing using `pdf-parse` library
- Text extraction and cleaning
- Support for various resume formats

#### 2. **OpenAI Integration**

- GPT-4o-mini model for analysis
- Professional HR-focused prompts
- Structured JSON response parsing
- Error handling and fallbacks

#### 3. **Scoring Algorithm**

The AI uses a weighted scoring system:

- **Skills Match (40%)**: How many required skills the candidate possesses
- **Experience Relevance (30%)**: Relevance of work experience to the role
- **Education/Qualifications (15%)**: Educational background alignment
- **Achievements/Projects (15%)**: Notable accomplishments and projects

### Database Schema Updates

New columns added to `applications` table:

- `resume_summary`: AI-generated professional summary
- `matching_score`: 0-100 match score
- `skills_match`: JSON array of matched skills
- `experience_match`: Experience level analysis
- `strengths_weaknesses`: JSON object with strengths and weaknesses
- `ai_analysis`: Complete AI analysis data
- `referral_code`: Referral code used (if any)

### API Endpoints

#### 1. **Resume Analysis API**

- `POST /api/resume/analyze`
- Accepts multipart form data with resume file and job ID
- Returns comprehensive AI analysis

#### 2. **Job Applicants API**

- `GET /api/jobs/[id]/applicants` - Get all applicants with filtering
- `PATCH /api/jobs/[id]/applicants` - Update application status

#### 3. **Enhanced Job Application API**

- Updated `POST /api/jobs/[id]/apply` to include AI analysis data

## User Experience Flow

### Student Application Flow

1. **Browse Jobs**: Student finds interesting job opportunity
2. **Start Application**: Click "Apply Now" button
3. **Upload Resume**: Upload PDF resume file
4. **AI Analysis**: System automatically analyzes resume against job requirements
5. **Review Results**: Student sees match score, strengths, weaknesses, and recommendations
6. **Complete Application**: Add cover letter and referral code (optional)
7. **Submit**: Application is submitted with AI analysis data

### Alumni Review Flow

1. **View Job Postings**: Alumni sees their posted jobs
2. **Check Applicants**: Click "Applicants" button on job card
3. **Filter & Sort**: Use filters to find best candidates (score, status, etc.)
4. **Review Candidates**: View detailed AI analysis for each applicant
5. **Make Decisions**: Update application status based on AI insights and manual review
6. **Contact Candidates**: Use provided contact information for next steps

## Key Benefits

### For Students

- **Better Self-Awareness**: Understand resume strengths and weaknesses
- **Targeted Improvements**: Get specific recommendations for resume enhancement
- **Competitive Advantage**: Submit applications with professional AI analysis
- **Real-time Feedback**: No need to wait for human review

### For Alumni/Recruiters

- **Efficient Screening**: Quickly identify top candidates using AI scores
- **Objective Analysis**: Reduce bias with AI-powered candidate evaluation
- **Time Savings**: Focus on high-scoring candidates first
- **Comprehensive Insights**: Get detailed analysis beyond just resume scanning
- **Better Hiring Decisions**: Make informed decisions with AI-backed data

## Configuration

### Environment Variables Required

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Dependencies Added

- `openai`: OpenAI API client
- `pdf-parse`: PDF text extraction

## Usage Examples

### Student Resume Analysis

```typescript
// Component usage
<ResumeAnalyzer
  jobId={jobId}
  onAnalysisComplete={(analysis) => {
    console.log('Match Score:', analysis.matchingScore);
    console.log('Matched Skills:', analysis.skillsMatch);
  }}
/>
```

### Alumni Applicant Management

```typescript
// Component usage
<JobApplicantsView
  jobId={jobId}
  jobTitle={jobTitle}
/>
```

## Future Enhancements

1. **Multi-format Support**: Support for DOC/DOCX files
2. **Batch Analysis**: Analyze multiple resumes at once
3. **Custom Scoring Weights**: Allow recruiters to customize scoring criteria
4. **Interview Scheduling**: Integrate with calendar systems
5. **Email Integration**: Automated email responses based on status changes
6. **Analytics Dashboard**: Track hiring metrics and AI accuracy
7. **Resume Suggestions**: AI-powered resume improvement suggestions
8. **Video Analysis**: Analyze video introductions or interviews

## Security & Privacy

- Resume files are processed securely
- AI analysis data is stored encrypted
- Personal information is protected according to privacy policies
- OpenAI API calls are made server-side only
- File uploads are validated and size-limited

## Performance Considerations

- AI analysis typically takes 3-10 seconds
- PDF processing is optimized for common resume formats
- Database queries are optimized with proper indexing
- Caching can be implemented for repeated analyses

This feature significantly enhances the job application and recruitment process by providing intelligent, AI-powered insights that benefit both job seekers and recruiters.
