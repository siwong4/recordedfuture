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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHelixResourceMetadata = exports.buildAlgoliaRecord = void 0;
const faker_1 = require("@faker-js/faker");
const ADMIN_HLX_PAGE_INDEX_URL_PREFIX = 'https://admin.hlx.page/index';
/**
 *
 * @param hlxResource
 */
const buildAlgoliaRecord = (hlxResource) => {
    console.log(`Logging helix::buildAlgoliaRecord...`, hlxResource);
    if (hlxResource && hlxResource.results && hlxResource.results[0] && hlxResource.results[0].record) {
        // TODO:  replace faker with real data once schema is ready
        return {
            webPath: hlxResource.webPath,
            resourcePath: hlxResource.resourcePath,
            name: `${faker_1.faker.food.dish()}`,
            lastModified: faker_1.faker.date.anytime().getTime(),
            title: `${faker_1.faker.food.dish()}`,
            image: `${faker_1.faker.image.url()}`,
            description: `${faker_1.faker.food.description()}`,
            category: `${faker_1.faker.food.ethnicCategory()}`,
            author: `${faker_1.faker.book.author()}`,
            date: faker_1.faker.date.anytime().getTime(),
        };
    }
    return undefined;
};
exports.buildAlgoliaRecord = buildAlgoliaRecord;
/**
 *
 * @param owner
 * @param repo
 * @param branch
 * @param path
 */
const fetchHelixResourceMetadata = (_a) => __awaiter(void 0, [_a], void 0, function* ({ owner, repo, branch, path, }) {
    const modPath = path.replace(/^\/*/, '');
    const url = new URL(`${ADMIN_HLX_PAGE_INDEX_URL_PREFIX}/${owner}/${repo}/${branch}/${modPath}`);
    console.log(`Logging helix::fetchHelixResourceMetadata... `, { url, modPath });
    const fetchRsp = yield fetch(url);
    console.log(`helix::fetchHelixResourceMetadata fetchRsp: `, JSON.stringify(fetchRsp));
    if (!fetchRsp.ok)
        throw new Error(`Failed to fetch Helix resource metadata: ${fetchRsp.status} ${fetchRsp.statusText}`);
    const jsonBody = yield fetchRsp.json();
    console.log(`helix::fetchHelixResourceMetadataLogging jsonRsp: `, JSON.stringify(jsonBody));
    // page does not exist
    if (JSON.stringify(jsonBody).includes('requested path returned a 301 or 404')) {
        return undefined;
    }
    // transform to AlgRecord
    return (0, exports.buildAlgoliaRecord)(jsonBody);
});
exports.fetchHelixResourceMetadata = fetchHelixResourceMetadata;
//# sourceMappingURL=helix.js.map