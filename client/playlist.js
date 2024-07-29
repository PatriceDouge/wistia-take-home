"use strict";

var Playlist = {
  medias: [],
  currentIndex: 0,
  autoplayEnabled: true,
  player: null,

  renderMedia: function (media) {
    var template = document.getElementById("media-template");
    var clone = template.content.cloneNode(true);
    var el = clone.children[0];

    el.querySelector(".thumbnail").setAttribute("src", media.thumbnail.url);
    el.querySelector(".title").innerText = media.name;
    el.querySelector(".duration").innerText = Utils.formatTime(media.duration);
    el.querySelector(".media-content").setAttribute(
      "href",
      "#wistia_" + media.hashed_id
    );

    document.getElementById("medias").appendChild(el);
  },

  initializePlaylist: async function () {
    try {
      this.medias = await Utils.getMedias();
      const visibleMedias = this.medias.filter((media) => media.visible);

      if (visibleMedias.length > 0) {
        document
          .querySelector(".wistia_embed")
          .classList.add("wistia_async_" + visibleMedias[0].hashed_id);

        visibleMedias.forEach(function (media) {
          Playlist.renderMedia(media);
        });
      } else {
        console.log("No visible medias to display");
      }
    } catch (error) {
      console.error("Error initializing playlist:", error);
    }
  },

  autoplayPlaylist: function () {
    this.player.push({
      id: "_all",
      options: {
        autoPlay: true,
        silentAutoPlay: "allow", //fallback to allow auto play if normal auto play is blocked
        plugin: {
          autoplay: {
            src: "autoplay-plugin.js",
          },
        },
      },
    });
  },
};

(function () {
  document.addEventListener(
    "DOMContentLoaded",
    async function () {
      try {
        await Playlist.initializePlaylist();

        if (Playlist.medias.length > 0) {
          Playlist.player = window._wq || [];
          Playlist.autoplayPlaylist();
        } else {
          console.log("No medias found in local storage");
        }
      } catch (error) {
        console.error("Error in DOMContentLoaded:", error);
      }
    },
    false
  );
})();
