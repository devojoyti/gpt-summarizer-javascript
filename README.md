# GPT-Summarizer
### Lightweight library to summarize long texts using GPT models

GPT-Summarizer provides the capability of summarizing very large text corpus exceeding the token limit of normal GPT models. Of course, you can use it to summarize shorter texts as well. 

## Installation
```sh
$ npm install gptsummarizer
```
## Usage
```sh
$ const Summarizer = require("gptsummarizer")
$ const generator = new Summarizer("put_your_openai_key_here")
$ const summary = await generator.getSummary("Hello! How are you?")
$ console.log(summary)
Two people are exchanging greetings and inquiring about each others wellbeing.
```

## 💪 Power Usage

Setting the GPT model to use for summarization. Currently supports two GPT engines, `text-davinci-003` and `gpt-3.5-turbo`. If no engine is specified, it defaults to `text-davinci-003`
```sh
$ const summary = await generator.getSummary("Hello! How are you?", "gpt-3.5-turbo")
```

Setting other model parameters are like `temperature`, `max_tokens` are optional, and can be done similarly. 
```sh
$ generator.getSummary("Hello! How are you?", 
                       "text-davinci-003", // Engine
                       0.3,                // Temperature
                       600,                // Max Tokens 
                       1,                  // Top_p
                       0,                  // Frequency penalty
                       1)                  // Presence penalty 
```

For more information on how to fine-tune these parameters, follow [OpenAI documentation](https://platform.openai.com/docs/api-reference/completions/create).

## License

MIT
