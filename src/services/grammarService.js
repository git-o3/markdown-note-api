import axios from "axios";
import { marked } from "marked"


const LANG_TOOL_URL = "https://api.languagetool.org/v2/check"

export const checkGrammar = async (text) => {
    try {
        const plainText = marked.parse(text).replace(/<[^>]*>/g, "");
        // languageTool expects data in 'application/x-www-form-urlencoded'
        const params = new URLSearchParams();
        params.append("text", plainText);
        params.append("language", "en-US");

        const response = await axios.post(LANG_TOOL_URL, params);

        // map the results to only the data that's needed
        return response.data.matches.map(match => ({
            message: match.message,
            shortMessage: match.shortMessage,
            offset: match.offset,
            length: match.length,
            replacements: match.replacements.slice(0, 3).map(r => r.value), // top 3 suggestions
            context: match.context.text
        }));
  
    } catch (error) {
        // if the external API is down, throw a custom error
        console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);
        throw new Error("Grammar Service is currently unavailable")
    }
}