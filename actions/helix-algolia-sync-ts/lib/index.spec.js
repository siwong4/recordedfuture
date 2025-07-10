"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const helix_1 = require("./services/helix");
const algolia_1 = require("./services/algolia");
const myModule = __importStar(require("./index"));
jest.mock('./services/algolia', () => ({
    addOrUpdateRecords: jest.fn(),
    deleteRecords: jest.fn(),
}));
jest.mock('./services/helix', () => ({
    fetchHelixResourceMetadata: jest.fn(),
}));
// Mock getInput and setFailed functions
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setFailed: jest.fn(),
}));
// Mock context and getOctokit functions
jest.mock('@actions/github', () => ({
    context: {
        payload: {
            action: 'resource-published',
            client_payload: {
                org: 'nelson-ens',
                path: '/index.md',
                site: 'aem-eds-boilerplate',
                status: 200,
            },
        },
        repo: {
            owner: 'owner',
            repo: 'repo',
        },
        ref: 'refs/heads/main',
    },
    getOctokit: jest.fn(),
}));
describe('main index', () => {
    const goodClientPayload = {
        org: 'nelson-ens',
        path: '/index.md',
        site: 'aem-eds-boilerplate',
        status: 200,
    };
    const emptyPathsClientPayload = {
        org: 'nelson-ens',
        site: 'aem-eds-boilerplate',
        status: 200,
    };
    beforeEach(() => {
        // Clear all mock function calls and reset mock implementation
        jest.clearAllMocks();
        github_1.context.payload.client_payload = goodClientPayload;
    });
    afterEach(() => { });
    it('should return clientPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the return values for getInput
        expect(myModule.getClientPayload()).toEqual({
            org: 'nelson-ens',
            path: '/index.md',
            site: 'aem-eds-boilerplate',
            status: 200,
        });
    }));
    it('should run processPublishEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'resource-published';
        const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        const x = yield myModule.run();
        expect(processPublishEventSpy).toHaveBeenCalledTimes(1);
        expect(processUnpublishEventSpy).toHaveBeenCalledTimes(0);
        processPublishEventSpy.mockRestore();
        processUnpublishEventSpy.mockRestore();
    }));
    it('should run processUnPublishEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'resource-unpublished';
        const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        const x = yield myModule.run();
        expect(processUnpublishEventSpy).toHaveBeenCalledTimes(1);
        expect(processPublishEventSpy).toHaveBeenCalledTimes(0);
        processUnpublishEventSpy.mockRestore();
        processPublishEventSpy.mockRestore();
    }));
    it('should not run neither processPublishEvent nor processUnPublishEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'blah';
        const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield myModule.run();
        })).rejects.toThrowError();
        processUnpublishEventSpy.mockRestore();
        processPublishEventSpy.mockRestore();
        github_1.context.payload.action = 'resource-published';
    }));
    it('should return appCfg as expected', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the return values for getInput
        core_1.getInput.mockReturnValueOnce('algolia-application-id');
        core_1.getInput.mockReturnValueOnce('algolia-api-key');
        core_1.getInput.mockReturnValueOnce('algolia-index-name');
        expect(myModule.getAppCfg()).toEqual({
            appId: 'algolia-application-id',
            apiKey: 'algolia-api-key',
            indexName: 'algolia-index-name',
            branchName: 'main',
        });
    }));
    it('should throw an error in checkClientPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the return values for getInput
        core_1.getInput.mockReturnValueOnce('algolia-application-id');
        core_1.getInput.mockReturnValueOnce('algolia-api-key');
        core_1.getInput.mockReturnValueOnce('algolia-index-name');
        github_1.context.payload.client_payload = undefined;
        expect(myModule.getClientPayload).toThrowError('No client payload found.');
    }));
    it('should return an array of paths', () => __awaiter(void 0, void 0, void 0, function* () {
        const clientPayloadMock = {
            org: 'nelson-ens',
            site: 'aem-eds-boilerplate',
            status: 200,
        };
        expect(myModule.getPathsFromClientPayload(Object.assign(Object.assign({}, clientPayloadMock), { path: '/index.md' }))).toEqual([
            '/index.md',
        ]);
        expect(myModule.getPathsFromClientPayload(Object.assign(Object.assign({}, clientPayloadMock), { paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'] }))).toEqual(['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md']);
    }));
    it('should throw an error in extractPathsFromPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(myModule.getPathsFromClientPayload(emptyPathsClientPayload)).toEqual([]);
        expect(myModule.getPathsFromClientPayload(Object.assign(Object.assign({}, emptyPathsClientPayload), { path: '' }))).toEqual([]);
        expect(myModule.getPathsFromClientPayload(Object.assign(Object.assign({}, emptyPathsClientPayload), { paths: [] }))).toEqual([]);
        expect(myModule.getPathsFromClientPayload(Object.assign(Object.assign({}, emptyPathsClientPayload), { paths: undefined }))).toEqual([]);
    }));
    it('should return truthy if eventType is valid', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the return values for getInput
        expect(myModule.validEventType('resource-published')).toBeTruthy();
        expect(myModule.validEventType('resources-published')).toBeTruthy();
        expect(myModule.validEventType('resource-unpublished')).toBeTruthy();
        expect(myModule.validEventType('resources-unpublished')).toBeTruthy();
    }));
    it('should return falsy if eventType is valid', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(myModule.validEventType('RESOURCE-PUBLISHED')).toBeFalsy();
        expect(myModule.validEventType('resource-publishedd')).toBeFalsy();
        expect(myModule.validEventType('RESOURCE-UNPUBLISHED')).toBeFalsy();
        expect(myModule.validEventType('resource-unpublishedd')).toBeFalsy();
        expect(myModule.validEventType('')).toBeFalsy();
        expect(myModule.validEventType(null)).toBeFalsy();
        expect(myModule.validEventType(undefined)).toBeFalsy();
    }));
    it('should return eventType', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'resource-published';
        expect(myModule.getEventType()).toBe('resource-published');
    }));
    it('should throw an error in extractEventType', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'blah';
        expect(myModule.getEventType).toThrowError('Unsupported eventType=blah');
    }));
    it('should test processPublishEvent successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'resource-published';
        const x = yield myModule.processPublishEvent({
            clientPayload: {},
            branchName: 'bn',
            apiKey: 'ak',
            appId: 'ai',
            indexName: 'in',
            paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
        });
        expect(helix_1.fetchHelixResourceMetadata).toBeCalledTimes(3);
        expect(algolia_1.addOrUpdateRecords).toBeCalledTimes(1);
    }));
    it('should test processUnpublishEvent successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'resource-unpublished';
        const x = yield myModule.processUnpublishEvent({
            apiKey: 'ak',
            appId: 'ai',
            indexName: 'in',
            paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
        });
        expect(algolia_1.deleteRecords).toBeCalledTimes(1);
    }));
    it('should not run neither processPublishEvent nor processUnPublishEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        github_1.context.payload.action = 'resource-published';
        github_1.context.payload.client_payload = emptyPathsClientPayload;
        const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { }));
        yield myModule.run();
        expect(processPublishEventSpy).toHaveBeenCalledTimes(0);
        expect(processUnpublishEventSpy).toHaveBeenCalledTimes(0);
        processUnpublishEventSpy.mockRestore();
        processPublishEventSpy.mockRestore();
    }));
});
//# sourceMappingURL=index.spec.js.map