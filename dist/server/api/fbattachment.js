"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("next/config");
const { serverRuntimeConfig } = config_1.default();
const express_1 = require("express");
const FormData = require("form-data");
const multer = require("multer");
const axios_1 = require("axios");
const router = express_1.Router();
const storage = multer.memoryStorage;
const upload = multer({ storage: storage() });
exports.default = router;
router.post("/", upload.single("blob"), (req, res) => {
    const message = {
        attachment: {
            type: "image",
            payload: {
                is_reusable: true
            }
        }
    };
    var fd = new FormData();
    fd.append("message", JSON.stringify(message));
    fd.append("filedata", req.file.buffer, {
        filename: "vainzone-image.png"
    });
    axios_1.default({
        method: "post",
        url: "https://graph.facebook.com/v2.6/me/message_attachments",
        params: {
            access_token: serverRuntimeConfig.fbAccessToken
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
        }
        else {
            return Promise.reject("Missing attachment_id in response");
        }
    })
        .catch(err => {
        console.error("Unable to send image with error: %s", err);
        res.status(500).json({
            error: true
        });
    });
});
//# sourceMappingURL=fbattachment.js.map