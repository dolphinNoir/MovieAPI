require("dotenv").config()
const port = process.env.PORT;
const express = require("express")
const mongoose = require("mongoose")
const cors = require('cors')
const MovieModel = require('./Models/MovieModel')
const app = express()
app.use(express.json())
app.use(cors())



mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;


db.on('error', (error) => {console.log(error)})
db.once('open', () => {console.log("Connected to DB")})

//////////////////////////////////////////////////////////

app.get("/", (req,res) => {
    res.json("Welcome to the Movie API, here you can find a collection of over 1million movies!!! Read our docs to find out how to use the API. ")
})

//////////////////////////////////////////////////////////

app.get("/Random/:limit", async (req,res) => {
  const limit = req.params.limit
  try {
    const RandomMovies = await MovieModel.aggregate([
      { $sample: { size: Number(limit) } }
  ])
    res.json(RandomMovies)

  } catch (error) {
    res.status(200).json({message: error.message})
  }

})

//////////////////////////////////////////////////////////

app.get("/FindByImbdId/:id", async (req,res) => {
  try { 

    const id = req.params.id
    const movie = await MovieModel.find({"imdb_id": id})

    res.json(movie)
    
  } catch (error) {
      res.status(200).json({message: error.message})
  }
})

//////////////////////////////////////////////////////////

app.get("/FindByTitle/:title", async (req,res) => {
  try { 

    const title = req.params.title
    const finalSentence = title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

    const movie = await MovieModel.find({title: finalSentence})

    res.json(movie)
    
  } catch (error) {
      res.status(200).json({message: error.message})
  }
})

//////////////////////////////////////////////////////////

app.get("/Filter/", async (req,res) => {

  try { 
    const {MinRating,MaxRating, Genres, Runtime, SpokenLanguages,ImdbID} = req.query
    let Limit = req.query.Limit

    let IsAdult = req.query.IsAdult



    let MinYear = req.query.MinYear
    MinYear = `1-1-${MinYear}`

    let MaxYear = req.query.MaxYear
    MaxYear = `1-1-${MaxYear}`


    MinYear = new Date(req.query.MinYear)
    MaxYear = new Date(req.query.MaxYear)


    if (Limit && !isNaN(Limit)) {
      Limit = parseInt(Limit);
    } else {
        Limit = 100;
    }
    

    let mongooseQuery = MovieModel.find().limit(Limit);

    if(MinRating && MaxRating){
      mongooseQuery = mongooseQuery.where({ "vote_average": {$gte: MinRating, $lte: MaxRating} })
    } 

    if(MinYear && MaxYear){
      mongooseQuery = mongooseQuery.where({"release_date" : {$gte: MinYear, $lte: MaxYear}})
    }

    if(IsAdult === "false"){
      mongooseQuery = mongooseQuery.where({"adult" : false})
    }
    else if(IsAdult === "true"){
      mongooseQuery = mongooseQuery.where({"adult" : true})
    }



    let movies = await mongooseQuery.exec()

    res.json(movies)
    
  } catch (error) {
      res.status(200).json({message: error.message})
  }
})

//////////////////////////////////////////////////////////



app.listen(port, () => console.log(`started server on port ${port}`));
 
process.on('SIGINT', () => {
    db.close(() => {
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });
  });

