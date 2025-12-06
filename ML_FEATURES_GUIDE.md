# 🤖 ML Features & Analytics Guide

## Overview

Alumni Connect now includes advanced machine learning features for intelligent profile matching, recommendations, and comprehensive analytics.

---

## 🚀 Quick Start

### 1. Seed Enhanced Data

Visit `/test-ml` and click "Seed Enhanced Data" to populate:

- 5 diverse students with complete profiles
- 5 experienced alumni mentors
- Realistic connections and network data
- Posts, comments, and reactions
- Messages and chats
- Skills with endorsements
- Mentorship requests

### 2. View Analytics

Navigate to `/analytics` to see:

- Profile strength score
- Network statistics
- Engagement metrics
- AI-powered recommendations

---

## 🎯 ML Features

### 1. Profile Matching Algorithm

**Location:** `src/lib/ml-service.ts` - `matchProfiles()`

**How it works:**

- **Skill Similarity (40%)**: Uses Jaccard similarity to compare skill sets
- **Branch Matching (20%)**: Prioritizes same-branch connections
- **Role Complementarity (20%)**: Matches students with alumni mentors
- **Bio/Headline Similarity (20%)**: Uses TF-IDF vectors and cosine similarity

**API Endpoint:** `GET /api/ml/profile-match?userId={id}`

**Response:**

```json
{
  "success": true,
  "matches": [
    {
      "userId": 123,
      "score": 85.5,
      "reasons": [
        "3 common skills: React, Node.js, TypeScript",
        "Same branch: Computer Engineering"
      ],
      "user": {
        "id": 123,
        "name": "John Doe",
        "headline": "Senior Engineer @ Google",
        "role": "alumni"
      }
    }
  ]
}
```

### 2. Profile Rating System

**Location:** `src/lib/ml-service.ts` - `rateProfile()`

**Scoring Components (100 points total):**

1. **Completeness (25 points)**
   - Name: 5 points
   - Headline: 5 points
   - Bio (50+ chars): 10 points
   - Branch: 5 points

2. **Engagement (25 points)**
   - Posts: 3 points each (max 10)
   - Comments: 2 points each (max 10)
   - Connections: 1 point each (max 5)

3. **Expertise (25 points)**
   - Skills: 2 points each (max 15)
   - Endorsements: 2 points each (max 10)

4. **Network Strength (25 points)**
   - Connections: 2 points each (max 20)
   - Bonus for 5+ connections: 5 points

**API Endpoint:** `GET /api/ml/profile-rating?userId={id}`

**Response:**

```json
{
  "success": true,
  "rating": {
    "userId": 1,
    "overallScore": 78,
    "completeness": 20,
    "engagement": 18,
    "expertise": 22,
    "networkStrength": 18,
    "breakdown": {
      "profileComplete": true,
      "hasSkills": true,
      "hasBio": true,
      "hasConnections": true,
      "hasActivity": true
    }
  }
}
```

### 3. Smart Recommendations

**Location:** `src/lib/ml-service.ts` - `generateRecommendations()`

**Recommendation Types:**

1. **Connection Recommendations**
   - Top 10 profile matches
   - Filtered by existing connections
   - Sorted by match score

2. **Mentor Recommendations**
   - Alumni with high match scores
   - Same or related branch
   - Complementary skills

3. **Job Recommendations** (for students)
   - Skill-based matching
   - Branch alignment
   - Scored by relevance

4. **Event Recommendations**
   - Branch-specific events
   - Category preferences
   - Upcoming events only

**API Endpoint:** `GET /api/ml/recommendations?userId={id}&type={all|connections|jobs|events}`

### 4. Skill Trend Analysis

**Location:** `src/lib/ml-service.ts` - `analyzeSkillTrends()`

**Features:**

- Top 20 most popular skills
- Emerging skills (10-30% adoption)
- Skills by branch breakdown
- Percentage distribution

---

## 📊 Analytics Dashboard

### Overview Tab

**Key Metrics:**

- Total connections
- Total posts
- Total skills
- Engagement level

### Network Tab

**Statistics:**

- Connection count
- Pending requests
- Monthly growth
- Suggested connections with match scores

### Engagement Tab

**Metrics:**

- Content activity (posts, comments)
- Average posts per week
- Skills distribution by proficiency level
- Top endorsed skills

### AI Recommendations Tab

**Personalized Suggestions:**

- Recommended jobs with match scores
- Upcoming events
- Trending skills
- Skill recommendations for your branch

---

## 🔧 Technical Implementation

### Algorithms Used

