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
const client_search_1 = require("@algolia/client-search");
const algolia_1 = require("./algolia");
// Mock getInput and setFailed functions
jest.mock('@algolia/client-search', () => {
    const mockClient = { addOrUpdateObject: jest.fn(), deleteObject: jest.fn() };
    return { searchClient: jest.fn(() => mockClient) };
});
// jest.mock('@algolia/client-search');
describe('algolia service', () => {
    beforeEach(() => {
        // Clear all mock function calls and reset mock implementation
        jest.clearAllMocks();
    });
    afterEach(() => { });
    // Assert if setTimeout was called properly
    it('tests addOrUpdateRecords to ensure addOrUpdateObject was triggered 2 times', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = (0, client_search_1.searchClient)('a', 'b');
        const x = yield (0, algolia_1.addOrUpdateRecords)({
            appId: 'appId',
            apiKey: 'apiKey',
            indexName: 'indexName',
            records: [{ resourcePath: '/x/y1.md' }, { resourcePath: '/x/y2.md' }],
        });
        expect(client.addOrUpdateObject).toBeCalledTimes(2);
    }));
    // Assert if setTimeout was called properly
    it('tests deleteRecords to ensure deleteObject was triggered 2 times', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = (0, client_search_1.searchClient)('a', 'b');
        const x = yield (0, algolia_1.deleteRecords)({
            appId: 'appId',
            apiKey: 'apiKey',
            indexName: 'indexName',
            paths: ['/x/y1.md', '/x/y2.md'],
        });
        expect(client.deleteObject).toBeCalledTimes(2);
    }));
});
//# sourceMappingURL=algolia.spec.js.map