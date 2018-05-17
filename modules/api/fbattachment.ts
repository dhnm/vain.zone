import { Router, Request, Response } from 'express';
import * as FormData from 'form-data';
import * as multer from 'multer';
import axios from 'axios';

const router: Router = Router();
const storage = multer.memoryStorage;
const upload = multer({ storage: storage() });

export default router;

export type IOutput = {
  error: boolean;
  attachmentId?: string;
};

router.post('/', upload.single('blob'), (req: Request, res: Response): void => {
  const message: any = {
    attachment: {
      type: 'image',
      payload: {
        is_reusable: true,
      },
    },
  };

  var fd: FormData = new FormData();
  fd.append('message', JSON.stringify(message));
  fd.append('filedata', req.file.buffer, {
    filename: 'image.png',
  });

  axios({
    method: 'post',
    url: 'https://graph.facebook.com/v2.6/me/message_attachments',
    params: {
      access_token:
        'EAAIxVyRb1vwBAHhU8w9UNT7G5mv9CR7oPra44BXAHS6PwVkf7OOwR5bKZCCXbZB0l2IJ01b7HxonqYrtUyg9d7w2ykbW5dlhZCbkZCxRxThgJQ9nZAhHHwBTH8CxPhyl2ftVi8UNv36EwLKPyOpDtuKmhDQgfoaNclpMjxf1ZCoAZDZD',
    },
    data: fd,
    headers: fd.getHeaders(),
  })
    .then((fbRes: any): any => {
      console.log('Success!');
      if (fbRes.data.attachment_id) {
        const output: IOutput = {
          error: false,
          attachmentId: fbRes.data.attachment_id,
        };
        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(output));
        res.end();
      } else {
        return Promise.reject('Missing attachment_id in response');
      }
    })
    .catch((err) => {
      const output: IOutput = {
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
