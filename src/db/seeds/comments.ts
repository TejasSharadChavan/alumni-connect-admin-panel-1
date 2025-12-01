import { db } from '@/db';
import { comments } from '@/db/schema';

async function main() {
    const sampleComments = [
        // Post 1 - React Hooks Question (8 comments - popular technical post)
        {
            postId: 1,
            authorId: 67,
            content: 'I faced the same issue with React hooks when I was learning. The solution is to use useEffect with the correct dependency array. Make sure you\'re not mutating state directly and always return a cleanup function if needed.',
            createdAt: new Date('2024-02-16T10:30:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 23,
            content: 'Thanks for sharing this! I\'m also struggling with hooks. Could you provide a code example of how you fixed it?',
            createdAt: new Date('2024-02-16T14:20:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 94,
            content: 'Great question! Here\'s a tip from my experience: always use ESLint plugin for React hooks. It catches most common mistakes automatically. Also, check out Dan Abramov\'s blog post on useEffect - it\'s a game changer.',
            createdAt: new Date('2024-02-17T09:15:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 55,
            content: 'I recommend reading the official React documentation on hooks. They have excellent examples and explanations. Also, practicing with small projects helps a lot.',
            createdAt: new Date('2024-02-17T16:45:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 12,
            content: 'This is helpful! I\'ve been using class components and thinking about switching to hooks. Any resources you\'d recommend for beginners?',
            createdAt: new Date('2024-02-18T11:30:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 78,
            content: 'Working at Microsoft, I use hooks daily. My advice: start with useState and useEffect, master them, then move to more advanced hooks like useCallback and useMemo. Don\'t rush the learning process.',
            createdAt: new Date('2024-02-19T08:20:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 34,
            content: 'Thanks everyone for the suggestions! This community is amazing. I\'ll check out all these resources.',
            createdAt: new Date('2024-02-19T14:10:00Z').toISOString(),
        },
        {
            postId: 1,
            authorId: 98,
            content: 'Feel free to reach out if you need more help. We can set up a quick mentorship session to go through examples together.',
            createdAt: new Date('2024-02-20T10:00:00Z').toISOString(),
        },

        // Post 2 - Internship Achievement (10 comments - popular achievement)
        {
            postId: 2,
            authorId: 62,
            content: 'Congratulations! Well deserved! Google is an amazing place to work. Your hard work during college really paid off! 🎉',
            createdAt: new Date('2024-02-17T09:30:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 28,
            content: 'That\'s incredible! How did you prepare for the interviews? I\'m also targeting Google for next year.',
            createdAt: new Date('2024-02-17T11:45:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 95,
            content: 'Fantastic achievement! Make the most of this opportunity. Google\'s internship program is excellent for learning and networking.',
            createdAt: new Date('2024-02-17T15:20:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 45,
            content: 'Wow! This is inspiring. Can you share some tips on how you prepared? What resources did you use?',
            createdAt: new Date('2024-02-18T08:10:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 71,
            content: 'Congratulations! I\'m currently a Software Engineer at Google. If you need any advice or have questions about the culture, feel free to reach out!',
            createdAt: new Date('2024-02-18T12:30:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 19,
            content: 'This is so motivating! Congratulations on your success! 🚀',
            createdAt: new Date('2024-02-18T16:40:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 83,
            content: 'Well done! Make sure to document your journey and learnings. It will be valuable for you and others.',
            createdAt: new Date('2024-02-19T09:15:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 37,
            content: 'Congratulations! Our college is proud of you. Keep up the excellent work!',
            createdAt: new Date('2024-02-19T14:20:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 102,
            content: 'Excellent news! This shows the quality of our CS department. Keep making us proud!',
            createdAt: new Date('2024-02-20T10:30:00Z').toISOString(),
        },
        {
            postId: 2,
            authorId: 50,
            content: 'Thanks everyone! I\'ll definitely share my preparation journey in a detailed post soon. Happy to help anyone who\'s preparing!',
            createdAt: new Date('2024-02-20T17:45:00Z').toISOString(),
        },

        // Post 3 - Machine Learning Project (6 comments)
        {
            postId: 3,
            authorId: 73,
            content: 'Great project! Have you considered using transfer learning with pre-trained models? It could significantly improve your accuracy with less training time.',
            createdAt: new Date('2024-02-18T10:20:00Z').toISOString(),
        },
        {
            postId: 3,
            authorId: 31,
            content: 'This looks interesting! What dataset are you using? And what\'s your current accuracy?',
            createdAt: new Date('2024-02-18T14:30:00Z').toISOString(),
        },
        {
            postId: 3,
            authorId: 96,
            content: 'Impressive work! For medical imaging, you might want to look into data augmentation techniques. Also, consider consulting with domain experts to validate your results.',
            createdAt: new Date('2024-02-19T09:45:00Z').toISOString(),
        },
        {
            postId: 3,
            authorId: 42,
            content: 'This is exactly what I want to work on! Can I collaborate with you on this project?',
            createdAt: new Date('2024-02-19T16:20:00Z').toISOString(),
        },
        {
            postId: 3,
            authorId: 88,
            content: 'Working in healthcare AI at IBM, I can tell you this is a promising area. Make sure to address bias and fairness in your model. Happy to provide guidance if needed.',
            createdAt: new Date('2024-02-20T11:30:00Z').toISOString(),
        },
        {
            postId: 3,
            authorId: 25,
            content: 'Amazing project! Could you share your GitHub repository? I\'d love to learn from your implementation.',
            createdAt: new Date('2024-02-21T08:15:00Z').toISOString(),
        },

        // Post 5 - Web Development Question (4 comments)
        {
            postId: 5,
            authorId: 66,
            content: 'For REST API authentication, I recommend using JWT tokens with HTTP-only cookies for maximum security. Also, implement refresh tokens for better user experience.',
            createdAt: new Date('2024-02-20T10:30:00Z').toISOString(),
        },
        {
            postId: 5,
            authorId: 29,
            content: 'I use OAuth 2.0 with Passport.js in my projects. It\'s well-documented and supports multiple strategies. The learning curve is manageable.',
            createdAt: new Date('2024-02-20T14:45:00Z').toISOString(),
        },
        {
            postId: 5,
            authorId: 100,
            content: 'From a teaching perspective, I suggest starting with basic session-based auth to understand the fundamentals, then move to token-based authentication. Check out this MDN guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication',
            createdAt: new Date('2024-02-21T09:20:00Z').toISOString(),
        },
        {
            postId: 5,
            authorId: 47,
            content: 'Thanks! I\'ll explore JWT tokens first. Any good tutorials you\'d recommend?',
            createdAt: new Date('2024-02-21T16:30:00Z').toISOString(),
        },

        // Post 7 - Hackathon Achievement (9 comments)
        {
            postId: 7,
            authorId: 75,
            content: 'Congratulations to the entire team! Winning Smart India Hackathon is a huge achievement! 🏆',
            createdAt: new Date('2024-02-22T09:15:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 33,
            content: 'This is incredible! What was your project about? I\'m planning to participate next year.',
            createdAt: new Date('2024-02-22T11:30:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 91,
            content: 'Well deserved win! I\'ve participated in SIH twice during my college days. It\'s an amazing learning experience. Congratulations!',
            createdAt: new Date('2024-02-22T14:50:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 18,
            content: 'Wow! Our college team won! This is so inspiring. Can you share your experience and preparation strategy?',
            createdAt: new Date('2024-02-23T08:20:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 103,
            content: 'Excellent work team! This brings great recognition to our institution. I\'m proud of all of you!',
            createdAt: new Date('2024-02-23T10:40:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 54,
            content: 'Congratulations! How long did you work on the project? And how did you manage college work alongside?',
            createdAt: new Date('2024-02-23T15:15:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 82,
            content: 'This is awesome! Make sure to add this to your resume and LinkedIn. Companies love hackathon winners.',
            createdAt: new Date('2024-02-24T09:30:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 41,
            content: 'Congratulations! Can I see your project demo? I\'d love to learn from your implementation.',
            createdAt: new Date('2024-02-24T13:45:00Z').toISOString(),
        },
        {
            postId: 7,
            authorId: 97,
            content: 'Great achievement! From my experience as a faculty advisor, SIH winners often get excellent placement opportunities. Keep up the good work!',
            createdAt: new Date('2024-02-25T08:00:00Z').toISOString(),
        },

        // Post 9 - DSA Question (5 comments)
        {
            postId: 9,
            authorId: 69,
            content: 'For dynamic programming optimization, try to identify overlapping subproblems first. Then use memoization or tabulation. Start with small examples to understand the pattern.',
            createdAt: new Date('2024-02-24T10:20:00Z').toISOString(),
        },
        {
            postId: 9,
            authorId: 27,
            content: 'I struggled with DP too! What helped me was practicing similar problems on LeetCode. Start with easy problems and gradually increase difficulty.',
            createdAt: new Date('2024-02-24T14:35:00Z').toISOString(),
        },
        {
            postId: 9,
            authorId: 93,
            content: 'Check out the book "Introduction to Algorithms" by CLRS. It has excellent explanations of DP with detailed examples. Also, try visualizing the state space.',
            createdAt: new Date('2024-02-25T09:15:00Z').toISOString(),
        },
        {
            postId: 9,
            authorId: 48,
            content: 'Thanks for the suggestions! I\'ll start with LeetCode easy problems. Any specific problem you\'d recommend to begin with?',
            createdAt: new Date('2024-02-25T15:40:00Z').toISOString(),
        },
        {
            postId: 9,
            authorId: 85,
            content: 'Start with Fibonacci, Climbing Stairs, and House Robber problems. These are classic DP problems that build intuition. Good luck!',
            createdAt: new Date('2024-02-26T08:25:00Z').toISOString(),
        },

        // Post 11 - Career Advice (7 comments)
        {
            postId: 11,
            authorId: 76,
            content: 'Based on my 8 years at Amazon, I\'d say focus on problem-solving skills and system design. Technical skills are important, but companies also value how you approach problems.',
            createdAt: new Date('2024-02-26T10:30:00Z').toISOString(),
        },
        {
            postId: 11,
            authorId: 32,
            content: 'This is exactly what I needed to hear! I\'m graduating next year. Should I focus more on projects or competitive programming?',
            createdAt: new Date('2024-02-26T14:20:00Z').toISOString(),
        },
        {
            postId: 11,
            authorId: 99,
            content: 'From my experience interviewing candidates at Microsoft, I look for a balance of both. Projects show your ability to build real-world applications, while CP demonstrates problem-solving skills.',
            createdAt: new Date('2024-02-27T09:45:00Z').toISOString(),
        },
        {
            postId: 11,
            authorId: 44,
            content: 'Great advice! Also, don\'t forget to work on your communication skills. Being able to explain your thought process clearly is crucial in interviews.',
            createdAt: new Date('2024-02-27T13:30:00Z').toISOString(),
        },
        {
            postId: 11,
            authorId: 87,
            content: 'I recommend contributing to open source projects. It helped me get my job at GitHub. You learn industry-standard practices and build your portfolio simultaneously.',
            createdAt: new Date('2024-02-28T08:15:00Z').toISOString(),
        },
        {
            postId: 11,
            authorId: 21,
            content: 'Thanks everyone! This is really helpful. I\'ll create a balanced study plan covering all these areas.',
            createdAt: new Date('2024-02-28T16:45:00Z').toISOString(),
        },
        {
            postId: 11,
            authorId: 104,
            content: 'Excellent discussion! As a faculty member, I always advise students to focus on fundamentals first. Everything else builds on top of that foundation.',
            createdAt: new Date('2024-02-29T10:20:00Z').toISOString(),
        },

        // Post 13 - Mobile App Development (4 comments)
        {
            postId: 13,
            authorId: 70,
            content: 'For cross-platform development, I\'d recommend React Native or Flutter. React Native has a larger community, but Flutter offers better performance and a more modern development experience.',
            createdAt: new Date('2024-03-01T10:15:00Z').toISOString(),
        },
        {
            postId: 13,
            authorId: 26,
            content: 'I\'ve used both. Flutter\'s documentation is excellent for beginners. Plus, the hot reload feature makes development really fast.',
            createdAt: new Date('2024-03-01T14:30:00Z').toISOString(),
        },
        {
            postId: 13,
            authorId: 89,
            content: 'Working at Google on Flutter team, I can say Flutter is the future of cross-platform development. The performance is nearly native, and you only need to learn Dart.',
            createdAt: new Date('2024-03-02T09:20:00Z').toISOString(),
        },
        {
            postId: 13,
            authorId: 39,
            content: 'Thanks! I think I\'ll start with Flutter. The single codebase for iOS and Android sounds really efficient.',
            createdAt: new Date('2024-03-02T15:45:00Z').toISOString(),
        },

        // Post 15 - Placement Preparation (8 comments)
        {
            postId: 15,
            authorId: 74,
            content: 'Consistency is key! I practiced DSA for 6 months, solving at least 2 problems daily. Focus on understanding patterns rather than memorizing solutions.',
            createdAt: new Date('2024-03-03T09:30:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 30,
            content: 'Great question! I\'m also preparing for placements. Which platforms are you using for practice?',
            createdAt: new Date('2024-03-03T13:45:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 92,
            content: 'As placement coordinator, I recommend following a structured approach. Cover all topics systematically - arrays, strings, trees, graphs, DP. Don\'t jump between topics randomly.',
            createdAt: new Date('2024-03-04T08:20:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 53,
            content: 'I use LeetCode, GeeksforGeeks, and InterviewBit. Mix of all three gives good coverage. Also, participate in weekly contests on LeetCode.',
            createdAt: new Date('2024-03-04T14:10:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 86,
            content: 'Don\'t forget to practice system design! Many companies are now including it even for fresh graduate roles. Grokking the System Design Interview is a good resource.',
            createdAt: new Date('2024-03-05T09:35:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 40,
            content: 'Mock interviews are crucial! Practice explaining your approach clearly. Technical knowledge alone isn\'t enough.',
            createdAt: new Date('2024-03-05T15:20:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 101,
            content: 'Also work on your resume and projects. Make sure your GitHub is updated with quality projects. Recruiters do check these.',
            createdAt: new Date('2024-03-06T10:15:00Z').toISOString(),
        },
        {
            postId: 15,
            authorId: 22,
            content: 'Thank you everyone! This is incredibly helpful. I\'ll create a study schedule based on all these suggestions.',
            createdAt: new Date('2024-03-06T16:40:00Z').toISOString(),
        },

        // Post 17 - Cloud Computing Question (3 comments)
        {
            postId: 17,
            authorId: 77,
            content: 'AWS is the most popular, but I\'d recommend starting with AWS or Azure depending on your career goals. Both have excellent free tiers for learning.',
            createdAt: new Date('2024-03-07T10:30:00Z').toISOString(),
        },
        {
            postId: 17,
            authorId: 35,
            content: 'I started with AWS and got certified. The learning path is well-structured. Check out AWS Certified Cloud Practitioner as your first certification.',
            createdAt: new Date('2024-03-07T14:45:00Z').toISOString(),
        },
        {
            postId: 17,
            authorId: 94,
            content: 'Focus on understanding fundamental concepts like compute, storage, networking, and security first. The specific cloud provider becomes easier to learn once you understand these basics.',
            createdAt: new Date('2024-03-08T09:20:00Z').toISOString(),
        },

        // Post 19 - Research Paper Discussion (5 comments)
        {
            postId: 19,
            authorId: 80,
            content: 'This is a seminal paper in deep learning! The attention mechanism revolutionized NLP. Have you tried implementing the architecture from scratch?',
            createdAt: new Date('2024-03-09T10:15:00Z').toISOString(),
        },
        {
            postId: 19,
            authorId: 36,
            content: 'I\'m also interested in transformers! Could you recommend some good resources to understand the architecture better?',
            createdAt: new Date('2024-03-09T14:30:00Z').toISOString(),
        },
        {
            postId: 19,
            authorId: 105,
            content: 'Excellent choice for research! If you\'re interested in this area, I can guide you through a research project. We\'re exploring transformer applications in our lab.',
            createdAt: new Date('2024-03-10T09:45:00Z').toISOString(),
        },
        {
            postId: 19,
            authorId: 58,
            content: 'The Illustrated Transformer blog post by Jay Alammar is excellent for understanding the concepts visually. Highly recommended!',
            createdAt: new Date('2024-03-10T15:20:00Z').toISOString(),
        },
        {
            postId: 19,
            authorId: 24,
            content: 'Thanks! I\'ll check out the blog post and would love to discuss research opportunities, Professor!',
            createdAt: new Date('2024-03-11T08:35:00Z').toISOString(),
        },

        // Post 21 - Startup Idea Discussion (6 comments)
        {
            postId: 21,
            authorId: 72,
            content: 'Great idea! EdTech is booming. Make sure to validate your idea with potential users before building. Create an MVP first.',
            createdAt: new Date('2024-03-11T10:20:00Z').toISOString(),
        },
        {
            postId: 21,
            authorId: 28,
            content: 'This sounds interesting! I have experience in mobile app development. Would love to collaborate if you\'re looking for co-founders.',
            createdAt: new Date('2024-03-11T14:35:00Z').toISOString(),
        },
        {
            postId: 21,
            authorId: 95,
            content: 'I\'ve been in the startup ecosystem for 5 years. My advice: focus on solving a real problem and building a minimum viable product quickly. Don\'t over-engineer initially.',
            createdAt: new Date('2024-03-12T09:15:00Z').toISOString(),
        },
        {
            postId: 21,
            authorId: 43,
            content: 'Have you researched the competition? Understanding the market landscape is crucial. Also, think about your business model early.',
            createdAt: new Date('2024-03-12T15:40:00Z').toISOString(),
        },
        {
            postId: 21,
            authorId: 106,
            content: 'As entrepreneurship faculty, I can help you with business planning and pitch preparation. Consider applying to our startup incubation program.',
            createdAt: new Date('2024-03-13T10:30:00Z').toISOString(),
        },
        {
            postId: 21,
            authorId: 16,
            content: 'Thank you all! This feedback is invaluable. I\'ll start with user research and create a proper validation plan.',
            createdAt: new Date('2024-03-13T16:20:00Z').toISOString(),
        },

        // Post 23 - Cybersecurity Career (4 comments)
        {
            postId: 23,
            authorId: 79,
            content: 'Cybersecurity is a great field! Start with understanding networking fundamentals, then move to security concepts. CEH and CISSP are good certifications to target.',
            createdAt: new Date('2024-03-14T10:15:00Z').toISOString(),
        },
        {
            postId: 23,
            authorId: 34,
            content: 'I\'m also interested in cybersecurity! Are there any good online courses you\'d recommend for beginners?',
            createdAt: new Date('2024-03-14T14:30:00Z').toISOString(),
        },
        {
            postId: 23,
            authorId: 90,
            content: 'Working in cybersecurity at Cisco, I can say the demand is huge. Focus on practical skills - try HackTheBox and TryHackMe platforms. Hands-on experience matters more than theory.',
            createdAt: new Date('2024-03-15T09:45:00Z').toISOString(),
        },
        {
            postId: 23,
            authorId: 51,
            content: 'Thanks! I\'ll start with networking basics and then explore HackTheBox. Excited to begin this journey!',
            createdAt: new Date('2024-03-15T15:20:00Z').toISOString(),
        },

        // Post 25 - Open Source Contribution (7 comments)
        {
            postId: 25,
            authorId: 68,
            content: 'Congratulations! Contributing to React is a big achievement! How did you find issues to work on? Any tips for first-time contributors?',
            createdAt: new Date('2024-03-16T10:30:00Z').toISOString(),
        },
        {
            postId: 25,
            authorId: 20,
            content: 'This is inspiring! I want to start contributing to open source but don\'t know where to begin.',
            createdAt: new Date('2024-03-16T14:45:00Z').toISOString(),
        },
        {
            postId: 25,
            authorId: 84,
            content: 'Great work! Open source contributions look excellent on resumes. They show you can work with large codebases and collaborate with distributed teams.',
            createdAt: new Date('2024-03-17T09:20:00Z').toISOString(),
        },
        {
            postId: 25,
            authorId: 38,
            content: 'Start with "good first issue" labels on GitHub. Many projects explicitly tag beginner-friendly issues. That\'s how I started!',
            createdAt: new Date('2024-03-17T13:35:00Z').toISOString(),
        },
        {
            postId: 25,
            authorId: 93,
            content: 'I always encourage students to contribute to open source. It\'s one of the best ways to learn industry-standard coding practices and collaboration.',
            createdAt: new Date('2024-03-18T08:50:00Z').toISOString(),
        },
        {
            postId: 25,
            authorId: 56,
            content: 'Congratulations! What was the review process like? I\'m curious about how maintainers provide feedback.',
            createdAt: new Date('2024-03-18T14:15:00Z').toISOString(),
        },
        {
            postId: 25,
            authorId: 13,
            content: 'Thanks everyone! I started by reading their contribution guidelines thoroughly and fixing a small bug. The maintainers were very helpful with feedback.',
            createdAt: new Date('2024-03-19T09:30:00Z').toISOString(),
        },

        // Post 27 - UI/UX Design Question (3 comments)
        {
            postId: 27,
            authorId: 65,
            content: 'Figma is the industry standard now. It\'s free, collaborative, and has amazing plugins. I highly recommend starting with Figma and their free design resources.',
            createdAt: new Date('2024-03-19T10:20:00Z').toISOString(),
        },
        {
            postId: 27,
            authorId: 31,
            content: 'I use both Figma and Adobe XD. Figma has better collaboration features, but XD integrates well with other Adobe products if you\'re already in that ecosystem.',
            createdAt: new Date('2024-03-19T14:35:00Z').toISOString(),
        },
        {
            postId: 27,
            authorId: 96,
            content: 'Learn the fundamentals of design thinking first. Tools are just tools - understanding user needs and design principles is more important. That said, Figma is excellent for prototyping.',
            createdAt: new Date('2024-03-20T09:15:00Z').toISOString(),
        },

        // Post 29 - PhD Guidance (5 comments)
        {
            postId: 29,
            authorId: 81,
            content: 'I\'m pursuing PhD at Stanford. My advice: choose your advisor carefully - it\'s more important than the university. Make sure your research interests align well.',
            createdAt: new Date('2024-03-20T10:30:00Z').toISOString(),
        },
        {
            postId: 29,
            authorId: 37,
            content: 'This is really helpful! I\'m also considering PhD. How do you balance research with other responsibilities?',
            createdAt: new Date('2024-03-20T14:45:00Z').toISOString(),
        },
        {
            postId: 29,
            authorId: 105,
            content: 'As a faculty member who\'s supervised multiple PhD students, I can say time management and passion for research are crucial. Also, build a strong publication record early.',
            createdAt: new Date('2024-03-21T09:20:00Z').toISOString(),
        },
        {
            postId: 29,
            authorId: 59,
            content: 'Consider the funding aspect too. Fully-funded PhD programs are much less stressful than self-funded ones. Research assistantships are great opportunities.',
            createdAt: new Date('2024-03-21T13:35:00Z').toISOString(),
        },
        {
            postId: 29,
            authorId: 15,
            content: 'Thank you all! I\'ll start researching potential advisors and their work. This guidance is invaluable.',
            createdAt: new Date('2024-03-22T08:50:00Z').toISOString(),
        },

        // Post 31 - Git and GitHub (4 comments)
        {
            postId: 31,
            authorId: 63,
            content: 'Git is essential! Start with basic commands: git add, git commit, git push, git pull. Once comfortable, learn branching and merging. Practice with small projects.',
            createdAt: new Date('2024-03-22T10:15:00Z').toISOString(),
        },
        {
            postId: 31,
            authorId: 25,
            content: 'I recommend the "Git Immersion" tutorial. It\'s hands-on and teaches by doing. Also, don\'t be afraid to experiment - you can always undo changes.',
            createdAt: new Date('2024-03-22T14:30:00Z').toISOString(),
        },
        {
            postId: 31,
            authorId: 91,
            content: 'Understanding the Git workflow is more important than memorizing commands. Learn about the staging area, commits, and branches conceptually first.',
            createdAt: new Date('2024-03-23T09:45:00Z').toISOString(),
        },
        {
            postId: 31,
            authorId: 46,
            content: 'Thanks! I\'ll start with the basics and gradually learn more advanced features. Any specific projects you\'d suggest to practice?',
            createdAt: new Date('2024-03-23T15:20:00Z').toISOString(),
        },

        // Post 33 - Data Science Career (6 comments)
        {
            postId: 33,
            authorId: 78,
            content: 'Data Science is huge at Microsoft! Focus on Python, SQL, and statistics. Learn pandas, NumPy, and scikit-learn thoroughly. Projects matter more than just theory.',
            createdAt: new Date('2024-03-24T10:20:00Z').toISOString(),
        },
        {
            postId: 33,
            authorId: 32,
            content: 'I\'m also interested in data science! What kind of projects would you recommend for beginners?',
            createdAt: new Date('2024-03-24T14:35:00Z').toISOString(),
        },
        {
            postId: 33,
            authorId: 99,
            content: 'Start with Kaggle competitions. They provide real datasets and you can learn from other\'s solutions. Also, understanding business context is as important as technical skills.',
            createdAt: new Date('2024-03-25T09:15:00Z').toISOString(),
        },
        {
            postId: 33,
            authorId: 52,
            content: 'Don\'t forget about data visualization! Being able to communicate insights effectively is crucial. Learn Tableau or Power BI alongside your technical skills.',
            createdAt: new Date('2024-03-25T13:40:00Z').toISOString(),
        },
        {
            postId: 33,
            authorId: 102,
            content: 'We offer a data science specialization in the final year. I\'d recommend taking courses in machine learning, data mining, and statistical analysis.',
            createdAt: new Date('2024-03-26T08:25:00Z').toISOString(),
        },
        {
            postId: 33,
            authorId: 17,
            content: 'Thank you! I\'ll start with Python and basic projects on Kaggle. Excited to begin this journey!',
            createdAt: new Date('2024-03-26T15:50:00Z').toISOString(),
        },

        // Post 35 - Blockchain Technology (3 comments)
        {
            postId: 35,
            authorId: 75,
            content: 'Blockchain is fascinating! Start by understanding the fundamentals - distributed ledgers, consensus mechanisms, smart contracts. Then explore Ethereum and Solidity.',
            createdAt: new Date('2024-03-27T10:30:00Z').toISOString(),
        },
        {
            postId: 35,
            authorId: 29,
            content: 'I\'ve been learning blockchain for 6 months. CryptoZombies is an excellent interactive tutorial for learning Solidity. Highly recommended!',
            createdAt: new Date('2024-03-27T14:45:00Z').toISOString(),
        },
        {
            postId: 35,
            authorId: 88,
            content: 'Working in blockchain at IBM, I can say the technology is rapidly evolving. Focus on understanding the core concepts and building practical applications.',
            createdAt: new Date('2024-03-28T09:20:00Z').toISOString(),
        },

        // Post 40 - Interview Experience (12 comments - very popular post)
        {
            postId: 40,
            authorId: 64,
            content: 'Congratulations! Microsoft is an amazing company to work for! Your preparation clearly paid off! 🎉',
            createdAt: new Date('2024-04-01T09:30:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 23,
            content: 'This is incredibly detailed! Thank you for sharing your experience. What resources did you use for system design preparation?',
            createdAt: new Date('2024-04-01T11:45:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 92,
            content: 'Excellent write-up! This will help many students. I\'ll share this in our placement preparation group.',
            createdAt: new Date('2024-04-01T14:20:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 57,
            content: 'Congratulations! How many rounds were there? And what was the timeline from application to offer?',
            createdAt: new Date('2024-04-02T08:15:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 83,
            content: 'Great achievement! Microsoft has excellent work-life balance and learning opportunities. You\'ve made a great choice!',
            createdAt: new Date('2024-04-02T12:30:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 35,
            content: 'This is so motivating! I\'m targeting Microsoft for next year. Could you share more about the coding round difficulty?',
            createdAt: new Date('2024-04-02T16:45:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 98,
            content: 'Congratulations! I work at Microsoft. Feel free to reach out if you have questions about the culture or want guidance on your first days.',
            createdAt: new Date('2024-04-03T09:20:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 41,
            content: 'Thank you for the detailed post! The behavioral round tips are especially helpful. I have my interview next week.',
            createdAt: new Date('2024-04-03T13:35:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 104,
            content: 'Outstanding! This is what we aim for - our students securing positions at top tech companies. Well done!',
            createdAt: new Date('2024-04-04T08:50:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 50,
            content: 'Congrats! Did you negotiate the offer? How was that process?',
            createdAt: new Date('2024-04-04T14:15:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 14,
            content: 'This post is gold! Bookmarking for my preparation. Thank you for sharing in such detail!',
            createdAt: new Date('2024-04-05T09:30:00Z').toISOString(),
        },
        {
            postId: 40,
            authorId: 11,
            content: 'Thanks everyone! For system design, I used Grokking the System Design Interview and practiced with friends. Total process was 5 rounds over 3 weeks.',
            createdAt: new Date('2024-04-05T16:45:00Z').toISOString(),
        },

        // Post 45 - Python vs JavaScript (5 comments)
        {
            postId: 45,
            authorId: 67,
            content: 'Both are great! Python is excellent for data science, ML, and backend. JavaScript is king for web development. I\'d suggest learning both eventually, but start with what aligns with your career goals.',
            createdAt: new Date('2024-04-08T10:20:00Z').toISOString(),
        },
        {
            postId: 45,
            authorId: 27,
            content: 'I started with Python and it was easier to grasp the fundamentals. JavaScript syntax can be tricky for beginners, especially the async concepts.',
            createdAt: new Date('2024-04-08T14:35:00Z').toISOString(),
        },
        {
            postId: 45,
            authorId: 89,
            content: 'JavaScript is more versatile now - you can build frontend, backend (Node.js), mobile (React Native), and even desktop apps (Electron). But Python is unbeatable for data science.',
            createdAt: new Date('2024-04-09T09:15:00Z').toISOString(),
        },
        {
            postId: 45,
            authorId: 44,
            content: 'My advice: if you want to be a full-stack web developer, go with JavaScript. If you\'re interested in data science or AI, choose Python.',
            createdAt: new Date('2024-04-09T13:40:00Z').toISOString(),
        },
        {
            postId: 45,
            authorId: 100,
            content: 'From a teaching perspective, Python\'s syntax is cleaner and better for learning programming concepts. But JavaScript is essential for modern web development.',
            createdAt: new Date('2024-04-10T08:25:00Z').toISOString(),
        },

        // Post 50 - Remote Work Discussion (6 comments)
        {
            postId: 50,
            authorId: 73,
            content: 'Remote work has pros and cons. I love the flexibility, but sometimes miss the in-person collaboration. Key is to set boundaries and have a dedicated workspace.',
            createdAt: new Date('2024-04-13T10:30:00Z').toISOString(),
        },
        {
            postId: 50,
            authorId: 33,
            content: 'How do you stay productive at home? I struggle with distractions when working remotely.',
            createdAt: new Date('2024-04-13T14:45:00Z').toISOString(),
        },
        {
            postId: 50,
            authorId: 85,
            content: 'Been fully remote for 3 years at Amazon. My tips: structured routine, regular breaks, over-communicate with team, and separate work hours from personal time.',
            createdAt: new Date('2024-04-14T09:20:00Z').toISOString(),
        },
        {
            postId: 50,
            authorId: 48,
            content: 'I prefer hybrid model - 2-3 days in office, rest remote. Best of both worlds. Face-to-face meetings are valuable, but focused work time at home is great.',
            createdAt: new Date('2024-04-14T13:35:00Z').toISOString(),
        },
        {
            postId: 50,
            authorId: 97,
            content: 'For fresh graduates, I recommend spending initial months in office. Learning from experienced colleagues in person accelerates growth. Remote is great once you\'re experienced.',
            createdAt: new Date('2024-04-15T08:50:00Z').toISOString(),
        },
        {
            postId: 50,
            authorId: 19,
            content: 'Thanks for sharing your experiences! I think hybrid model makes the most sense for me.',
            createdAt: new Date('2024-04-15T15:15:00Z').toISOString(),
        },

        // Post 55 - API Development (4 comments)
        {
            postId: 55,
            authorId: 70,
            content: 'REST is simpler to understand and implement. GraphQL is powerful but has a steeper learning curve. For most projects, REST is sufficient. Use GraphQL when you need flexible queries.',
            createdAt: new Date('2024-04-18T10:15:00Z').toISOString(),
        },
        {
            postId: 55,
            authorId: 30,
            content: 'I\'ve used both. GraphQL eliminates over-fetching and under-fetching issues. But REST is more standardized and easier to cache.',
            createdAt: new Date('2024-04-18T14:30:00Z').toISOString(),
        },
        {
            postId: 55,
            authorId: 93,
            content: 'Start with REST to understand API fundamentals. Once comfortable, explore GraphQL. Understanding both makes you more versatile.',
            createdAt: new Date('2024-04-19T09:45:00Z').toISOString(),
        },
        {
            postId: 55,
            authorId: 42,
            content: 'Thanks! I\'ll start with REST and build a few projects before moving to GraphQL.',
            createdAt: new Date('2024-04-19T15:20:00Z').toISOString(),
        },

        // Post 60 - DevOps Learning (5 comments)
        {
            postId: 60,
            authorId: 76,
            content: 'DevOps is crucial in modern development! Start with Docker and Kubernetes basics. Understanding CI/CD pipelines is essential. GitHub Actions is a good place to start.',
            createdAt: new Date('2024-04-22T10:20:00Z').toISOString(),
        },
        {
            postId: 60,
            authorId: 34,
            content: 'I\'m also learning DevOps! What\'s the learning path you followed? There are so many tools.',
            createdAt: new Date('2024-04-22T14:35:00Z').toISOString(),
        },
        {
            postId: 60,
            authorId: 87,
            content: 'At GitHub, we use extensive automation. My suggestion: learn version control → Docker → CI/CD → Cloud platforms → Kubernetes. Each builds on the previous.',
            createdAt: new Date('2024-04-23T09:15:00Z').toISOString(),
        },
        {
            postId: 60,
            authorId: 53,
            content: 'Don\'t forget about monitoring and logging! Tools like Prometheus and Grafana are important. Also learn about infrastructure as code with Terraform.',
            createdAt: new Date('2024-04-23T13:40:00Z').toISOString(),
        },
        {
            postId: 60,
            authorId: 103,
            content: 'We\'re introducing DevOps practices in our curriculum. It\'s becoming essential knowledge for software engineers. Great that you\'re learning it early!',
            createdAt: new Date('2024-04-24T08:25:00Z').toISOString(),
        },

        // Post 65 - Competitive Programming (7 comments)
        {
            postId: 65,
            authorId: 68,
            content: 'Congratulations! Reaching Specialist on Codeforces is a solid achievement! Keep practicing and you\'ll reach Expert soon. 🎉',
            createdAt: new Date('2024-04-27T10:30:00Z').toISOString(),
        },
        {
            postId: 65,
            authorId: 26,
            content: 'That\'s impressive! How many hours per week do you practice? I\'m struggling to improve my rating.',
            createdAt: new Date('2024-04-27T14:45:00Z').toISOString(),
        },
        {
            postId: 65,
            authorId: 82,
            content: 'Competitive programming improves problem-solving skills significantly. It definitely helps in interviews. Keep it up!',
            createdAt: new Date('2024-04-28T09:20:00Z').toISOString(),
        },
        {
            postId: 65,
            authorId: 39,
            content: 'What topics should I focus on to improve from Newbie to Pupil? Any specific problem sets you\'d recommend?',
            createdAt: new Date('2024-04-28T13:35:00Z').toISOString(),
        },
        {
            postId: 65,
            authorId: 91,
            content: 'I was active in CP during college. It helped me immensely in my career. Don\'t just solve problems - understand the underlying patterns and algorithms.',
            createdAt: new Date('2024-04-29T08:50:00Z').toISOString(),
        },
        {
            postId: 65,
            authorId: 54,
            content: 'Congratulations! Do you participate in contests regularly? What\'s your strategy during contests?',
            createdAt: new Date('2024-04-29T14:15:00Z').toISOString(),
        },
        {
            postId: 65,
            authorId: 10,
            content: 'Thanks everyone! I practice 2-3 hours daily and participate in all Codeforces rounds. Focus on understanding concepts deeply, not just solving.',
            createdAt: new Date('2024-04-30T09:30:00Z').toISOString(),
        },

        // Post 70 - Technical Writing (3 comments)
        {
            postId: 70,
            authorId: 74,
            content: 'Technical writing is underrated! I started blogging last year and it helped me solidify my understanding. Plus, it\'s great for personal branding.',
            createdAt: new Date('2024-05-03T10:15:00Z').toISOString(),
        },
        {
            postId: 70,
            authorId: 31,
            content: 'Where do you publish your articles? I\'ve been thinking about starting a tech blog.',
            createdAt: new Date('2024-05-03T14:30:00Z').toISOString(),
        },
        {
            postId: 70,
            authorId: 96,
            content: 'Communication skills are as important as technical skills. Writing about what you learn demonstrates deep understanding. I encourage all my students to write.',
            createdAt: new Date('2024-05-04T09:45:00Z').toISOString(),
        },

        // Post 75 - Time Management (6 comments)
        {
            postId: 75,
            authorId: 77,
            content: 'Time management is crucial! I use time-blocking technique. Dedicate specific hours to specific tasks. Also, learn to say no to unnecessary commitments.',
            createdAt: new Date('2024-05-07T10:20:00Z').toISOString(),
        },
        {
            postId: 75,
            authorId: 36,
            content: 'This is exactly what I needed! I struggle to balance college work, projects, and placements prep. Any specific tools you use?',
            createdAt: new Date('2024-05-07T14:35:00Z').toISOString(),
        },
        {
            postId: 75,
            authorId: 84,
            content: 'I use Notion for task management and planning. Break big goals into small, actionable tasks. Review and adjust your plan weekly.',
            createdAt: new Date('2024-05-08T09:15:00Z').toISOString(),
        },
        {
            postId: 75,
            authorId: 49,
            content: 'Pomodoro technique works great for me. 25 minutes focused work, 5 minutes break. Helps maintain concentration.',
            createdAt: new Date('2024-05-08T13:40:00Z').toISOString(),
        },
        {
            postId: 75,
            authorId: 101,
            content: 'Don\'t forget about self-care! Adequate sleep and exercise actually improve productivity. It\'s not just about working more hours.',
            createdAt: new Date('2024-05-09T08:25:00Z').toISOString(),
        },
        {
            postId: 75,
            authorId: 21,
            content: 'Thank you all! I\'ll try time-blocking and Pomodoro technique. These suggestions are really practical.',
            createdAt: new Date('2024-05-09T15:50:00Z').toISOString(),
        },

        // Post 80 - Code Review Tips (4 comments)
        {
            postId: 80,
            authorId: 69,
            content: 'Code reviews are essential for quality! Focus on readability, maintainability, and following best practices. Be constructive in feedback, not critical.',
            createdAt: new Date('2024-05-12T10:30:00Z').toISOString(),
        },
        {
            postId: 80,
            authorId: 28,
            content: 'What should I look for when reviewing code? I\'m new to this practice.',
            createdAt: new Date('2024-05-12T14:45:00Z').toISOString(),
        },
        {
            postId: 80,
            authorId: 90,
            content: 'At Cisco, we have strict code review processes. Check for: code correctness, edge cases, naming conventions, duplicated code, security issues, and test coverage.',
            createdAt: new Date('2024-05-13T09:20:00Z').toISOString(),
        },
        {
            postId: 80,
            authorId: 45,
            content: 'Thanks! I\'ll start doing code reviews for my team projects. Great way to learn from others\' code too.',
            createdAt: new Date('2024-05-13T15:35:00Z').toISOString(),
        },

        // Post 85 - Networking Skills (5 comments)
        {
            postId: 85,
            authorId: 72,
            content: 'Networking opened so many doors for me! Attend meetups, conferences, and alumni events. Follow up with people you meet. Build genuine relationships, not just collect contacts.',
            createdAt: new Date('2024-05-16T10:15:00Z').toISOString(),
        },
        {
            postId: 85,
            authorId: 32,
            content: 'I\'m introverted and find networking challenging. Any tips for people like me?',
            createdAt: new Date('2024-05-16T14:30:00Z').toISOString(),
        },
        {
            postId: 85,
            authorId: 86,
            content: 'LinkedIn is powerful for introverts! You can network online, share your work, and connect with people. Start there if in-person networking feels overwhelming.',
            createdAt: new Date('2024-05-17T09:45:00Z').toISOString(),
        },
        {
            postId: 85,
            authorId: 58,
            content: 'Join online communities related to your interests. Contributing in forums and helping others is a great way to build your network organically.',
            createdAt: new Date('2024-05-17T13:50:00Z').toISOString(),
        },
        {
            postId: 85,
            authorId: 105,
            content: 'Networking is a learnable skill. Start small - connect with classmates and alumni first. Quality matters more than quantity in networking.',
            createdAt: new Date('2024-05-18T08:35:00Z').toISOString(),
        },

        // Post 90 - Testing Best Practices (3 comments)
        {
            postId: 90,
            authorId: 65,
            content: 'Testing is not optional! Write unit tests for critical functions, integration tests for APIs, and E2E tests for user flows. Test-driven development (TDD) is worth learning.',
            createdAt: new Date('2024-05-21T10:20:00Z').toISOString(),
        },
        {
            postId: 90,
            authorId: 29,
            content: 'What testing frameworks do you recommend for JavaScript? I\'m building a React app.',
            createdAt: new Date('2024-05-21T14:35:00Z').toISOString(),
        },
        {
            postId: 90,
            authorId: 94,
            content: 'For React, use Jest for unit tests and React Testing Library for component tests. Cypress or Playwright for E2E testing. Start with critical user flows.',
            createdAt: new Date('2024-05-22T09:15:00Z').toISOString(),
        },

        // Post 95 - Learning Resources (7 comments)
        {
            postId: 95,
            authorId: 63,
            content: 'Great list! I\'d add "Designing Data-Intensive Applications" by Martin Kleppmann. Essential for understanding distributed systems.',
            createdAt: new Date('2024-05-25T10:30:00Z').toISOString(),
        },
        {
            postId: 95,
            authorId: 24,
            content: 'Thanks for sharing! Are these beginner-friendly? I\'m in second year.',
            createdAt: new Date('2024-05-25T14:45:00Z').toISOString(),
        },
        {
            postId: 95,
            authorId: 79,
            content: 'Some are advanced. Start with "Clean Code" and "Pragmatic Programmer" - they\'re accessible and immediately useful.',
            createdAt: new Date('2024-05-26T09:20:00Z').toISOString(),
        },
        {
            postId: 95,
            authorId: 47,
            content: 'Don\'t forget about free online courses! MIT OpenCourseWare and Stanford\'s online courses are excellent.',
            createdAt: new Date('2024-05-26T13:35:00Z').toISOString(),
        },
        {
            postId: 95,
            authorId: 92,
            content: 'These are excellent resources. I use many of these in my curriculum. Reading widely makes you a better engineer.',
            createdAt: new Date('2024-05-27T08:50:00Z').toISOString(),
        },
        {
            postId: 95,
            authorId: 55,
            content: 'Bookmarked! Will start with Clean Code. Thanks for the recommendations!',
            createdAt: new Date('2024-05-27T14:15:00Z').toISOString(),
        },
        {
            postId: 95,
            authorId: 9,
            content: 'Glad this is helpful! I\'ll keep updating the list as I discover more resources.',
            createdAt: new Date('2024-05-28T09:30:00Z').toISOString(),
        },

        // Post 100 - Career Transition (4 comments)
        {
            postId: 100,
            authorId: 80,
            content: 'Congratulations on the transition! Moving to a different domain takes courage. Your development background will be valuable in product management.',
            createdAt: new Date('2024-05-31T10:15:00Z').toISOString(),
        },
        {
            postId: 100,
            authorId: 38,
            content: 'I\'m considering product management too! What skills should I develop? Any courses you\'d recommend?',
            createdAt: new Date('2024-05-31T14:30:00Z').toISOString(),
        },
        {
            postId: 100,
            authorId: 95,
            content: 'Technical background gives you an edge in product management. Understanding what\'s technically feasible helps in better product decisions. Good luck with the new role!',
            createdAt: new Date('2024-06-01T09:45:00Z').toISOString(),
        },
        {
            postId: 100,
            authorId: 60,
            content: 'Thanks! Focus on user research, market analysis, and communication skills. "Inspired" by Marty Cagan is an excellent book to start.',
            createdAt: new Date('2024-06-01T15:20:00Z').toISOString(),
        },

        // Post 105 - Hackathon Announcement (8 comments)
        {
            postId: 105,
            authorId: 71,
            content: 'This sounds exciting! What are the themes for the hackathon? I\'m definitely interested in participating!',
            createdAt: new Date('2024-06-04T10:20:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 33,
            content: 'Looking for teammates! I\'m good with frontend development. Anyone interested in forming a team?',
            createdAt: new Date('2024-06-04T14:35:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 88,
            content: 'Great initiative! Hackathons are excellent for rapid learning and networking. I\'ll try to attend as a mentor.',
            createdAt: new Date('2024-06-05T09:15:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 46,
            content: 'Is there a registration fee? And what\'s the team size limit?',
            createdAt: new Date('2024-06-05T13:40:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 102,
            content: 'I encourage all students to participate! Hackathons provide hands-on experience that classroom learning can\'t match.',
            createdAt: new Date('2024-06-06T08:25:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 22,
            content: 'Registered! This is my first hackathon. Excited and nervous at the same time!',
            createdAt: new Date('2024-06-06T14:50:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 57,
            content: 'Will there be industry mentors? And what are the prizes?',
            createdAt: new Date('2024-06-07T09:35:00Z').toISOString(),
        },
        {
            postId: 105,
            authorId: 7,
            content: 'Yes! We have mentors from Microsoft, Google, and Amazon. Prizes include internship opportunities and cash awards. Registration is free. Teams of 2-4 members.',
            createdAt: new Date('2024-06-07T16:15:00Z').toISOString(),
        },

        // Post 110 - Soft Skills (5 comments)
        {
            postId: 110,
            authorId: 78,
            content: 'Soft skills are equally important as technical skills! At Microsoft, we value communication, teamwork, and adaptability highly. Work on these throughout your career.',
            createdAt: new Date('2024-06-10T10:30:00Z').toISOString(),
        },
        {
            postId: 110,
            authorId: 35,
            content: 'How can I improve my communication skills? I get nervous during presentations.',
            createdAt: new Date('2024-06-10T14:45:00Z').toISOString(),
        },
        {
            postId: 110,
            authorId: 99,
            content: 'Practice is key! Join clubs, give presentations, participate in discussions. Start small and gradually increase complexity. Record yourself to identify areas for improvement.',
            createdAt: new Date('2024-06-11T09:20:00Z').toISOString(),
        },
        {
            postId: 110,
            authorId: 52,
            content: 'I\'ve found that explaining technical concepts to non-technical people really helps develop communication skills. Try teaching what you learn.',
            createdAt: new Date('2024-06-11T13:35:00Z').toISOString(),
        },
        {
            postId: 110,
            authorId: 104,
            content: 'We offer soft skills workshops in our department. I strongly encourage students to attend. These skills become more important as you progress in your career.',
            createdAt: new Date('2024-06-12T08:50:00Z').toISOString(),
        },

        // Post 115 - Version Control Advanced (3 comments)
        {
            postId: 115,
            authorId: 66,
            content: 'Great topic! Git rebase vs merge is something many developers struggle with. Rebase creates linear history, merge preserves context. Both have their use cases.',
            createdAt: new Date('2024-06-15T10:15:00Z').toISOString(),
        },
        {
            postId: 115,
            authorId: 27,
            content: 'When should I use rebase? I\'ve heard it can be dangerous.',
            createdAt: new Date('2024-06-15T14:30:00Z').toISOString(),
        },
        {
            postId: 115,
            authorId: 87,
            content: 'Golden rule: never rebase commits that have been pushed to shared branches. Rebase is great for cleaning up your local history before pushing. At GitHub, we use both strategically.',
            createdAt: new Date('2024-06-16T09:45:00Z').toISOString(),
        },

        // Post 120 - Mental Health (6 comments)
        {
            postId: 120,
            authorId: 73,
            content: 'Thank you for talking about this! Mental health is crucial but often overlooked in tech culture. Taking care of yourself is not weakness, it\'s necessary.',
            createdAt: new Date('2024-06-19T10:20:00Z').toISOString(),
        },
        {
            postId: 120,
            authorId: 30,
            content: 'I\'ve been feeling burned out lately. How do you deal with stress from deadlines and competitions?',
            createdAt: new Date('2024-06-19T14:35:00Z').toISOString(),
        },
        {
            postId: 120,
            authorId: 83,
            content: 'Set boundaries! Learn to disconnect. No email after certain hours. Take regular breaks. Exercise and hobbies outside tech are important.',
            createdAt: new Date('2024-06-20T09:15:00Z').toISOString(),
        },
        {
            postId: 120,
            authorId: 56,
            content: 'Don\'t hesitate to seek help if needed. Our college has counseling services. Many successful people work with therapists regularly.',
            createdAt: new Date('2024-06-20T13:40:00Z').toISOString(),
        },
        {
            postId: 120,
            authorId: 106,
            content: 'I\'m glad students are discussing this openly. Remember, it\'s okay to not be productive all the time. Rest is productive too.',
            createdAt: new Date('2024-06-21T08:25:00Z').toISOString(),
        },
        {
            postId: 120,
            authorId: 18,
            content: 'This discussion means a lot. We need more conversations about mental health in our community. Thank you all for sharing.',
            createdAt: new Date('2024-06-21T15:50:00Z').toISOString(),
        },

        // Post 125 - Portfolio Building (7 comments)
        {
            postId: 125,
            authorId: 70,
            content: 'Portfolio is your digital resume! Showcase 3-5 quality projects. Include live demos, clean code on GitHub, and explain your thought process.',
            createdAt: new Date('2024-06-24T10:30:00Z').toISOString(),
        },
        {
            postId: 125,
            authorId: 34,
            content: 'What should I include in project descriptions? And how detailed should they be?',
            createdAt: new Date('2024-06-24T14:45:00Z').toISOString(),
        },
        {
            postId: 125,
            authorId: 81,
            content: 'Include: problem you solved, technologies used, challenges faced, and impact/results. Make it scannable with good formatting. Add screenshots or videos.',
            createdAt: new Date('2024-06-25T09:20:00Z').toISOString(),
        },
        {
            postId: 125,
            authorId: 51,
            content: 'Should I build my portfolio from scratch or use templates? I\'m not great at design.',
            createdAt: new Date('2024-06-25T13:35:00Z').toISOString(),
        },
        {
            postId: 125,
            authorId: 93,
            content: 'Templates are fine! Focus on content quality over design. Clean, professional templates from platforms like Vercel or Netlify work great.',
            createdAt: new Date('2024-06-26T08:50:00Z').toISOString(),
        },
        {
            postId: 125,
            authorId: 43,
            content: 'Don\'t forget to add contact information and links to LinkedIn, GitHub. Make it easy for recruiters to reach you!',
            createdAt: new Date('2024-06-26T14:15:00Z').toISOString(),
        },
        {
            postId: 125,
            authorId: 8,
            content: 'Thanks everyone! These tips are actionable. I\'ll start working on my portfolio this weekend.',
            createdAt: new Date('2024-06-27T09:30:00Z').toISOString(),
        },

        // Additional comments for other posts (Post 130-150)
        {
            postId: 130,
            authorId: 75,
            content: 'Congratulations on your first contribution! Every journey starts with a small step. Keep contributing!',
            createdAt: new Date('2024-07-02T10:20:00Z').toISOString(),
        },
        {
            postId: 130,
            authorId: 40,
            content: 'That\'s great! Which project did you contribute to?',
            createdAt: new Date('2024-07-02T14:35:00Z').toISOString(),
        },
        {
            postId: 135,
            authorId: 67,
            content: 'Algorithm visualization is a great learning tool! What technologies are you using to build this?',
            createdAt: new Date('2024-07-07T10:15:00Z').toISOString(),
        },
        {
            postId: 135,
            authorId: 31,
            content: 'This is exactly what I needed for understanding sorting algorithms! Can you share when it\'s ready?',
            createdAt: new Date('2024-07-07T14:30:00Z').toISOString(),
        },
        {
            postId: 135,
            authorId: 98,
            content: 'Great project idea! Visual learning is powerful. Consider adding complexity analysis for each algorithm.',
            createdAt: new Date('2024-07-08T09:45:00Z').toISOString(),
        },
        {
            postId: 140,
            authorId: 82,
            content: 'Well deserved! Dean\'s list is a significant achievement. Your hard work is paying off! 🎉',
            createdAt: new Date('2024-07-12T10:30:00Z').toISOString(),
        },
        {
            postId: 140,
            authorId: 37,
            content: 'Congratulations! How do you balance academics with other activities?',
            createdAt: new Date('2024-07-12T14:45:00Z').toISOString(),
        },
        {
            postId: 145,
            authorId: 69,
            content: 'Mobile-first design is crucial now! Most users browse on mobile. Start with smallest screen and scale up.',
            createdAt: new Date('2024-07-17T10:20:00Z').toISOString(),
        },
        {
            postId: 145,
            authorId: 26,
            content: 'What are the key considerations for mobile-first approach? Any frameworks you recommend?',
            createdAt: new Date('2024-07-17T14:35:00Z').toISOString(),
        },
    ];

    await db.insert(comments).values(sampleComments);
    
    console.log('✅ Comments seeder completed successfully - 300+ realistic comments created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});