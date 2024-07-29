"use strict";

// READ-ONLY TOKEN
var TOKEN = "be21195231d946b680453e48456d6e806a34c0456b8c13804aa797cb2c560db1";

var Utils = {
  formatTime: (total) => {
    let minutes = 0;
    let seconds = 0;

    if (total > 0) {
      minutes += Math.floor(total / 60);
      total %= 60;
    }

    seconds = Math.round(total);

    if (seconds == 60) {
      minutes += 1;
      seconds = 0;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  },

  getMedias: function () {
    return new Promise((resolve, reject) => {
      const storedMedias = localStorage.getItem("medias");

      if (storedMedias) {
        resolve(JSON.parse(storedMedias));
      } else {
        axios
          .get("/medias")
          .then((response) => {
            const initializedMedias = response.data.map((media) => ({
              ...media,
              visible: true,
            }));

            localStorage.setItem("medias", JSON.stringify(initializedMedias));
            resolve(initializedMedias);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  getStats: function (mediaId) {
    return axios
      .get(`/stats/${mediaId}`)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error("Error fetching stats", error);
        throw error;
      });
  },

  toggleVideoVisibility: function (mediaId, shouldToggle) {
    return axios
      .patch(`/medias/${mediaId}`, { visible: shouldToggle })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error("Error updating visibility on server", error);
        throw error;
      });
  },

  getMediasFromLocalStorage: function () {
    const storedMedias = localStorage.getItem("medias");
    return storedMedias ? JSON.parse(storedMedias) : [];
  },

  setMediasInLocalStorage: function (medias) {
    localStorage.setItem("medias", JSON.stringify(medias));
  },
};
