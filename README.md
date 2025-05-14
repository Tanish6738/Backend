# Backend API Testing Guide (Postman)

This guide will help you test the Streamer backend APIs using Postman. It covers authentication, user, video, playlist, tweet, comment, like, subscription, and dashboard endpoints, with example requests, dummy data, and expected responses.

---

## 1. Getting Started

- **Base URL:** `http://localhost:<PORT>/api/v1/`
- Replace `<PORT>` with your backend server port (e.g., 3000).
- Most endpoints require authentication. First, register and log in to get your JWT token (as a cookie or Bearer token).

---

## 2. Authentication & User APIs

### Register User
- **POST** `/users/register`
- **Body (form-data):**
  - `fullName`: `John Doe` (required, non-empty)
  - `username`: `johndoe` (required, non-empty, unique)
  - `email`: `john@example.com` (required, non-empty, unique)
  - `password`: `Password123!` (required, non-empty)
  - `avatar`: (image file, required)
  - `coverImage`: (image file, optional)
- **Validation:** All fields except `coverImage` are required and must not be empty. `avatar` file is required. Duplicate email or username is not allowed.
- **Response:**
```json
{
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "<cloudinary_url>",
    "coverImage": "<cloudinary_url>"
  },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 201) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("userId", json.data._id);
    }
}
```

### Login User
- **POST** `/users/login`
- **Body (JSON):**
```json
{
  "email": "john@example.com", // or "username": "johndoe"
  "password": "Password123!"
}
```
- **Validation:** Either `email` or `username` is required, and `password` is required. All must be non-empty.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "<cloudinary_url>",
    "coverImage": "<cloudinary_url>"
  },
  "success": true
}
```
- **Cookies:** `accessToken` and `refreshToken` are set as httpOnly, secure cookies.
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("userId", json.data._id);
    }
    if (pm.cookies.get('accessToken')) {
        pm.environment.set("accessToken", pm.cookies.get('accessToken'));
    }
    if (pm.cookies.get('refreshToken')) {
        pm.environment.set("refreshToken", pm.cookies.get('refreshToken'));
    }
    if (json.data && json.data.accessToken) {
        pm.environment.set("accessToken", json.data.accessToken);
    }
    if (json.data && json.data.refreshToken) {
        pm.environment.set("refreshToken", json.data.refreshToken);
    }
}
```

### Logout User
- **POST** `/users/logout`
- **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
- **Response:**
```json
{
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": null,
  "success": true
}
```

### Refresh Access Token
- **POST** `/users/refresh-token`
- **Body (JSON or Cookie):**
  - `refreshToken`: (string, required if not in cookie)
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data.accessToken) {
        pm.environment.set("accessToken", json.data.accessToken);
    }
    if (json.data && json.data.refreshToken) {
        pm.environment.set("refreshToken", json.data.refreshToken);
    }
}
```

### Change Current User Password
- **PATCH** `/users/change-password`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "oldPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": null,
  "success": true
}
```

### Get Current User
- **GET** `/users/me`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "User found",
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "<cloudinary_url>",
    "coverImage": "<cloudinary_url>"
  },
  "success": true
}
```

### Update User Account
- **PATCH** `/users/update`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "fullName": "New Name", // optional
  "email": "newemail@example.com", // optional
  "username": "newusername" // optional
}
```
- **Validation:** At least one field is required and must not be empty. Email/username must be unique.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "User updated successfully",
  "data": {
    "_id": "...",
    "username": "newusername",
    "email": "newemail@example.com",
    "fullName": "New Name",
    "avatar": "<cloudinary_url>",
    "coverImage": "<cloudinary_url>"
  },
  "success": true
}
```

### Update User Avatar
- **PATCH** `/users/avatar`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (form-data):**
  - `avatar`: (image file, required)
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Avatar updated successfully",
  "data": {
    "_id": "...",
    "avatar": "<cloudinary_url>"
  },
  "success": true
}
```

