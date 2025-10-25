// API client for Hey Verne! Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Session {
  id: string;
  created_at: string;
  completed_at?: string;
  story_type: string;
  kid_photo_url?: string;
  shareable_link?: string;
  status: string;
}

export interface StoryPage {
  id: number;
  session_id: string;
  page_number: number;
  educational_concept: string;
  story_text: string;
  agent_prompt: string;
  kid_response?: string;
  panel_1_url?: string;
  panel_2_url?: string;
  time_spent_seconds?: number;
}

export interface NextPageResponse {
  success: boolean;
  pageNumber: number;
  storyText: string;
  agentPrompt: string | null;
  suggestedOptions: string[];
  educationalConcept: string;
  panel1Status: string;
  panel2Status: string;
  imageIds: {
    panel1: string | null;
    panel2: string | null;
  };
  chosenPlanet: string;
}

export interface ImageStatus {
  panel: string;
  taskId: string;
  status: string;
  url?: string;
  progress?: number;
}

// Session APIs
export async function createSession(storyType: string = 'space') {
  const response = await fetch(`${API_URL}/api/sessions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyType })
  });
  return response.json();
}

export async function uploadPhoto(sessionId: string, photoFile: File) {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const response = await fetch(`${API_URL}/api/sessions/${sessionId}/upload-photo`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

export async function getSession(sessionId: string) {
  const response = await fetch(`${API_URL}/api/sessions/${sessionId}`);
  return response.json();
}

export async function completeSession(sessionId: string) {
  const response = await fetch(`${API_URL}/api/sessions/${sessionId}/complete`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

// Story APIs
export async function getNextPage(data: {
  sessionId: string;
  currentPage: number;
  kidResponse?: string;
  responseTime?: number;
  suggestedOptions?: string[];
}): Promise<NextPageResponse> {
  const response = await fetch(`${API_URL}/api/story/next-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function checkImageStatus(
  sessionId: string,
  pageNumber: number,
  taskId1?: string,
  taskId2?: string
): Promise<{ success: boolean; images: ImageStatus[] }> {
  const params = new URLSearchParams({
    sessionId,
    pageNumber: pageNumber.toString(),
    ...(taskId1 && { taskId1 }),
    ...(taskId2 && { taskId2 })
  });

  const response = await fetch(`${API_URL}/api/story/check-images?${params}`);
  return response.json();
}

// Analytics APIs
export async function trackInteraction(data: {
  sessionId: string;
  pageNumber?: number;
  interactionType: string;
  userInput?: string;
  responseTimeMs?: number;
}) {
  const response = await fetch(`${API_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function getDashboardAnalytics() {
  const response = await fetch(`${API_URL}/api/analytics/dashboard`);
  return response.json();
}

export async function getSessionAnalytics(sessionId: string) {
  const response = await fetch(`${API_URL}/api/analytics/session/${sessionId}`);
  return response.json();
}

// Book APIs
export async function generateBook(sessionId: string) {
  const response = await fetch(`${API_URL}/api/book/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  return response.json();
}

export async function getBook(sessionId: string) {
  const response = await fetch(`${API_URL}/api/book/${sessionId}`);
  return response.json();
}

