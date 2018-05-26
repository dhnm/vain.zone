"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FormData = require("form-data");
const multer = require("multer");
const axios_1 = require("axios");
const router = express_1.Router();
const storage = multer.memoryStorage;
const upload = multer({ storage: storage() });
exports.default = router;
router.post('/', upload.single('blob'), (req, res) => {
    const message = {
        attachment: {
            type: 'image',
            payload: {
                is_reusable: true,
            },
        },
    };
    var fd = new FormData();
    fd.append('message', JSON.stringify(message));
    fd.append('filedata', req.file.buffer, {
        filename: 'image.png',
    });
    axios_1.default({
        method: 'post',
        url: 'https://graph.facebook.com/v2.6/me/message_attachments',
        params: {
            access_token: 'EAAIxVyRb1vwBAHhU8w9UNT7G5mv9CR7oPra44BXAHS6PwVkf7OOwR5bKZCCXbZB0l2IJ01b7HxonqYrtUyg9d7w2ykbW5dlhZCbkZCxRxThgJQ9nZAhHHwBTH8CxPhyl2ftVi8UNv36EwLKPyOpDtuKmhDQgfoaNclpMjxf1ZCoAZDZD',
        },
        data: fd,
        headers: fd.getHeaders(),
    })
        .then((fbRes) => {
        console.log('Success!');
        if (fbRes.data.attachment_id) {
            const output = {
                error: false,
                attachmentId: fbRes.data.attachment_id,
            };
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            res.write(JSON.stringify(output));
            res.end();
        }
        else {
            return Promise.reject('Missing attachment_id in response');
        }
    })
        .catch((err) => {
        const output = {
            error: true,
        };
        console.error('Unable to send image with error: %s', err);
        res.writeHead(500, {
            'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(output));
        res.end();
    });
});
//# sourceMappingURL=fbattachment.js.map