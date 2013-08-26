/**
 * These are taken from the XRegExp library (http://xregexp.com/) + the Unicode-related plugins from http://xregexp.com/plugins/
 *
 * XRegExp("\\p{Z}").source.replace(/\\u([0-9a-f]{4})/gi, function ($0, hexStr) {
 *     var charCode = parseInt(hexStr, 16),
 *         ch = String.fromCharCode(charCode);
 *     if (charCode >= 0x20 && charCode < 0x7f && "^$|()[]{}.*+".indexOf(ch) === -1) {
 *         return String.fromCharCode(charCode);
 *     } else {
 *         return $0;
 *     }
 * });
 */

(function (root, factory) {
    // expose unicodeRegExp as
    // - an AMD module (require)
    // - a node module

    if (typeof define === 'function' && define.amd) {
        define(['xregexp'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('xregexp').XRegExp);
    }
}(this, function (xregexp) {
    // kludge to use a require loaded but not AMD wrapped module
    /*global XRegExp: true*/
    xregexp = xregexp || XRegExp;

    // start our namespace
    var unicodeRegExp = {};

    unicodeRegExp.letter = xregexp('\\p{L}');
    unicodeRegExp.mark = xregexp('\\p{M}');
    unicodeRegExp.number = xregexp('\\p{N}');
    unicodeRegExp.punctuation = xregexp('\\p{P}');
    unicodeRegExp.symbol = xregexp('\\p{S}');
    unicodeRegExp.separator = xregexp('\\p{Z}');
    unicodeRegExp.other = xregexp('\\p{C}'); // Other (control, format, private use, surrogate, and unassigned codes)

    unicodeRegExp.spliceCharacterClassRegExps = function () { // ...
        var args = Array.prototype.slice.call(arguments);

        return new RegExp('[' + args.map(function (regExp) {
            return regExp.source.replace(/^\[|\]$/g, '');
        }).join("") + ']');
    };

    // All of the above combined, except 'separator', and 'other':
    unicodeRegExp.visible = unicodeRegExp.spliceCharacterClassRegExps(
        unicodeRegExp.letter,
        unicodeRegExp.mark,
        unicodeRegExp.number,
        unicodeRegExp.punctuation,
        unicodeRegExp.symbol
    );

    // The set of printable characters also includes space:
    unicodeRegExp.printable = unicodeRegExp.spliceCharacterClassRegExps(
        unicodeRegExp.visible,
        unicodeRegExp.separator
    );

    // Helper function for removing a char from a character class regular expression:

    function parseCharCode(u4, x2, literal) {
        if (u4 || x2) {
            return parseInt(u4 || x2, 16);
        } else {
            return literal.charCodeAt(0);
        }
    }

    function charCodeToRegExpToken(charCode) {
        if (charCode >= 0x20 && charCode < 0x7f) {
            return String.fromCharCode(charCode);
        } else {
            var hexStr = charCode.toString(16);
            return "\\u" + "0000".slice(hexStr.length) + hexStr;
        }
    }

    var characterClassToken = /(?:\\u([0-9a-f]{4})|\\x([0-9a-f]{2})|([^\-]))(?:-(?:\\u([0-9a-f]{4})|\\x([0-9a-f]{2})|([^\-])))?/gi;

    unicodeRegExp.removeCharacterFromCharacterClassRegExp = function (regExp, ch) {
        var charCode = ch.charCodeAt(0);

        return new RegExp('[' + regExp.source.replace(/^\[|\]$/g, '').replace(characterClassToken, function ($0, fromU4, fromX2, fromLiteral, toU4, toX2, toLiteral) {
            var fromCharCode = parseCharCode(fromU4, fromX2, fromLiteral);
            if (toU4 || toX2 || toLiteral) {
                var toCharCode = parseCharCode(toU4, toX2, toLiteral);
                if (charCode === fromCharCode) {
                    if (charCode + 1 < toCharCode) {
                        return charCodeToRegExpToken(charCode + 1) + '-' + charCodeToRegExpToken(toCharCode);
                    } else {
                        return charCodeToRegExpToken(toCharCode);
                    }
                } else if (charCode === toCharCode) {
                    if (fromCharCode < charCode - 1) {
                        return charCodeToRegExpToken(fromCharCode) + '-' + charCodeToRegExpToken(charCode - 1);
                    } else {
                        // fromCharCode === toCharCode - 1, rewrite to single char
                        return charCodeToRegExpToken(fromCharCode);
                    }
                } else if (charCode > fromCharCode && charCode < toCharCode) {
                    return charCodeToRegExpToken(fromCharCode) + (charCode > fromCharCode + 1 ? '-' + charCodeToRegExpToken(charCode - 1) : '') +
                        (charCode + 1 < toCharCode ? charCodeToRegExpToken(charCode + 1) + '-' : '') + charCodeToRegExpToken(toCharCode);
                } else {
                    return $0;
                }
            } else {
                if (charCode === fromCharCode) {
                    return "";
                } else {
                    return charCodeToRegExpToken(fromCharCode);
                }
            }
        }) + ']');
    };

    return unicodeRegExp;
}));
