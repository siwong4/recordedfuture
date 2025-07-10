"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecords = exports.addOrUpdateRecords = void 0;
const client_search_1 = require("@algolia/client-search");
const stringUtils_1 = __importDefault(require("../utils/stringUtils"));
/**
 *
 * @param appId
 * @param apiKey
 * @param indexName
 * @param resourcePath
 */
const addOrUpdateRecords = (_a) => __awaiter(void 0, [_a], void 0, function* ({ appId, apiKey, indexName, records }) {
    console.log('Logging algolia::addOrUpdateRecords... ', records);
    const client = (0, client_search_1.searchClient)(appId, apiKey);
    const response = yield Promise.all(records.map((r) => client.addOrUpdateObject({
        indexName,
        objectID: (0, stringUtils_1.default)(r.resourcePath),
        body: r,
    })));
    console.log(`algolia::addOrUpdateRecords response: `, response);
});
exports.addOrUpdateRecords = addOrUpdateRecords;
/**
 *
 * @param appId
 * @param apiKey
 * @param indexName
 * @param resourcePath
 */
const deleteRecords = (_a) => __awaiter(void 0, [_a], void 0, function* ({ appId, apiKey, indexName, paths }) {
    console.log('Logging algolia::deleteRecords... ', paths);
    const client = (0, client_search_1.searchClient)(appId, apiKey);
    const response = yield Promise.all(paths.map((path) => client.deleteObject({
        indexName,
        objectID: (0, stringUtils_1.default)(path),
    })));
    console.log(`algolia::deleteRecords response: `, response);
});
exports.deleteRecords = deleteRecords;
//# sourceMappingURL=algolia.js.map