-- Table for Museum Administrators
CREATE TABLE AdminUsers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Exhibitions
CREATE TABLE Exhibitions (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL REFERENCES AdminUsers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Stations within an Exhibition
CREATE TABLE Stations (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER NOT NULL REFERENCES Exhibitions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    -- Using JSONB to store multilingual texts, e.g., {"DE": "German text", "EN": "English text"}
    texts JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Indexes for frequently queried columns
CREATE INDEX idx_exhibitions_admin_user_id ON Exhibitions(admin_user_id);
CREATE INDEX idx_stations_exhibition_id ON Stations(exhibition_id);

-- Table for Exhibition Views (for statistics)
CREATE TABLE ExhibitionViews (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER NOT NULL REFERENCES Exhibitions(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Station Plays (for statistics)
CREATE TABLE StationPlays (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES Stations(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- e.g., 'DE', 'EN'
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Indexes for statistics tables
CREATE INDEX idx_exhibition_views_exhibition_id ON ExhibitionViews(exhibition_id);
CREATE INDEX idx_station_plays_station_id ON StationPlays(station_id);

EOF && cat <<EOF > README.md
# Backend for Museen Audio App

This directory contains the Node.js Express backend for the Museen Audio App.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in this directory by copying `.env.example` (if provided) or by creating it manually. It should include:
    *   `DATABASE_URL`: Connection string for your PostgreSQL database.
        Example: `postgresql://user:password@host:port/database_name`
    *   `OPENAI_API_KEY`: Your API key from OpenAI.
    *   `PORT`: The port the backend server should run on (e.g., 3001).
    *   `JWT_SECRET`: A secret key for signing JSON Web Tokens.

3.  **Database Setup (PostgreSQL):**
    *   Ensure you have PostgreSQL installed and running.
    *   Create a database for the application.
    *   Connect to your database and run the SQL commands in `schema.sql` to create the necessary tables:
        ```bash
        psql -U your_username -d your_database_name -f schema.sql
        ```
    *   Replace `your_username` and `your_database_name` with your actual PostgreSQL username and database name.

4.  **Run the Server:**
    ```bash
    npm st\art
    ```
    (This assumes you have a "start": "node server.js" script in your package.json)

EOF && echo "schema.sql and backend/README.md created/updated successfully." && ls -la
