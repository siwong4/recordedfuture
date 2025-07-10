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
const stringUtils_1 = __importDefault(require("./stringUtils"));
describe('stringUtils functions', () => {
    beforeEach(() => { });
    afterEach(() => { });
    // Assert if setTimeout was called properly
    it('generates md5 hash accordingly', () => __awaiter(void 0, void 0, void 0, function* () {
        expect((0, stringUtils_1.default)('asdf')).toBe('912ec803b2ce49e4a541068d495ab570');
    }));
});
//# sourceMappingURL=stringUtils.spec.js.map