const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());
let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertMovieObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie;`;
  const movieArray = await database.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
app.get("/movies/:/movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id=${movie_id};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertMovieObject(movie));
});
app.post("/movies/",async (request,response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const postQuery=`
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES
    (${directorId},'${movieName}','${leadActor}');`;
    await database.run(postQuery);
    response.send("Movie Successfully Added");
});
app.put("/movies/:movieId/",async (request,response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const {movieId}=request.params;
    const UpdateQuery=`
    UPDATE movie
    SET 
    director_id=${directorId},
    movie_name='${movie_Name}',
    lead_actor='${leadActor}'
    WHERE
    movie_id=${movieId};`;
    await database.run(UpdateQuery);
    response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/",async (request,response)=>{
    const {movieId}=request.params;
    const deleteQuery=`
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
    await database.run(deleteQuery);
    response.send("Movie Removed")
})
app.get("/directors/",async (request,response)=>{
    const directorQuery='
    SELECT *
    FROM director;';
    const directorArray=await database.all(directorQuery);
    response.send(
        directorArray.map((eachArray)=>
        convertDirectorObject(eachArray))
    );
});
app.get("/directors/:directorId/movies/",async (request,response)=>{
    const {directorId}=request.params;
    const directorMovieQuery=`
    SELECT movie_name
    FROM movie
    WHERE director_id='${directorId}';`;
    const moviesArray=await database.all(directorMovieQuery);
    response.send(moviesArray.map((eachArray)=>({ movieName:eachArray}))
    );
});
module.exports = app;
