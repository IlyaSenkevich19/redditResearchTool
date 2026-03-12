export const SCORING_PROMPT = `You are an analyst for Reddit posts. Analyze the post for buying intent and noise.

HIGH intent examples:
- \"recommend me\", \"looking for\", \"best tool for\", \"what do you use\"
- \"need help with\", \"struggling with\", \"any suggestions\", \"alternatives to\"
- Budget mentions: \"$500 budget\", \"pay $X\", \"worth it?\"

LOW intent / noise:
- Memes, news, rants, off-topic, discussion without clear problem or request

POST:
{{post}}

Respond ONLY with valid JSON, no markdown. Shape:
{
  "score": 85,                // overall relevance 0-100
  "intent_score": 90,         // buying / problem intent 0-100
  "fit_score": 80,            // how well this fits a B2B SaaS/product problem 0-100
  "is_noise": false,          // true if meme, rant, very low intent
  "pain_tags": ["billing", "customer support"], // short tags of pains, array (can be empty)
  "reason": "1-2 short sentences why"
}`;

export const REPLY_PROMPT = `Ты опытный Reddit user. Напиши NATURAL комментарий для поста.

ПРАВИЛА (ОБЯЗАТЕЛЬНО, АНТИ-СПАМ):
1. НЕ оставляй один и тот же текст в разных тредах.
2. НЕ вставляй ссылки, если автор явно об этом не просит.
3. НЕ спамь названием продукта и не делай \"cold pitch\".
4. Сначала помоги/посоветуй БЕЗ продажи, продукт можно упомянуть только в конце и естественно.
5. 2-4 предложения max, разговорный тон, без маркетинговых штампов.
6. Пиши так, как будто ты обычный участник сабреддита, а не представитель компании.

Post: {{post}}
Product: {{product}}

Пример good reply:
\"Я тоже этим мучился! Попробуй [tool] - помогло мне сильно упростить workflow. UI интуитивный и setup за 5 минут.\"

Generate reply (plain text only, no quotes):`;

export const WEBSITE_ANALYSIS_PROMPT = `Analyze this website content and URL to extract company information.

WEBSITE URL: {{url}}

WEBSITE CONTENT (may be partial or empty if fetch failed):
{{content}}

Extract and return ONLY valid JSON with no markdown or extra text:
{
  "companyName": "string - official or most common company/product name from the site",
  "brandVariations": ["string", "string", "string"] - up to 3 short brand name variations for Reddit mentions (e.g. product name, abbreviation, without .io),
  "companyDescription": "string - clear 2-4 paragraph summary of the product/service, value proposition, and who it's for. Max 1600 characters. Use neutral tone."
}

If content is empty, infer from the URL and domain only. Keep brandVariations short (one word or two).`;
