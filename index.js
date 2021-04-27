const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

const getArtists = (request, response) => {
  pool.query('SELECT * FROM artists', (error, results) => {
    if (error) {
      throw error
    }
    // que retorne id y no artist_id
    response.status(200).json(results.rows)
  })
}

const addArtist = (request, response) => {
  const {name, age} = request.body
  console.log(name, age);
  const artist_id = name ? Buffer.from(name).toString('base64').slice(0, 22): name;
  const albums = `https://integracion2gazali.herokuapp.com/artists/${artist_id}/albums`;
  const tracks = `https://integracion2gazali.herokuapp.com/artists/${artist_id}/tracks`;
  const self   = `https://integracion2gazali.herokuapp.com/artists/${artist_id}`;
  pool.query(
    'INSERT INTO artists (artist_id, name, age, albums, tracks, self) VALUES ($1, $2, $3, $4, $5, $6)',
    [artist_id, name, age, albums, tracks, self],
    (error, results) => {
      if (error) {
        console.log(error)
        
        if (error.constraint == 'artists_pkey') {
          response.status(409).json({
            id: artist_id,
            name: name,
            age: age,
            albums: albums,
            tracks: tracks,
            self: self
          })
        } else {
          response.status(400).send();
        }
      } else {
        response.status(201).json({
          id: artist_id,
          name: name,
          age: age,
          albums: albums,
          tracks: tracks,
          self: self
        })
      }
    },
  )
}

const addAlbum = (request, response) => {
  const artist_id = request.params.artist_id;
  const {name, genre} = request.body;
  const album_artist_id = `${name}:${artist_id}`;
  const album_id = (name && artist_id) ? Buffer.from(album_artist_id).toString('base64').slice(0, 22): undefined;
  const artist = `https://integracion2gazali.herokuapp.com/artists/${artist_id}`;
  const tracks = `https://integracion2gazali.herokuapp.com/albums/${album_id}/tracks`;
  const self   = `https://integracion2gazali.herokuapp.com/albums/${album_id}`;
  pool.query(
    'INSERT INTO albums (album_id, artist_id, name, genre, artist, tracks, self) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [album_id, artist_id, name, genre, artist, tracks, self],
    (error, results) => {
      if (error) {
        console.log(error)
        if (error.constraint == 'albums_pkey') {
          response.status(409).json({
            id: album_id,
            artist_id: artist_id,
            name: name,
            genre: genre,
            artist: artist,
            tracks: tracks,
            self: self
          })
        } else if (error.constraint == 'fk_artist') {
          response.status(422).send();
        } else {
          response.status(400).send();
        }
      } else {
        response.status(201).json({
          id: album_id,
          artist_id: artist_id,
          name: name,
          genre: genre,
          artist: artist,
          tracks: tracks,
          self: self
        })
      }
    },
  )
}

const addTrack = async (request, response) => {
  const album_id = request.params.album_id;
  const {name, duration} = request.body;
  const cancion_album_id = `${name}:${album_id}`;
  const track_id = (name && album_id) ? Buffer.from(cancion_album_id).toString('base64').slice(0, 22): undefined;
  var artist_response;
  try {
    artist_response = await pool.query('SELECT artist_id FROM albums WHERE album_id = $1',[album_id])
  } catch (err) {
    console.log(err.stack)
  }
  // console.log('ARTIST RESPONSE', artist_response.rows);
  const artist_id = artist_response.rows[0] ? artist_response.rows[0].artist_id: undefined;
  // console.log('ARTIST_ID', artist_id);
  
  const artist = `https://integracion2gazali.herokuapp.com/artists/${artist_id}`;
  const album  = `https://integracion2gazali.herokuapp.com/albums/${album_id}`;
  const self   = `https://integracion2gazali.herokuapp.com/tracks/${track_id}`;
  if (!name || !duration) {
    response.status(400).send();
    return
  }
  pool.query(
    'INSERT INTO tracks (track_id, album_id, name, duration, times_played, artist, album, self) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [track_id, album_id, name, duration, 0, artist, album, self],
    (error, results) => {
      if (error) {
        console.log(error)
        if (error.constraint == 'tracks_pkey') {
          response.status(409).json({
            id: track_id,
            album_id: album_id,
            name: name,
            duration: duration,
            times_played: 0,
            artist: artist,
            album: album,
            self: self
          })
        } else if (error.constraint == 'fk_album') {
          response.status(422).send();
        } else {
          response.status(400).send();
        }
      } else {
        response.status(201).json({
          id: track_id,
          album_id: album_id,
          name: name,
          duration: duration,
          times_played: 0,
          artist: artist,
          album: album,
          self: self
        })
      }
    },
  )
}

app
  .route('/artists')
  // GET endpoint
  .get(getArtists)
  // POST endpoint
  .post(addArtist)

app
  .route('/artists/:artist_id/albums')
  .post(addAlbum)

app
  .route('/albums/:album_id/tracks')
  .post(addTrack)

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})