### Update User Cover Image
- **PATCH** `/users/cover-image`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (form-data):**
  - `coverImage`: (image file, required)
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Cover image updated successfully",
  "data": {
    "_id": "...",
    "coverImage": "<cloudinary_url>"
  },
  "success": true
}
```

### Get Channel Profile
- **GET** `/users/channel/:username`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Channel profile found",
  "data": [
    {
      "fullName": "...",
      "username": "...",
      "email": "...",
      "isSubscribed": true,
      "avatar": "<cloudinary_url>",
      "coverImage": "<cloudinary_url>",
      "subscriberCount": 0,
      "subscribeToCount": 0
    }
  ],
  "success": true
}
```

### Get User Watch History
- **GET** `/users/watch-history`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Watch history found",
  "data": [ /* array of video objects with owner info */ ],
  "success": true
}
```

---

## 3. Video APIs

### Publish a Video
- **POST** `/videos/`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (form-data):**
  - `title`: `My First Video` (required)
  - `description`: `This is a test video.` (optional)
  - `videoFile`: (video file, required)
  - `thumbnail`: (image file, required)
- **Validation:** `title` and both files are required. User must be authenticated.
- **Response:**
```json
{
  "statusCode": 201,
  "message": "Video created successfully",
  "data": {
    "_id": "...",
    "title": "My First Video",
    "description": "This is a test video.",
    "videoFile": "<cloudinary_url>",
    "thumbnail": "<cloudinary_url>",
    "duration": 0,
    "owner": "..."
  },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 201) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("videoId", json.data._id);
    }
}
```

### Get All Videos
- **GET** `/videos/`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Query Params (optional):**
  - `page`, `limit`, `query`, `sortBy`, `sortType`, `userId`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Videos retrieved successfully",
  "data": { /* paginated video list */ },
  "success": true
}
```

### Get Video by ID
- **GET** `/videos/:videoId`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Video retrieved successfully",
  "data": { /* video object with owner info */ },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("videoId", json.data._id);
    }
}
```

### Update Video
- **PATCH** `/videos/:videoId`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (form-data):**
  - `title`: (optional)
  - `description`: (optional)
  - `thumbnail`: (image file, optional)
- **Validation:** Only the video owner can update. At least one field required.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Video updated successfully",
  "data": { /* updated video object */ },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("videoId", json.data._id);
    }
}
```

### Delete Video
- **DELETE** `/videos/:videoId`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Validation:** Only the video owner can delete.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Video deleted successfully",
  "data": null,
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("videoId");
}
```

### Toggle Video Publish Status
- **PATCH** `/videos/toggle/publish/:videoId`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Video publish status updated",
  "data": { /* video object with updated isPublished */ },
  "success": true
}
```

---

## 4. Playlist APIs

