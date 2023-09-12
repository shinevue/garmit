 /**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠関連のユーティリティ(electricLockUtility)
 * 
 */

'use strict';

import { validateTextArea, successResult, errorResult } from 'inputCheck';
import { ELECTRIC_RACK_TARGET } from 'constant';

export const MAX_LENGTH_OPERATION_MEMO = 300;

export const MODAL_OPERATION_ELECTRIC_RACK = {
    unlock: 'unlock',
    lock: 'lock'
}

/**
 * 操作メモの検証
 * @param {string} memo メモ
 */
export function validateOperationMemo(memo) {
    return validateTextArea(memo, MAX_LENGTH_OPERATION_MEMO, true);
}

/**
 * 操作対象の検証結果
 * @param {boolean} front 前面
 * @param {boolean} rear 背面
 */
export function validateOperationTarget(front, rear) {
    if (!(front === true || rear === true)) {
        return errorResult('前面か背面のどちらかは選択してください。');
    }
    return successResult;
}

/**
 * 全て操作対象が「前後」もしくは「物理錠」かどうか
 * @param {object} electricLockRacks 電気錠ラック一覧
 */
export function isAllBothTargetOrPhysicalKey(electricLockRacks) {
    return electricLockRacks.every((rack) => rack.electricLocks.every((lock) => lock.target === ELECTRIC_RACK_TARGET.both || lock.target === ELECTRIC_RACK_TARGET.none));
}

/**
 * 電気錠ステータスを作成する
 * @param {*} electricLocks 電気錠リスト
 */
export function makeLockStatusName(electricLocks) {
    var statusArray = electricLocks.map((lock) => {
        let statusStr = '';
        switch (lock.target) {
            case ELECTRIC_RACK_TARGET.front:
                statusStr = '前面：'
                break;
            case ELECTRIC_RACK_TARGET.rear:
                statusStr = '背面：'                    
                break;
        }
        return (statusStr + lock.statusName);
    })
    return statusArray;
}

/**
 * 全て「開錠中」もしくは「物理錠」かどうか
 * @param {array} electricLockRacks 電気錠ラック一覧
 */
export function isAllUnlockOrPhysicalKey(electricLockRacks) {
    return electricLockRacks.every((rack) => rack.electricLocks.every((lock) => lock.isUnlock || lock.target === 0));
}

/**
 * 全て同じ開錠目的かどうか
 * @param {array}} electricLockRacks 電気錠ラック一覧
 */
export function isAllSameUnlockPurpose(electricLockRacks) {
    const source = electricLockRacks.length > 0 && electricLockRacks[0].electricLocks.length > 0 ? electricLockRacks[0].electricLocks[0] : null;
    if (source) {
        return electricLockRacks.every((rack) => 
            rack.electricLocks.every((lock) => lock.unlockPurpose && lock.unlockPurpose.unlockPurposeId === source.unlockPurpose.unlockPurposeId)
        );
    } else {
        return false;
    }
}

/**
 * 全て同じ詳細情報かどうかかどうか
 * @param {array}} electricLockRacks 電気錠ラック一覧
 */
export function isAllSameELockOpLogExtendedPages(electricLockRacks) {
    const sourceLock = electricLockRacks.length > 0 && electricLockRacks[0].electricLocks.length > 0 ? electricLockRacks[0].electricLocks[0] : null;
    if (sourceLock) {
        return electricLockRacks.every((rack) => 
            rack.electricLocks.every((lock) => 
                lock.eLockOpLogExtendedPages && 
                lock.eLockOpLogExtendedPages.length > 0 &&
                lock.eLockOpLogExtendedPages.every((page) => {
                    const sourcePage = sourceLock.eLockOpLogExtendedPages.find((spage) => spage.pageNo === page.pageNo);
                    return page.extendedItems.every((item) => {
                        const sourceItem = sourcePage && sourcePage.extendedItems.find(sitem => sitem.itemId === item.itemId);
                        return sourceItem ? sourceItem.value === item.value : false;
                    })
                })
            )
        );
    } else {
        return false;
    }
}

/**
 * 全て同じ開錠メモかどうか
 * @param {array}} electricLockRacks 電気錠ラック一覧
 */
export function isAllSameOpenMemo(electricLockRacks) {
    const source = electricLockRacks.length > 0 && electricLockRacks[0].electricLocks.length > 0 ? electricLockRacks[0].electricLocks[0] : null;
    if (source) {
        return electricLockRacks.every((rack) => 
            rack.electricLocks.every((lock) => lock.openMemo === source.openMemo)
        );
    } else {
        return false;
    }
}