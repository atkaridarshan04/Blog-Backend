# Blog Backend

Welcome to the Blog Backend repository! This project provides the backend API for a blogging platform, including user authentication, post management, comments, and more. The application is built using Node.js, MySQL, and Sequelize, with features to handle image uploads via Cloudinary.

## Features

- **User Management**: Registration, login, profile management, and password updates.
- **Post Management**: Create, update, delete, and retrieve posts with support for tags.
- **Comments**: Add, update, and delete comments on posts.
- **Likes**: Like and unlike posts.
- **Followers**: Follow and unfollow users.
- **Image Uploads**: Profile pictures and post images handled via Cloudinary.
- **Tag Management**: Create, update, delete, and retrieve tags for posts.

## Getting Started

### Prerequisites

- Node.js
- MySQL
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/atkaridarshan04/Blog-Backend.git
    cd Blog-Backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. ### Set up your environment variables:

Create a `.env` file in the root directory and configure the following environment variables:

```plaintext
MYSQL_HOST=your_database_host
MYSQL_USER=your_database_user
MYSQL_PASSWORD=your_database_password

PORT=your_server_port

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=your_access_token_expiry

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Run database migrations:

    ```bash
    npx sequelize-cli db:migrate
    ```

5. Start the server:

    ```bash
    npm start
    ```

## API Documentation

The API documentation is available through Postman. You can find the link to the documentation [[here](https://documenter.getpostman.com/view/38192013/2sAXqmAjzy)].
