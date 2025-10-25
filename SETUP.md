# Hey Verne! - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Vapi AI API key ([Get one at vapi.ai](https://vapi.ai))
- RunwayML API key ([Get one at runwayml.com](https://runwayml.com))

## Quick Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Create .env file
cat > .env << 'EOF'
PORT=4000
DATABASE_PATH=./database/heyverne.db
UPLOAD_DIR=./uploads
RUNWAY_API_KEY=your_runway_api_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
EOF

# Update .env with your actual API keys
# Edit the file and replace "your_runway_api_key_here" with your actual key

# Start backend server
npm start
```

The backend should now be running at `http://localhost:4000`

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install dependencies (already done)
npm install

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF

# Update .env.local with your actual API keys
# Edit the file and replace the placeholder keys with your actual keys

# Start frontend dev server
npm run dev
```

The frontend should now be running at `http://localhost:3000`

### 3. Configure Vapi Assistant (Optional)

You have two options:

**Option A: Use Inline Configuration (Easier)**
- Leave `NEXT_PUBLIC_VAPI_ASSISTANT_ID` empty
- The app will use the inline Vapi configuration in `frontend/app/lib/vapi.ts`

**Option B: Create Assistant in Vapi Dashboard**
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Create a new Assistant
3. Configure:
   - **Model:** GPT-4
   - **Voice:** ElevenLabs (female, calm)
   - **System Prompt:** Copy from `SPECIFICATION.md` (Vapi section)
   - **First Message:** "Hi! I'm Captain Verne! Ready for a space adventure?"
4. Copy the Assistant ID
5. Paste it in `frontend/.env.local` as `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

## Testing the Application

1. **Open your browser:** Navigate to `http://localhost:3000`

2. **Start an adventure:**
   - Click "Start Adventure!" on the Space card
   - You'll be taken to the story page

3. **Upload a photo:**
   - Use camera or upload a selfie
   - This photo will be incorporated into all story images

4. **Talk with Captain Verne:**
   - Allow microphone access when prompted
   - Listen to Captain Verne
   - Respond with your voice when prompted
   - Make choices to guide your adventure

5. **Complete the story:**
   - Go through all 5 pages
   - At the end, you'll be redirected to your digital book

6. **View your book:**
   - See all your adventure panels with your face in them
   - Share or print your book

7. **Check analytics:**
   - Navigate to `http://localhost:3000/stats`
   - View aggregated analytics across all sessions

## Troubleshooting

### Backend won't start
- Check if port 4000 is available: `lsof -i :4000`
- Verify database file exists: `ls backend/database/heyverne.db`
- Check SQLite is installed: `sqlite3 --version`

### Frontend won't start
- Check if port 3000 is available: `lsof -i :3000`
- Clear Next.js cache: `rm -rf frontend/.next`
- Reinstall dependencies: `cd frontend && rm -rf node_modules && npm install`

### Vapi voice not working
- Check browser microphone permissions
- Verify `NEXT_PUBLIC_VAPI_API_KEY` is set correctly
- Open browser console for error messages
- Try using inline configuration (leave ASSISTANT_ID empty)

### Images not generating
- Verify `RUNWAY_API_KEY` is set correctly in backend `.env`
- Check RunwayML API credits/quota
- Look at backend console logs for errors
- Images take 20-60 seconds to generate (loading animation should show)

### Database errors
- Reinitialize database:
  ```bash
  cd backend
  rm database/heyverne.db
  sqlite3 database/heyverne.db < database/schema.sql
  ```

### CORS errors
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default should be `http://localhost:3000`

## File Structure

```
heyverne/
├── backend/
│   ├── server.js              # Main Express server
│   ├── routes/                # API endpoints
│   │   ├── sessions.js        # Session management
│   │   ├── story.js           # Story progression
│   │   ├── analytics.js       # Analytics tracking
│   │   └── book.js            # Book generation
│   ├── services/              # Business logic
│   │   ├── database.js        # SQLite operations
│   │   ├── runway.js          # RunwayML integration
│   │   └── storyGenerator.js # Story content & prompts
│   ├── database/              # SQLite database
│   │   ├── schema.sql         # Database schema
│   │   └── heyverne.db        # SQLite file
│   └── uploads/               # Kid photos (created automatically)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── story/[sessionId]/ # Story experience
│   │   ├── book/[sessionId]/  # Digital book
│   │   ├── stats/             # Analytics dashboard
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities (API, Vapi, Store)
│   └── public/                # Static assets
│
├── SPECIFICATION.md           # Complete technical spec
├── SETUP.md                   # This file
└── README.md                  # Project overview
```

## API Endpoints Reference

### Backend (`http://localhost:4000`)

**Sessions:**
- `POST /api/sessions/create` - Create new session
- `POST /api/sessions/:id/upload-photo` - Upload kid's photo
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/complete` - Mark session complete

**Story:**
- `POST /api/story/next-page` - Progress to next page
- `GET /api/story/check-images` - Check image generation status
- `GET /api/story/content/:pageNumber` - Get story content

**Analytics:**
- `POST /api/analytics/track` - Track interaction
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/session/:id` - Get session analytics

**Book:**
- `POST /api/book/generate` - Generate shareable book
- `GET /api/book/:id` - Get book data

## Environment Variables Summary

### Backend `.env`
```env
PORT=4000
DATABASE_PATH=./database/heyverne.db
UPLOAD_DIR=./uploads
RUNWAY_API_KEY=<your_runway_key>
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_VAPI_API_KEY=<your_vapi_key>
NEXT_PUBLIC_VAPI_ASSISTANT_ID=<optional_assistant_id>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Development Tips

1. **Backend logs:** Watch the terminal running `npm start` in backend
2. **Frontend logs:** Check browser console (F12)
3. **Database inspection:** Use `sqlite3 backend/database/heyverne.db` then `.tables`, `SELECT * FROM sessions;`, etc.
4. **Hot reload:** Both frontend and backend support hot reload
5. **Clear data:** Delete `heyverne.db` and reinitialize to start fresh

## Next Steps

After confirming everything works:
1. Test the complete user flow multiple times
2. Try different voice responses
3. Check that images include the kid's face
4. Verify stats dashboard shows correct data
5. Test on mobile devices (responsive design)

## Support

For issues or questions:
- Check `SPECIFICATION.md` for detailed technical information
- Review browser and server console logs
- Verify all environment variables are set correctly

---

**Ready to launch your space adventure! 🚀**

