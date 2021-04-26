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
        /* throw error */
        if (error.constraint == 'artists_pkey') {
          response.status(409).json({
            artist_id: artist_id,
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
          artist_id: artist_id,
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

app
  .route('/artists')
  // GET endpoint
  .get(getArtists)
  // POST endpoint
  .post(addArtist)

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})