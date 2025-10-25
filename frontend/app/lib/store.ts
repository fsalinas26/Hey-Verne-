// Zustand store for Hey Verne! state management

import { create } from 'zustand';

interface StoryState {
  // Session info
  sessionId: string | null;
  photoUrl: string | null;
  currentPage: number;
  chosenPlanet: string;
  
  // Story state
  isVapiActive: boolean;
  isCaptainSpeaking: boolean;
  currentStoryText: string;
  currentPrompt: string;
  suggestedOptions: string[];
  
  // Image generation
  panel1Url: string | null;
  panel2Url: string | null;
  imagesLoading: boolean;
  
  // Interaction tracking
  interactionStartTime: number | null;
  
  // Actions
  setSessionId: (id: string) => void;
  setPhotoUrl: (url: string) => void;
  setCurrentPage: (page: number) => void;
  setChosenPlanet: (planet: string) => void;
  setVapiActive: (active: boolean) => void;
  setCaptainSpeaking: (speaking: boolean) => void;
  setStoryContent: (text: string, prompt: string, options: string[]) => void;
  setPanelUrls: (panel1: string | null, panel2: string | null) => void;
  setImagesLoading: (loading: boolean) => void;
  startInteraction: () => void;
  getInteractionTime: () => number;
  reset: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  // Initial state
  sessionId: null,
  photoUrl: null,
  currentPage: 0,
  chosenPlanet: 'Mars',
  isVapiActive: false,
  isCaptainSpeaking: false,
  currentStoryText: '',
  currentPrompt: '',
  suggestedOptions: [],
  panel1Url: null,
  panel2Url: null,
  imagesLoading: false,
  interactionStartTime: null,

  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  
  setPhotoUrl: (url) => set({ photoUrl: url }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setChosenPlanet: (planet) => set({ chosenPlanet: planet }),
  
  setVapiActive: (active) => set({ isVapiActive: active }),
  
  setCaptainSpeaking: (speaking) => set({ isCaptainSpeaking: speaking }),
  
  setStoryContent: (text, prompt, options) => set({
    currentStoryText: text,
    currentPrompt: prompt,
    suggestedOptions: options
  }),
  
  setPanelUrls: (panel1, panel2) => set({
    panel1Url: panel1,
    panel2Url: panel2
  }),
  
  setImagesLoading: (loading) => set({ imagesLoading: loading }),
  
  startInteraction: () => set({ interactionStartTime: Date.now() }),
  
  getInteractionTime: () => {
    const startTime = get().interactionStartTime;
    return startTime ? Date.now() - startTime : 0;
  },
  
  reset: () => set({
    sessionId: null,
    photoUrl: null,
    currentPage: 0,
    chosenPlanet: 'Mars',
    isVapiActive: false,
    isCaptainSpeaking: false,
    currentStoryText: '',
    currentPrompt: '',
    suggestedOptions: [],
    panel1Url: null,
    panel2Url: null,
    imagesLoading: false,
    interactionStartTime: null
  })
}));

