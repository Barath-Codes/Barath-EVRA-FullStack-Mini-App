CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  charger_id    TEXT    NOT NULL,
  connector_id  INTEGER NOT NULL,
  id_tag        TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Faulted')),
  start_time    TEXT    NOT NULL,
  end_time      TEXT,
  total_energy_wh REAL  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meter_readings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  INTEGER NOT NULL,
  energy_wh   REAL    NOT NULL,
  timestamp   TEXT    NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS anomalies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  INTEGER NOT NULL,
  type        TEXT    NOT NULL,
  detected_at TEXT    NOT NULL,
  details     TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
