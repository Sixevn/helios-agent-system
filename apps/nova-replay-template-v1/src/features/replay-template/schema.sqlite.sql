-- Nova Replay-to-Template v1 SQLite schema contract
-- v1 runtime uses localStorage, but this schema is the locked migration target.

CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  youtube_handle TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (channel_id) REFERENCES channels (id)
);

CREATE TABLE IF NOT EXISTS manual_replay_segments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  start_sec REAL NOT NULL,
  end_sec REAL NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  template_name TEXT NOT NULL,
  version TEXT NOT NULL,
  platform TEXT NOT NULL,
  simplicity INTEGER NOT NULL,
  hook_style TEXT NOT NULL,
  cta_style TEXT NOT NULL,
  blueprint_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  total_score REAL NOT NULL,
  reasons_json TEXT NOT NULL,
  cut_segments_json TEXT NOT NULL,
  elapsed_seconds INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates (id)
);

CREATE INDEX IF NOT EXISTS idx_manual_segments_video
  ON manual_replay_segments (video_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_video
  ON recommendations (video_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_channel
  ON videos (channel_id, created_at DESC);
