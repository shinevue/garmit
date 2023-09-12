/**
 * @license Copyright 2021 DENSO
 * 
 * 開錠目的のユーティリティ(unlockPurposeUtility)
 * 
 */

 'use strict';

/**
 * 若番の開錠目的を取得する
 * @param {array} unlockPurposeList 開錠目的リスト
 * @returns {object} 開錠目的
 */
export function getFirstUnlockPurpose(unlockPurposeList) {
    var unlockPurpose = null;
    if (unlockPurposeList.length > 0) {
        unlockPurpose = unlockPurposeList[0];
    }
    return unlockPurpose;
}

/**
 * 指定の名称の開錠目的を取得する
 * @param {array} unlockPurposeList 開錠目的リスト
 * @param {string} purposeName 開錠目的名称
 * @returns {object} 開錠目的
 */
export function getUnlockPurpose(unlockPurposeList, purposeName) {
    const filterPurposeList = (unlockPurposeList.length > 0 && purposeName) ? unlockPurposeList.filter((purpose) => purpose.purpose === purposeName) : [];
    if (filterPurposeList.length > 0) {
        return filterPurposeList[filterPurposeList.length - 1];
    }
    return getFirstUnlockPurpose(unlockPurposeList);
}