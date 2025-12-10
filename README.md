"# Meidan elokuva-sovellus" 
1) Download Node.js

2) Download Posgtres SQL

3) Create database with Query-command:

CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    created_at DATE
);

CREATE TABLE Film (
    film_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    release_date DATE,
    in_theaters BOOLEAN DEFAULT FALSE,
    imdb_rating INTEGER CHECK (imdb_rating BETWEEN 1 AND 10)
);

CREATE TABLE "Group" (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id INTEGER REFERENCES "User"(user_id),
    created_at DATE,
    description VARCHAR(255),
    is_private BOOLEAN DEFAULT FALSE
);

CREATE TABLE Favorite_list (
    list_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id),
    title VARCHAR(100) DEFAULT 'My Favorites',
    created_at DATE,
    share_token VARCHAR(100) UNIQUE
);

CREATE TABLE Review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id),
    movie_id INTEGER REFERENCES Film(film_id),
    rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    created_at DATE
);

CREATE TABLE Group_member (
    group_id INTEGER REFERENCES "Group"(group_id),
    user_id INTEGER REFERENCES "User"(user_id),
    joined_at DATE,
    member_id SERIAL PRIMARY KEY
);

CREATE TABLE Group_request (
    group_id INTEGER REFERENCES "Group"(group_id),
    user_id INTEGER REFERENCES "User"(user_id),
    status VARCHAR(20) DEFAULT 'pending',
    group_request_id SERIAL PRIMARY KEY
);

CREATE TABLE Favorite_movie (
    favorite_id INTEGER REFERENCES Favorite_list(list_id),
    movie_id INTEGER REFERENCES Film(film_id)
);

CREATE TABLE Films_in_group (
    added_by_id INTEGER REFERENCES Group_member(member_id),
    group_id INTEGER REFERENCES "Group"(group_id),
    movie_id INTEGER REFERENCES Film(film_id)
);

4) Start a server
4.1) In Terminal open backend folder
4.2) Paste command: npm install
4.3) Paste command: npm run dev

5) Start React
5.1) In Terminal open frontend folder
5.2) Paste command: npm install
5.3) Paste command: npm start