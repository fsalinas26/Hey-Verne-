const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../database/heyverne.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }

  // Promisify database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Session operations
  async createSession(sessionId, storyType = 'space') {
    const sql = `INSERT INTO sessions (id, story_type) VALUES (?, ?)`;
    return await this.run(sql, [sessionId, storyType]);
  }

  async getSession(sessionId) {
    const sql = `SELECT * FROM sessions WHERE id = ?`;
    return await this.get(sql, [sessionId]);
  }

  async updateSessionPhoto(sessionId, photoUrl) {
    const sql = `UPDATE sessions SET kid_photo_url = ? WHERE id = ?`;
    return await this.run(sql, [photoUrl, sessionId]);
  }

  async updateSessionStatus(sessionId, status) {
    const sql = `UPDATE sessions SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.run(sql, [status, sessionId]);
  }

  async updateSessionShareableLink(sessionId, link) {
    const sql = `UPDATE sessions SET shareable_link = ? WHERE id = ?`;
    return await this.run(sql, [link, sessionId]);
  }

  // Story page operations
  async createStoryPage(data) {
    const sql = `
      INSERT INTO story_pages 
      (session_id, page_number, educational_concept, story_text, agent_prompt, 
       kid_response, kid_response_timestamp, panel_1_url, panel_2_url, time_spent_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await this.run(sql, [
      data.sessionId,
      data.pageNumber,
      data.educationalConcept,
      data.storyText,
      data.agentPrompt,
      data.kidResponse,
      data.kidResponseTimestamp,
      data.panel1Url,
      data.panel2Url,
      data.timeSpentSeconds
    ]);
  }

  async updateStoryPageImages(sessionId, pageNumber, panel1Url, panel2Url) {
    const sql = `
      UPDATE story_pages 
      SET panel_1_url = ?, panel_2_url = ? 
      WHERE session_id = ? AND page_number = ?
    `;
    return await this.run(sql, [panel1Url, panel2Url, sessionId, pageNumber]);
  }

  async getStoryPages(sessionId) {
    const sql = `SELECT * FROM story_pages WHERE session_id = ? ORDER BY page_number`;
    return await this.all(sql, [sessionId]);
  }

  // Interaction operations
  async trackInteraction(data) {
    const sql = `
      INSERT INTO interactions 
      (session_id, page_number, interaction_type, user_input, response_time_ms)
      VALUES (?, ?, ?, ?, ?)
    `;
    return await this.run(sql, [
      data.sessionId,
      data.pageNumber,
      data.interactionType,
      data.userInput,
      data.responseTimeMs
    ]);
  }

  async getInteractions(sessionId) {
    const sql = `SELECT * FROM interactions WHERE session_id = ? ORDER BY timestamp`;
    return await this.all(sql, [sessionId]);
  }

  // Choice operations
  async trackChoice(data) {
    const sql = `
      INSERT INTO choices 
      (session_id, page_number, suggested_options, kid_choice, was_default)
      VALUES (?, ?, ?, ?, ?)
    `;
    return await this.run(sql, [
      data.sessionId,
      data.pageNumber,
      JSON.stringify(data.suggestedOptions),
      data.kidChoice,
      data.wasDefault ? 1 : 0
    ]);
  }

  async getChoices(sessionId) {
    const sql = `SELECT * FROM choices WHERE session_id = ? ORDER BY page_number`;
    return await this.all(sql, [sessionId]);
  }

  // Analytics operations
  async saveMetric(sessionId, metricName, metricValue) {
    const sql = `
      INSERT INTO analytics_metrics (session_id, metric_name, metric_value)
      VALUES (?, ?, ?)
    `;
    return await this.run(sql, [sessionId, metricName, JSON.stringify(metricValue)]);
  }

  async getAllSessions() {
    const sql = `SELECT * FROM sessions ORDER BY created_at DESC`;
    return await this.all(sql, []);
  }

  async getSessionStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        AVG(CASE WHEN completed_at IS NOT NULL 
            THEN (julianday(completed_at) - julianday(created_at)) * 86400 
            ELSE NULL END) as avg_session_time
      FROM sessions
    `;
    return await this.get(sql, []);
  }
}

// Create singleton instance
const db = new Database();

module.exports = db;

