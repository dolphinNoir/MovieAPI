const mongoose = require('mongoose')

const MovieModel = new mongoose.Schema({
    title : String,
    "vote_average": Number,
    "vote_count": Number,
    status : String,
    "release_date": Date,
    revenue : Number,
    runtime: Number,
    adult: Boolean,
    "backdrop_path" : String,
    budget : Number,
    homepage: String,
    "imdb_id" : String,
    "original_language" : String,
    "original_title" : String,
    overview : String,
    popularity : Number,
    "poster_path" : String,
    tagline : String,
    genres : String,
    "production_companies" : String,
    "production_countries" : String,
    "spoken_languages" : String

})

module.exports = mongoose.model('MovieAPI', MovieModel, 'MovieAPI')