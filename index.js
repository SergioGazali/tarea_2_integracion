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
  console.log(request.body);
  const artist_id = name+'_id';
  console.log(name, age);
  pool.query(
    'INSERT INTO artists (artist_id, name, age) VALUES ($1, $2, $3)',
    [artist_id, name, age],
    (error) => {
      if (error) {
        throw error
      }
      response.status(201).json({status: 'success', message: 'Artist added.'})
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