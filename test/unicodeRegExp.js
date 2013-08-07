var _ = require('underscore'),
    expect = require('expect.js'),
    unicodeRegExp = require('../lib/unicodeRegExp');

/*global describe,it*/

function createVow(regExp, ch, expectedResultRegExp) {
    return function () {
        it("Should be re-written to " + expectedResultRegExp.source, function () {
            var res = unicodeRegExp.removeCharacterFromCharacterClassRegExp(
                regExp, ch);
            expect(res.source).to.equal(expectedResultRegExp.source);
        });
    };
}

var unicodes = {
    'empty character class': createVow(new RegExp("[]"), 'a', new RegExp("[]")),
    'single matching char': createVow(/[a]/, 'a', new RegExp("[]")),
    'single matching char, \\u syntax': createVow(/[\u0061]/, 'a', new RegExp("[]")),
    'single matching char, \\x syntax': createVow(/[\x61]/, 'a', new RegExp("[]")),
    'single non-matching char': createVow(/[a]/, 'b', /[a]/),
    'single non-matching char, \\x syntax': createVow(/[\x61]/, 'b', /[a]/),
    'multiple chars, remove first': createVow(/[abc]/, 'a', /[bc]/),
    'multiple chars, remove first, \\u syntax': createVow(/[\u0061\u0062\u0063]/, 'a', /[bc]/),
    'multiple chars, remove first, \\x syntax': createVow(/[\x61\x62\x63]/, 'a', /[bc]/),
    'multiple chars, remove second': createVow(/[abc]/, 'b', /[ac]/),
    'multiple chars, remove second, \\u syntax': createVow(/[\u0061\u0062\u0063]/, 'b', /[ac]/),
    'multiple chars, remove second, \\x syntax': createVow(/[\x61\x62\x63]/, 'b', /[ac]/),
    'single range, remove first char': createVow(/[a-z]/, 'a', /[b-z]/),
    'single range, remove first char, \\u syntax': createVow(/[\u0061-\u007a]/, 'a', /[b-z]/),
    'single range, remove first char, \\x syntax': createVow(/[\x61-\x7a]/, 'a', /[b-z]/),
    'single range, remove second char': createVow(/[a-z]/, 'b', /[ac-z]/),
    'single range, remove second char, \\u syntax': createVow(/[\u0061-\u007a]/, 'b', /[ac-z]/),
    'single range, remove second char, \\x syntax': createVow(/[\x61-\x7a]/, 'b', /[ac-z]/),
    'single range, remove last char but one': createVow(/[a-z]/, 'y', /[a-xz]/),
    'single range, remove last char but one, \\u syntax': createVow(/[\u0061-\u007a]/, 'y', /[a-xz]/),
    'single range, remove last char but one, \\x syntax': createVow(/[\x61-\x7a]/, 'y', /[a-xz]/),
    'single range, remove last char': createVow(/[a-z]/, 'z', /[a-y]/),
    'single range, remove last char, \\u syntax': createVow(/[\u0061-\u007a]/, 'z', /[a-y]/),
    'single range, remove last char, \\x syntax': createVow(/[\x61-\x7a]/, 'z', /[a-y]/),
    'multiple ranges, remove first char': createVow(/[0-9a-z]/, 'a', /[0-9b-z]/),
    'multiple ranges, remove second char': createVow(/[0-9a-z]/, 'b', /[0-9ac-z]/),
    'multiple ranges, remove last char but one': createVow(/[0-9a-z]/, 'y', /[0-9a-xz]/),
    'multiple ranges, remove last char': createVow(/[0-9a-z]/, 'z', /[0-9a-y]/)
};

describe('Unicode RegExp', function () {

    _(unicodes).forEach(function (vow, name) {
        describe(name, function () {
            vow();
        });
    });
});
