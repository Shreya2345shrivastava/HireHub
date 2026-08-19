import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import pdfParse from 'pdf-parse';

/**
 * Extracts structured data (skills, experience, education, links) from raw PDF text using Gemini AI.
 */
export const parseResumeData = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        const text = data.text;

        // Extract Links using Regex (most reliable way)
        const links = { github: "", linkedin: "", portfolio: "" };
        const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
        if (githubMatch) links.github = `https://${githubMatch[0]}`;
        
        const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
        if (linkedinMatch) links.linkedin = `https://${linkedinMatch[0]}`;
        
        const portfolioMatch = text.match(/(?:portfolio|website).*?(https?:\/\/[^\s]+)/i);
        if (portfolioMatch && portfolioMatch[1]) links.portfolio = portfolioMatch[1];

        // Ensure API Key exists
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set. Falling back to basic empty parsing.");
            return { extractedSkills: [], experienceYears: 0, education: "", projects: [], certifications: [], links };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const schema = {
            description: "Extracted candidate data from resume",
            type: SchemaType.OBJECT,
            properties: {
                extractedSkills: {
                    type: SchemaType.ARRAY,
                    description: "Array of technical skills and tools",
                    items: { type: SchemaType.STRING }
                },
                experienceYears: {
                    type: SchemaType.NUMBER,
                    description: "Total years of professional experience (0 if none or just internships)"
                },
                education: {
                    type: SchemaType.STRING,
                    description: "Highest level of education (e.g., 'B.Tech', 'M.Sc', 'MBA', 'High School')"
                },
                projects: {
                    type: SchemaType.ARRAY,
                    description: "Names or short descriptions of major projects",
                    items: { type: SchemaType.STRING }
                },
                certifications: {
                    type: SchemaType.ARRAY,
                    description: "List of certifications",
                    items: { type: SchemaType.STRING }
                },
                strengths: {
                    type: SchemaType.ARRAY,
                    description: "Key professional strengths and core competencies",
                    items: { type: SchemaType.STRING }
                },
                summary: {
                    type: SchemaType.STRING,
                    description: "A professional summary of the candidate's profile"
                }
            },
            required: ["extractedSkills", "experienceYears", "education", "projects", "certifications", "strengths", "summary"]
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const prompt = `Analyze the following resume text and extract the candidate's skills, years of experience, highest education, projects, and certifications.
        
Resume Text:
${text}`;

        const result = await model.generateContent(prompt);
        const aiResponseText = result.response.text();
        
        const parsedAI = JSON.parse(aiResponseText);
        
        return {
            extractedSkills: parsedAI.extractedSkills || [],
            experienceYears: parsedAI.experienceYears || 0,
            education: parsedAI.education || "",
            projects: parsedAI.projects || [],
            certifications: parsedAI.certifications || [],
            strengths: parsedAI.strengths || [],
            summary: parsedAI.summary || "",
            links
        };
    } catch (error) {
        console.error("Resume parsing failed:", error);
        return {
            extractedSkills: [],
            experienceYears: 0,
            education: "",
            projects: [],
            certifications: [],
            strengths: [],
            summary: "",
            links: { github: "", linkedin: "", portfolio: "" }
        };
    }
};
