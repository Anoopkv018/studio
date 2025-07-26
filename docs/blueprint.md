# **App Name**: ಕೃಷಿ ಮಿತ್ರ (Krushi Mitra)

## Core Features:

- Dashboard: Responsive dashboard with service cards for key functionalities.
- Crop Disease Detection: Analyze uploaded plant image using Gemini to detect diseases and provide solutions; include audio playback of the response.
- Market Price Query: Query current market prices for crops using a custom Vertex AI endpoint; display results in Kannada with text and audio.
- Cultivation Guidelines: Generate a week-by-week Kannada cultivation plan based on crop, location, and area inputs.
- YouTube Videos: Display relevant Kannada agricultural training videos fetched using the YouTube Data API.
- General Assistant Chat: Provide a chatbot interface powered by the Gemini text model to answer farmer questions in Kannada; offer both text and audio responses.
- Govt Scheme Info: Use Gemini to summarize government schemes relevant to farmer queries and display the results with links to official portals. The LLM should use its tool when deciding whether to incorporate a link in its answer.
- Agro Services Locator: Show nearby agricultural services (shops, mandis, centers) using the Google Maps API based on live location or manual input.

## Style Guidelines:

- Primary color: Earthy green (#6B8E23) to represent agriculture and nature.
- Background color: Desaturated light green (#F0F8E0) to provide a clean and calming backdrop.
- Accent color: Brownish-orange (#A0522D) to highlight important elements and call-to-actions.
- Body and headline font: 'PT Sans' (sans-serif) for a modern yet readable appearance in Kannada.
- Note: currently only Google Fonts are supported.
- Use relevant, visually clear icons for each service card, reinforcing the function.
- Maintain a clean, modular, and mobile-first responsive design using Tailwind CSS.
- Subtle Tailwind hover effects on service cards to indicate interactivity.