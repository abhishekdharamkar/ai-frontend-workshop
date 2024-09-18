import { ChatGroq } from "@langchain/groq";
import.meta.env
const llm =  new ChatGroq({
    apiKey: import.meta.env.VITE_API_KEY,
  });
export async function getAnswer(message: string) {

    try {
        var res = await llm.invoke(message);
        console.log(res);

        return res?.content;
        
    } catch (e) {
        console.error(e);
    }

   
}