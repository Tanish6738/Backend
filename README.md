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
  - `fullName`: `John Doe`
  - `username`: `johndoe`
  - `email`: `john@example.com`
  - `password`: `Password123!`
  - `avatar`: (image file)
  - `coverImage`: (image file, optional)
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
  "email": "john@example.com",
  "password": "Password123!"
}
```
- **Response:**
```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "_id": "...",
    "username": "johndoe",
    ...
  },
  "success": true
}
```
- **Note:** Save the `accessToken` cookie or use the returned JWT as Bearer token for subsequent requests.
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
    // If tokens are in response body:
    if (json.data && json.data.accessToken) {
        pm.environment.set("accessToken", json.data.accessToken);
    }
    if (json.data && json.data.refreshToken) {
        pm.environment.set("refreshToken", json.data.refreshToken);
    }
}
```

---

## 3. Video APIs

### Publish a Video
- **POST** `/videos/`
- **Headers:** `Authorization: Bearer <token>`
- **Body (form-data):**
  - `title`: `My First Video`
  - `description`: `This is a test video.`
  - `videoFile`: (video file)
  - `thumbnail`: (image file)
- **Response:**
```json
{
  "statusCode": 201,
  "message": "Video created successfully",
  "data": { ... }
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
- **Response:**
```json
{
  "statusCode": 200,
  "message": "Videos retrieved successfully",
  "data": { "docs": [ ... ] }
}
```

### Get Video by ID
- **GET** `/videos/{videoId}`
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
- **PATCH** `/videos/{videoId}`
- **Headers:** `Authorization: Bearer <token>`
- **Body (form-data):**
  - `title`, `description`, `thumbnail` (as needed)
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
- **DELETE** `/videos/{videoId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("videoId");
}
```

---

## 4. Playlist APIs

### Create Playlist
- **POST** `/playlists/`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
```json
{
  "name": "My Playlist",
  "description": "A test playlist."
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
- **GET** `/playlists/user/{userId}`

### Add Video to Playlist
- **PATCH** `/playlists/add/{videoId}/{playlistId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update playlistId or videoId if needed
}
```

### Remove Video from Playlist
- **PATCH** `/playlists/remove/{videoId}/{playlistId}`

### Update Playlist
- **PATCH** `/playlists/{playlistId}`
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
- **DELETE** `/playlists/{playlistId}`
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
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
```json
{
  "content": "This is my first tweet!"
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
- **GET** `/tweets/user/{userId}`

### Update Tweet
- **PATCH** `/tweets/{tweetId}`
- **Body (JSON):** `{ "content": "Updated tweet!" }`
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
- **DELETE** `/tweets/{tweetId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("tweetId");
}
```

---

## 6. Comment APIs

### Get Video Comments
- **GET** `/comments/{videoId}`

### Add Comment
- **POST** `/comments/{videoId}`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
```json
{
  "content": "Nice video!"
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
- **PATCH** `/comments/c/{commentId}`
- **Body (JSON):** `{ "content": "Updated comment!" }`
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
- **DELETE** `/comments/c/{commentId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    pm.environment.unset("commentId");
}
```

---

## 7. Like APIs

### Like/Unlike Video
- **POST** `/likes/toggle/v/{videoId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update likeId or videoId if needed
}
```

### Like/Unlike Comment
- **POST** `/likes/toggle/c/{commentId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update likeId or commentId if needed
}
```

### Like/Unlike Tweet
- **POST** `/likes/toggle/t/{tweetId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update likeId or tweetId if needed
}
```

### Get Liked Videos
- **GET** `/likes/videos`

---

## 8. Subscription APIs

### Subscribe/Unsubscribe to Channel
- **POST** `/subscriptions/c/{channelId}`
- **Postman Test Script:**
```js
if (pm.response.code === 200) {
    // Optionally update subscriptionId or channelId if needed
}
```

### Get Subscribed Channels
- **GET** `/subscriptions/c/{channelId}`

### Get Channel Subscribers
- **GET** `/subscriptions/u/{subscriberId}`

---

## 9. Dashboard APIs

### Get Channel Stats
- **GET** `/dashboard/stats?channelId={channelId}`

### Get Channel Videos
- **GET** `/dashboard/videos?channelId={channelId}`

### Get Channel Engagement
- **GET** `/dashboard/engagement?channelId={channelId}`

### Get Top Videos
- **GET** `/dashboard/top-videos?channelId={channelId}`

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
