import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { parseResumeData } from "../utils/resumeParser.js";
import nodemailer from "nodemailer";
import { Notification } from "../models/notification.model.js";
import { createAuditLog } from "../services/audit.service.js";

// ─── OTP Utilities ──────────────────────────────────────────────────────────

/**
 * generateOTP — Returns a cryptographically random 6-digit string.
 * Using Math.random() is acceptable for OTPs (not cryptographic keys),
 * but we pad to ensure consistent 6-digit length.
 */
const generateOTP = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

// ─── Nodemailer Setup ────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"HireHub Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your HireHub Login OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                <h2 style="color: #1e293b;">Your One-Time Password</h2>
                <p>Use the following OTP to complete your login. It expires in <strong>5 minutes</strong>.</p>
                <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:bold;color:#0f172a;">
                    ${otp}
                </div>
                <p style="color:#64748b;font-size:12px;margin-top:20px;">If you did not request this, please ignore this email. Do not share this OTP with anyone.</p>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

// ─── Cookie Options Helper ───────────────────────────────────────────────────

/**
 * getCookieOptions — Returns environment-aware cookie settings.
 * 
 * - secure: true in production forces HTTPS. In dev, false allows HTTP.
 * - sameSite: "strict" in production prevents CSRF attacks. "lax" in dev
 *   is needed because localhost doesn't always support strict same-site.
 * - httpOnly: ALWAYS true — prevents JavaScript (XSS) from reading the cookie.
 */
const getCookieOptions = () => ({
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
});

// ─── Register ────────────────────────────────────────────────────────────────

export const register = async (req, res, next) => {
    try {
        // req.validatedData is populated by the validate(registerSchema) middleware
        const { fullname, email, phoneNumber, password, role } = req.validatedData || req.body;

        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: "Profile photo is required.",
                success: false,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists.",
                success: false,
            });
        }

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds for registration

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url,
            },
        });

        if (role === 'recruiter') {
            const admins = await User.find({ role: 'admin' });
            const notifications = admins.map(admin => ({
                recipient: admin._id,
                sender: newUser._id,
                title: "New Recruiter Registered",
                message: `A new recruiter "${fullname}" has joined the platform.`,
                type: "new_recruiter_registers",
                link: "/admin/users",
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        // Audit Log
        await createAuditLog({
            actor: newUser._id,
            actorRole: role,
            action: "USER_REGISTERED",
            targetType: "user",
            targetId: newUser._id,
            targetName: fullname,
            description: `New ${role} registered: ${fullname}`,
            ipAddress: req.ip
        });

        return res.status(201).json({
            message: "Account created successfully. Please log in.",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.validatedData || req.body;

        const user = await User.findOne({ email });

        // Use the same generic message for both "user not found" and "wrong password"
        // to prevent user enumeration attacks (attackers finding which emails are registered)
        const invalidCredentialsMsg = "Invalid email, password, or role.";

        if (!user) {
            return res.status(401).json({ message: invalidCredentialsMsg, success: false });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: invalidCredentialsMsg, success: false });
        }

        if (role !== user.role) {
            return res.status(401).json({ message: invalidCredentialsMsg, success: false });
        }

        // Generate OTP as a string
        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10); // Hash before storing
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await sendOTP(user.email, otp); // Send PLAIN otp to user's email

        // Store the HASHED otp in the database, not the plain one
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        user.trackLogin();
        await user.save();

        return res.status(200).json({
            message: "OTP sent to your registered email. Please verify.",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.validatedData || req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Generic message — don't confirm whether email exists
            return res.status(400).json({ message: "Invalid or expired OTP.", success: false });
        }

        // Check OTP expiry first
        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ message: "OTP has expired. Please log in again.", success: false });
        }

        // Compare submitted OTP against the HASHED otp in the database
        if (!user.otp) {
            return res.status(400).json({ message: "No pending OTP. Please log in again.", success: false });
        }

        const isOtpValid = await bcrypt.compare(otp, user.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP.", success: false });
        }

        // Clear OTP fields after successful verification
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

        // Return a clean user object — never return password, otp, or otpExpiry
        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        // Audit Log
        await createAuditLog({
            actor: user._id,
            actorRole: user.role,
            action: "USER_LOGIN",
            targetType: "user",
            targetId: user._id,
            targetName: user.fullname,
            description: `${user.role} logged in: ${user.fullname}`,
            ipAddress: req.ip
        });

        return res
            .status(200)
            .cookie("token", token, getCookieOptions())
            .json({
                message: `Welcome back, ${user.fullname}!`,
                user: safeUser,
                success: true,
            });
    } catch (error) {
        next(error);
    }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (req, res, next) => {
    try {
        const userId = req.id;
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                await createAuditLog({
                    actor: user._id,
                    actorRole: user.role,
                    action: "USER_LOGOUT",
                    targetType: "user",
                    targetId: user._id,
                    targetName: user.fullname,
                    description: `${user.role} logged out: ${user.fullname}`,
                    ipAddress: req.ip
                });
            }
        }

        return res
            .status(200)
            .cookie("token", "", { maxAge: 0, httpOnly: true })
            .json({ message: "Logged out successfully.", success: true });
    } catch (error) {
        next(error);
    }
};

