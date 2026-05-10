import { marked } from "marked";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// sanitizer for the server environment
const window = new JSDOM("").window;
const purify = createDOMPurify(window);

export const convertToHtml = (markdownContent) => {
    // convert markdow to raw Html
    const rawHtml = marked.parse(markdownContent);
    // sanitize to prevent XSS attacks
    return purify.sanitize(rawHtml);
}