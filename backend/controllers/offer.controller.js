import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateOfferLetter = async (req, res, next) => {
    try {
        const { candidateId, jobId, salary, joinDate, expirationDate } = req.body;

        const candidate = await User.findById(candidateId);
        const job = await Job.findById(jobId).populate('company');

        if (!candidate || !job) {
            return res.status(404).json({ message: "Candidate or Job not found", success: false });
        }

        const prompt = `
        You are an expert HR Manager. Write a professional Offer Letter for a candidate.
        Use HTML formatting (without <html> or <body> tags, just semantic <h1>, <p>, <ul> tags). Do not use markdown backticks, return only the raw HTML.
        
        Details:
        - Candidate Name: ${candidate.fullname}
        - Job Title: ${job.title}
        - Company Name: ${job.company.name}
        - Salary: ${salary}
        - Start Date: ${joinDate}
        - Offer Expiration Date: ${expirationDate}
        
        Make it sound extremely welcoming, professional, and compliant. Include standard contingencies (like background checks if standard) and instructions for acceptance.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await model.generateContent(prompt);
        const offerHtml = result.response.text().replace(/```html|```/g, '');

        return res.status(200).json({
            message: "Offer letter generated",
            offerHtml,
            success: true
        });
    } catch (error) {
        next(error);
    }
};
