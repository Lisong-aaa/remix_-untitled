<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7013ddc6-ce84-4786-837f-bbc1d673f12d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure the OpenAI-compatible API in [.env.local](.env.local):
   ```env
   OPENAI_API_KEY="YOUR_API_KEY"
   OPENAI_BASE_URL="https://api.ltoken.shop/v1"
   OPENAI_MODEL="gpt-5.4-mini"
   ```
3. Run the app:
   `npm run dev`
