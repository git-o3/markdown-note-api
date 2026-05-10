import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // using UUID ensures every note is "sovereign" and unique
        cb(null, `${uuidv4()}${ext}`);
    }
});

export const upload = multer({ storage });