// ─── Update Profile ──────────────────────────────────────────────────────────

export const updateProfile = async (req, res, next) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.validatedData || req.body;

        let user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        const file = req.file;
        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
        }

        // Handle resume vs profile photo based on file MIME type
        if (file) {
            const fileUri = getDataUri(file);
            if (file.mimetype === "application/pdf") {
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { 
                    resource_type: "raw",
                    public_id: `resume_${Date.now()}.pdf`
                });
                user.profile.resume = cloudResponse.secure_url;
                user.profile.resumeOriginalName = file.originalname;
                
                try {
                    // Extract structured data from the uploaded resume buffer
                    const parsedData = await parseResumeData(file.buffer);
                    user.profile.parsedResumeData = parsedData;
                } catch (err) {
                    console.error("Error parsing resume during upload:", err);
                }
            } else {
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                user.profile.profilePhoto = cloudResponse.secure_url;
            }
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio !== undefined) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        await user.save();

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: safeUser,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ─── Toggle Save Job ──────────────────────────────────────────────────────────

export const toggleSaveJob = async (req, res, next) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        if (!user.savedJobs) user.savedJobs = [];

        const jobIndex = user.savedJobs.indexOf(jobId);
        let isSaved;

        if (jobIndex >= 0) {
            user.savedJobs.splice(jobIndex, 1);
            isSaved = false;
        } else {
            user.savedJobs.push(jobId);
            isSaved = true;
        }

        await user.save();

        return res.status(200).json({
            message: isSaved ? "Job saved successfully." : "Job removed from saved jobs.",
            savedJobs: user.savedJobs,
            isSaved,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ─── Get Saved Jobs ───────────────────────────────────────────────────────────

export const getSavedJobs = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).populate({
            path: "savedJobs",
            populate: { path: "company" },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        return res.status(200).json({ savedJobs: user.savedJobs || [], success: true });
    } catch (error) {
        next(error);
    }
};

// ─── Get Analytics (Platform-level monthly user stats) ────────────────────────

export const getAnalytics = async (req, res, next) => {
    try {
        const analytics = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalStudentLogins: { $sum: { $cond: ["$studentLogin", 1, 0] } },
                    totalRecruiterLogins: { $sum: { $cond: ["$recruiterLogin", 1, 0] } },
                    totalActiveUsers: {
                        $sum: {
                            $cond: [{ $or: ["$studentLogin", "$recruiterLogin"] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        const result = analytics[0] || {
            totalActiveUsers: 0,
            totalStudentLogins: 0,
            totalRecruiterLogins: 0,
        };

        return res.status(200).json({ ...result, success: true });
    } catch (error) {
        next(error);
    }
};

// --- PHASE 7: ENTERPRISE FEATURES ---

export const searchCandidates = async (req, res, next) => {
    try {
        const { keyword, skills, experience, location } = req.query;
        
        let query = { role: 'student' };

        // Advanced Search Query Building
        if (keyword) {
            query.$or = [
                { fullname: { $regex: keyword, $options: 'i' } },
                { 'profile.bio': { $regex: keyword, $options: 'i' } },
                { 'profile.skills': { $regex: keyword, $options: 'i' } }
            ];
        }

        if (skills) {
            const skillArray = skills.split(',').map(s => s.trim());
            // Match any of the skills
            query['profile.skills'] = { $in: skillArray.map(s => new RegExp(s, 'i')) };
        }

        // Search in users
        const candidates = await User.find(query)
            .select('-password')
            .limit(50); // Limit for performance

        // Filter by experience if provided (since experience might be in parsed resume)
        // Note: For true enterprise scalability, experience should be a top-level indexed field.
        let filteredCandidates = candidates;
        if (experience) {
            const expNum = parseInt(experience);
            filteredCandidates = candidates.filter(c => {
                const cExp = c.profile?.aiCareerProfile?.parsedResume?.experienceYears || 0;
                return cExp >= expNum;
            });
        }

        return res.status(200).json({
            success: true,
            count: filteredCandidates.length,
            candidates: filteredCandidates
        });

    } catch (error) {
        next(error);
    }
};