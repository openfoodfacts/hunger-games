import axios from "axios";

export const addImageFlag = ({ barcode, imgid, url }) => {
  axios
    .put(`https://amathjourney.com/api/off-annotation/flag-image/${barcode}`, {
      mode: "no-cors",
      imgid,
      url,
    })
    .catch(() => {
      console.log("Image flagged");
    });
};

export const removeImageFlag = ({ barcode, imgid }) => {
  axios
    .delete(
      `https://amathjourney.com/api/off-annotation/flag-image/${barcode}`,
      {
        mode: "no-cors",
        data: {
          imgid,
        },
      }
    )
    .catch(() => {
      console.log("Something went wrong. Image could not be flagged");
    });
};

const externalApi = {
  addImageFlag,
  removeImageFlag,
};

export default externalApi;
