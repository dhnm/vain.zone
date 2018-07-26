import * as mcache from "memory-cache";

export default duration => (req, res, next) => {
  const key = "__express__" + req.originalUrl || req.url;
  const cachedBody = mcache.get(key);
  if (cachedBody) {
    console.log("sending cachedbody", cachedBody);
    res.send(cachedBody);
    return;
  } else {
    console.log("sending UNcached");
    res.sendResponse = res.send;
    res.send = body => {
      mcache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};
