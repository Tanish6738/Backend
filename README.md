# First Professional Level Backend

## Description
This project is a backend application built with Node.js, Express, and MongoDB. It includes user authentication, video management, and subscription features.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/yourproject.git
    cd yourproject
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the necessary environment variables. For example:
    ```env
    ACCESS_TOKEN_SECRET=youraccesstokensecret
    ```

## Usage

1. Start the development server:
    ```bash
    npm start
    ```

2. The server will be running at `http://localhost:3000`.

## Testing

1. Run the tests:
    ```bash
    npm test
    ```

## Models

### User Model
The `User` model represents the users in the application. It includes fields such as `email`, `password`, `refreshToken`, etc.

### Video Model
The `Video` model represents the videos uploaded by users. It includes fields such as `title`, `description`, `videoFile`, `thumbnail`, etc.

### Subscription Model
The `Subscription` model represents the subscriptions of users to different channels. It includes fields such as `userId` and `channelId`.

## Controllers

### Auth Controller
Handles user authentication, including login and token verification.

#### Methods:
- **registerUser**: Registers a new user.
    - Response:
    ```json
    {
        "status": 201,
        "message": "User created successfully",
        "data": {
            "user": { ... }
        }
    }
    ```
- **loginUser**: Logs in an existing user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "User logged in successfully",
        "data": {
            "token": "string"
        }
    }
    ```
- **logoutUser**: Logs out the current user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "User logged out successfully"
    }
    ```
- **refreshAccessToken**: Refreshes the access token.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Access token refreshed successfully",
        "data": {
            "accessToken": "string",
            "refreshToken": "string"
        }
    }
    ```
- **changeCurrentUserPassword**: Changes the password of the current user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Password changed successfully"
    }
    ```
- **getCurrentUser**: Retrieves the current user's information.
    - Response:
    ```json
    {
        "status": 200,
        "message": "User found",
        "data": {
            "user": { ... }
        }
    }
    ```
- **updateUserAccount**: Updates the current user's account information.
    - Response:
    ```json
    {
        "status": 200,
        "message": "User updated successfully",
        "data": {
            "user": { ... }
        }
    }
    ```
- **updateUserAvatar**: Updates the current user's avatar.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Avatar updated successfully",
        "data": {
            "user": { ... }
        }
    }
    ```
- **updateUserCoverImage**: Updates the current user's cover image.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Cover image updated successfully",
        "data": {
            "user": { ... }
        }
    }
    ```
- **getChannelProfile**: Retrieves the profile of a channel.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Channel profile found",
        "data": {
            "channel": { ... }
        }
    }
    ```
- **getUserWatchHistory**: Retrieves the watch history of the current user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Watch history found",
        "data": {
            "watchHistory": [ ... ]
        }
    }
    ```

### Video Controller
Handles video-related operations such as uploading, retrieving, and deleting videos.

#### Methods:
- **getAllVideos**: Retrieves all videos with pagination and filtering options.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Videos retrieved successfully",
        "data": {
            "videos": [ ... ]
        }
    }
    ```
- **publishAVideo**: Publishes a new video.
    - Response:
    ```json
    {
        "status": 201,
        "message": "Video created successfully",
        "data": {
            "video": { ... }
        }
    }
    ```
- **getVideoById**: Retrieves a video by its ID.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video retrieved successfully",
        "data": {
            "video": { ... }
        }
    }
    ```
- **updateVideo**: Updates a video's information.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video updated successfully",
        "data": {
            "video": { ... }
        }
    }
    ```
- **deleteVideo**: Deletes a video by its ID.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video deleted successfully"
    }
    ```
- **togglePublishStatus**: Toggles the publish status of a video.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video publish status updated",
        "data": {
            "video": { ... }
        }
    }
    ```

### Subscription Controller
Handles subscription-related operations such as subscribing and unsubscribing to channels.

#### Methods:
- **toggleSubscription**: Subscribes or unsubscribes to a channel.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Subscribed successfully"
    }
    ```
    or
    ```json
    {
        "status": 200,
        "message": "Unsubscribed successfully"
    }
    ```
- **getUserChannelSubscribers**: Retrieves the subscribers of a channel.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Subscribers fetched successfully",
        "data": {
            "subscribers": [ ... ]
        }
    }
    ```
- **getSubscribedChannels**: Retrieves the channels subscribed to by a user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Subscribed channels fetched successfully",
        "data": {
            "channels": [ ... ]
        }
    }
    ```

### Tweet Controller
Handles tweet-related operations such as creating, retrieving, updating, and deleting tweets.

#### Methods:
- **createTweet**: Creates a new tweet.
    - Response:
    ```json
    {
        "status": 201,
        "message": "Tweet created successfully",
        "data": {
            "tweet": { ... }
        }
    }
    ```
- **getUserTweets**: Retrieves tweets of a user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Tweets fetched successfully",
        "data": {
            "tweets": [ ... ]
        }
    }
    ```
- **updateTweet**: Updates a tweet.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Tweet updated successfully",
        "data": {
            "tweet": { ... }
        }
    }
    ```