### Create Playlist
- **POST** `/playlists/`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "name": "My Playlist",
  "description": "A test playlist."
}
```
- **Response:**
```json
{
  "statusCode": 201,
  "message": "Playlist created successfully",
  "data": {
    "_id": "...",
    "name": "My Playlist",
    "description": "A test playlist.",
    "owner": "..."
  },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 201) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("playlistId", json.data._id);
    }
}
```

### Get User Playlists
- **GET** `/playlists/user/{{userId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "User playlists fetched successfully",
  "data": [ /* array of playlist objects */ ],
  "success": true
}
```

### Get Playlist by ID
- **GET** `/playlists/{{playlistId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "playlist fetched successfully",
  "data": { /* playlist object */ },
  "success": true
}
```

### Add Video to Playlist
- **PATCH** `/playlists/add/{{videoId}}/{{playlistId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Video added to playlist successfully",
  "data": { /* updated playlist object */ },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update playlistId or videoId if needed
}
```

### Remove Video from Playlist
- **PATCH** `/playlists/remove/{{videoId}}/{{playlistId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Video removed from playlist successfully",
  "data": { /* updated playlist object */ },
  "success": true
}
```

### Update Playlist
- **PATCH** `/playlists/{{playlistId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "name": "Updated Playlist Name", // optional
  "description": "Updated description." // optional
}
```
- **Validation:** Only the playlist owner can update. At least one field required.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Playlist updated successfully",
  "data": { /* updated playlist object */ },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("playlistId", json.data._id);
    }
}
```

### Delete Playlist
- **DELETE** `/playlists/{{playlistId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Validation:** Only the playlist owner can delete.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Playlist deleted successfully",
  "data": null,
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("playlistId");
}
```

---

## 5. Tweet APIs

### Create Tweet
- **POST** `/tweets/`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "content": "This is my first tweet!"
}
```
- **Validation:** `content` is required and must not be empty.
- **Response:**
```json
{
  "statusCode": 201,
  "message": "Tweet created successfully",
  "data": {
    "_id": "...",
    "content": "This is my first tweet!",
    "owner": "...",
    "createdAt": "..."
  },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 201) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("tweetId", json.data._id);
    }
}
```

### Get User Tweets
- **GET** `/tweets/user/{{userId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Tweets fetched successfully",
  "data": [
    {
      "content": "...",
      "createdAt": "...",
      "owner": { "username": "...", "avatar": { "url": "..." } },
      "likesCount": 0,
      "isLiked": false
    }
  ],
  "success": true
}
```

### Update Tweet
- **PATCH** `/tweets/{{tweetId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "content": "Updated tweet!"
}
```
- **Validation:** Only the tweet owner can update. `content` must not be empty.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Tweet updated successfully",
  "data": {
    "_id": "...",
    "content": "Updated tweet!",
    "owner": "...",
    "createdAt": "..."
  },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("tweetId", json.data._id);
    }
}
```

### Delete Tweet
- **DELETE** `/tweets/{{tweetId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Validation:** Only the tweet owner can delete.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Tweet deleted successfully",
  "data": {},
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("tweetId");
}
```

---

## 6. Comment APIs

### Get Video Comments
- **GET** `/comments/{{videoId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Query Params (optional):**
  - `page`, `limit`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Comments fetched successfully",
  "data": [ /* array of comment objects */ ],
  "success": true
}
```

### Add Comment
- **POST** `/comments/{{videoId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "content": "Nice video!"
}
```
- **Response:**
```json
{
  "statusCode": 201,
  "message": "Comment added successfully",
  "data": { /* comment object */ },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 201) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("commentId", json.data._id);
    }
}
```

### Update Comment
- **PATCH** `/comments/c/{{commentId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
```json
{
  "content": "Updated comment!"
}
```
- **Validation:** Only the comment owner can update. `content` must not be empty.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Comment updated successfully",
  "data": { /* updated comment object */ },
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("commentId", json.data._id);
    }
}
```

### Delete Comment
- **DELETE** `/comments/c/{{commentId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Validation:** Only the comment owner can delete.
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Comment deleted successfully",
  "data": null,
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("commentId");
}
```

---

## 7. Like APIs

### Like/Unlike Video
- **POST** `/likes/toggle/v/{{videoId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response (Like):**
```json
{
  "statusCode": 200,
  "message": "Video liked successfully",
  "data": null,
  "success": true
}
```
- **Response (Unlike):**
```json
{
  "statusCode": 200,
  "message": "Video unliked successfully",
  "data": null,
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update likeId or videoId if needed
}
```

### Like/Unlike Comment
- **POST** `/likes/toggle/c/{{commentId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response (Like):**
```json
{
  "statusCode": 200,
  "message": "Comment liked successfully",
  "data": null,
  "success": true
}
```
- **Response (Unlike):**
```json
{
  "statusCode": 200,
  "message": "Comment unliked successfully",
  "data": null,
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update likeId or commentId if needed
}
```

### Like/Unlike Tweet
- **POST** `/likes/toggle/t/{{tweetId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response (Like):**
```json
{
  "statusCode": 200,
  "message": "Tweet liked successfully",
  "data": null,
  "success": true
}
```
- **Response (Unlike):**
```json
{
  "statusCode": 200,
  "message": "Tweet unliked successfully",
  "data": null,
  "success": true
}
```
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update likeId or tweetId if needed
}
```

### Get Liked Videos
- **GET** `/likes/videos`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Query Params (optional):**
  - `page`, `limit`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Liked videos fetched successfully",
  "data": [ /* array of liked video objects */ ],
  "success": true
}
```

---

## 9. Dashboard APIs

### Get Channel Stats
- **GET** `/dashboard/stats?channelId={{channelId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Channel stats fetched successfully",
  "data": { /* stats object */ },
  "success": true
}
```

### Get Channel Videos
- **GET** `/dashboard/videos?channelId={{channelId}}&page=1&limit=10&search=...&sortBy=...&sortType=asc|desc`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Channel videos fetched successfully",
  "data": { /* paginated videos object */ },
  "success": true
}
```

### Get Channel Engagement
- **GET** `/dashboard/engagement?channelId={{channelId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Channel engagement analytics fetched successfully",
  "data": { /* engagement analytics object */ },
  "success": true
}
```

### Get Top Videos
- **GET** `/dashboard/top-videos?channelId={{channelId}}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Top videos fetched successfully",
  "data": [ /* array of top video objects */ ],
  "success": true
}
```

---

## 10. Healthcheck

- **GET** `/healthcheck/`
- **Response:**
```json
{
  "statusCode": 200,
  "message": "OK",
  "data": { "message": "Service is up and running" },
  "success": true
}
```

---

## 11. Postman Collection

- Create a new Postman collection and add requests for each endpoint as described above.
- For endpoints requiring authentication, set the `Authorization` header to `Bearer <accessToken>` or use cookies as per your backend setup.
- Use the dummy data provided in the examples for testing.

### Postman Scripts for Storing Environment Variables

#### 1. Store Access and Refresh Tokens After Login
- In your **Login** request, go to the **Tests** tab and add:
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("userId", json.data._id);
    }
    if (pm.cookies.get('accessToken')) {
        pm.environment.set("accessToken", pm.cookies.get('accessToken'));
    }
    if (pm.cookies.get('refreshToken')) {
        pm.environment.set("refreshToken", pm.cookies.get('refreshToken'));
    }
    // If tokens are in response body:
    if (json.data && json.data.accessToken) {
        pm.environment.set("accessToken", json.data.accessToken);
    }
    if (json.data && json.data.refreshToken) {
        pm.environment.set("refreshToken", json.data.refreshToken);
    }
}
```

#### 2. Use Access Token in Authorization Header
- In requests that require authentication, set the **Authorization** header to:
```
Bearer {{accessToken}}
```

#### 3. Store Other Dynamic Variables
- For endpoints that return IDs (e.g., videoId, playlistId), add in the **Tests** tab:
```js
if (pm.response.code === 201 || pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data._id) {
        pm.environment.set("videoId", json.data._id); // or playlistId, tweetId, etc.
    }
}
```

#### 4. Refresh Token Script
- In your **Refresh Token** request, add in the **Tests** tab:
```js
if (pm.response.code === 200) {
    var json = pm.response.json();
    if (json.data && json.data.accessToken) {
        pm.environment.set("accessToken", json.data.accessToken);
    }
    if (json.data && json.data.refreshToken) {
        pm.environment.set("refreshToken", json.data.refreshToken);
    }
}
```

---

## 12. Notes

- All responses follow the format:
```json
{
  "statusCode": <number>,
  "message": <string>,
  "data": <object|null>,
  "success": <boolean>
}
```
- Replace IDs and tokens with actual values from your database.
- For file uploads, use Postman's `form-data` body type.
- For protected routes, always login first and use the returned token.

---

Happy Testing!
