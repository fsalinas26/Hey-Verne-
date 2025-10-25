# Hey Verne! - Developer Specification
## AI Storytelling for Kids - Hackathon Prototype

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Feature Requirements](#feature-requirements)
6. [API Specifications](#api-specifications)
7. [Vapi Voice Agent Configuration](#vapi-voice-agent-configuration)
8. [RunwayML Integration](#runwayml-integration)
9. [UI/UX Requirements](#uiux-requirements)
10. [Analytics & Stats Dashboard](#analytics--stats-dashboard)
11. [Error Handling](#error-handling)
12. [Testing Plan](#testing-plan)
13. [Implementation Phases](#implementation-phases)

---

## Project Overview

### Problem Statement
Kids are creative and learn visually, but traditional learning is linear, text-based, and passive.

### Solution
Voice-driven, interactive storytelling where kids become the main character, guiding the plot with their voice, exploring concepts through dynamic illustrations.

### Target Audience
- **Primary Users:** Children aged 3-5 years (preschool)
- **Secondary Users:** Parents, teachers, child psychologists (stats dashboard)

### Prototype Scope
- **Single Story:** Space Adventure
- **Total Pages:** 5 pages (10 comic-style panel images)
- **Educational Concepts:** 
  1. The solar system has 8 planets
  2. The sun is a star
  3. Gravity keeps planets in orbit
- **Deployment:** Local environment only
- **Authentication:** None (completely open access)

---

## Technical Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Voice Integration:** Vapi Web SDK
- **State Management:** React Context API / Zustand
- **Image Handling:** Next/Image with loading states
- **Animations:** Framer Motion or CSS animations

### Backend
- **Runtime:** Node.js (Express.js)
- **Database:** SQLite3
- **ORM:** Prisma (optional) or raw SQL
- **API Style:** RESTful

### External Services
- **Voice Agent:** Vapi AI (https://docs.vapi.ai)
- **Image Generation:** RunwayML API (Text/Image to Image)

### Development Tools
- **Package Manager:** npm or pnpm
- **Environment Variables:** .env.local
- **API Testing:** Postman/Thunder Client

---

## System Architecture

### High-Level Flow

```
┌─────────────────┐
│   Next.js Web   │
│    Frontend     │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    v         v              v
┌─────────┐ ┌──────────┐ ┌──────────┐
│  Vapi   │ │ Node.js  │ │ SQLite   │
│Web SDK  │ │ Backend  │ │ Database │
└─────────┘ └────┬─────┘ └──────────┘
                 │
                 v
           ┌──────────┐
           │ RunwayML │
           │   API    │
           └──────────┘
```

### Data Flow

1. **Session Start:**
   - Frontend loads → Creates new session in SQLite
   - Vapi SDK initializes with assistant configuration
   - User sees story selection (Space - default for prototype)

2. **Voice Interaction:**
   - Frontend connects to Vapi via Web SDK
   - Voice transcription happens in real-time
   - Frontend captures user responses and sends to backend

3. **Image Generation:**
   - Backend receives story progression trigger
   - Backend generates image prompts based on story state
   - Backend calls RunwayML with kid's reference image
   - Backend polls for image completion
   - Backend returns URLs to frontend

4. **Stats Tracking:**
   - Every interaction logged to SQLite
   - Stats dashboard queries aggregated data

---

## Database Schema

### SQLite Tables

#### 1. `sessions`
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  story_type TEXT DEFAULT 'space',
  kid_photo_url TEXT,
  shareable_link TEXT,
  status TEXT DEFAULT 'in_progress'
);
```

#### 2. `story_pages`
```sql
CREATE TABLE story_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  page_number INTEGER,
  educational_concept TEXT,
  story_text TEXT,
  agent_prompt TEXT,
  kid_response TEXT,
  kid_response_timestamp DATETIME,
  panel_1_url TEXT,
  panel_2_url TEXT,
  time_spent_seconds INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

#### 3. `interactions`
```sql
CREATE TABLE interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  page_number INTEGER,
  interaction_type TEXT, -- 'voice_input', 'silence', 'choice_made', 'default_path'
  user_input TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

#### 4. `choices`
```sql
CREATE TABLE choices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  page_number INTEGER,
  suggested_options TEXT, -- JSON array
  kid_choice TEXT,
  was_default BOOLEAN DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

#### 5. `analytics_metrics`
```sql
CREATE TABLE analytics_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  metric_name TEXT,
  metric_value TEXT,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

---

## Feature Requirements

### 1. Landing Page (Story Selection)
**Status:** Simplified for prototype - auto-select Space

**Requirements:**
- Responsive design (mobile-first)
- Large, colorful cards showing 3 story options:
  - Space Adventure (active)
  - Sea Exploration (disabled/coming soon)
  - Forest Mystery (disabled/coming soon)
- Click Space → Start experience

**UI Elements:**
- Hero section with "Hey Verne!" branding
- Story cards with preview illustrations
- Clear CTA button: "Start Adventure"

---

### 2. Selfie Capture (Page 1)

**Requirements:**
- Captain Verne voice introduction (20 seconds max):
  - "Hi! I'm Captain Verne, and I'll be your space explorer guide today!"
  - "Before we blast off, let's take a picture of you so you can be the hero of this adventure!"
- Two upload options:
  - Camera capture (browser API)
  - File upload from device
- Visual guidance: Face outline or frame for positioning
- Preview before confirming
- Store image temporarily in backend
- Generate unique session ID

**Error Handling:**
- Camera permission denied → Show upload option
- Upload failed → Retry button
- Invalid file type → Error message with accepted formats

---

### 3. Story Pages (Pages 2-5)

#### Page Structure (All Pages)

**Layout:**
```
┌─────────────────────────────────┐
│     [Comic Panel 1] [Panel 2]   │
│                                  │
│  [Voice indicator: Captain      │
│   Verne is speaking...]         │
│                                  │
│  [Subtitle text of narration]   │
│                                  │
│  [Microphone button/indicator]  │
└─────────────────────────────────┘
```

**Interaction Flow:**
1. Captain Verne narrates story segment (15-20 seconds)
2. Agent asks question with 2-3 suggested options
3. Kid responds via voice (or 10-second timeout → default path)
4. Backend processes response
5. Generate next story segment + images
6. Show loading animation (themed: rockets, stars, planets)
7. Display next page with new panels

#### Page 2: Introduction to Solar System
**Educational Concept:** Solar system has 8 planets

**Story Beat:**
- Blast off from Earth
- See the solar system from above
- Captain Verne introduces the 8 planets

**Decision Point:**
- "Which planet should we visit first?"
- Suggested: Mars (red planet) or Jupiter (biggest planet)
- Accept free-form: any planet name

**Kid's face integration:** 
- Panel 1: Kid in astronaut suit in rocket
- Panel 2: Kid looking at planets through window

#### Page 3: Understanding the Sun
**Educational Concept:** The sun is a star

**Story Beat:**
- Travel toward chosen planet
- Pass near the sun
- Captain Verne explains sun is a star that gives light/heat

**Decision Point:**
- "Should we fly closer to learn more, or keep safe distance?"
- Suggested: closer or safe
- Accept free-form

**Kid's face integration:**
- Panel 1: Kid pointing at sun
- Panel 2: Kid with protective visor looking amazed

#### Page 4: Experiencing Gravity
**Educational Concept:** Gravity keeps planets in orbit

**Story Beat:**
- Arrive at chosen planet
- Experience zero gravity vs planet gravity
- Captain Verne explains gravity keeps everything in place

**Decision Point:**
- "Do you want to explore the surface or orbit around it?"
- Suggested: land or orbit
- Accept free-form

**Kid's face integration:**
- Panel 1: Kid floating in zero gravity
- Panel 2: Kid exploring planet surface/orbiting

#### Page 5: Journey Complete
**No decision point - Conclusion**

**Story Beat:**
- Return to Earth safely
- Recap the 3 things learned
- Celebrate the adventure
- Generate digital book

**Kid's face integration:**
- Panel 1: Kid waving from rocket window
- Panel 2: Kid as space hero with medal/certificate

---

### 4. Digital Book Generation

**Requirements:**
- Create shareable web page at `/story/{sessionId}`
- Public URL (no auth required)
- Contains:
  - All 10 comic panels in order
  - Story text narration for each page
  - Kid's name/photo at the top
  - "Download as PDF" button (optional - can be browser print)
  - Social share buttons (optional for prototype)
  
**UI Design:**
- Vertical scrolling layout
- Mobile-responsive
- Print-friendly CSS

---

### 5. Stats Dashboard (`/stats`)

**Audience Sections:**

#### For Parents
**Metrics:**
1. Session completion rate
2. Favorite choices/paths taken
3. Total time engaged with story
4. Response time to questions (engagement level)

**Visualizations:**
- Line chart: engagement over time
- Bar chart: choice distribution

#### For Teachers
**Metrics:**
5. Educational concepts retention indicators
6. Language complexity in responses
7. Creative vs. suggested choice ratio
8. Story completion patterns

**Visualizations:**
- Pie chart: concept coverage
- Table: response analysis

#### For Child Psychologists
**Metrics:**
9. Decision-making patterns (risk-averse vs. adventurous)
10. Silence periods (hesitation/shyness indicators)

**Visualizations:**
- Heatmap: interaction patterns
- Timeline: engagement fluctuations

**Additional Tracked Metrics:**
- Voice interaction count per page
- Default path triggers (timeouts)
- Page navigation times

**Implementation:**
- Aggregate view (all sessions)
- Filter by date range
- Export data as CSV

---

## API Specifications

### Backend Endpoints

#### 1. Session Management

**POST /api/sessions/create**
```json
Request:
{
  "storyType": "space"
}

Response:
{
  "sessionId": "uuid-v4",
  "createdAt": "2025-10-25T10:00:00Z"
}
```

**POST /api/sessions/{sessionId}/upload-photo**
```json
Request:
Content-Type: multipart/form-data
{
  "photo": <File>
}

Response:
{
  "photoUrl": "/uploads/{sessionId}/photo.jpg",
  "success": true
}
```

**GET /api/sessions/{sessionId}**
```json
Response:
{
  "sessionId": "uuid",
  "status": "in_progress",
  "currentPage": 2,
  "photoUrl": "/uploads/...",
  "pages": [...]
}
```

#### 2. Story Progression

**POST /api/story/next-page**
```json
Request:
{
  "sessionId": "uuid",
  "currentPage": 2,
  "kidResponse": "I want to visit Mars!",
  "responseTime": 3500,
  "suggestedOptions": ["Mars", "Jupiter"]
}

Response:
{
  "pageNumber": 3,
  "storyText": "Great choice! Let's blast off to Mars...",
  "agentPrompt": "Should we fly closer to the sun or keep a safe distance?",
  "suggestedOptions": ["fly closer", "keep safe"],
  "educationalConcept": "sun_is_a_star",
  "panel1Status": "generating",
  "panel2Status": "generating",
  "imageIds": ["img1_id", "img2_id"]
}
```

**GET /api/story/check-images**
```json
Request Query:
?imageIds=img1_id,img2_id

Response:
{
  "images": [
    {
      "id": "img1_id",
      "status": "complete",
      "url": "https://..."
    },
    {
      "id": "img2_id",
      "status": "generating",
      "url": null
    }
  ]
}
```

#### 3. Analytics

**POST /api/analytics/track**
```json
Request:
{
  "sessionId": "uuid",
  "pageNumber": 2,
  "interactionType": "voice_input",
  "userInput": "Mars!",
  "responseTimeMs": 3500
}

Response:
{
  "success": true
}
```

**GET /api/analytics/dashboard**
```json
Response:
{
  "totalSessions": 42,
  "completionRate": 0.85,
  "avgEngagementTime": 320,
  "parentMetrics": { ... },
  "teacherMetrics": { ... },
  "psychologistMetrics": { ... }
}
```

#### 4. Book Generation

**POST /api/book/generate**
```json
Request:
{
  "sessionId": "uuid"
}

Response:
{
  "shareableLink": "https://localhost:3000/story/uuid",
  "success": true
}
```

---

## Vapi Voice Agent Configuration

### Assistant Setup

**Model Configuration:**
```javascript
{
  "name": "Captain Verne - Space Explorer",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 150
  },
  "voice": {
    "provider": "elevenlabs", // or "playht", "deepgram"
    "voiceId": "female-calm-storyteller",
    "stability": 0.75,
    "similarityBoost": 0.75,
    "speed": 0.9 // Slightly slower for young kids
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en"
  }
}
```

### System Prompt

```
You are Captain Verne, a friendly and patient space explorer guide for preschool children (ages 3-5). 

CHARACTER:
- Warm, encouraging, and enthusiastic
- Use very simple words and short sentences (5-8 words max)
- Speak slowly and clearly
- Celebrate every response the child gives

TEACHING GOALS:
You're teaching three concepts through adventure:
1. The solar system has 8 planets
2. The sun is a star that gives light and heat
3. Gravity keeps planets in orbit and things from floating away

CONVERSATION RULES:
- Keep each story segment under 20 seconds (3-4 short sentences)
- Always present 2-3 simple choices, but accept creative answers too
- If child says something unexpected, incorporate it positively
- Use sound effects words: "Whoosh!", "Zoom!", "Wow!"
- Repeat important educational concepts naturally
- Never use complex vocabulary

RESPONSE FORMAT:
After telling a story segment, ask: "What should we do next?"
Then suggest 2 options: "Should we [option A] or [option B]?"

EXAMPLE INTERACTIONS:
"We're flying through space! Whoosh! Look, there's Mars! It's red and rocky. Should we land on Mars or visit Jupiter instead?"

If child says something off-script like "I want to see aliens":
"Aliens! How exciting! Maybe aliens live on Mars. Let's go see! Ready for landing?"
```

### Web SDK Integration (Frontend)

```javascript
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);

// Start call
await vapi.start({
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
  // OR inline config:
  assistant: {
    model: { /* config above */ },
    voice: { /* config above */ },
    firstMessage: "Hi! I'm Captain Verne! Ready for a space adventure?",
  }
});

// Listen for events
vapi.on('speech-start', () => {
  console.log('Captain Verne is speaking');
});

vapi.on('speech-end', () => {
  console.log('Captain Verne finished speaking');
});

vapi.on('message', (message) => {
  if (message.type === 'transcript' && message.role === 'user') {
    // Kid spoke - send to backend
    handleKidResponse(message.transcript);
  }
});

vapi.on('error', (error) => {
  console.error('Vapi error:', error);
});
```

### Conversation Flow Control

**Page Transitions:**
- After kid responds, call backend API
- Backend returns next story segment
- Frontend sends new instructions to Vapi (use `vapi.send()` if supported, or manage state)
- Continue conversation seamlessly

**Timeout Handling:**
- If no response in 10 seconds, trigger default path
- Captain Verne says: "Hmm, let me choose for us! Let's try [default option]!"

---

## RunwayML Integration

### Image Generation API

**Endpoint:** `POST https://api.dev.runwayml.com/v1/text_to_image`

**Headers:**
```
Authorization: Bearer YOUR_RUNWAY_API_KEY
Content-Type: application/json
```

### Request Format for Story Images

```javascript
async function generateStoryPanel(sessionId, pageNumber, panelNumber, storyContext, kidPhotoUrl) {
  const prompt = generatePrompt(pageNumber, panelNumber, storyContext);
  
  const response = await fetch('https://api.dev.runwayml.com/v1/text_to_image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      referenceImages: [kidPhotoUrl], // Kid's selfie as reference
      width: 1024,
      height: 768,
      stylePreset: "children-book-illustration",
      numberOfImages: 1
    })
  });
  
  const data = await response.json();
  return data.taskId;
}
```

### Image Prompt Templates

**Page 2, Panel 1:**
```
"A cheerful young child astronaut in a colorful space suit sitting inside a rocket ship cockpit, 
looking out the window at planet Earth getting smaller. Stars twinkling outside. 
Child's face should be visible and smiling. 
Children's book illustration style, vibrant colors, safe and friendly."
```

**Page 2, Panel 2:**
```
"The same young child astronaut floating in zero gravity inside the spacecraft, 
looking amazed at a view of the solar system with all 8 planets visible in beautiful colors. 
Sun glowing in the distance. Child expressing wonder. 
Children's book illustration style, educational, colorful."
```

**Page 3, Panel 1:**
```
"Young child astronaut in space suit pointing excitedly at the bright sun through a spacecraft window, 
wearing protective visor. Sun depicted as a glowing star with rays. 
Child's face showing curiosity and excitement. 
Children's book illustration style, warm colors."
```

**Page 3, Panel 2:**
```
"Close-up of young child astronaut with protective sun visor looking amazed, 
sunlight reflecting on helmet. Background shows the sun as a beautiful glowing star. 
Children's book illustration style, magical atmosphere."
```

**Page 4, Panel 1:**
```
"Young child astronaut floating playfully in zero gravity inside spacecraft, 
arms spread wide, toys floating around them. Big smile on child's face. 
Planets visible through window in background. 
Children's book illustration style, fun and whimsical."
```

**Page 4, Panel 2:**
```
"Young child astronaut standing on the surface of [CHOSEN_PLANET], 
planting a flag or exploring with tool. Spacecraft visible in background. 
Child looking proud and adventurous. 
Children's book illustration style, heroic pose."
```

**Page 5, Panel 1:**
```
"Young child astronaut waving happily from spacecraft window as Earth comes into view, 
returning home. Stars and space in background. 
Child's face showing joy and accomplishment. 
Children's book illustration style, heartwarming."
```

**Page 5, Panel 2:**
```
"Young child astronaut as space hero, standing proudly with a medal or certificate, 
helmet under arm. Surrounded by planets and stars in a celebratory scene. 
Big proud smile on child's face. 
Children's book illustration style, achievement theme."
```

### Polling for Image Completion

```javascript
async function pollImageStatus(taskId) {
  const maxAttempts = 30;
  const pollInterval = 2000; // 2 seconds
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      return data.output[0].url;
    } else if (data.status === 'failed') {
      throw new Error('Image generation failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error('Image generation timeout');
}
```

### Reference Image Handling

1. Kid uploads selfie
2. Backend saves to `/uploads/{sessionId}/photo.jpg`
3. For each panel generation, pass full URL to selfie as `referenceImages` array
4. RunwayML will incorporate kid's likeness into generated scenes

---

## UI/UX Requirements

### Design System

**Color Palette:**
- Primary: Deep Space Blue (#0B3D91)
- Secondary: Cosmic Purple (#6B4FBB)
- Accent: Star Yellow (#FFD700)
- Background: Soft White (#F8F9FA)
- Text: Dark Gray (#2C3E50)

**Typography:**
- Headings: Fredoka One or similar playful font
- Body: Nunito or similar child-friendly sans-serif
- Size: Large (min 18px for body, 24px+ for headings)

**Spacing:**
- Mobile: 16px base padding
- Desktop: 24px base padding
- Generous tap targets (min 44x44px)

### Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```

### Loading Animation (Space Theme)

**Animation Requirements:**
- Rocket ship flying across screen with exhaust trail
- Stars twinkling in background
- Optional: Planets rotating slowly
- Text: "Creating your next adventure..."
- Duration: Loop indefinitely until images load

**Implementation:**
```javascript
// Framer Motion example
<motion.div
  animate={{
    x: [0, 300, 0],
    rotate: [0, 360]
  }}
  transition={{
    duration: 3,
    repeat: Infinity
  }}
>
  🚀
</motion.div>
```

### Accessibility Requirements

- High contrast text
- Large, clear buttons
- Voice feedback visualizations (waveform or pulsing mic icon)
- Alternative text for all images
- Keyboard navigation support
- Screen reader friendly

### Comic Panel Layout

```jsx
<div className="grid grid-cols-2 gap-4 p-4">
  <div className="aspect-[4/3] relative">
    {/* Panel 1 */}
    <Image src={panel1Url} fill alt="Story panel 1" />
  </div>
  <div className="aspect-[4/3] relative">
    {/* Panel 2 */}
    <Image src={panel2Url} fill alt="Story panel 2" />
  </div>
</div>
```

---

## Error Handling

### Frontend Errors

**Vapi Connection Failures:**
```javascript
try {
  await vapi.start();
} catch (error) {
  // Show friendly error
  showError("Oops! Captain Verne can't connect right now. Please check your microphone and try again!");
  // Log for debugging
  console.error('Vapi error:', error);
}
```

**Microphone Permission Denied:**
```javascript
vapi.on('error', (error) => {
  if (error.message.includes('microphone')) {
    showModal({
      title: "Need Microphone Access",
      message: "Captain Verne needs to hear you! Please allow microphone access.",
      action: "Try Again"
    });
  }
});
```

**Image Loading Failures:**
```javascript
<Image
  src={panelUrl}
  onError={(e) => {
    e.target.src = '/placeholder-space.svg';
  }}
  alt="Story panel"
/>
```

### Backend Errors

**RunwayML API Failures:**
```javascript
try {
  const imageUrl = await generateAndPollImage(prompt, referenceUrl);
} catch (error) {
  // Use fallback image
  console.error('Image generation failed:', error);
  return {
    success: false,
    fallbackUrl: '/assets/default-space-scene.jpg'
  };
}
```

**Database Errors:**
```javascript
try {
  await db.run(insertQuery, params);
} catch (error) {
  console.error('Database error:', error);
  // Continue without saving (degrade gracefully)
  return { success: false, message: 'Session not saved but continuing' };
}
```

**Timeout Handling:**
```javascript
// If kid doesn't respond in 10 seconds
const timeoutId = setTimeout(() => {
  console.log('Kid response timeout - using default path');
  proceedWithDefaultPath(sessionId, currentPage);
}, 10000);

// Clear on response
clearTimeout(timeoutId);
```

### User-Facing Error Messages

**Principles:**
- Never use technical jargon
- Always suggest a solution
- Use friendly, encouraging language
- Include retry options

**Examples:**
- ❌ "API request failed with status 500"
- ✅ "Captain Verne got a bit lost in space! Let's try that again."

- ❌ "Image generation timeout"
- ✅ "Drawing your adventure is taking longer than usual. Let's keep going with a quick sketch for now!"

---

## Testing Plan

### Manual Testing Checklist

#### User Flow Testing
- [ ] Landing page loads on mobile/desktop
- [ ] Story selection works
- [ ] Camera access prompts correctly
- [ ] Photo upload works (both camera and file)
- [ ] Photo preview displays correctly
- [ ] Vapi voice connects and speaks
- [ ] Microphone captures kid's voice
- [ ] Transcription appears correctly
- [ ] Story progresses to next page
- [ ] Images generate and display
- [ ] Loading animation appears during generation
- [ ] Timeout triggers default path after 10 seconds
- [ ] All 5 pages complete successfully
- [ ] Digital book generates with correct content
- [ ] Shareable link works
- [ ] Stats dashboard shows correct data

#### Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile iOS)
- [ ] Firefox
- [ ] Edge

#### Responsive Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1024px+)

### API Testing

**Use Postman/Thunder Client:**

1. Test session creation
2. Test photo upload (valid/invalid files)
3. Test story progression with various responses
4. Test image status polling
5. Test analytics tracking
6. Test book generation
7. Test stats dashboard queries

### Performance Testing

**Metrics to Monitor:**
- Page load time: < 3 seconds
- Vapi connection time: < 2 seconds
- Image generation time: 20-60 seconds per image
- Database query time: < 100ms
- API response time: < 500ms

**Tools:**
- Chrome DevTools Lighthouse
- Network tab monitoring
- Console timing logs

### Error Scenario Testing

- [ ] No microphone available
- [ ] Microphone permission denied
- [ ] Network disconnection mid-story
- [ ] Image generation failure
- [ ] Database write failure
- [ ] Invalid image upload format
- [ ] Vapi API key invalid
- [ ] RunwayML API key invalid
- [ ] Kid doesn't respond (timeout)
- [ ] Kid responds with unexpected input

### Data Validation Testing

- [ ] Session ID is unique
- [ ] Photo URL is stored correctly
- [ ] Story text is saved
- [ ] Timestamps are accurate
- [ ] Analytics metrics calculated correctly
- [ ] Stats dashboard aggregations are accurate

---

## Implementation Phases

### Phase 1: Project Setup & Infrastructure (2-3 hours)

**Tasks:**
1. Initialize Next.js project
   ```bash
   npx create-next-app@latest heyverne --typescript --tailwind --app
   cd heyverne
   ```

2. Initialize Node.js backend
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express cors dotenv sqlite3 multer
   ```

3. Set up SQLite database
   ```bash
   mkdir database
   touch database/schema.sql
   ```

4. Create `.env.local` files
   ```env
   # Frontend
   NEXT_PUBLIC_VAPI_API_KEY=your_key
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
   NEXT_PUBLIC_API_URL=http://localhost:4000
   
   # Backend
   RUNWAY_API_KEY=your_runway_key
   DATABASE_PATH=./database/heyverne.db
   UPLOAD_DIR=./uploads
   ```

5. Install dependencies
   ```bash
   # Frontend
   npm install @vapi-ai/web framer-motion zustand
   
   # Backend
   npm install axios uuid
   ```

**Deliverables:**
- Working dev servers (frontend + backend)
- Database initialized with schema
- Environment variables configured

---

### Phase 2: Core Backend API (3-4 hours)

**Tasks:**
1. Create Express server structure
   ```
   backend/
   ├── server.js
   ├── routes/
   │   ├── sessions.js
   │   ├── story.js
   │   ├── analytics.js
   │   └── book.js
   ├── services/
   │   ├── database.js
   │   ├── runway.js
   │   └── storyGenerator.js
   └── utils/
       └── helpers.js
   ```

2. Implement session management endpoints
3. Implement photo upload handling
4. Implement RunwayML integration
5. Implement story progression logic
6. Test all endpoints with Postman

**Deliverables:**
- All API endpoints working
- Database operations functional
- Image generation pipeline tested

---

### Phase 3: Vapi Voice Agent Configuration (1-2 hours)

**Tasks:**
1. Create Vapi account & get API key
2. Configure assistant in Vapi dashboard:
   - Set up voice model
   - Configure system prompt
   - Test in Vapi's playground
3. Alternative: Use Web SDK inline configuration
4. Document assistant ID and configuration

**Deliverables:**
- Working Vapi assistant
- Voice responses tested
- Transcription working

---

### Phase 4: Frontend - Landing & Photo Upload (2-3 hours)

**Tasks:**
1. Create landing page with story selection
2. Implement photo upload component:
   - Camera capture
   - File upload
   - Preview
3. Integrate session creation API
4. Design responsive layouts
5. Add loading states

**Deliverables:**
- Functional landing page
- Photo upload working on mobile/desktop
- Session created in database

---

### Phase 5: Frontend - Story Experience (4-5 hours)

**Tasks:**
1. Create story page component
2. Integrate Vapi Web SDK:
   - Initialize call
   - Handle speech events
   - Display voice indicators
3. Implement comic panel layout
4. Add loading animations
5. Handle page transitions
6. Implement timeout logic (10 seconds)
7. Test full story flow

**Deliverables:**
- Story pages 2-5 functional
- Voice interaction working
- Images displaying correctly
- Smooth transitions

---

### Phase 6: Story Content & Image Prompts (2-3 hours)

**Tasks:**
1. Write complete story script for all pages
2. Create image prompt templates
3. Implement dynamic prompt generation
4. Test image generation with various choices
5. Refine prompts for consistency

**Deliverables:**
- Complete story narrative
- High-quality image generations
- Consistent visual style

---

### Phase 7: Digital Book Generation (2-3 hours)

**Tasks:**
1. Create shareable book page (`/story/[sessionId]`)
2. Design print-friendly layout
3. Implement book generation endpoint
4. Test shareable links
5. Add social share buttons (optional)

**Deliverables:**
- Beautiful digital book page
- Shareable links working
- Mobile-responsive design

---

### Phase 8: Analytics & Stats Dashboard (3-4 hours)

**Tasks:**
1. Implement analytics tracking throughout app
2. Create stats dashboard page (`/stats`)
3. Build three audience sections:
   - Parents view
   - Teachers view
   - Psychologists view
4. Add data visualizations (charts)
5. Implement CSV export
6. Test data accuracy

**Deliverables:**
- Comprehensive stats dashboard
- Accurate metrics
- Useful visualizations

---

### Phase 9: Error Handling & Edge Cases (2-3 hours)

**Tasks:**
1. Add error boundaries in React
2. Implement fallback UI components
3. Add retry mechanisms
4. Handle all timeout scenarios
5. Test offline behavior
6. Add user-friendly error messages

**Deliverables:**
- Robust error handling
- Graceful degradation
- No crashes on errors

---

### Phase 10: Testing & Polish (2-3 hours)

**Tasks:**
1. Run through full user flow 5+ times
2. Test on multiple devices/browsers
3. Fix bugs and issues
4. Optimize performance
5. Improve animations and transitions
6. Final UI polish
7. Prepare demo script

**Deliverables:**
- Bug-free prototype
- Smooth demo experience
- Documentation for judges

---

### Phase 11: Deployment Preparation (1-2 hours)

**Tasks:**
1. Create demo data (seed database)
2. Prepare presentation materials
3. Write README with setup instructions
4. Create video demo (optional)
5. Test full setup on clean environment

**Deliverables:**
- Ready-to-demo prototype
- Setup documentation
- Presentation ready

---

## Estimated Total Time: 25-35 hours

**Recommended Team Split (3 developers):**
- **Developer 1 (Backend):** Phases 2, 3, 8
- **Developer 2 (Frontend):** Phases 4, 5, 7
- **Developer 3 (Content/Integration):** Phases 6, 9, 10
- **All:** Phases 1, 11 (pair/mob)

---

## Environment Variables Reference

### Frontend `.env.local`
```env
NEXT_PUBLIC_VAPI_API_KEY=sk_live_xxxxx
NEXT_PUBLIC_VAPI_ASSISTANT_ID=asst_xxxxx
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend `.env`
```env
PORT=4000
DATABASE_PATH=./database/heyverne.db
UPLOAD_DIR=./uploads
RUNWAY_API_KEY=runway_xxxxx
CORS_ORIGIN=http://localhost:3000
```

---

## File Structure

```
heyverne/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── story/
│   │   │   ├── [sessionId]/
│   │   │   │   └── page.tsx    # Story experience
│   │   │   └── share/
│   │   │       └── [sessionId]/
│   │   │           └── page.tsx # Digital book
│   │   └── stats/
│   │       └── page.tsx         # Analytics dashboard
│   ├── components/
│   │   ├── PhotoUpload.tsx
│   │   ├── StoryPanel.tsx
│   │   ├── VoiceIndicator.tsx
│   │   ├── LoadingAnimation.tsx
│   │   └── StatsCharts.tsx
│   ├── lib/
│   │   ├── vapi.ts
│   │   └── api.ts
│   └── public/
│       ├── assets/
│       └── animations/
├── backend/                     # Node.js/Express
│   ├── server.js
│   ├── routes/
│   │   ├── sessions.js
│   │   ├── story.js
│   │   ├── analytics.js
│   │   └── book.js
│   ├── services/
│   │   ├── database.js
│   │   ├── runway.js
│   │   └── storyGenerator.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── heyverne.db
│   └── uploads/                 # User photos
├── SPECIFICATION.md             # This file
└── README.md                    # Setup instructions
```

---

## Key Dependencies

### Frontend
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@vapi-ai/web": "^2.0.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "recharts": "^2.10.0"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "sqlite3": "^5.1.0",
    "multer": "^1.4.5",
    "axios": "^1.6.0",
    "uuid": "^9.0.0"
  }
}
```

---

## Success Criteria

### Functional Requirements Met
- ✅ Kid can complete full story journey
- ✅ Voice interaction works smoothly
- ✅ Images generate with kid's face
- ✅ Educational concepts are taught
- ✅ Digital book is generated
- ✅ Stats dashboard shows meaningful data

### Technical Requirements Met
- ✅ Mobile responsive
- ✅ Works locally without deployment
- ✅ All APIs integrated (Vapi, RunwayML)
- ✅ Database persists data
- ✅ Error handling implemented

### UX Requirements Met
- ✅ Simple enough for 3-5 year olds
- ✅ Engaging and fun
- ✅ Loading states keep kid engaged
- ✅ Visual feedback for voice interaction
- ✅ Smooth, no confusing errors

---

## Demo Script for Hackathon

### Setup (Before Demo)
1. Start backend server
2. Start frontend dev server
3. Have test device with camera ready
4. Prepare sample session in database (backup)

### Demo Flow (5 minutes)
1. **Intro (30 sec):** Show landing page, explain problem/solution
2. **Photo Upload (30 sec):** Take/upload kid photo
3. **Voice Interaction (2 min):** Show 2-3 pages of story with voice
4. **Image Generation (1 min):** Show loading animation, reveal kid in scene
5. **Digital Book (30 sec):** Show shareable link output
6. **Stats Dashboard (30 sec):** Show analytics for educators/psychologists
7. **Wrap-up (30 sec):** Emphasize impact, scalability, future stories

### Talking Points
- "Traditional learning is passive - we make it active and personalized"
- "Kids drive their own adventure with their voice"
- "AI generates custom illustrations with the kid as the hero"
- "Educators get insights into decision-making and engagement"
- "Scalable to any educational topic - we started with space"

---

## Future Enhancements (Post-Hackathon)

### Additional Stories
- Sea Exploration: Teach marine biology, ocean zones
- Forest Mystery: Teach ecosystems, animal habitats

### Features
- Parent dashboard with progress tracking
- Multiple language support
- Voice recognition for different accents
- Save and resume sessions
- Print-quality PDF generation
- Achievement badges/rewards
- Multiplayer mode (siblings together)

### Technical Improvements
- Cloud deployment (Vercel + Railway)
- Real database (PostgreSQL)
- CDN for images
- Advanced analytics (ML insights)
- A/B testing different story paths
- Real-time collaboration features

---

## Questions & Support

For implementation questions during hackathon:

**Vapi Integration:**
- Docs: https://docs.vapi.ai
- Community: Vapi Discord

**RunwayML Integration:**
- Docs: https://docs.dev.runwayml.com
- API Reference: https://docs.dev.runwayml.com/api

**Next.js:**
- Docs: https://nextjs.org/docs

---

## License & Credits

**Prototype:** Hey Verne! - Hackathon 2025
**Team:** [Your Team Name]
**Technologies:** Next.js, Node.js, Vapi AI, RunwayML
**Target Age:** 3-5 years (preschool)

---

*End of Specification Document*
*Version 1.0 - Ready for Implementation*
*Estimated Build Time: 25-35 developer hours*

