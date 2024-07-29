"use strict";

var Dashboard = {
  getStats: function (mediaId) {
    return Utils.getStats(mediaId).then(function (response) {
      var stats = response;
      if (!stats || stats.play_count === 0) {
        return "?";
      }
      return stats.play_count.toString();
    });
  },

  renderTag: function (mediaEl, tag) {
    var template = document.getElementById("tag-template");
    var clone = template.content.cloneNode(true);
    var tagEl = clone.children[0];

    tagEl.innerText = tag;
    mediaEl.querySelector(".tags").append(tagEl);
  },

  renderTags: function (mediaEl, tags) {
    tags.forEach(function (tag) {
      Dashboard.renderTag(mediaEl, tag);
    });
  },

  renderMedia: function (media) {
    var template = document.getElementById("media-template");
    var clone = template.content.cloneNode(true);
    var el = clone.children[0];

    el.querySelector(".thumbnail").setAttribute("src", media.thumbnail.url);
    el.querySelector(".title").innerText = media.name;
    el.querySelector(".duration").innerText = Utils.formatTime(media.duration);
    var countEl = el.querySelector(".count");
    countEl.innerText = "Loading...";
    this.getStats(media.id).then(function (count) {
      countEl.innerText = count;
    });
    el.setAttribute("data-hashed-id", media.hashed_id);
    el.setAttribute("data-visible", media.visible ? "true" : "false");

    var visibilityToggle = el.querySelector(".visibility-toggle");
    var visibleIcon = visibilityToggle.querySelector(".media--visible");
    var hiddenIcon = visibilityToggle.querySelector(".media--hidden");

    if (media.visible) {
      visibilityToggle.classList.remove("strikethrough");
      visibleIcon.style.display = "inline";
      hiddenIcon.style.display = "none";
    } else {
      visibilityToggle.classList.add("strikethrough");
      visibleIcon.style.display = "none";
      hiddenIcon.style.display = "inline";
    }

    this.renderTags(el, ["tag-1", "tag-2"]);

    document.getElementById("medias").appendChild(el);
  },

  openModal: function () {
    document.querySelector(".modal").classList.add("modal--open");
  },

  closeModal: function () {
    document.querySelector(".modal").classList.remove("modal--open");
  },

  addTag: function () {
    var el = document.createElement("li");
    el.querySelector(".tags").appendChild(el);
  },

  toggleVisibility: function (mediaEl) {
    var hashedId = mediaEl.getAttribute("data-hashed-id");
    var isVisible = mediaEl.getAttribute("data-visible") === "true";
    var shouldToggle = !isVisible;

    var medias = JSON.parse(localStorage.getItem("medias") || "[]");
    var mediaIndex = medias.findIndex((m) => m.hashed_id === hashedId);
    if (mediaIndex !== -1) {
      medias[mediaIndex].visible = shouldToggle;
      localStorage.setItem("medias", JSON.stringify(medias));
    }

    mediaEl.setAttribute("data-visible", shouldToggle.toString());
    var visibilityToggle = mediaEl.querySelector(".visibility-toggle");
    visibilityToggle.classList.toggle("strikethrough", !shouldToggle);

    var visibleIcon = visibilityToggle.querySelector(".media--visible");
    var hiddenIcon = visibilityToggle.querySelector(".media--hidden");
    visibleIcon.style.display = shouldToggle ? "inline" : "none";
    hiddenIcon.style.display = shouldToggle ? "none" : "inline";

    Utils.toggleVideoVisibility(hashedId, shouldToggle);
  },
};

(function () {
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      Utils.getMedias()
        .then(function (medias) {
          if (Array.isArray(medias)) {
            medias.forEach(function (media) {
              Dashboard.renderMedia(media);
            });
          } else {
            console.error("Unexpected medias structure:", medias);
            document.getElementById("medias").innerHTML =
              "<p>Error loading media data.</p>";
          }
        })
        .catch(function (error) {
          console.error("Error fetching medias:", error);
          document.getElementById("medias").innerHTML =
            "<p>Error loading media data.</p>";
        });
    },
    { useCapture: false }
  );

  document.addEventListener(
    "click",
    function (event) {
      if (event && event.target.matches(".visibility-toggle")) {
        var mediaEl = event.target.closest(".media");
        Dashboard.toggleVisibility(mediaEl);
      }

      if (event && event.target.matches(".tag-button")) {
        Dashboard.openModal();
      }

      if (event && event.target.matches(".modal__button--close")) {
        Dashboard.closeModal();
      }
    },
    { useCapture: true }
  );
})();
