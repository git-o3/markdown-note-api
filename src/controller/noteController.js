import path from "path";
import * as grammarService from "../services/grammarService.js";
import * as noteService from "../services/noteService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import fs from "fs/promises"


export const verifyNoteGrammer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const filePath = path.join("uploads", id);

    // read the file content
    const markdown = await fs.readFile(filePath, "utf-8");

    // run grammer check
    const issues = await grammarService.checkGrammar(markdown);

    res.json({
        noteId: id,
        issuesCount: issues.length,
        issues
    });
});

export const uploadNote = asyncHandler(async (req, res) => {
    const result = await noteService.saveNote(req.file);
    res.status(201).json({ message: "Note archived successfully", ...result });
});

export const renderNote = asyncHandler(async (req, res) => {
    const html = await noteService.getRenderedNote(req.params.id);
    res.set("Content-Type", "text/html");
    res.send(html);
});

export const getNotes = asyncHandler(async (req, res) => {
    const notes = await noteService.listAllNotes();
    res.json({ count: notes.length, notes });
});