const { Configuration, OpenAIApi } = require("openai");
const { encode, decode } = require('gpt-3-encoder');
const gptmodels = require('./gptmodels');

const token_limit_text_davinci_003 = 4085
const token_limit_gpt_35_turbo = 4085

class Summarizer {

    constructor(key) {
        const configuration = new Configuration({
            apiKey: key
        });

        this.openai = new OpenAIApi(configuration);
    }

    async getSummary(text, engine, temperature, max_tokens, top_p, frequency_penalty, presence_penalty) {
        // Setting default values of the parameters
        temperature ||= 0.3
        max_tokens ||= 600
        top_p ||= 1
        frequency_penalty ||= 0
        presence_penalty ||= 1

        // Will be used later
        var token_limit

        switch (engine) {
            case "text-davinci-003":
                engine = gptmodels.text_davinci_003
                token_limit = token_limit_text_davinci_003
                break
            case "gpt-3.5-turbo":
                engine = gptmodels.gpt_35_turbo
                token_limit = token_limit_gpt_35_turbo
                break
            default:
                engine = gptmodels.text_davinci_003
                token_limit = token_limit_text_davinci_003
        }

        // Get the length of the current text token
        const tokens = encode(text)
        const number_of_tokens = tokens.length

        const output_token_requested = Math.max(max_tokens, Math.floor(number_of_tokens / 4))

        // If the current text input is lesser than the token limit of the model, go forward with summarization
        if (number_of_tokens + output_token_requested < token_limit) {
            const summary = await this.getGPTSummary(text, engine, temperature, output_token_requested, top_p, frequency_penalty, presence_penalty)
            return summary
        }
        else {
            // We need to shorten the text, while preserving all the details.
            const max_token_batch = 3 * (Math.floor(token_limit / 4))
            var summary = ""
            var ptr = 0
            var done = false
            var curr_chunk = 0
            while (!done) {
                // If we have reached at token end, finish after this operation
                if (ptr + max_token_batch >= tokens.length) {
                    done = true
                    curr_chunk = tokens.length
                }
                else {
                    curr_chunk = ptr + max_token_batch
                }

                const curr_tokens = tokens.slice(ptr, curr_chunk)
                // Keeping a buffer of 100 tokens so that no loss of info takes place

                ptr = curr_chunk - 100

                // Transfer back to normal text
                const curr_text = decode(curr_tokens)

                const interim_summary = await this.getGPTSummary(curr_text, engine, temperature, output_token_requested, top_p, frequency_penalty, presence_penalty)

                summary = summary.concat(" ".concat(interim_summary))
            }

            return summary
        }
    }

    async getGPTSummary(text, engine, temperature, max_tokens, top_p, frequency_penalty, presence_penalty) {
        if (engine == gptmodels.text_davinci_003) {
            return await this.getDaVinci003Summary(text, engine, temperature, max_tokens, top_p, frequency_penalty, presence_penalty)
        }
        else if (engine == gptmodels.gpt_35_turbo) {
            return await this.getGPT35TurboSummary(text, engine, temperature, max_tokens, top_p, frequency_penalty, presence_penalty)
        }
    }

    async getDaVinci003Summary(text, engine, temperature, max_tokens, top_p, frequency_penalty, presence_penalty) {
        const summary_prompt = "Summarize the following text: "

        text = summary_prompt.concat(text)

        const response = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt: text,
            temperature: temperature,
            max_tokens: max_tokens,
            top_p: top_p,
            frequency_penalty: frequency_penalty,
            presence_penalty: presence_penalty,
        })

        return response.data.choices[0].text.trim()
    }

    async getGPT35TurboSummary(text, engine, temperature, max_tokens, top_p, frequency_penalty, presence_penalty) {
        const summary_prompt = "Summarize the following text"

        const response = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "system", "content": summary_prompt }, { "role": "user", "content": text }],
            temperature: temperature,
            max_tokens: max_tokens,
            top_p: top_p,
            frequency_penalty: frequency_penalty,
            presence_penalty: presence_penalty,
        })

        return response.data.choices[0].message.content.trim()
    }
}

module.exports = Summarizer