"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const czSkSchema = new mongoose_1.Schema({
    name: { type: String, unique: true, required: true }
});
exports.CzSk = mongoose_1.model("czsk", czSkSchema, "czsk");
//# sourceMappingURL=CzSk.js.map