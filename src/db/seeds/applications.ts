import { db } from '@/db';
import { applications } from '@/db/schema';

async function main() {
    const coverLetterTemplates = [
        (company: string, skills: string, domain: string) => 
            `I am very excited about this opportunity at ${company}. My experience with ${skills} aligns well with the role requirements. I am eager to contribute and learn from the team.`,
        (company: string, skills: string, year: string) => 
            `As a ${year} student with strong ${skills} skills, I believe I would be a great fit for this role. My projects demonstrate my capabilities. I look forward to discussing further.`,
        (company: string, domain: string) => 
            `I am impressed by ${company}'s work in ${domain}. My academic background and practical experience make me well-suited for this position. I am enthusiastic about the opportunity to contribute.`,
        (company: string, skills: string) => 
            `This position at ${company} perfectly matches my career goals. My proficiency in ${skills} and passion for technology drive me to excel. I would love to be part of your team.`,
    ];

    const getRandomDate = (startDate: Date, endDate: Date): string => {
        const start = startDate.getTime();
        const end = endDate.getTime();
        const randomTime = start + Math.random() * (end - start);
        return new Date(randomTime).toISOString();
    };

    const addDays = (date: string, days: number): string => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString();
    };

    const sampleApplications = [
        // FAANG Jobs (Job IDs 1-5) - 8-10 applications each
        // Google SDE (Job 1) - 10 applications
        { jobId: 1, applicantId: 2, resumeUrl: 'https://drive.google.com/file/d/resume-2-1/view', coverLetter: coverLetterTemplates[0]('Google', 'Java, Python, and DSA', 'software engineering'), status: 'interview', appliedAt: '2024-01-16T10:30:00.000Z', updatedAt: '2024-01-28T14:20:00.000Z' },
        { jobId: 1, applicantId: 5, resumeUrl: 'https://drive.google.com/file/d/resume-5-1/view', coverLetter: coverLetterTemplates[1]('Google', 'C++, algorithms', 'final year'), status: 'screening', appliedAt: '2024-01-17T09:15:00.000Z', updatedAt: '2024-01-25T11:30:00.000Z' },
        { jobId: 1, applicantId: 8, resumeUrl: null, coverLetter: null, status: 'rejected', appliedAt: '2024-01-18T14:45:00.000Z', updatedAt: '2024-01-30T16:00:00.000Z' },
        { jobId: 1, applicantId: 12, resumeUrl: 'https://drive.google.com/file/d/resume-12-1/view', coverLetter: coverLetterTemplates[2]('Google', 'problem solving'), status: 'interview', appliedAt: '2024-01-19T11:20:00.000Z', updatedAt: '2024-02-01T10:15:00.000Z' },
        { jobId: 1, applicantId: 15, resumeUrl: 'https://drive.google.com/file/d/resume-15-1/view', coverLetter: coverLetterTemplates[3]('Google', 'Java, Spring Boot'), status: 'screening', appliedAt: '2024-01-20T08:30:00.000Z', updatedAt: '2024-01-27T13:45:00.000Z' },
        { jobId: 1, applicantId: 18, resumeUrl: null, coverLetter: coverLetterTemplates[0]('Google', 'Python, Django', 'web development'), status: 'applied', appliedAt: '2024-01-21T15:10:00.000Z', updatedAt: '2024-01-21T15:10:00.000Z' },
        { jobId: 1, applicantId: 22, resumeUrl: 'https://drive.google.com/file/d/resume-22-1/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-22T12:40:00.000Z', updatedAt: '2024-01-29T09:20:00.000Z' },
        { jobId: 1, applicantId: 25, resumeUrl: 'https://drive.google.com/file/d/resume-25-1/view', coverLetter: coverLetterTemplates[1]('Google', 'data structures, algorithms', 'final year'), status: 'applied', appliedAt: '2024-01-23T10:05:00.000Z', updatedAt: '2024-01-23T10:05:00.000Z' },
        { jobId: 1, applicantId: 28, resumeUrl: 'https://drive.google.com/file/d/resume-28-1/view', coverLetter: coverLetterTemplates[2]('Google', 'software development'), status: 'interview', appliedAt: '2024-01-24T13:25:00.000Z', updatedAt: '2024-02-03T11:40:00.000Z' },
        { jobId: 1, applicantId: 31, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Google', 'C++, competitive programming'), status: 'applied', appliedAt: '2024-01-25T16:50:00.000Z', updatedAt: '2024-01-25T16:50:00.000Z' },

        // Amazon Backend Engineer (Job 2) - 9 applications
        { jobId: 2, applicantId: 3, resumeUrl: 'https://drive.google.com/file/d/resume-3-2/view', coverLetter: coverLetterTemplates[0]('Amazon', 'Node.js, Express, MongoDB', 'backend development'), status: 'screening', appliedAt: '2024-01-17T09:20:00.000Z', updatedAt: '2024-01-26T14:35:00.000Z' },
        { jobId: 2, applicantId: 6, resumeUrl: 'https://drive.google.com/file/d/resume-6-2/view', coverLetter: coverLetterTemplates[1]('Amazon', 'Java, Spring Boot, microservices', 'final year'), status: 'interview', appliedAt: '2024-01-18T11:45:00.000Z', updatedAt: '2024-01-30T10:20:00.000Z' },
        { jobId: 2, applicantId: 9, resumeUrl: null, coverLetter: null, status: 'rejected', appliedAt: '2024-01-19T14:15:00.000Z', updatedAt: '2024-01-31T15:50:00.000Z' },
        { jobId: 2, applicantId: 13, resumeUrl: 'https://drive.google.com/file/d/resume-13-2/view', coverLetter: coverLetterTemplates[2]('Amazon', 'cloud computing'), status: 'applied', appliedAt: '2024-01-20T08:40:00.000Z', updatedAt: '2024-01-20T08:40:00.000Z' },
        { jobId: 2, applicantId: 16, resumeUrl: 'https://drive.google.com/file/d/resume-16-2/view', coverLetter: coverLetterTemplates[3]('Amazon', 'Python, FastAPI, PostgreSQL'), status: 'screening', appliedAt: '2024-01-21T12:10:00.000Z', updatedAt: '2024-01-28T09:45:00.000Z' },
        { jobId: 2, applicantId: 19, resumeUrl: 'https://drive.google.com/file/d/resume-19-2/view', coverLetter: coverLetterTemplates[0]('Amazon', 'REST APIs, database design', 'backend systems'), status: 'interview', appliedAt: '2024-01-22T15:30:00.000Z', updatedAt: '2024-02-01T13:20:00.000Z' },
        { jobId: 2, applicantId: 23, resumeUrl: null, coverLetter: coverLetterTemplates[1]('Amazon', 'backend technologies', 'final year'), status: 'applied', appliedAt: '2024-01-23T10:55:00.000Z', updatedAt: '2024-01-23T10:55:00.000Z' },
        { jobId: 2, applicantId: 26, resumeUrl: 'https://drive.google.com/file/d/resume-26-2/view', coverLetter: coverLetterTemplates[2]('Amazon', 'scalable systems'), status: 'screening', appliedAt: '2024-01-24T13:20:00.000Z', updatedAt: '2024-01-31T11:15:00.000Z' },
        { jobId: 2, applicantId: 29, resumeUrl: 'https://drive.google.com/file/d/resume-29-2/view', coverLetter: null, status: 'applied', appliedAt: '2024-01-25T16:40:00.000Z', updatedAt: '2024-01-25T16:40:00.000Z' },

        // Microsoft Frontend Developer (Job 3) - 8 applications
        { jobId: 3, applicantId: 4, resumeUrl: 'https://drive.google.com/file/d/resume-4-3/view', coverLetter: coverLetterTemplates[0]('Microsoft', 'React, TypeScript, Next.js', 'frontend development'), status: 'interview', appliedAt: '2024-01-18T10:15:00.000Z', updatedAt: '2024-01-29T14:30:00.000Z' },
        { jobId: 3, applicantId: 7, resumeUrl: 'https://drive.google.com/file/d/resume-7-3/view', coverLetter: coverLetterTemplates[1]('Microsoft', 'JavaScript, React, Redux', 'final year'), status: 'screening', appliedAt: '2024-01-19T13:40:00.000Z', updatedAt: '2024-01-27T10:55:00.000Z' },
        { jobId: 3, applicantId: 10, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Microsoft', 'user interfaces'), status: 'applied', appliedAt: '2024-01-20T09:25:00.000Z', updatedAt: '2024-01-20T09:25:00.000Z' },
        { jobId: 3, applicantId: 14, resumeUrl: 'https://drive.google.com/file/d/resume-14-3/view', coverLetter: null, status: 'rejected', appliedAt: '2024-01-21T11:50:00.000Z', updatedAt: '2024-01-30T16:20:00.000Z' },
        { jobId: 3, applicantId: 17, resumeUrl: 'https://drive.google.com/file/d/resume-17-3/view', coverLetter: coverLetterTemplates[3]('Microsoft', 'Angular, Vue.js, responsive design'), status: 'screening', appliedAt: '2024-01-22T14:35:00.000Z', updatedAt: '2024-01-29T12:10:00.000Z' },
        { jobId: 3, applicantId: 20, resumeUrl: 'https://drive.google.com/file/d/resume-20-3/view', coverLetter: coverLetterTemplates[0]('Microsoft', 'HTML5, CSS3, JavaScript', 'web development'), status: 'interview', appliedAt: '2024-01-23T12:05:00.000Z', updatedAt: '2024-02-02T09:45:00.000Z' },
        { jobId: 3, applicantId: 24, resumeUrl: null, coverLetter: coverLetterTemplates[1]('Microsoft', 'modern frontend frameworks', 'third year'), status: 'applied', appliedAt: '2024-01-24T15:20:00.000Z', updatedAt: '2024-01-24T15:20:00.000Z' },
        { jobId: 3, applicantId: 27, resumeUrl: 'https://drive.google.com/file/d/resume-27-3/view', coverLetter: coverLetterTemplates[2]('Microsoft', 'UI/UX'), status: 'applied', appliedAt: '2024-01-25T11:45:00.000Z', updatedAt: '2024-01-25T11:45:00.000Z' },

        // Meta Data Scientist (Job 4) - 7 applications
        { jobId: 4, applicantId: 11, resumeUrl: 'https://drive.google.com/file/d/resume-11-4/view', coverLetter: coverLetterTemplates[0]('Meta', 'Python, Pandas, Scikit-learn', 'data science'), status: 'screening', appliedAt: '2024-01-19T10:30:00.000Z', updatedAt: '2024-01-28T13:15:00.000Z' },
        { jobId: 4, applicantId: 21, resumeUrl: 'https://drive.google.com/file/d/resume-21-4/view', coverLetter: coverLetterTemplates[1]('Meta', 'machine learning, statistics', 'final year'), status: 'interview', appliedAt: '2024-01-20T14:20:00.000Z', updatedAt: '2024-01-31T11:40:00.000Z' },
        { jobId: 4, applicantId: 30, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Meta', 'data analytics'), status: 'applied', appliedAt: '2024-01-21T09:45:00.000Z', updatedAt: '2024-01-21T09:45:00.000Z' },
        { jobId: 4, applicantId: 32, resumeUrl: 'https://drive.google.com/file/d/resume-32-4/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-22T13:10:00.000Z', updatedAt: '2024-01-29T10:25:00.000Z' },
        { jobId: 4, applicantId: 35, resumeUrl: 'https://drive.google.com/file/d/resume-35-4/view', coverLetter: coverLetterTemplates[3]('Meta', 'TensorFlow, PyTorch, deep learning'), status: 'rejected', appliedAt: '2024-01-23T16:35:00.000Z', updatedAt: '2024-02-01T14:50:00.000Z' },
        { jobId: 4, applicantId: 38, resumeUrl: 'https://drive.google.com/file/d/resume-38-4/view', coverLetter: coverLetterTemplates[0]('Meta', 'SQL, data visualization', 'analytics'), status: 'applied', appliedAt: '2024-01-24T11:20:00.000Z', updatedAt: '2024-01-24T11:20:00.000Z' },
        { jobId: 4, applicantId: 41, resumeUrl: null, coverLetter: coverLetterTemplates[1]('Meta', 'predictive modeling', 'third year'), status: 'applied', appliedAt: '2024-01-25T14:55:00.000Z', updatedAt: '2024-01-25T14:55:00.000Z' },

        // Apple iOS Developer (Job 5) - 6 applications
        { jobId: 5, applicantId: 2, resumeUrl: 'https://drive.google.com/file/d/resume-2-5/view', coverLetter: coverLetterTemplates[0]('Apple', 'Swift, SwiftUI, iOS SDK', 'mobile development'), status: 'screening', appliedAt: '2024-01-20T10:40:00.000Z', updatedAt: '2024-01-29T15:20:00.000Z' },
        { jobId: 5, applicantId: 12, resumeUrl: 'https://drive.google.com/file/d/resume-12-5/view', coverLetter: coverLetterTemplates[1]('Apple', 'iOS app development', 'final year'), status: 'interview', appliedAt: '2024-01-21T13:25:00.000Z', updatedAt: '2024-02-01T12:35:00.000Z' },
        { jobId: 5, applicantId: 22, resumeUrl: null, coverLetter: null, status: 'applied', appliedAt: '2024-01-22T09:15:00.000Z', updatedAt: '2024-01-22T09:15:00.000Z' },
        { jobId: 5, applicantId: 33, resumeUrl: 'https://drive.google.com/file/d/resume-33-5/view', coverLetter: coverLetterTemplates[2]('Apple', 'mobile applications'), status: 'screening', appliedAt: '2024-01-23T12:50:00.000Z', updatedAt: '2024-01-30T10:40:00.000Z' },
        { jobId: 5, applicantId: 36, resumeUrl: 'https://drive.google.com/file/d/resume-36-5/view', coverLetter: coverLetterTemplates[3]('Apple', 'Objective-C, Core Data, UIKit'), status: 'applied', appliedAt: '2024-01-24T15:30:00.000Z', updatedAt: '2024-01-24T15:30:00.000Z' },
        { jobId: 5, applicantId: 39, resumeUrl: 'https://drive.google.com/file/d/resume-39-5/view', coverLetter: coverLetterTemplates[0]('Apple', 'app architecture', 'iOS ecosystem'), status: 'rejected', appliedAt: '2024-01-25T11:10:00.000Z', updatedAt: '2024-02-02T16:25:00.000Z' },

        // Good Startups (Job IDs 6-15) - 5-7 applications each
        // Razorpay Full Stack (Job 6) - 6 applications
        { jobId: 6, applicantId: 3, resumeUrl: 'https://drive.google.com/file/d/resume-3-6/view', coverLetter: coverLetterTemplates[0]('Razorpay', 'MERN stack, payment systems', 'full stack development'), status: 'screening', appliedAt: '2024-01-21T10:20:00.000Z', updatedAt: '2024-01-30T14:45:00.000Z' },
        { jobId: 6, applicantId: 8, resumeUrl: 'https://drive.google.com/file/d/resume-8-6/view', coverLetter: coverLetterTemplates[1]('Razorpay', 'React, Node.js, databases', 'final year'), status: 'interview', appliedAt: '2024-01-22T13:35:00.000Z', updatedAt: '2024-02-01T11:20:00.000Z' },
        { jobId: 6, applicantId: 13, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Razorpay', 'fintech'), status: 'applied', appliedAt: '2024-01-23T09:50:00.000Z', updatedAt: '2024-01-23T09:50:00.000Z' },
        { jobId: 6, applicantId: 18, resumeUrl: 'https://drive.google.com/file/d/resume-18-6/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-24T12:15:00.000Z', updatedAt: '2024-01-31T09:35:00.000Z' },
        { jobId: 6, applicantId: 23, resumeUrl: 'https://drive.google.com/file/d/resume-23-6/view', coverLetter: coverLetterTemplates[3]('Razorpay', 'full stack technologies, APIs'), status: 'applied', appliedAt: '2024-01-25T15:40:00.000Z', updatedAt: '2024-01-25T15:40:00.000Z' },
        { jobId: 6, applicantId: 28, resumeUrl: 'https://drive.google.com/file/d/resume-28-6/view', coverLetter: coverLetterTemplates[0]('Razorpay', 'JavaScript, TypeScript', 'web applications'), status: 'rejected', appliedAt: '2024-01-26T11:25:00.000Z', updatedAt: '2024-02-03T15:10:00.000Z' },

        // Zomato Backend Engineer (Job 7) - 5 applications
        { jobId: 7, applicantId: 6, resumeUrl: 'https://drive.google.com/file/d/resume-6-7/view', coverLetter: coverLetterTemplates[1]('Zomato', 'Python, Django, Redis', 'final year'), status: 'screening', appliedAt: '2024-01-22T10:45:00.000Z', updatedAt: '2024-01-31T13:20:00.000Z' },
        { jobId: 7, applicantId: 16, resumeUrl: 'https://drive.google.com/file/d/resume-16-7/view', coverLetter: coverLetterTemplates[2]('Zomato', 'food tech'), status: 'interview', appliedAt: '2024-01-23T14:10:00.000Z', updatedAt: '2024-02-02T10:55:00.000Z' },
        { jobId: 7, applicantId: 26, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Zomato', 'scalable backend systems'), status: 'applied', appliedAt: '2024-01-24T09:30:00.000Z', updatedAt: '2024-01-24T09:30:00.000Z' },
        { jobId: 7, applicantId: 34, resumeUrl: 'https://drive.google.com/file/d/resume-34-7/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-25T12:55:00.000Z', updatedAt: '2024-02-01T09:40:00.000Z' },
        { jobId: 7, applicantId: 42, resumeUrl: 'https://drive.google.com/file/d/resume-42-7/view', coverLetter: coverLetterTemplates[0]('Zomato', 'microservices, Kafka', 'distributed systems'), status: 'applied', appliedAt: '2024-01-26T16:20:00.000Z', updatedAt: '2024-01-26T16:20:00.000Z' },

        // Flipkart DevOps (Job 8) - 5 applications
        { jobId: 8, applicantId: 9, resumeUrl: 'https://drive.google.com/file/d/resume-9-8/view', coverLetter: coverLetterTemplates[0]('Flipkart', 'Docker, Kubernetes, Jenkins', 'DevOps'), status: 'interview', appliedAt: '2024-01-23T11:15:00.000Z', updatedAt: '2024-02-01T14:30:00.000Z' },
        { jobId: 8, applicantId: 19, resumeUrl: 'https://drive.google.com/file/d/resume-19-8/view', coverLetter: coverLetterTemplates[1]('Flipkart', 'CI/CD, cloud infrastructure', 'final year'), status: 'screening', appliedAt: '2024-01-24T13:40:00.000Z', updatedAt: '2024-01-31T11:15:00.000Z' },
        { jobId: 8, applicantId: 29, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Flipkart', 'automation'), status: 'applied', appliedAt: '2024-01-25T10:05:00.000Z', updatedAt: '2024-01-25T10:05:00.000Z' },
        { jobId: 8, applicantId: 37, resumeUrl: 'https://drive.google.com/file/d/resume-37-8/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-26T14:30:00.000Z', updatedAt: '2024-02-02T09:50:00.000Z' },
        { jobId: 8, applicantId: 44, resumeUrl: 'https://drive.google.com/file/d/resume-44-8/view', coverLetter: coverLetterTemplates[3]('Flipkart', 'AWS, Terraform, monitoring'), status: 'applied', appliedAt: '2024-01-27T11:55:00.000Z', updatedAt: '2024-01-27T11:55:00.000Z' },

        // Paytm Mobile Developer (Job 9) - 6 applications
        { jobId: 9, applicantId: 4, resumeUrl: 'https://drive.google.com/file/d/resume-4-9/view', coverLetter: coverLetterTemplates[0]('Paytm', 'React Native, Flutter', 'mobile development'), status: 'screening', appliedAt: '2024-01-24T10:25:00.000Z', updatedAt: '2024-02-01T13:40:00.000Z' },
        { jobId: 9, applicantId: 14, resumeUrl: 'https://drive.google.com/file/d/resume-14-9/view', coverLetter: coverLetterTemplates[1]('Paytm', 'Android, iOS development', 'final year'), status: 'interview', appliedAt: '2024-01-25T12:50:00.000Z', updatedAt: '2024-02-03T10:15:00.000Z' },
        { jobId: 9, applicantId: 24, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Paytm', 'mobile apps'), status: 'applied', appliedAt: '2024-01-26T09:15:00.000Z', updatedAt: '2024-01-26T09:15:00.000Z' },
        { jobId: 9, applicantId: 31, resumeUrl: 'https://drive.google.com/file/d/resume-31-9/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-27T13:35:00.000Z', updatedAt: '2024-02-03T11:50:00.000Z' },
        { jobId: 9, applicantId: 40, resumeUrl: 'https://drive.google.com/file/d/resume-40-9/view', coverLetter: coverLetterTemplates[3]('Paytm', 'cross-platform development'), status: 'applied', appliedAt: '2024-01-28T16:10:00.000Z', updatedAt: '2024-01-28T16:10:00.000Z' },
        { jobId: 9, applicantId: 46, resumeUrl: 'https://drive.google.com/file/d/resume-46-9/view', coverLetter: coverLetterTemplates[0]('Paytm', 'Kotlin, Swift', 'native apps'), status: 'rejected', appliedAt: '2024-01-29T11:45:00.000Z', updatedAt: '2024-02-05T14:20:00.000Z' },

        // Swiggy Data Analyst (Job 10) - 5 applications
        { jobId: 10, applicantId: 11, resumeUrl: 'https://drive.google.com/file/d/resume-11-10/view', coverLetter: coverLetterTemplates[1]('Swiggy', 'SQL, Excel, Tableau', 'final year'), status: 'screening', appliedAt: '2024-01-25T11:30:00.000Z', updatedAt: '2024-02-02T14:15:00.000Z' },
        { jobId: 10, applicantId: 30, resumeUrl: 'https://drive.google.com/file/d/resume-30-10/view', coverLetter: coverLetterTemplates[2]('Swiggy', 'data analysis'), status: 'interview', appliedAt: '2024-01-26T14:20:00.000Z', updatedAt: '2024-02-04T11:35:00.000Z' },
        { jobId: 10, applicantId: 38, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Swiggy', 'analytics, insights generation'), status: 'applied', appliedAt: '2024-01-27T10:45:00.000Z', updatedAt: '2024-01-27T10:45:00.000Z' },
        { jobId: 10, applicantId: 43, resumeUrl: 'https://drive.google.com/file/d/resume-43-10/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-28T13:10:00.000Z', updatedAt: '2024-02-04T09:25:00.000Z' },
        { jobId: 10, applicantId: 48, resumeUrl: 'https://drive.google.com/file/d/resume-48-10/view', coverLetter: coverLetterTemplates[0]('Swiggy', 'Python, pandas, statistics', 'business intelligence'), status: 'applied', appliedAt: '2024-01-29T15:55:00.000Z', updatedAt: '2024-01-29T15:55:00.000Z' },

        // CRED Product Manager (Job 11) - 4 applications
        { jobId: 11, applicantId: 5, resumeUrl: 'https://drive.google.com/file/d/resume-5-11/view', coverLetter: coverLetterTemplates[0]('CRED', 'product management, user research', 'product development'), status: 'screening', appliedAt: '2024-01-26T10:50:00.000Z', updatedAt: '2024-02-03T13:20:00.000Z' },
        { jobId: 11, applicantId: 25, resumeUrl: 'https://drive.google.com/file/d/resume-25-11/view', coverLetter: coverLetterTemplates[1]('CRED', 'agile, stakeholder management', 'final year'), status: 'interview', appliedAt: '2024-01-27T13:15:00.000Z', updatedAt: '2024-02-05T10:45:00.000Z' },
        { jobId: 11, applicantId: 35, resumeUrl: null, coverLetter: coverLetterTemplates[2]('CRED', 'fintech products'), status: 'applied', appliedAt: '2024-01-28T09:40:00.000Z', updatedAt: '2024-01-28T09:40:00.000Z' },
        { jobId: 11, applicantId: 45, resumeUrl: 'https://drive.google.com/file/d/resume-45-11/view', coverLetter: null, status: 'rejected', appliedAt: '2024-01-29T12:25:00.000Z', updatedAt: '2024-02-06T15:35:00.000Z' },

        // Ola QA Engineer (Job 12) - 4 applications
        { jobId: 12, applicantId: 7, resumeUrl: 'https://drive.google.com/file/d/resume-7-12/view', coverLetter: coverLetterTemplates[1]('Ola', 'Selenium, automation testing', 'final year'), status: 'screening', appliedAt: '2024-01-27T11:05:00.000Z', updatedAt: '2024-02-04T14:50:00.000Z' },
        { jobId: 12, applicantId: 20, resumeUrl: 'https://drive.google.com/file/d/resume-20-12/view', coverLetter: coverLetterTemplates[2]('Ola', 'quality assurance'), status: 'interview', appliedAt: '2024-01-28T14:30:00.000Z', updatedAt: '2024-02-06T11:20:00.000Z' },
        { jobId: 12, applicantId: 32, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Ola', 'manual and automated testing'), status: 'applied', appliedAt: '2024-01-29T10:15:00.000Z', updatedAt: '2024-01-29T10:15:00.000Z' },
        { jobId: 12, applicantId: 47, resumeUrl: 'https://drive.google.com/file/d/resume-47-12/view', coverLetter: null, status: 'applied', appliedAt: '2024-01-30T13:45:00.000Z', updatedAt: '2024-01-30T13:45:00.000Z' },

        // Myntra Frontend Engineer (Job 13) - 5 applications
        { jobId: 13, applicantId: 10, resumeUrl: 'https://drive.google.com/file/d/resume-10-13/view', coverLetter: coverLetterTemplates[0]('Myntra', 'React, Redux, CSS', 'e-commerce UI'), status: 'screening', appliedAt: '2024-01-28T10:20:00.000Z', updatedAt: '2024-02-05T13:35:00.000Z' },
        { jobId: 13, applicantId: 17, resumeUrl: 'https://drive.google.com/file/d/resume-17-13/view', coverLetter: coverLetterTemplates[1]('Myntra', 'JavaScript, HTML5', 'final year'), status: 'interview', appliedAt: '2024-01-29T12:45:00.000Z', updatedAt: '2024-02-07T10:15:00.000Z' },
        { jobId: 13, applicantId: 27, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Myntra', 'frontend development'), status: 'applied', appliedAt: '2024-01-30T09:10:00.000Z', updatedAt: '2024-01-30T09:10:00.000Z' },
        { jobId: 13, applicantId: 36, resumeUrl: 'https://drive.google.com/file/d/resume-36-13/view', coverLetter: null, status: 'screening', appliedAt: '2024-01-31T13:35:00.000Z', updatedAt: '2024-02-07T11:50:00.000Z' },
        { jobId: 13, applicantId: 49, resumeUrl: 'https://drive.google.com/file/d/resume-49-13/view', coverLetter: coverLetterTemplates[3]('Myntra', 'responsive design, performance optimization'), status: 'applied', appliedAt: '2024-02-01T16:20:00.000Z', updatedAt: '2024-02-01T16:20:00.000Z' },

        // PhonePe Security Engineer (Job 14) - 4 applications
        { jobId: 14, applicantId: 15, resumeUrl: 'https://drive.google.com/file/d/resume-15-14/view', coverLetter: coverLetterTemplates[0]('PhonePe', 'cybersecurity, penetration testing', 'security'), status: 'screening', appliedAt: '2024-01-29T11:25:00.000Z', updatedAt: '2024-02-06T14:40:00.000Z' },
        { jobId: 14, applicantId: 28, resumeUrl: 'https://drive.google.com/file/d/resume-28-14/view', coverLetter: coverLetterTemplates[1]('PhonePe', 'security protocols', 'final year'), status: 'interview', appliedAt: '2024-01-30T14:10:00.000Z', updatedAt: '2024-02-08T11:25:00.000Z' },
        { jobId: 14, applicantId: 39, resumeUrl: null, coverLetter: coverLetterTemplates[2]('PhonePe', 'information security'), status: 'applied', appliedAt: '2024-01-31T10:35:00.000Z', updatedAt: '2024-01-31T10:35:00.000Z' },
        { jobId: 14, applicantId: 50, resumeUrl: 'https://drive.google.com/file/d/resume-50-14/view', coverLetter: null, status: 'rejected', appliedAt: '2024-02-01T13:15:00.000Z', updatedAt: '2024-02-09T15:50:00.000Z' },

        // Dunzo Logistics Engineer (Job 15) - 3 applications
        { jobId: 15, applicantId: 12, resumeUrl: 'https://drive.google.com/file/d/resume-12-15/view', coverLetter: coverLetterTemplates[1]('Dunzo', 'optimization, algorithms', 'final year'), status: 'screening', appliedAt: '2024-01-30T11:40:00.000Z', updatedAt: '2024-02-07T13:55:00.000Z' },
        { jobId: 15, applicantId: 33, resumeUrl: 'https://drive.google.com/file/d/resume-33-15/view', coverLetter: coverLetterTemplates[2]('Dunzo', 'logistics technology'), status: 'applied', appliedAt: '2024-01-31T14:20:00.000Z', updatedAt: '2024-01-31T14:20:00.000Z' },
        { jobId: 15, applicantId: 41, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Dunzo', 'route optimization, supply chain'), status: 'applied', appliedAt: '2024-02-01T10:05:00.000Z', updatedAt: '2024-02-01T10:05:00.000Z' },

        // Regular Companies (Job IDs 16-35) - 2-4 applications each
        // TCS Digital Full Stack (Job 16) - 4 applications
        { jobId: 16, applicantId: 8, resumeUrl: 'https://drive.google.com/file/d/resume-8-16/view', coverLetter: coverLetterTemplates[0]('TCS', 'Java, Spring, Angular', 'enterprise applications'), status: 'screening', appliedAt: '2024-01-31T11:15:00.000Z', updatedAt: '2024-02-08T14:30:00.000Z' },
        { jobId: 16, applicantId: 18, resumeUrl: 'https://drive.google.com/file/d/resume-18-16/view', coverLetter: coverLetterTemplates[1]('TCS', 'full stack development', 'final year'), status: 'interview', appliedAt: '2024-02-01T13:40:00.000Z', updatedAt: '2024-02-10T11:15:00.000Z' },
        { jobId: 16, applicantId: 26, resumeUrl: null, coverLetter: null, status: 'applied', appliedAt: '2024-02-02T10:25:00.000Z', updatedAt: '2024-02-02T10:25:00.000Z' },
        { jobId: 16, applicantId: 37, resumeUrl: 'https://drive.google.com/file/d/resume-37-16/view', coverLetter: coverLetterTemplates[2]('TCS', 'software engineering'), status: 'applied', appliedAt: '2024-02-03T14:50:00.000Z', updatedAt: '2024-02-03T14:50:00.000Z' },

        // Infosys System Engineer (Job 17) - 3 applications
        { jobId: 17, applicantId: 13, resumeUrl: 'https://drive.google.com/file/d/resume-13-17/view', coverLetter: coverLetterTemplates[1]('Infosys', 'Java, databases', 'final year'), status: 'screening', appliedAt: '2024-02-01T10:30:00.000Z', updatedAt: '2024-02-09T13:45:00.000Z' },
        { jobId: 17, applicantId: 23, resumeUrl: 'https://drive.google.com/file/d/resume-23-17/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-02T13:15:00.000Z', updatedAt: '2024-02-02T13:15:00.000Z' },
        { jobId: 17, applicantId: 34, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Infosys', 'software development'), status: 'applied', appliedAt: '2024-02-03T09:40:00.000Z', updatedAt: '2024-02-03T09:40:00.000Z' },

        // Wipro Project Engineer (Job 18) - 3 applications
        { jobId: 18, applicantId: 9, resumeUrl: 'https://drive.google.com/file/d/resume-9-18/view', coverLetter: coverLetterTemplates[0]('Wipro', 'C++, Python', 'software projects'), status: 'interview', appliedAt: '2024-02-02T11:20:00.000Z', updatedAt: '2024-02-11T10:35:00.000Z' },
        { jobId: 18, applicantId: 19, resumeUrl: 'https://drive.google.com/file/d/resume-19-18/view', coverLetter: coverLetterTemplates[1]('Wipro', 'project development', 'final year'), status: 'screening', appliedAt: '2024-02-03T14:45:00.000Z', updatedAt: '2024-02-10T12:20:00.000Z' },
        { jobId: 18, applicantId: 29, resumeUrl: null, coverLetter: null, status: 'applied', appliedAt: '2024-02-04T10:10:00.000Z', updatedAt: '2024-02-04T10:10:00.000Z' },

        // Tech Mahindra Software Developer (Job 19) - 2 applications
        { jobId: 19, applicantId: 16, resumeUrl: 'https://drive.google.com/file/d/resume-16-19/view', coverLetter: coverLetterTemplates[2]('Tech Mahindra', 'software development'), status: 'applied', appliedAt: '2024-02-03T11:35:00.000Z', updatedAt: '2024-02-03T11:35:00.000Z' },
        { jobId: 19, applicantId: 35, resumeUrl: 'https://drive.google.com/file/d/resume-35-19/view', coverLetter: coverLetterTemplates[1]('Tech Mahindra', 'Java, web technologies', 'final year'), status: 'screening', appliedAt: '2024-02-04T13:20:00.000Z', updatedAt: '2024-02-11T09:45:00.000Z' },

        // HCL Technologies (Job 20) - 3 applications
        { jobId: 20, applicantId: 14, resumeUrl: 'https://drive.google.com/file/d/resume-14-20/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-04T10:45:00.000Z', updatedAt: '2024-02-04T10:45:00.000Z' },
        { jobId: 20, applicantId: 24, resumeUrl: 'https://drive.google.com/file/d/resume-24-20/view', coverLetter: coverLetterTemplates[0]('HCL', 'IT services', 'technology'), status: 'screening', appliedAt: '2024-02-05T12:30:00.000Z', updatedAt: '2024-02-12T14:15:00.000Z' },
        { jobId: 20, applicantId: 38, resumeUrl: null, coverLetter: coverLetterTemplates[3]('HCL', 'software engineering'), status: 'applied', appliedAt: '2024-02-06T14:55:00.000Z', updatedAt: '2024-02-06T14:55:00.000Z' },

        // Cognizant Programmer Analyst (Job 21) - 2 applications
        { jobId: 21, applicantId: 21, resumeUrl: 'https://drive.google.com/file/d/resume-21-21/view', coverLetter: coverLetterTemplates[1]('Cognizant', 'programming, analysis', 'final year'), status: 'interview', appliedAt: '2024-02-05T11:10:00.000Z', updatedAt: '2024-02-13T10:25:00.000Z' },
        { jobId: 21, applicantId: 40, resumeUrl: 'https://drive.google.com/file/d/resume-40-21/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-06T13:35:00.000Z', updatedAt: '2024-02-06T13:35:00.000Z' },

        // Accenture Associate Engineer (Job 22) - 3 applications
        { jobId: 22, applicantId: 11, resumeUrl: 'https://drive.google.com/file/d/resume-11-22/view', coverLetter: coverLetterTemplates[0]('Accenture', 'engineering', 'technology consulting'), status: 'screening', appliedAt: '2024-02-06T10:20:00.000Z', updatedAt: '2024-02-13T13:40:00.000Z' },
        { jobId: 22, applicantId: 30, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Accenture', 'IT services'), status: 'applied', appliedAt: '2024-02-07T12:45:00.000Z', updatedAt: '2024-02-07T12:45:00.000Z' },
        { jobId: 22, applicantId: 42, resumeUrl: 'https://drive.google.com/file/d/resume-42-22/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-08T15:10:00.000Z', updatedAt: '2024-02-08T15:10:00.000Z' },

        // Capgemini Software Engineer (Job 23) - 2 applications
        { jobId: 23, applicantId: 22, resumeUrl: 'https://drive.google.com/file/d/resume-22-23/view', coverLetter: coverLetterTemplates[1]('Capgemini', 'software development', 'final year'), status: 'screening', appliedAt: '2024-02-07T11:30:00.000Z', updatedAt: '2024-02-14T10:15:00.000Z' },
        { jobId: 23, applicantId: 43, resumeUrl: 'https://drive.google.com/file/d/resume-43-23/view', coverLetter: coverLetterTemplates[3]('Capgemini', 'enterprise applications'), status: 'applied', appliedAt: '2024-02-08T14:20:00.000Z', updatedAt: '2024-02-08T14:20:00.000Z' },

        // LTI Developer (Job 24) - 2 applications
        { jobId: 24, applicantId: 27, resumeUrl: null, coverLetter: coverLetterTemplates[0]('LTI', 'development', 'software solutions'), status: 'applied', appliedAt: '2024-02-08T10:40:00.000Z', updatedAt: '2024-02-08T10:40:00.000Z' },
        { jobId: 24, applicantId: 44, resumeUrl: 'https://drive.google.com/file/d/resume-44-24/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-09T13:15:00.000Z', updatedAt: '2024-02-09T13:15:00.000Z' },

        // Mphasis Software Engineer (Job 25) - 2 applications
        { jobId: 25, applicantId: 17, resumeUrl: 'https://drive.google.com/file/d/resume-17-25/view', coverLetter: coverLetterTemplates[1]('Mphasis', 'software engineering', 'final year'), status: 'interview', appliedAt: '2024-02-09T11:25:00.000Z', updatedAt: '2024-02-16T10:40:00.000Z' },
        { jobId: 25, applicantId: 36, resumeUrl: 'https://drive.google.com/file/d/resume-36-25/view', coverLetter: coverLetterTemplates[2]('Mphasis', 'IT services'), status: 'applied', appliedAt: '2024-02-10T14:50:00.000Z', updatedAt: '2024-02-10T14:50:00.000Z' },

        // L&T Infotech (Job 26) - 2 applications
        { jobId: 26, applicantId: 32, resumeUrl: 'https://drive.google.com/file/d/resume-32-26/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-10T10:15:00.000Z', updatedAt: '2024-02-10T10:15:00.000Z' },
        { jobId: 26, applicantId: 45, resumeUrl: null, coverLetter: coverLetterTemplates[3]('L&T Infotech', 'software development'), status: 'applied', appliedAt: '2024-02-11T12:40:00.000Z', updatedAt: '2024-02-11T12:40:00.000Z' },

        // Internships (Job IDs 31-45) - 3-6 applications each
        // Google SWE Intern (Job 31) - 6 applications
        { jobId: 31, applicantId: 34, resumeUrl: 'https://drive.google.com/file/d/resume-34-31/view', coverLetter: coverLetterTemplates[1]('Google', 'C++, algorithms', 'third year'), status: 'screening', appliedAt: '2024-02-11T10:30:00.000Z', updatedAt: '2024-02-18T13:45:00.000Z' },
        { jobId: 31, applicantId: 37, resumeUrl: 'https://drive.google.com/file/d/resume-37-31/view', coverLetter: coverLetterTemplates[0]('Google', 'data structures, programming', 'software engineering'), status: 'interview', appliedAt: '2024-02-12T13:15:00.000Z', updatedAt: '2024-02-20T10:20:00.000Z' },
        { jobId: 31, applicantId: 40, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Google', 'internship'), status: 'applied', appliedAt: '2024-02-13T09:40:00.000Z', updatedAt: '2024-02-13T09:40:00.000Z' },
        { jobId: 31, applicantId: 43, resumeUrl: 'https://drive.google.com/file/d/resume-43-31/view', coverLetter: null, status: 'accepted', appliedAt: '2024-02-14T12:25:00.000Z', updatedAt: '2024-02-21T15:35:00.000Z' },
        { jobId: 31, applicantId: 46, resumeUrl: 'https://drive.google.com/file/d/resume-46-31/view', coverLetter: coverLetterTemplates[3]('Google', 'Java, Python'), status: 'screening', appliedAt: '2024-02-15T15:50:00.000Z', updatedAt: '2024-02-22T11:10:00.000Z' },
        { jobId: 31, applicantId: 49, resumeUrl: 'https://drive.google.com/file/d/resume-49-31/view', coverLetter: coverLetterTemplates[1]('Google', 'competitive programming', 'third year'), status: 'applied', appliedAt: '2024-02-16T11:20:00.000Z', updatedAt: '2024-02-16T11:20:00.000Z' },

        // Microsoft Intern (Job 32) - 5 applications
        { jobId: 32, applicantId: 35, resumeUrl: 'https://drive.google.com/file/d/resume-35-32/view', coverLetter: coverLetterTemplates[0]('Microsoft', 'C#, .NET', 'software development'), status: 'interview', appliedAt: '2024-02-12T10:45:00.000Z', updatedAt: '2024-02-20T13:30:00.000Z' },
        { jobId: 32, applicantId: 38, resumeUrl: 'https://drive.google.com/file/d/resume-38-32/view', coverLetter: coverLetterTemplates[1]('Microsoft', 'full stack', 'third year'), status: 'screening', appliedAt: '2024-02-13T12:30:00.000Z', updatedAt: '2024-02-21T10:15:00.000Z' },
        { jobId: 32, applicantId: 41, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Microsoft', 'technology'), status: 'applied', appliedAt: '2024-02-14T14:55:00.000Z', updatedAt: '2024-02-14T14:55:00.000Z' },
        { jobId: 32, applicantId: 44, resumeUrl: 'https://drive.google.com/file/d/resume-44-32/view', coverLetter: null, status: 'accepted', appliedAt: '2024-02-15T11:10:00.000Z', updatedAt: '2024-02-22T14:25:00.000Z' },
        { jobId: 32, applicantId: 47, resumeUrl: 'https://drive.google.com/file/d/resume-47-32/view', coverLetter: coverLetterTemplates[3]('Microsoft', 'Azure, cloud computing'), status: 'applied', appliedAt: '2024-02-16T13:35:00.000Z', updatedAt: '2024-02-16T13:35:00.000Z' },

        // Amazon SDE Intern (Job 33) - 5 applications
        { jobId: 33, applicantId: 36, resumeUrl: 'https://drive.google.com/file/d/resume-36-33/view', coverLetter: coverLetterTemplates[1]('Amazon', 'Java, AWS', 'third year'), status: 'screening', appliedAt: '2024-02-13T11:20:00.000Z', updatedAt: '2024-02-21T14:40:00.000Z' },
        { jobId: 33, applicantId: 39, resumeUrl: 'https://drive.google.com/file/d/resume-39-33/view', coverLetter: coverLetterTemplates[0]('Amazon', 'backend development', 'software engineering'), status: 'interview', appliedAt: '2024-02-14T13:45:00.000Z', updatedAt: '2024-02-22T11:15:00.000Z' },
        { jobId: 33, applicantId: 42, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Amazon', 'internship program'), status: 'applied', appliedAt: '2024-02-15T10:10:00.000Z', updatedAt: '2024-02-15T10:10:00.000Z' },
        { jobId: 33, applicantId: 45, resumeUrl: 'https://drive.google.com/file/d/resume-45-33/view', coverLetter: null, status: 'screening', appliedAt: '2024-02-16T12:35:00.000Z', updatedAt: '2024-02-23T09:50:00.000Z' },
        { jobId: 33, applicantId: 48, resumeUrl: 'https://drive.google.com/file/d/resume-48-33/view', coverLetter: coverLetterTemplates[3]('Amazon', 'Python, data structures'), status: 'applied', appliedAt: '2024-02-17T15:20:00.000Z', updatedAt: '2024-02-17T15:20:00.000Z' },

        // Meta Data Science Intern (Job 34) - 4 applications
        { jobId: 34, applicantId: 38, resumeUrl: 'https://drive.google.com/file/d/resume-38-34/view', coverLetter: coverLetterTemplates[0]('Meta', 'Python, ML', 'data science'), status: 'interview', appliedAt: '2024-02-14T11:50:00.000Z', updatedAt: '2024-02-22T13:25:00.000Z' },
        { jobId: 34, applicantId: 41, resumeUrl: 'https://drive.google.com/file/d/resume-41-34/view', coverLetter: coverLetterTemplates[1]('Meta', 'statistics, ML', 'third year'), status: 'accepted', appliedAt: '2024-02-15T14:15:00.000Z', updatedAt: '2024-02-23T15:40:00.000Z' },
        { jobId: 34, applicantId: 44, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Meta', 'data analytics'), status: 'applied', appliedAt: '2024-02-16T10:40:00.000Z', updatedAt: '2024-02-16T10:40:00.000Z' },
        { jobId: 34, applicantId: 47, resumeUrl: 'https://drive.google.com/file/d/resume-47-34/view', coverLetter: null, status: 'screening', appliedAt: '2024-02-17T13:05:00.000Z', updatedAt: '2024-02-24T11:20:00.000Z' },

        // Apple iOS Intern (Job 35) - 4 applications
        { jobId: 35, applicantId: 37, resumeUrl: 'https://drive.google.com/file/d/resume-37-35/view', coverLetter: coverLetterTemplates[1]('Apple', 'Swift, iOS', 'third year'), status: 'screening', appliedAt: '2024-02-15T11:30:00.000Z', updatedAt: '2024-02-23T14:45:00.000Z' },
        { jobId: 35, applicantId: 40, resumeUrl: 'https://drive.google.com/file/d/resume-40-35/view', coverLetter: coverLetterTemplates[0]('Apple', 'mobile development', 'app development'), status: 'interview', appliedAt: '2024-02-16T13:55:00.000Z', updatedAt: '2024-02-24T10:30:00.000Z' },
        { jobId: 35, applicantId: 43, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Apple', 'iOS ecosystem'), status: 'applied', appliedAt: '2024-02-17T10:20:00.000Z', updatedAt: '2024-02-17T10:20:00.000Z' },
        { jobId: 35, applicantId: 46, resumeUrl: 'https://drive.google.com/file/d/resume-46-35/view', coverLetter: null, status: 'accepted', appliedAt: '2024-02-18T12:45:00.000Z', updatedAt: '2024-02-25T15:10:00.000Z' },

        // Razorpay Backend Intern (Job 36) - 4 applications
        { jobId: 36, applicantId: 39, resumeUrl: 'https://drive.google.com/file/d/resume-39-36/view', coverLetter: coverLetterTemplates[1]('Razorpay', 'Node.js, databases', 'third year'), status: 'screening', appliedAt: '2024-02-16T11:40:00.000Z', updatedAt: '2024-02-24T13:55:00.000Z' },
        { jobId: 36, applicantId: 42, resumeUrl: 'https://drive.google.com/file/d/resume-42-36/view', coverLetter: coverLetterTemplates[0]('Razorpay', 'backend systems', 'API development'), status: 'interview', appliedAt: '2024-02-17T14:05:00.000Z', updatedAt: '2024-02-25T11:20:00.000Z' },
        { jobId: 36, applicantId: 45, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Razorpay', 'fintech'), status: 'applied', appliedAt: '2024-02-18T10:30:00.000Z', updatedAt: '2024-02-18T10:30:00.000Z' },
        { jobId: 36, applicantId: 48, resumeUrl: 'https://drive.google.com/file/d/resume-48-36/view', coverLetter: null, status: 'applied', appliedAt: '2024-02-19T13:15:00.000Z', updatedAt: '2024-02-19T13:15:00.000Z' },

        // Zomato Frontend Intern (Job 37) - 3 applications
        { jobId: 37, applicantId: 40, resumeUrl: 'https://drive.google.com/file/d/resume-40-37/view', coverLetter: coverLetterTemplates[0]('Zomato', 'React, JavaScript', 'frontend'), status: 'accepted', appliedAt: '2024-02-17T11:50:00.000Z', updatedAt: '2024-02-25T14:35:00.000Z' },
        { jobId: 37, applicantId: 43, resumeUrl: 'https://drive.google.com/file/d/resume-43-37/view', coverLetter: coverLetterTemplates[1]('Zomato', 'UI development', 'third year'), status: 'screening', appliedAt: '2024-02-18T14:20:00.000Z', updatedAt: '2024-02-26T10:45:00.000Z' },
        { jobId: 37, applicantId: 46, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Zomato', 'web development'), status: 'applied', appliedAt: '2024-02-19T10:45:00.000Z', updatedAt: '2024-02-19T10:45:00.000Z' },

        // Flipkart ML Intern (Job 38) - 3 applications
        { jobId: 38, applicantId: 41, resumeUrl: 'https://drive.google.com/file/d/resume-41-38/view', coverLetter: coverLetterTemplates[1]('Flipkart', 'ML, Python', 'third year'), status: 'interview', appliedAt: '2024-02-18T11:35:00.000Z', updatedAt: '2024-02-26T13:20:00.000Z' },
        { jobId: 38, applicantId: 44, resumeUrl: 'https://drive.google.com/file/d/resume-44-38/view', coverLetter: coverLetterTemplates[0]('Flipkart', 'machine learning', 'AI systems'), status: 'screening', appliedAt: '2024-02-19T13:50:00.000Z', updatedAt: '2024-02-27T10:15:00.000Z' },
        { jobId: 38, applicantId: 47, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Flipkart', 'data science'), status: 'applied', appliedAt: '2024-02-20T10:20:00.000Z', updatedAt: '2024-02-20T10:20:00.000Z' },

        // Paytm QA Intern (Job 39) - 3 applications
        { jobId: 39, applicantId: 42, resumeUrl: 'https://drive.google.com/file/d/resume-42-39/view', coverLetter: coverLetterTemplates[0]('Paytm', 'testing, automation', 'quality assurance'), status: 'screening', appliedAt: '2024-02-19T11:45:00.000Z', updatedAt: '2024-02-27T14:30:00.000Z' },
        { jobId: 39, applicantId: 45, resumeUrl: 'https://drive.google.com/file/d/resume-45-39/view', coverLetter: coverLetterTemplates[1]('Paytm', 'software testing', 'second year'), status: 'accepted', appliedAt: '2024-02-20T14:10:00.000Z', updatedAt: '2024-02-28T11:45:00.000Z' },
        { jobId: 39, applicantId: 48, resumeUrl: null, coverLetter: null, status: 'applied', appliedAt: '2024-02-21T10:35:00.000Z', updatedAt: '2024-02-21T10:35:00.000Z' },

        // Swiggy Data Intern (Job 40) - 3 applications
        { jobId: 40, applicantId: 43, resumeUrl: 'https://drive.google.com/file/d/resume-43-40/view', coverLetter: coverLetterTemplates[1]('Swiggy', 'SQL, analytics', 'third year'), status: 'interview', appliedAt: '2024-02-20T11:55:00.000Z', updatedAt: '2024-02-28T13:10:00.000Z' },
        { jobId: 40, applicantId: 46, resumeUrl: 'https://drive.google.com/file/d/resume-46-40/view', coverLetter: coverLetterTemplates[0]('Swiggy', 'data analysis', 'business insights'), status: 'screening', appliedAt: '2024-02-21T13:20:00.000Z', updatedAt: '2024-03-01T10:25:00.000Z' },
        { jobId: 40, applicantId: 49, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Swiggy', 'analytics'), status: 'applied', appliedAt: '2024-02-22T10:40:00.000Z', updatedAt: '2024-02-22T10:40:00.000Z' },

        // Part-time & Remote (Job IDs 46-50) - 1-3 applications each
        // Remote React Developer (Job 46) - 2 applications
        { jobId: 46, applicantId: 34, resumeUrl: 'https://drive.google.com/file/d/resume-34-46/view', coverLetter: coverLetterTemplates[0]('Remote Company', 'React, JavaScript', 'remote work'), status: 'screening', appliedAt: '2024-02-21T11:30:00.000Z', updatedAt: '2024-03-01T14:45:00.000Z' },
        { jobId: 46, applicantId: 49, resumeUrl: 'https://drive.google.com/file/d/resume-49-46/view', coverLetter: coverLetterTemplates[1]('Remote Company', 'frontend', 'third year'), status: 'applied', appliedAt: '2024-02-22T13:55:00.000Z', updatedAt: '2024-02-22T13:55:00.000Z' },

        // Part-time Content Writer (Job 47) - 2 applications
        { jobId: 47, applicantId: 35, resumeUrl: null, coverLetter: coverLetterTemplates[2]('Content Agency', 'writing'), status: 'accepted', appliedAt: '2024-02-22T11:40:00.000Z', updatedAt: '2024-03-02T15:20:00.000Z' },
        { jobId: 47, applicantId: 50, resumeUrl: 'https://drive.google.com/file/d/resume-50-47/view', coverLetter: coverLetterTemplates[0]('Content Agency', 'content creation', 'writing skills'), status: 'applied', appliedAt: '2024-02-23T14:05:00.000Z', updatedAt: '2024-02-23T14:05:00.000Z' },

        // Remote Data Entry (Job 48) - 2 applications
        { jobId: 48, applicantId: 36, resumeUrl: 'https://drive.google.com/file/d/resume-36-48/view', coverLetter: null, status: 'screening', appliedAt: '2024-02-23T11:50:00.000Z', updatedAt: '2024-03-03T10:35:00.000Z' },
        { jobId: 48, applicantId: 51, resumeUrl: null, coverLetter: coverLetterTemplates[3]('Data Company', 'data entry, Excel'), status: 'applied', appliedAt: '2024-02-24T13:15:00.000Z', updatedAt: '2024-02-24T13:15:00.000Z' },

        // Part-time Tutor (Job 49) - 2 applications
        { jobId: 49, applicantId: 37, resumeUrl: 'https://drive.google.com/file/d/resume-37-49/view', coverLetter: coverLetterTemplates[1]('Tutoring Platform', 'teaching', 'third year'), status: 'accepted', appliedAt: '2024-02-24T11:25:00.000Z', updatedAt: '2024-03-04T14:50:00.000Z' },
        { jobId: 49, applicantId: 48, resumeUrl: null, coverLetter: coverLetterTemplates[0]('Tutoring Platform', 'mentoring', 'education'), status: 'applied', appliedAt: '2024-02-25T13:40:00.000Z', updatedAt: '2024-02-25T13:40:00.000Z' },

        // Remote Customer Support (Job 50) - 1 application
        { jobId: 50, applicantId: 39, resumeUrl: 'https://drive.google.com/file/d/resume-39-50/view', coverLetter: coverLetterTemplates[2]('Support Company', 'customer service'), status: 'applied', appliedAt: '2024-02-25T11:35:00.000Z', updatedAt: '2024-02-25T11:35:00.000Z' },
    ];

    await db.insert(applications).values(sampleApplications);
    
    console.log('✅ Applications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});