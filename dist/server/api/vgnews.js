"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const cacheMW_1 = require("./../../functions/cacheMW");
const axios_1 = require("axios");
exports.default = router;
router.get("/", cacheMW_1.default(14400), (_, res) => {
    axios_1.default("https://www.vainglorygame.com/wp-json/wp/v2/posts?per_page=5")
        .then(axiosData => axiosData.data)
        .then(news => {
        return Promise.all(news.map(n => {
            if (!n._links ||
                !n._links["wp:featuredmedia"] ||
                !n._links["wp:featuredmedia"][0]) {
                return "/static/img/vg_news_logo.png";
            }
            return axios_1.default(n._links["wp:featuredmedia"][0].href)
                .then(f => {
                if (!f.data || !f.data.guid || !f.data.guid.rendered) {
                    return "/static/img/vg_news_logo.png";
                }
                return f.data.guid.rendered;
            })
                .catch(() => "/static/img/vg_news_logo.png");
        })).then(featuredImagesData => news.map((n, i) => ({
            link: n.link,
            title: n.title ? n.title.rendered : "",
            // date: n.date_gmt,
            // excerpt: n.excerpt
            //   ? n.excerpt.rendered
            //     ? n.excerpt.rendered.substring(0, 140)
            //     : n.excerpt.rendered
            //   : "",
            featuredImage: featuredImagesData[i]
        })));
    })
        .then(news => {
        res.json(news);
    })
        .catch(err => {
        console.error(err);
        res.status(404).json({ error: err.message });
    });
});
//# sourceMappingURL=vgnews.js.map