import React from "react";

const movies = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Movie ${i + 1}`,
  image: "images/2f.png"
}));

function MoviesSection() {
  return (
    <section className="movies container-md">
      <h2 className="title-bg mb-4">Films</h2>
      <div className="row g-3">
        {movies.map(movie => (
          <div key={movie.id} className="col-6 col-md-4 col-lg-2 text-center movie-card">
            <img src={movie.image} alt={movie.title} className="img-fluid rounded" />
            <p className="mt-2 text-white">{movie.title}</p>
          </div>
        ))}
      </div>
      <p className="title-under mb-4">Show more...</p>
    </section>
  );
}

export default MoviesSection;
