require("dotenv").config();
const port = process.env.PORT;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const MovieModel = require("./Models/MovieModel");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

db.on("error", (error) => {
  console.log(error);
});
db.once("open", () => {
  console.log("Connected to DB");
});

//////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.json(
    "Welcome to the Movie API, here you can find a collection of over 1million movies!!! Read our docs to find out how to use the API. "
  );
});

//////////////////////////////////////////////////////////

app.get("/Random/:limit", async (req, res) => {
  const limit = req.params.limit;
  try {
    const RandomMovies = await MovieModel.aggregate([
      {
        $match: {
          revenue: { $gt: 300000 },
          original_language: "en",
        },
      },
      { $sample: { size: Number(limit) } },
    ]);
    res.json(RandomMovies);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
});

//////////////////////////////////////////////////////////

app.get("/FindByImbdId/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await MovieModel.find({ imdb_id: id });

    res.json(movie);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
});

//////////////////////////////////////////////////////////

app.get("/FindByTitle/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const finalSentence = title.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );

    const movie = await MovieModel.find({ title: finalSentence });

    res.json(movie);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
});

//////////////////////////////////////////////////////////

app.get("/Filter/", async (req, res) => {
  try {
    let { Genre } = req.query;
    let Limit = req.query.Limit;

    let MinRating = req.query.MinRating ? new Number(req.query.MinRating) : 4;
    let MaxRating = req.query.MaxRating ? new Number(req.query.MaxRating) : 10;

    let MinRevenue = req.query.MinRevenue
      ? new Number(req.query.MinRevenue)
      : 100000;
    let MaxRevenue = req.query.MaxRevenue
      ? new Number(req.query.MaxRevenue)
      : 10000000000;

    let MinYear = req.query.MinYear
      ? new Date(`1-1-${req.query.MinYear}`)
      : new Date(`1-1-1971`);
    let MaxYear = req.query.MaxYear
      ? new Date(`1-1-${req.query.MaxYear}`)
      : new Date(`1-1-2024`);

    let MinRuntime = req.query.MinRuntime
      ? new Number(req.query.MinRuntime)
      : 20;
    let MaxRuntime = req.query.MaxRuntime
      ? new Number(req.query.MaxRuntime)
      : 300;

    let OriginalLanguage = req.query.OriginalLanguage
      ? req.query.OriginalLanguage
      : "en";
    let SpokenLanguage = req.query.SpokenLanguage
      ? req.query.SpokenLanguage
      : "english";

    let IsAdult = req.query.IsAdult;

    if (Limit && !isNaN(Limit)) {
      Limit = parseInt(Limit);
    } else {
      Limit = 30;
    }

    let mongooseQuery = MovieModel.find().limit(Limit);

    if (MinRating || MaxRating) {
      mongooseQuery = mongooseQuery.where({
        vote_average: {
          $gte: MinRating,
          $lte: MaxRating,
        },
      });
    }

    if (MinYear || MaxYear) {
      mongooseQuery = mongooseQuery.where({
        release_date: {
          $gte: MinYear,
          $lte: MaxYear,
        },
      });
    }

    if (Genre) {
      const regex = new RegExp(Genre, "i");
      mongooseQuery = mongooseQuery.where({ genres: regex });
    }

    if (IsAdult === "false" || IsAdult === "true") {
      mongooseQuery =
        IsAdult == "false"
          ? mongooseQuery.where({ adult: false })
          : mongooseQuery.where({ adult: true });
    }

    if (MaxRuntime || MinRuntime) {
      mongooseQuery = mongooseQuery.where({
        runtime: { $gte: MinRuntime, $lte: MaxRuntime },
      });
    }

    if (MinRevenue && MaxRevenue) {
      MinRevenue = new Number(MinRevenue);
      MaxRevenue = new Number(MaxRevenue);

      mongooseQuery = mongooseQuery.where({
        revenue: { $gte: MinRevenue, $lte: MaxRevenue },
      });
    }

    if (SpokenLanguage) {
      const regex = new RegExp(SpokenLanguage, "i");
      mongooseQuery = mongooseQuery.where({ spoken_languages: regex });
    }

    if (OriginalLanguage) {
      const regex = new RegExp(OriginalLanguage, "i");
      mongooseQuery = mongooseQuery.where({ original_language: regex });
    }

    let movies = await mongooseQuery.exec();

    res.json(movies);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
});

//////////////////////////////////////////////////////////

app.get("/Search/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const regex = new RegExp(title, "i");

    let movies = await MovieModel.find({ title: regex })
      .limit(20)
      .sort({ revenue: -1 });
    res.json(movies);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
});

app.listen(port, () => console.log(`started server on port ${port}`));

process.on("SIGINT", () => {
  db.close(() => {
    console.log("MongoDB connection closed due to application termination");
    process.exit(0);
  });
});
