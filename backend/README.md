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
    *   `FRONTEND_BASE_URL`: The base URL for the frontend application (e.g., `http://localhost:3000` or your production domain). This is used for generating QR code links.

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
    npm start
    ```
    (This assumes you have a "start": "node server.js" script in your package.json)
