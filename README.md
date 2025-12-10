
# Gemini Vercel Backend (ready to deploy)

Files included:
- api/chat/route.js
- package.json
- vercel.json

How to deploy (quick):
1. Go to https://vercel.com and log in.
2. Click "Add New" → "Project" → choose "Upload" (upload from your computer).
3. Select this folder (upload the zipped file or the folder).
4. After upload, in Project Settings → Environment Variables, add:
   - Name: GEMINI_API_KEY
   - Value: <your Gemini API key from Google AI Studio>
5. Deploy. The URL will be: https://your-project-name.vercel.app/api/chat
6. Test with curl:
   curl -X POST https://your-project-name.vercel.app/api/chat -H "Content-Type: application/json" -d '{"message":"hello"}'

In Unity, call that URL with a POST JSON {"message":"text"}. The response JSON contains {"reply":"..."}.
