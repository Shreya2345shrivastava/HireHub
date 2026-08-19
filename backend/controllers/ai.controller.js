import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateInterviewPrep = async (req, res) => {
    try {
        const interviewId = req.params.id;
        
        const interview = await Interview.findById(interviewId)
            .populate({
                path: 'applicationId',
                populate: {
                    path: 'applicant',
                    select: 'profile'
                }
            })
            .populate('jobId');

        if (!interview) {
            return res.status(404).json({ message: "Interview not found", success: false });
        }

        const jobTitle = interview.jobId.title;
        const jobDescription = interview.jobId.description;
        const jobRequirements = interview.jobId.requirements?.join(', ');
        
        const parsedResume = interview.applicationId.applicant.profile?.parsedResumeData || {};
        
        const prompt = `
        You are an expert technical recruiter and AI Interview Assistant.
        
        Job Role: ${jobTitle}
        Job Description: ${jobDescription}
        Job Requirements: ${jobRequirements}
        
        Candidate Resume Data:
        Skills: ${parsedResume.skills?.join(', ') || 'None provided'}
        Experience Years: ${parsedResume.experienceYears || '0'}
        Summary: ${parsedResume.summary || 'None provided'}
        Projects: ${JSON.stringify(parsedResume.projects) || 'None provided'}
        
        Based on the job requirements and the candidate's resume, generate an Interview Prep Sheet for the recruiter.
        
        Return the response strictly as a JSON object with the following exact structure:
        {
            "strengths": ["Strength 1", "Strength 2"],
            "weaknesses": ["Weakness 1", "Weakness 2"],
            "suggestedQuestions": ["Question 1", "Question 2", "Question 3"],
            "hiringRecommendation": "A short summary recommendation (1 sentence)"
        }
        
        Do not include markdown tags like \`\`\`json. Return only the raw JSON string.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean up markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsedResult = JSON.parse(text);

        interview.aiPrepSheet = parsedResult;
        await interview.save();

        return res.status(200).json({
            message: "AI Prep Sheet generated successfully.",
            aiPrepSheet: interview.aiPrepSheet,
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error during AI generation.", success: false });
    }
};

export const getCareerIntelligence = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        
        if (!user || user.role !== 'student') {
            return res.status(403).json({ message: "Access denied.", success: false });
        }

        const parsedResume = user.profile.parsedResumeData;
        if (!parsedResume || !parsedResume.extractedSkills || parsedResume.extractedSkills.length === 0) {
            return res.status(400).json({ message: "Please upload and parse your resume first.", success: false });
        }

        const prompt = `
        You are an AI Career Coach. Analyze the following candidate profile:
        Skills: ${parsedResume.extractedSkills.join(', ')}
        Experience: ${parsedResume.experienceYears} years
        Education: ${parsedResume.education}
        Projects: ${JSON.stringify(parsedResume.projects)}
        Summary: ${parsedResume.summary}

        Generate a Career Intelligence Report.
        Return strictly a JSON object with this exact structure:
        {
            "careerScore": 85,
            "topSkills": ["Skill 1", "Skill 2", "Skill 3"],
            "missingSkills": ["Skill to learn 1", "Skill to learn 2"],
            "growthSuggestions": ["Suggestion 1", "Suggestion 2"],
            "learningRoadmap": [
                { "step": "Step 1 name", "description": "What to do" },
                { "step": "Step 2 name", "description": "What to do" }
            ]
        }
        Do not include markdown tags like \`\`\`json. Return only the raw JSON string.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(text);

        user.profile.aiCareerProfile = {
            ...parsedResult,
            lastUpdated: new Date()
        };
        await user.save();

        return res.status(200).json({ success: true, aiCareerProfile: user.profile.aiCareerProfile });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const getResumeOptimizer = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        
        const parsedResume = user.profile.parsedResumeData;
        if (!parsedResume || !parsedResume.extractedSkills || parsedResume.extractedSkills.length === 0) {
            return res.status(400).json({ message: "Please upload and parse your resume first.", success: false });
        }

        const prompt = `
        You are an expert ATS (Applicant Tracking System) software. Score this resume objectively.
        Skills: ${parsedResume.extractedSkills.join(', ')}
        Experience: ${parsedResume.experienceYears} years
        Summary: ${parsedResume.summary}
        
        Return strictly a JSON object:
        {
            "atsScore": 75,
            "missingKeywords": ["keyword1", "keyword2"],
            "weaknesses": ["weakness 1", "weakness 2"],
            "formattingIssues": ["issue 1", "issue 2"],
            "improvements": ["improvement 1", "improvement 2", "improvement 3"]
        }
        Do not include markdown tags like \`\`\`json. Return only the raw JSON string.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(text);

        user.profile.aiResumeOptimizer = {
            ...parsedResult,
            lastUpdated: new Date()
        };
        await user.save();

        return res.status(200).json({ success: true, aiResumeOptimizer: user.profile.aiResumeOptimizer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const generateCoverLetter = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.body;
        
        const user = await User.findById(userId);
        const job = await Job.findById(jobId).populate('company');
        
        if (!job) return res.status(404).json({ message: "Job not found", success: false });
        
        const parsedResume = user.profile.parsedResumeData;

        const prompt = `
        Write a professional cover letter for the following job:
        Job Title: ${job.title}
        Company: ${job.company.name}
        Job Description: ${job.description}
        
        Candidate Details:
        Name: ${user.fullname}
        Skills: ${parsedResume.extractedSkills?.join(', ')}
        Experience: ${parsedResume.experienceYears} years
        
        The cover letter should be concise, professional, and highlight why the candidate's specific skills make them a perfect fit.
        Return the cover letter as a raw string. Do NOT format as JSON.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await model.generateContent(prompt);
        
        return res.status(200).json({ success: true, coverLetter: result.response.text() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const getJobRecommendations = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        
        const parsedResume = user.profile.parsedResumeData;
        if (!parsedResume || !parsedResume.extractedSkills || parsedResume.extractedSkills.length === 0) {
            return res.status(400).json({ message: "Please upload and parse your resume first.", success: false });
        }

        const activeJobs = await Job.find({}).limit(20).select('_id title description requirements location');

        if (activeJobs.length === 0) {
            return res.status(200).json({ success: true, aiJobRecommendations: [] });
        }

        const prompt = `
        You are an AI Job Matcher. Match the candidate's profile against the following available jobs.
        
        Candidate Skills: ${parsedResume.extractedSkills.join(', ')}
        Candidate Experience: ${parsedResume.experienceYears} years
        
        Available Jobs:
        ${activeJobs.map(job => `ID: ${job._id}, Title: ${job.title}, Requirements: ${job.requirements.join(', ')}`).join('\n')}
        
        Return STRICTLY a JSON array containing the top 3 best matching jobs.
        Structure each object as:
        {
            "jobId": "the_exact_job_id",
            "matchPercentage": 90,
            "matchReasoning": "1 sentence why this matches"
        }
        Do not include markdown tags like \`\`\`json. Return only the raw JSON array string.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(text);

        user.profile.aiJobRecommendations = parsedResult.map(res => ({
            jobId: res.jobId,
            matchPercentage: res.matchPercentage,
            matchReasoning: res.matchReasoning,
            generatedAt: new Date()
        }));
        await user.save();

        const populatedUser = await User.findById(userId).populate('profile.aiJobRecommendations.jobId');

        return res.status(200).json({ success: true, aiJobRecommendations: populatedUser.profile.aiJobRecommendations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};
