## How to setup & run

- browser
  - Navigate to:
    1. http://localhost:8080/playlist
    2. http://localhost:8080/dashboard
- locally:
  1.  `cd full-stack-challenge-gwkzas`
  2.  Run `npm install`
  3.  Run `npm run dev`
  4.  Navigate to:
      1. http://localhost:8080/playlist
      2. http://localhost:8080/dashboard

## Browser & OS used

Chrome Version 126.0.6478.183
macOS Sonoma Version 14.5

## General design

I built a straightforward Node.js/Express based project. I didn't change much with the client folder. I added a server/index.js file where I defined the express app and the associated routes & endpoints.

## Playlist overview & details

### Thought process (notes.md has more details)

I started off by familiarizing myself with the Wistia API, taking note of methods and supported workflows to begin forming an initial design. At first, I decided on using the Wistia player to push videos onto the queue, and by binding to an end event, I assumed I could get the next video, and `play()` from there or use `addToPlaylist()` to autoplay the next video after handling the playing status countdown.

Though, after trying to implement a quick POC, I quickly ran into some issues with getting consecutive videos to run. While looking through the API docs, I came across the Plugin API, which led me to refactor my design, since what I was essentially trying build from scratch, was provided by default with plugins.

### High Level Design

1. On DOMContentLoaded event, get medias array from cache or via API
2. InitializePlaylist() - render each video
3. AutoplayPlaylist() - define plugin & kick off autoplay
4. Once the plugin loads
   1. Mark video as playing in playlist
   2. Show the current video title below the video
   3. Add video the watchedVideos array
   4. GetNextUnwatchedVideo() - look for videos in medias array not in watchedVideos
   5. When end event fires
      1. Clear all classes with a "playing" class
      2. Pause the video
      3. ShowCountdown()
      4. Once countdown is up -> replace current video with next video (play the next video)
      5. Move played video to bottom of queue
   6. Autoplay will be automatically "disabled" once there are no longer any videos in the medias array not watchedVideos

### Performance characteristics

1. Initial load
   - On first load, we're getting all medias from the API which could potentially be costly for larger list sizes. In that case we could implement pagination and/or lazy loading,
   - After the initial load, we cache the medias in local storage, so we save on load times & unnecessary API calls
   - Besides localStorage, we have a few other options for caching that would be more robust and scalable:
     - Memcached
     - Redis
     - IndexedDB

- Autoplay
  - My initial implementation could have been costly as I had to implement my own loop for iterating through the list of videos, but by using Wistia's built in Plugin API, for our use cases its an optimized approach
  - GetNextUnwatchedVideo() could be optimized since we pull the cached medias every time we get ready to play the next video, so this can definitely be optimized by
    - Using a set for faster lookups
    - Using a [Circular Buffer](https://en.wikipedia.org/wiki/Circular_buffer) for more efficient storage and retrieval
- DOM Manipulation
  - For our use case, I feel there is not much room for optimizations, but I'm sure we can break each DOM query down and optimize how we're interacting between the autoplay logic and the client

### What I learned/What I would do differently

1. For a start, it was nice to build using vanilla JS again, rather than using React or other front-end frameworks. Most of the techniques I used I knew of but had to look up a few methods for DOM manipulation.
2. I would have taken more time familiarizing myself with the API.

### Notes

1. I included basic tests for my initial commit, but given more time I would have certainly made sure the API's the the UI workflow was properly unit tested, and would have included some integration tests for good measure
2. I chose to persist data mostly using the native `window` object local storage but with more time, I could have easily used a more robust solution like SQLite.
3. The API have no authentication, this is purely to save on time, and I would have definitely implemented proper auth for GET/POST/PATCH calls.

## Dashboard overview & details

The dashboard features were pretty straightforward to implement. My initial design ended up being the approach I ended up implementing.

### High Level Design

1. Register user click event
2. ToggleVideoVisibility()
   - Get medias from local storage & update the visible property on toggled media element
   - Get specific media based on user click event
   - Strikethrough media element on dashboard UI
   - Send a `PATCH /medias/:hashedId` request
     - Note: In a production app, this would usually update and persist the visibility of a media to a database, but for our use case, since we're persisting medias within localStorage client-side, we'll just return success

### Performance Characterics

1. Initial load
   - Similarly to the Playlist functionality, this has potential to be a bottleneck given much larger lists, but for our use case, storing to local storage after first fetch help reduce unnecessary calls and reduce load times for subsequent page refreshes

- On toggle
  - Similarly to the Playlist functionality, the main potential bottleneck here is retrieval from local storage. However, since we're not storing large amount of data, we don't need to worry about reaching the localStorage capacity or affecting page load times. For larger list sizes, we have a few options, which was listed earlier.

## Design the database for "search by tag" for the owner dashboard

### Schemas

1. Videos table:
   - My thinking behind this mostly around storing relevant information & meta data for each video
2. Tags table
   - Goal is to simply store unique tags and their names
3. Video_tags table
   - Many-to-many relationship between videos & tags

```
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    hashed_id VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    play_count INTEGER DEFAULT 0,
    name VARCHAR(255),
    duration FLOAT,
    visible BOOLEAN DEFAULT TRUE
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE video_tags (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id),
    tag_id INTEGER REFERENCES tags(id),
);
```

### Query to print the total number of videos with at least 1 play count

This query is straightforward — simply count the number of rows in the videos table where play_count is greater than 0.

```
SELECT COUNT(*)
FROM videos
WHERE play_count > 0;
```

### Query to find the video with the most number of tags.

The main idea behind this query is to get the count of unique tags that correspond to a particular video by cross checking across all tables to ensure we're counting tags that belong to each video. From there we sort by created_at so that LIMIT 1 returns the most recently created tag from the sorted list.

```
SELECT v.id, COUNT(DISTINCT t.id) AS tag_count
FROM videos v, video_tags vt, tags t
WHERE v.id = vt.video_id
AND vt.tag_id = t.id
GROUP BY v.id
ORDER BY tag_count DESC, v.created_at DESC
LIMIT 1;
```
