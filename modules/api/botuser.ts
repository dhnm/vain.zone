import { Router, Response, Request } from "express";
const router: Router = Router();

import { BotUser, IBotUser } from "./../../models/BotUser";

export default router;

export type IOutput = {
    currentUser: boolean;
    defaultIGN?: string;
};

router.get("/", (req: Request, res: Response): void => {
    BotUser.findOne({ psid: req.query.psid })
        .exec()
        .then((botUser: IBotUser | null): any => {
            if (botUser) {
                const output: IOutput = {
                    currentUser: true,
                    defaultIGN: botUser.defaultIGN
                };
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.write(JSON.stringify(output));
                res.end();
            } else {
                return Promise.reject("Not a current user.");
            }
        })
        .catch((err: any): void => {
            const output: IOutput = { currentUser: false };
            console.log(err);
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify(output));
            res.end();
        });
});
