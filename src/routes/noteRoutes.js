import { Router } from "express";
import { upload } from "../config/storage.js"
import {
    uploadNote,
    renderNote,
    getNotes,
    verifyNoteGrammer
} from "../controller/noteController.js"

const router = Router();

router.post("/upload", upload.single("note"), uploadNote);
router.get("/", getNotes);

router.get("/:id/render", renderNote);
router.get("/:id/grammar", verifyNoteGrammer)


export default router