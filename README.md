# ಕೃಷಿ ಮಿತ್ರ (Krushi Mitra) 
AI-Powered Kannada Farming Assistant using Gemini + Google Cloud**

Krushi Mitra is an intelligent, Kannada-first agricultural web assistant designed to empower Indian farmers through AI. It delivers crop disease diagnosis, real-time price insights, cultivation planning, government scheme info, and more — all in Kannada text and voice.

Key Features

| Feature | Description |
|--------|-------------|
| 🌿 Crop Disease Detection | Upload plant photo → Gemini Vision diagnoses disease + home remedies in Kannada |
| 💰 Market Price Assistant | Ask "ಟೊಮೆಟೋ ಬೆಲೆ ಇಂದು ಎಷ್ಟು?" → Get predicted price + sell/wait tip |
| 📅 Cultivation Guidelines | Enter crop + acreage → Week-wise cultivation plan |
| 🎥 Kannada YouTube Videos | View latest farming videos using YouTube API |
| 🤖 Kannada AI Chat | Ask any agri-related question → Gemini responds in Kannada |
| 🏛 Government Schemes | Type “ಸಬ್ಸಿಡಿ” → Summarized Kannada scheme info |
| 📍 Nearby Agro Services | Get live location + map for agro centers, mandi, fertilizer shops |

Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Firebase Cloud Functions
- **Database/Storage:** Firebase Storage (for images & TTS)
- **Deployment:** Firebase Hosting

Google Cloud & APIs Used

| Technology | Usage |
|-----------|-------|
| **Gemini 1.5 Pro Vision** | Crop image analysis and diagnosis |
| **Gemini 1.5 Pro Text** | Question answering, cultivation plans, scheme summarization |
| **Vertex AI Custom Model** | Crop + date → Market price prediction |
| **Text-to-Speech API (kn-IN)** | Kannada audio response |
| **YouTube Data API** | Fetch relevant Kannada agriculture videos |
| **Google Maps API** | Locate nearby agro services |
| **Firebase Suite** | Hosting, Functions, Storage, Auth



