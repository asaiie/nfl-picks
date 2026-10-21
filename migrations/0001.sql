PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL UNIQUE,password TEXT,admin INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO users(id,name,admin) VALUES(1,'Amit',1),(2,'Amol',0),(3,'Garv',0),(4,'Praneeth',0),(5,'Daniel',0);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS games(
 id TEXT PRIMARY KEY, season INTEGER NOT NULL DEFAULT 2026 CHECK(season=2026),
 week INTEGER NOT NULL CHECK(week BETWEEN 7 AND 18),home TEXT NOT NULL,away TEXT NOT NULL,
 tipoff INTEGER NOT NULL,day TEXT NOT NULL,time_tbd INTEGER NOT NULL DEFAULT 0 CHECK(time_tbd IN(0,1)),
 locked INTEGER NOT NULL DEFAULT 0 CHECK(locked IN(0,1)),
 status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN('scheduled','postponed','canceled','final')),
 winner TEXT,home_score INTEGER,away_score INTEGER,
 CHECK(home<>away),CHECK(winner IS NULL OR winner=home OR winner=away OR winner='TIE'),
 CHECK((status='final' AND winner IS NOT NULL AND time_tbd=0 AND home_score IS NOT NULL AND away_score IS NOT NULL
  AND home_score BETWEEN 0 AND 100 AND away_score BETWEEN 0 AND 100
  AND ((home_score=away_score AND winner='TIE') OR (home_score>away_score AND winner=home) OR (away_score>home_score AND winner=away)))
 OR (status<>'final' AND winner IS NULL AND home_score IS NULL AND away_score IS NULL))
);
CREATE TABLE IF NOT EXISTS picks(user_id INTEGER NOT NULL REFERENCES users(id),game_id TEXT NOT NULL REFERENCES games(id),team TEXT NOT NULL,updated INTEGER NOT NULL,PRIMARY KEY(user_id,game_id));
CREATE TABLE IF NOT EXISTS predictions(user_id INTEGER NOT NULL REFERENCES users(id),category TEXT NOT NULL,value TEXT NOT NULL,updated INTEGER NOT NULL,PRIMARY KEY(user_id,category));
CREATE TABLE IF NOT EXISTS outcomes(category TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS games_week ON games(week,tipoff);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
