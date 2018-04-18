const express = require("express");
const router = express.Router();

const getData = require("./../functions/getData");

module.exports = router;

router.get("/", (req, res) => {
    getData(req.query.IGN)
        .then(data => {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify(data));
            res.end();
        })
        .catch(error => {
            res.writeHead(200, {
                // 200 to handle error myself, otherwise it renders 404 page
                "Content-Type": "application/json"
            });
            res.write(
                JSON.stringify({
                    error: true,
                    errorMessage: error
                })
            );
            res.end();
        });
});
