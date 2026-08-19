import multer from "multer";

const storage = multer.memoryStorage();

/**
 * ALLOWED FILE TYPES
 * 
 * We use a two-layer check: MIME type (what the server detects) and
 * file extension (what the user named the file). Both must match.
 * 
 * This prevents extension spoofing (e.g. renaming 'malware.exe' to 'photo.jpg').
 */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_RESUME_TYPES = ["application/pdf"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_RESUME_EXTENSIONS = [".pdf"];

/**
 * FILE SIZE LIMITS
 * 
 * - Images (profile photos, company logos): 2MB max.
 *   Reason: Profile photos are resized by Cloudinary anyway. 2MB is more than
 *   enough for any real photo.
 *
 * - Resumes (PDF): 5MB max.
 *   Reason: A typical PDF resume is 100-500KB. 5MB is generous for resumes
 *   with embedded images. This prevents memory exhaustion on the server.
 */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;   // 2MB
const MAX_RESUME_SIZE = 5 * 1024 * 1024;  // 5MB

// Helper to get file extension
import path from "path";
const getExtension = (filename) => path.extname(filename).toLowerCase();

/**
 * imageFilter — Only allows JPEG, PNG, WEBP.
 * Rejects executables, scripts, and other non-image files.
 */
const imageFilter = (req, file, cb) => {
    const ext = getExtension(file.originalname);
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP images are allowed."), false);
    }
};

/**
 * resumeFilter — Only allows PDF files.
 * Reason: PDF is the universal resume format. Allowing .doc/.docx would
 * require server-side document parsing which is a separate security surface.
 */
const resumeFilter = (req, file, cb) => {
    const ext = getExtension(file.originalname);
    if (ALLOWED_RESUME_TYPES.includes(file.mimetype) && ALLOWED_RESUME_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF resumes are accepted."), false);
    }
};

/**
 * imageUpload — For profile photos and company logos.
 */
export const imageUpload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: MAX_IMAGE_SIZE },
}).single("file");

/**
 * resumeUpload — For student resume uploads.
 */
export const resumeUpload = multer({
    storage,
    fileFilter: resumeFilter,
    limits: { fileSize: MAX_RESUME_SIZE },
}).single("file");

/**
 * singleUpload — Legacy export. Used by routes that need to accept both
 * images and resumes (e.g. the general profile update which can include both).
 * 
 * Accepts both image and PDF with a combined 5MB limit.
 */
const combinedFilter = (req, file, cb) => {
    const ext = getExtension(file.originalname);
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_RESUME_TYPES];
    const allAllowedExts = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_RESUME_EXTENSIONS];
    if (allAllowedTypes.includes(file.mimetype) && allAllowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Allowed types: JPEG, PNG, WEBP, PDF."), false);
    }
};

export const singleUpload = multer({
    storage,
    fileFilter: combinedFilter,
    limits: { fileSize: MAX_RESUME_SIZE },
}).single("file");

export const multipleUpload = multer({
    storage,
    fileFilter: combinedFilter,
    limits: { fileSize: MAX_RESUME_SIZE }, // Max size per file
}).array("files", 5); // Allow up to 5 files