/**
 * @license Copyright 2019 DENSO
 * 
 * ロケーション用ユーティリティ
 * 
 */

'use strict';

/**
 * 拠点およびエリアのみEnableなロケーションを生成する
 * @param {any} locations
 */
export function makeAreaEnabledLocation(locations) {
    const locs = $.extend(true, [], locations);
    locs.forEach((loc) => {
        loc.children = (loc.children && loc.children.length > 0) ? makeAreaEnabledLocation(loc.children) : null;
        loc.disabled = !(loc.hasDemandSet || (loc.children && loc.children.some((child) => !child.disabled)));
    });
    return locs;
}

/**
 * 拠点のみ選択可能なロケーションを生成する
 * @param {any} locations
 */
export function makeBranchSelectableLocation(locations) {
    const locs = $.extend(true, [], locations);
    locs.forEach((loc) => {
        loc.children = (loc.children && loc.children.length > 0) ? makeBranchSelectableLocation(loc.children) : null;
        loc.disabled = !(loc.hasDemandSet || (loc.children && loc.children.some((child) => !child.disabled)));
        loc.unselectable = !loc.hasDemandSet;
    });
    return locs;
}

/**
 * ロケーションの表示用文字列を生成する
 * @param {any} location
 * @param {string} separator 区切り文字
 */
export function createLocationDisplayString(location, separator) {
    let displayString = location.name;
    let tmpLoc = location;
    let separatorStr =  separator ? separator :  ' / ';

    while (tmpLoc.parent) {
        tmpLoc = tmpLoc.parent;
        displayString = tmpLoc.name + separatorStr + displayString;
    }

    return displayString;
}