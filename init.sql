CREATE TABLE artists (
  artist_id VARCHAR(22),
  name VARCHAR(75),
  age INT,
  albums VARCHAR(50),
  tracks VARCHAR(50),
  self VARCHAR(50),
  PRIMARY KEY(artist_id)
);

CREATE TABLE albums (
  album_id VARCHAR(22),
  artist_id VARCHAR(22),
  name VARCHAR(75),
  genre VARCHAR(50),
  artist VARCHAR(50),
  tracks VARCHAR(50),
  self VARCHAR(50),
  PRIMARY KEY(album_id),
  CONSTRAINT fk_artist
    FOREIGN KEY(artist_id)
      REFERENCES artists(artist_id)
      ON DELETE CASCADE
);

CREATE TABLE tracks (
  track_id VARCHAR(22),
  album_id VARCHAR(22),
  name VARCHAR(75),
  duration NUMERIC,
  times_played INT,
  artist VARCHAR(50),
  album VARCHAR(50),
  self VARCHAR(50),
  PRIMARY KEY(track_id),
  CONSTRAINT fk_album
    FOREIGN KEY(album_id)
      REFERENCES albums(album_id)
      ON DELETE CASCADE
);