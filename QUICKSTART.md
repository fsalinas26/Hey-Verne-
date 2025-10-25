# Quick Start Guide - Getting Your API Keys

## 🔴 Critical: You Need Real API Keys!

Your app is running but needs API keys to work. Here's how to get them:

---

## 1️⃣ Get Vapi AI API Key (For Voice)

### Step-by-step:

1. **Sign up at Vapi:**
   - Go to: https://vapi.ai
   - Click "Sign Up" or "Get Started"
   - Create a free account

2. **Get your API key:**
   - Log in to the dashboard
   - Go to "API Keys" or "Settings"
   - Copy your API key (starts with `sk_`)

3. **Add to your app:**
   - Open: `frontend/.env.local`
   - Replace this line:
     ```
     NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here
     ```
   - With your actual key:
     ```
     NEXT_PUBLIC_VAPI_API_KEY=sk_your_actual_key_here
     ```

4. **Restart frontend:**
   ```bash
   # Stop the frontend (Ctrl+C in the terminal running it)
   # Then restart:
   cd frontend
   npm run dev
   ```

---

## 2️⃣ Get RunwayML API Key (For Images)

### Step-by-step:

1. **Sign up at RunwayML:**
   - Go to: https://runwayml.com
   - Click "Sign Up"
   - Create an account

2. **Get API access:**
   - Go to developer portal or API section
   - Generate an API key
   - Note: RunwayML might require a paid plan for API access

3. **Add to your app:**
   - Open: `backend/.env`
   - Replace this line:
     ```
     RUNWAY_API_KEY=your_runway_api_key_here
     ```
   - With your actual key:
     ```
     RUNWAY_API_KEY=your_actual_runway_key_here
     ```

4. **Restart backend:**
   ```bash
   # Stop the backend (Ctrl+C in the terminal running it)
   # Then restart:
   cd backend
   npm start
   ```

---

## 🎯 Quick Test Without Full Setup

Want to test the basic functionality first? Here's what works without API keys:

### ✅ Works Without Keys:
- Landing page navigation
- Photo upload (camera and file)
- UI and animations
- Database operations
- Stats dashboard

### ❌ Needs Keys to Work:
- Voice interaction with Captain Verne (needs Vapi key)
- Image generation with kid's face (needs RunwayML key)

---

## 🐛 Fixing Camera Issues

If camera isn't working:

1. **Check browser permissions:**
   - Click the 🔒 lock icon in the address bar
   - Make sure Camera is set to "Allow"

2. **Try Chrome/Edge:**
   - Camera works best in Chrome or Edge
   - Safari can be finicky with camera permissions

3. **Use file upload instead:**
   - Click "Upload Photo" button
   - Choose a photo from your device

---

## 🔧 Current Server Status

Your servers should be running at:
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:4000

To check if they're running:
```bash
lsof -i :3001 -i :4000 | grep LISTEN
```

---

## 🚀 After Adding Keys

1. **Restart both servers**
2. **Refresh your browser** (Cmd+R or Ctrl+R)
3. **Test the flow:**
   - Upload photo ✅
   - Voice should work ✅
   - Images should generate ✅

---

## 💡 Free Trial Options

**Vapi:** Usually offers free trial credits
**RunwayML:** Check for free trial or API credits

Both platforms may require credit card for API access.

---

## 🆘 Still Having Issues?

1. Check browser console (F12) for errors
2. Check backend terminal for error messages
3. Verify API keys are correct (no extra spaces)
4. Make sure you restarted after adding keys

---

## 📝 Alternative: Test with Mock Data

If you can't get API keys right now, I can create a demo mode that:
- Uses text-to-speech instead of Vapi
- Shows placeholder images instead of generated ones
- Let me know if you want this option!

---

**Need help getting keys? Let me know which one you're stuck on!**

