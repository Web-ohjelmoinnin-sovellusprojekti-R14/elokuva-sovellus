import React from "react";

const popular = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Movie ${i + 1}`,
  image: "images/1f.png"
}));

function PopularSection() {
  return (
    <section className="popular container-md">
      <h2 className="title-bg mb-4">Popular</h2>
      <div className="row g-3">
        {popular.map(movie => (
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

export default PopularSection;
