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
exports.run = exports.getPathsFromClientPayload = exports.getEventType = exports.validEventType = exports.getClientPayload = exports.processUnpublishEvent = exports.processPublishEvent = exports.getAppCfg = void 0;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const helix_1 = require("./services/helix");
const algolia_1 = require("./services/algolia");
const types_1 = require("./types");
/**
 *
 */
const getAppCfg = () => {
    console.log('Logging index::getAppCfg...');
    const appId = (0, core_1.getInput)('algolia-application-id');
    const apiKey = (0, core_1.getInput)('algolia-api-key');
    const idxName = (0, core_1.getInput)('algolia-index-name') || 'asdf'; // TODO: remove 'asdf' default
    const branchName = github_1.context.ref.replace('refs/heads/', '');
    console.log('index::getAppCfg: ', { appId, apiKey, idxName, branchName });
    return { appId, apiKey, indexName: idxName, branchName };
};
exports.getAppCfg = getAppCfg;
/**
 *
 * @param clientPayload
 * @param branchName
 * @param apiKey
 * @param appId
 * @param indexName
 * @param paths
 */
const processPublishEvent = (_a) => __awaiter(void 0, [_a], void 0, function* ({ clientPayload, branchName, apiKey, appId, indexName, paths, }) {
    console.log('Logging index::processPublishEvent...');
    const promises = [];
    for (let i = 0; i < paths.length; i += 1) {
        const path = paths[i];
        promises.push((0, helix_1.fetchHelixResourceMetadata)({
            owner: clientPayload.org,
            repo: clientPayload.site,
            branch: branchName,
            path,
        }));
    }
    let records = yield Promise.all(promises);
    records = records.filter((element) => element !== undefined);
    yield (0, algolia_1.addOrUpdateRecords)({ apiKey, appId, indexName, records });
});
exports.processPublishEvent = processPublishEvent;
/**
 *
 * @param apiKey
 * @param appId
 * @param indexName
 * @param paths
 */
const processUnpublishEvent = (_a) => __awaiter(void 0, [_a], void 0, function* ({ apiKey, appId, indexName, paths }) {
    console.log('Logging index::processUnpublishEvent...');
    yield (0, algolia_1.deleteRecords)({ apiKey, appId, indexName, paths });
});
exports.processUnpublishEvent = processUnpublishEvent;
/**
 *
 */
const getClientPayload = () => {
    /**
     * @type {{org: string, path: string, site: string, status: number}}
     */
    const clientPayload = github_1.context.payload.client_payload;
    console.log('Logging index::getClientPayload...', clientPayload);
    if (!clientPayload) {
        throw new Error('No client payload found.');
    }
    return clientPayload;
};
exports.getClientPayload = getClientPayload;
/**
 *
 * @param eventType
 */
const validEventType = (eventType) => {
    console.log('Logging index::validEventType...', eventType);
    if (Object.values(types_1.EventType).includes(eventType)) {
        return true;
    }
    return false;
};
exports.validEventType = validEventType;
/**
 *
 */
const getEventType = () => {
    const eventType = github_1.context.payload.action;
    console.log('Logging index::getEventType...', eventType);
    if (!(0, exports.validEventType)(eventType)) {
        throw new Error(`Unsupported eventType=${eventType}`);
    }
    return eventType;
};
exports.getEventType = getEventType;
/**
 *
 * @param clientPayload
 */
const getPathsFromClientPayload = (clientPayload) => {
    console.log('Logging index::extractPathsFromPayload...', clientPayload);
    if (clientPayload) {
        if (clientPayload.paths && clientPayload.paths.length > 0) {
            return clientPayload.paths;
        }
        if (clientPayload.path && clientPayload.path.length > 0) {
            return [clientPayload.path];
        }
    }
    return [];
};
exports.getPathsFromClientPayload = getPathsFromClientPayload;
/**
 * main runner
 */
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Logging index::runner... ', JSON.stringify(github_1.context));
    const { appId, apiKey, indexName, branchName } = (0, exports.getAppCfg)();
    // process payload
    const eventType = (0, exports.getEventType)();
    const clientPayload = (0, exports.getClientPayload)();
    const paths = (0, exports.getPathsFromClientPayload)(clientPayload);
    if (paths && paths.length > 0) {
        // process event
        switch (eventType) {
            case types_1.EventType.RESOURCE_PUBLISHED:
            case types_1.EventType.RESOURCES_PUBLISHED:
                yield (0, exports.processPublishEvent)({ clientPayload, branchName, apiKey, appId, indexName, paths });
                break;
            case types_1.EventType.RESOURCE_UNPUBLISHED:
            case types_1.EventType.RESOURCES_UNPUBLISHED:
                yield (0, exports.processUnpublishEvent)({ apiKey, appId, indexName, paths });
                break;
            default:
                break;
        }
    }
    else {
        // else nothing to process, exist gracefully.
        console.log('No paths to process, runner completed');
    }
});
exports.run = run;
/**
 * entry point
 */
if (!process.env.JEST_WORKER_ID) {
    (0, exports.run)().catch((error) => {
        var _a;
        (0, core_1.setFailed)(`Action failed with error: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown error'}`);
    });
}
//# sourceMappingURL=index.js.map