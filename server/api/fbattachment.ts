import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

import { Router } from "express";
import * as FormData from "form-data";
import * as multer from "multer";
import axios from "axios";

const router: Router = Router();
const storage = multer.memoryStorage;
const upload = multer({ storage: storage() });

export default router;

router.post("/", upload.single("blob"), (req, res) => {
  const message = {
    attachment: {
      type: "image",
      payload: {
        is_reusable: true
      }
    }
  };

  var fd: FormData = new FormData();
  fd.append("message", JSON.stringify(message));
  fd.append("filedata", req.file.buffer, {
    filename: "vainzone-image.png"
  });

  axios({
    method: "post",
    url: "https://graph.facebook.com/v2.6/me/message_attachments",
    params: {
      access_token: serverRuntimeConfig.fbMessengerAccessToken
    },
    data: fd,
    headers: fd.getHeaders()
  })
    .then(fbRes => {
      console.log("Success!");
      if (fbRes.data.attachment_id) {
        res.json({
          error: false,
          attachmentId: fbRes.data.attachment_id
        });
      } else {
        return Promise.reject("Missing attachment_id in response");
      }
    })
    .catch(err => {
      console.error("Unable to send image with error: %s", err);
      console.error(err.response);
      res.status(500).json({
        error: true
      });
    });
});
