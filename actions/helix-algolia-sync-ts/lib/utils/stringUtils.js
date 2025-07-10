"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
/**
 *
 * @param str
 */
const md5 = (str) => (0, crypto_1.createHash)('md5').update(str).digest('hex');
exports.default = md5;
//# sourceMappingURL=stringUtils.js.map