1. **Jaccard Similarity**

   ```
   J(A,B) = |A ∩ B| / |A ∪ B|
   ```

   Used for skill matching

2. **Cosine Similarity**

   ```
   cos(θ) = (A · B) / (||A|| × ||B||)
   ```

   Used for text similarity (bio, headline)

3. **TF-IDF Vectorization**
   ```
   TF-IDF(t,d) = TF(t,d) × IDF(t)
   ```
   Used for text feature extraction

### Database Schema

**New Tables:**

- `userSkills`: Detailed skill tracking
- `skillEndorsements`: Peer endorsements
- `mlModels`: Model versioning (future use)

**Enhanced Tables:**

- `users`: Added skills JSON field
- `connections`: Network graph data
- `posts`: Engagement tracking

---

## 🎨 UI Components

### Analytics Dashboard

**File:** `src/app/(dashboard)/analytics/page.tsx`

**Features:**

- Real-time data fetching
- Interactive tabs
- Progress bars and charts
- Responsive design

### Test ML Page

**File:** `src/app/(dashboard)/test-ml/page.tsx`

**Features:**

- One-click data seeding
- Feature testing links
- Documentation cards

---

## 📈 Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache profile matches for 1 hour
   - Cache skill trends for 24 hours
   - Invalidate on profile updates

2. **Batch Processing**
   - Process recommendations in batches
   - Limit candidate pool to active users
   - Use database indexes

3. **Lazy Loading**
   - Load recommendations on-demand
   - Paginate large result sets
   - Stream analytics data

### Scalability

**Current Limits:**

- Profile matching: 1000 candidates
- Recommendations: Top 20 results
- Skill analysis: All active users

**Future Enhancements:**

- Implement Redis caching
- Add background job processing
- Use vector databases for similarity search
- Implement collaborative filtering

---

## 🔮 Future ML Features

### Planned Enhancements

1. **Sentiment Analysis**
   - Analyze post sentiment
   - Track community mood
   - Identify trending topics

2. **Collaborative Filtering**
   - "Users like you also connected with..."
   - Job recommendations based on similar profiles
   - Event suggestions from peer behavior

3. **Natural Language Processing**
   - Auto-tag posts
   - Extract skills from resumes
   - Generate profile summaries

4. **Predictive Analytics**
   - Predict connection acceptance
   - Forecast job application success
   - Identify at-risk students

5. **Graph Neural Networks**
   - Advanced network analysis
   - Community detection
   - Influence scoring

---

## 🧪 Testing

### Test Data

**Seed Command:**

```bash
POST /api/seed-enhanced
```

**Test Users:**

- Students: 5 with diverse skills
- Alumni: 5 with industry experience
- Connections: 15+ relationships
- Posts: 5 with engagement
- Messages: 15+ conversations

### Test Scenarios

1. **Profile Matching**
   - Test with different skill sets
   - Verify branch matching
   - Check role complementarity

2. **Profile Rating**
   - Test incomplete profiles
   - Verify score calculations
   - Check breakdown accuracy

3. **Recommendations**
   - Test for different user roles
   - Verify filtering logic
   - Check relevance scores

---

## 📚 API Reference

### Profile Match

```
GET /api/ml/profile-match?userId={id}
```

### Profile Rating

```
GET /api/ml/profile-rating?userId={id}
```

### Recommendations

```
GET /api/ml/recommendations?userId={id}&type={type}
```

### Analytics Dashboard

```
GET /api/analytics/dashboard?userId={id}&range={days}
```

---

## 🎓 Best Practices

### For Developers

1. **Always validate user input**
2. **Handle edge cases** (empty profiles, no connections)
3. **Optimize database queries** (use indexes, limit results)
4. **Cache expensive computations**
5. **Monitor performance metrics**

### For Users

1. **Complete your profile** for better matches
2. **Add relevant skills** to improve recommendations
3. **Stay active** to boost engagement score
4. **Connect with peers** to strengthen network
5. **Endorse skills** to help others

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** No recommendations showing

- **Solution:** Ensure profile has skills and bio filled

**Issue:** Low match scores

- **Solution:** Add more skills and complete profile

**Issue:** Analytics not loading

- **Solution:** Check if user is logged in and has data

**Issue:** Slow performance

- **Solution:** Reduce candidate pool or implement caching

---

## 📞 Support

For questions or issues:

1. Check this documentation
2. Review code comments in `src/lib/ml-service.ts`
3. Test with seed data at `/test-ml`
4. Check API responses for error details

---

**Built with ❤️ using modern ML techniques and Next.js**
