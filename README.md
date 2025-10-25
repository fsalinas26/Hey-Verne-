# Hey Verne! 🚀
## AI Storytelling for Kids - Hackathon Prototype

Voice-driven, interactive storytelling that turns learning into an adventure. Kids become the main character, guiding the plot with their voice while learning through play.

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Vapi API Key ([Get one here](https://vapi.ai))
- RunwayML API Key ([Get one here](https://runwayml.com))

### Setup (5 minutes)

**1. Clone and install dependencies:**
```bash
# Frontend setup
cd heyverne
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install @vapi-ai/web framer-motion zustand recharts

# Backend setup
cd ..
mkdir backend
cd backend
npm init -y
npm install express cors dotenv sqlite3 multer axios uuid
```

**2. Environment variables:**

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Create `backend/.env`:
```env
PORT=4000
DATABASE_PATH=./database/heyverne.db
UPLOAD_DIR=./uploads
RUNWAY_API_KEY=your_runway_key
CORS_ORIGIN=http://localhost:3000
```

**3. Initialize database:**
```bash
cd backend
mkdir database uploads
sqlite3 database/heyverne.db < database/schema.sql
```

**4. Run the app:**
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000`

---

## 📚 Documentation

See **[SPECIFICATION.md](./SPECIFICATION.md)** for complete technical details including:
- Full system architecture
- API specifications
- Database schema
- Vapi & RunwayML integration guides
- UI/UX requirements
- Testing plan
- Implementation phases (25-35 hours)

---

## 🎬 Demo Flow

1. **Landing Page** → Select Space Adventure
2. **Photo Upload** → Take/upload kid's selfie
3. **Voice Interaction** → Talk with Captain Verne
4. **Story Pages** → 5 pages teaching:
   - Solar system has 8 planets
   - Sun is a star
   - Gravity keeps planets in orbit
5. **Digital Book** → Shareable link with kid as hero
6. **Stats Dashboard** → Analytics for parents/teachers/psychologists

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, SQLite
- **Voice AI:** Vapi (https://vapi.ai)
- **Image Generation:** RunwayML API
- **Target:** Kids aged 3-5 years

---

## 📊 Project Structure

```
heyverne/
├── frontend/           # Next.js app
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/            # Express API
│   ├── routes/
│   ├── services/
│   └── database/
├── SPECIFICATION.md    # Full technical spec
└── README.md          # This file
```

---

## 🚀 Key Features

✅ Voice-driven storytelling with Captain Verne  
✅ Real-time image generation with kid's face  
✅ Interactive decision-making (hybrid: suggested + free-form)  
✅ Educational concepts woven into adventure  
✅ Shareable digital book creation  
✅ Analytics dashboard for educators  
✅ Mobile-responsive design  
✅ Works completely offline/locally  

---

## 🎨 Design Highlights

- **Comic book style:** 2 panels per page (10 images total)
- **Age-appropriate:** Simple language for 3-5 year olds
- **Themed animations:** Space-themed loading states
- **Accessible:** High contrast, large tap targets, voice feedback

---

## 📈 Analytics Tracked

**10 Key Metrics:**
1. Session completion rate
2. Favorite choices/paths
3. Total engagement time
4. Response time to questions
5. Educational concept retention
6. Language complexity in responses
7. Creative vs. suggested choice ratio
8. Decision-making patterns
9. Silence periods (shyness indicators)
10. Voice interaction frequency

---

## 🐛 Troubleshooting

**Vapi not connecting?**
- Check API key in `.env.local`
- Allow microphone permissions
- Check browser console for errors

**Images not generating?**
- Verify RunwayML API key
- Check API quota/credits
- Look at backend logs

**Database errors?**
- Ensure schema.sql was run
- Check file permissions on `heyverne.db`

---

## 🎯 Success Criteria

- [ ] Kid completes full 5-page story
- [ ] Voice interaction smooth and natural
- [ ] Images include kid's face consistently
- [ ] All 3 educational concepts taught
- [ ] Digital book generates correctly
- [ ] Stats dashboard shows accurate data
- [ ] Mobile responsive on iOS/Android

---

## 🔮 Future Enhancements

- Additional stories (Sea, Forest)
- Multi-language support
- Cloud deployment
- Parent progress tracking
- Achievement system
- Multiplayer mode

---

## 👥 Team

**Hackathon 2025**  
Built with ❤️ for kids who love adventure and learning

---

## 📝 License

Prototype - Hackathon Project

---

## 🔗 Resources

- [Vapi Documentation](https://docs.vapi.ai)
- [RunwayML API](https://docs.dev.runwayml.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Full Specification](./SPECIFICATION.md)

---

**Ready to build? Start with Phase 1 in SPECIFICATION.md!** 🚀
