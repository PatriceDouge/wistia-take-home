# Notes for this takehome

## Non-functional requirements

- move token/creds to .env file

## Workflow/throught process

1. get an understanding of the general workflow of playlist.html & playlist.js, and how they interact. how are the videos loaded?

## Requirements

### Playlist

- on load of the playlist page, start autoplay
- 5 second countdown appears between each video (UI needs to match wireframe)
- current video shows as "playing" in the queue (UI needs to match wireframe)
- only loop through videos once (autoplay disabled) [think deeper about this]
- played videos need to be added to the bottom, work down the list of videos
- filter out videos that are not marked as visable
- videos need to be saved to local storage/cached to mark visibility & render or not within playlist
- when we getMedias(), first check local storage, if not fetch from API & cache

### Dashboard

- create endpoint to manage the video's visibility
  - update a video's visibility status on JSON
- when a user clicks on a videos's eye toggle -> toggleVideoVisibility()
- strikethrough eye toggle is video has been hidden

### Utility/Helper

- getMedias()
  - checks local storage first, if not get via API, cache and return

## Proposed Solution

### Playlist - on load, autoplay case (v1)

- on DOMContentLoaded event, getMedias first try from cache, if not get via API & cache results (default ttl (tradeoff based on use cases))
- filter out medias if visibility is set & is false
- initializePlaylist()
  - render each video
- (maybe) if first video is ready()
- startPlaylist()
  - initialize player
  - autoplay(index:0)
    - if !autoplayEnabled (possible improvement - this might become complex, split out into own func)
      - stop autoplay (return)
    - player.push ->
      - remove playing class from any videos (possible optimization)
      - add playing class to current video (index)
      - play video
    - when the end event is fired, showCountdown(callback)
      - could we add more checks here?
      - after countdown reaches zero
      - mark current video as watched on JSON (is this already available?)
      - reorderPlaylist()
      - autoplay(index + 1)
        - (potential optimizations here, like playNextUnwatchedVideo() instead, where we could keep track of a count of unwatchedVideoCount or watchedCount, and play the next unwatched video if unwatchedCount !== 0 or watchedCount !== medias.lenght)
        - so more optimizations possible following the above - use a circular buffer to optimize playNextUnwatchedVideo (O(n) -> O(1))
        - could we use addToPlaylist instead?

### Playlist - on load, autoplay case (v2)

- on DOMContentLoaded event, getMedias first try from cache (or DB), if not get via API & cache results (default ttl (tradeoff based on use cases))
- set Playlist medias prop
- initialize wistia queue/player
- initializePlaylist()
  - render each video
- autoplayPlaylist()
  - push all videos to wistia queue, with autoPlay set to true -> starts irst video
  - define & call autoplay plugin
    - mark video as playing
    - add video the watchedVideos array
    - getNextUnwatchedVideo()
      - find video's in the medias array not in watched videos
    - if no videos left -> autoplay disabled, return
    - video.addToPlaylist(nextVideo) -> couldn't use this, switched to replaceWith() within end event
    - when end event fires ->
      - reorderPlaylist()
      - showCountdown()
    - plays next video from there

### Playlist - after autoplay case

- user clicks play on video
- register click event, since we'll be storing the watchedVideos, there will be no videos to play, so it will do nothing

### Playlist - while autoplaying case

- autoplay starts, user clicks on other video and plays that instead
- register click event,
- onEnd, reorderPlaylist()
- if autoplayEnabled -> kickoff autoplay()

### Dashboard - on load

- on DOMContentLoaded, getMedias

### Dashboard - user clicks on toggle

- register user click event
- toggleVideoVisibility()
  - slash through eye on UI
  - update medias local storage

### Dashboard - video view count?

- not a specific requirement, but wireframe shows count
- will need to keep track of count on each media, update count class with value on load

## Non-goals / Ideas to go above & beyond

- deploy to vercel
- have index route, with playlist & dashboard linked within a header, add project write up as main page content
- put main index route behind auth page with password as key, on login fetch products asynchrounously & cache
- rather than saving to local storage, save to an actual DB
- add logs for performance & metrics
- add loading state
- how would i handle the play() restriction on mobile?
- think through asynchrous functions within this context

## Alternatives considered

- for autoplay functionality, loop through the list of videos
  - while this would allow for the expected behavior, it limits our flexibilty & control for handling edge/non-happy path user flows. For example: user pausing, clicking on another video. It also allows for better scalability for larger playlists & other possible features
- Playlist - on load, autoplay case (v1)
  - while this could have worked, using the plugin approach is much cleaner and rather than building our own autoplay functionality, it makes good use of the Wistia API

## Take home improvements

Within the README, the replaceWith link is wrong. Correct: https://docs.wistia.com/docs/javascript-player-api#replacewithhashedid-options
