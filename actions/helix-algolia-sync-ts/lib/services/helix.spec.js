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
const helix_1 = require("./helix");
const goodResponse = {
    webPath: '/blogs/blog1',
    resourcePath: '/blogs/blog1.md',
    results: [
        {
            name: 'default',
            record: {
                lastModified: 1737588336,
                title: 'blog1',
                image: '/default-meta-image.png?width=1200&format=pjpg&optimize=medium',
                description: '',
                category: '',
                author: '',
            },
        },
        {
            name: '#simple',
            record: {
                lastModified: 1737588336,
            },
        },
    ],
};
const badResponse = {
    webPath: '/blogs/blog123',
    resourcePath: '/blogs/blog123.md',
    results: [
        {
            name: 'default',
            message: 'requested path returned a 301 or 404',
        },
        {
            name: '#simple',
            message: 'requested path returned a 301 or 404',
        },
    ],
};
let mockedResponseStatus = true;
let mockResponse = goodResponse;
global.fetch = jest.fn(() => Promise.resolve({
    ok: mockedResponseStatus,
    status: 'status',
    statusText: 'statusText',
    json: () => Promise.resolve(mockResponse),
}));
describe('helix service', () => {
    beforeEach(() => {
        // Clear all mock function calls and reset mock implementation
        jest.clearAllMocks();
    });
    afterEach(() => { });
    // Assert if setTimeout was called properly
    it('tests addOrUpdateRecord', () => __awaiter(void 0, void 0, void 0, function* () {
        const record = (0, helix_1.buildAlgoliaRecord)(mockResponse);
        expect(record.webPath).toBe('/blogs/blog1');
        expect(record.resourcePath).toBe('/blogs/blog1.md');
    }));
    it('should return an algolia record', () => __awaiter(void 0, void 0, void 0, function* () {
        const x = yield (0, helix_1.fetchHelixResourceMetadata)({ owner: 'owner', repo: 'repo', branch: 'branch', path: 'path' });
        expect(x.webPath).toEqual('/blogs/blog1');
        expect(x.resourcePath).toEqual('/blogs/blog1.md');
    }));
    it('should return an undefiend record when helix resource not found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockResponse = badResponse;
        const x = yield (0, helix_1.fetchHelixResourceMetadata)({ owner: 'owner', repo: 'repo', branch: 'branch', path: 'path' });
        expect(x).toBeUndefined();
    }));
    it('should throw an error when response.ok is false', () => __awaiter(void 0, void 0, void 0, function* () {
        mockedResponseStatus = false;
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, helix_1.fetchHelixResourceMetadata)({ owner: 'owner', repo: 'repo', branch: 'branch', path: 'path' });
        })).rejects.toThrowError();
    }));
    it('tests addOrUpdateRecord to return {} object', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockInput = Object.assign({}, mockResponse);
        delete mockInput.results[0].record;
        expect((0, helix_1.buildAlgoliaRecord)(mockInput)).toEqual(undefined);
        mockInput.results = [];
        expect((0, helix_1.buildAlgoliaRecord)(mockInput)).toEqual(undefined);
        delete mockInput.results;
        expect((0, helix_1.buildAlgoliaRecord)(mockInput)).toEqual(undefined);
        expect((0, helix_1.buildAlgoliaRecord)({})).toEqual(undefined);
        expect((0, helix_1.buildAlgoliaRecord)(undefined)).toEqual(undefined);
        expect((0, helix_1.buildAlgoliaRecord)(null)).toEqual(undefined);
    }));
});
//# sourceMappingURL=helix.spec.js.map