- **deleteTweet**: Deletes a tweet.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Tweet deleted successfully"
    }
    ```

### Playlist Controller
Handles playlist-related operations such as creating, retrieving, updating, and deleting playlists.

#### Methods:
- **createPlaylist**: Creates a new playlist.
    - Response:
    ```json
    {
        "status": 201,
        "message": "Playlist created successfully",
        "data": {
            "playlist": { ... }
        }
    }
    ```
- **getUserPlaylists**: Retrieves playlists of a user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "User playlists fetched successfully",
        "data": {
            "playlists": [ ... ]
        }
    }
    ```
- **getPlaylistById**: Retrieves a playlist by its ID.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Playlist fetched successfully",
        "data": {
            "playlist": { ... }
        }
    }
    ```
- **addVideoToPlaylist**: Adds a video to a playlist.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video added to playlist successfully",
        "data": {
            "playlist": { ... }
        }
    }
    ```
- **removeVideoFromPlaylist**: Removes a video from a playlist.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video removed from playlist successfully",
        "data": {
            "playlist": { ... }
        }
    }
    ```
- **deletePlaylist**: Deletes a playlist.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Playlist deleted successfully"
    }
    ```
- **updatePlaylist**: Updates a playlist's information.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Playlist updated successfully",
        "data": {
            "playlist": { ... }
        }
    }
    ```

### Like Controller
Handles like-related operations such as liking and unliking videos, comments, and tweets.

#### Methods:
- **toggleVideoLike**: Likes or unlikes a video.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Video liked successfully"
    }
    ```
    or
    ```json
    {
        "status": 200,
        "message": "Video unliked successfully"
    }
    ```
- **toggleCommentLike**: Likes or unlikes a comment.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Comment liked successfully"
    }
    ```
    or
    ```json
    {
        "status": 200,
        "message": "Comment unliked successfully"
    }
    ```
- **toggleTweetLike**: Likes or unlikes a tweet.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Tweet liked successfully"
    }
    ```
    or
    ```json
    {
        "status": 200,
        "message": "Tweet unliked successfully"
    }
    ```
- **getLikedVideos**: Retrieves videos liked by the current user.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Liked videos fetched successfully",
        "data": {
            "likedVideos": [ ... ]
        }
    }
    ```

### Comment Controller
Handles comment-related operations such as adding, retrieving, updating, and deleting comments.

#### Methods:
- **getVideoComments**: Retrieves comments of a video.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Comments fetched successfully",
        "data": {
            "comments": [ ... ]
        }
    }
    ```
- **addComment**: Adds a comment to a video.
    - Response:
    ```json
    {
        "status": 201,
        "message": "Comment added successfully",
        "data": {
            "comment": { ... }
        }
    }
    ```
- **updateComment**: Updates a comment.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Comment updated successfully",
        "data": {
            "comment": { ... }
        }
    }
    ```
- **deleteComment**: Deletes a comment.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Comment deleted successfully"
    }
    ```

### Healthcheck Controller
Handles health check operations to ensure the service is up and running.

#### Methods:
- **healthcheck**: Returns the status of the service.
    - Response:
    ```json
    {
        "status": 200,
        "message": "OK",
        "data": {
            "message": "Service is up and running"
        }
    }
    ```

### Dashboard Controller
Handles dashboard-related operations such as retrieving channel statistics and videos.

#### Methods:
- **getChannelStats**: Retrieves statistics of a channel.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Channel stats fetched successfully",
        "data": {
            "stats": { ... }
        }
    }
    ```
- **getChannelVideos**: Retrieves videos of a channel.
    - Response:
    ```json
    {
        "status": 200,
        "message": "Channel videos fetched successfully",
        "data": {
            "videos": [ ... ]
        }
    }
    ```

## Routes

### Authentication Routes

- **POST /auth/login**
    - Request Body: `{ email: string, password: string }`
    - Response: 
    ```json
    {
        "status": 200,
        "message": "User logged in successfully",
        "data": {
            "token": "string"
        }
    }
    ```

### Video Routes

- **GET /videos**
    - Headers: `Authorization: Bearer <token>`
    - Response: 
    ```json
    {
        "status": 200,
        "message": "Videos retrieved successfully",
        "data": {
            "videos": [ ... ]
        }
    }
    ```

- **POST /videos**
    - Headers: `Authorization: Bearer <token>`
    - Form Data: `title, description, videoFile, thumbnail`
    - Response: 
    ```json
    {
        "status": 201,
        "message": "Video created successfully",
        "data": {
            "video": { ... }
        }
    }
    ```

### Subscription Routes

- **POST /subscriptions/:channelId**
    - Headers: `Authorization: Bearer <token>`
    - Response: 
    ```json
    {
        "status": 200,
        "message": "Subscribed successfully"
    }
    ```
    or
    ```json
    {
        "status": 200,
        "message": "Unsubscribed successfully"
    }
    ```

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

