-- Hey Verne! Database Schema
-- SQLite Database for Hackathon Prototype

-- Sessions table: tracks each kid's adventure session
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  story_type TEXT DEFAULT 'space',
  kid_photo_url TEXT,
  shareable_link TEXT,
  status TEXT DEFAULT 'in_progress'
);

-- Story pages table: stores content and images for each page
CREATE TABLE IF NOT EXISTS story_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
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

-- Interactions table: tracks all voice interactions and events
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_number INTEGER,
  interaction_type TEXT NOT NULL,
  user_input TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Choices table: tracks decisions made by kids
CREATE TABLE IF NOT EXISTS choices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  suggested_options TEXT,
  kid_choice TEXT,
  was_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Analytics metrics table: stores calculated metrics
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value TEXT,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_story_pages_session ON story_pages(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_session ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_choices_session ON choices(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_metrics(session_id);

