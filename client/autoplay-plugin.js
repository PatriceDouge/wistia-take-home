function getNextUnwatchedVideo() {
  const medias = Utils.getMediasFromLocalStorage();
  return medias.find((media) => {
    return !window.watchedVideos.includes(media.hashed_id) && media.visible;
  });
}

function clearPlayingStatus() {
  document.querySelectorAll(".thumbnail-container").forEach(function (item) {
    item.classList.remove("playing");
  });
}

function showAsPlaying(video) {
  clearPlayingStatus();

  const mediaEl = document.querySelector(
    `[href="#wistia_${video.hashedId()}"]`
  );
  if (mediaEl) {
    const thumbnailContainer = mediaEl.querySelector(".thumbnail-container");
    if (thumbnailContainer) {
      thumbnailContainer.classList.add("playing");
    }
  }
}

function reorderPlaylist() {
  const currentVideo = Wistia.api(document.querySelector(".wistia_embed"));
  if (!currentVideo) return;

  const currentVideoId = currentVideo.hashedId();
  const mediasList = document.getElementById("medias");
  const mediaItems = Array.from(mediasList.children);

  const currentVideoItem = mediaItems.find((item) =>
    item.querySelector(`[href="#wistia_${currentVideoId}"]`)
  );

  if (currentVideoItem) {
    mediasList.removeChild(currentVideoItem);
    mediasList.appendChild(currentVideoItem);
  }
}

function showCountdown(video, nextVideo) {
  return new Promise((resolve) => {
    const videoContainer = document.querySelector(".wistia_embed");
    if (!videoContainer) {
      resolve();
      return;
    }

    const countdownEl = document.createElement("div");
    countdownEl.className = "countdown";
    countdownEl.innerHTML = `
      <p class="countdown-title">Up Next</p>
      <div class="countdown-timer" style="background-image: url('${nextVideo.thumbnail.url}');">5</div>
      <p class="countdown-video-title">${nextVideo.name}</p>
    `;
    countdownEl.style.height = video.videoHeight() + "px";
    countdownEl.style.width = video.videoWidth() + "px";

    videoContainer.appendChild(countdownEl);

    let countdownTimeSeconds = 5;
    const countdownTimer = countdownEl.querySelector(".countdown-timer");

    const countdownInterval = setInterval(() => {
      countdownTimeSeconds--;

      if (countdownTimeSeconds > 0) {
        countdownTimer.textContent = countdownTimeSeconds;
      } else {
        clearInterval(countdownInterval);
        videoContainer.removeChild(countdownEl);

        setTimeout(() => {
          if (window.currentWistiaVideo) {
            window.currentWistiaVideo.play();
          }
        }, 500);

        resolve();
      }
    }, 1000);
  });
}

function showCurrentVideoTitle(video) {
  const existingTitles = document.querySelectorAll(".current-video-title");
  existingTitles.forEach((title) => title.remove());

  const titleEl = document.createElement("div");
  titleEl.className = "current-video-title";
  titleEl.innerHTML = `
      <p style="font-size: 23px;">${video.name()}</p>
  `;

  const videoContainer = document.querySelector(".wistia_embed");
  if (videoContainer) {
    videoContainer.appendChild(titleEl);
  }
}

window.watchedVideos = window.watchedVideos || []; // local storage would be better, but using window object for easier testing
window.currentWistiaVideo = null;

Wistia.plugin("autoplay", function (video) {
  window.currentWistiaVideo = video;

  showAsPlaying(video);
  showCurrentVideoTitle(video);

  window.watchedVideos.push(video.hashedId());
  const nextVideo = getNextUnwatchedVideo();
  if (!nextVideo) {
    console.log("Autoplay disabled, no more videos to play");
    return;
  }

  video.bind("end", function () {
    clearPlayingStatus();
    video.pause();
    showCountdown(video, nextVideo).then(() => {
      video.replaceWith(nextVideo.hashed_id, { transition: "none" });
    });
    reorderPlaylist();
  });
});
