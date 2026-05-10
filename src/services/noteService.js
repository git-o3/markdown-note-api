import fs from "fs/promises";
import path from "path";
import { convertToHtml } from "./parser.js";

const UPLOADS_DIR = "uploads";

export const saveNote = async (file) => {
    if (!file) throw new Error("No file provided");

    return {
        id: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
    };
};

export const getRenderedNote = async (id) => {
    const filePath = path.join(UPLOADS_DIR, id);

    const exists = await fs.access(filePath).then(() => true).catch(() => false);

    if (!exists) {
        throw new Error("ARCHIVE_NOT_FOUND");
    }

    const markdown = await fs.readFile(filePath, "utf-8");
    return convertToHtml(markdown)
};

export const listAllNotes = async () => {
    const files = await fs.readdir(UPLOADS_DIR);
    // filter out sytem files like .gitignore or .DS_Store
    return files.filter(file => file.endsWith(".md"));
}