/**
 * @license Copyright 2018 DENSO
 * 
 * トレンドグラフ関係のユーティリティ
 * 
 */

'use strict';

/**
 * グラフの時間軸の目盛間隔を取得する
 * @param {any} from
 * @param {any} to
 */
export function getTimeAxisTickInterval(from, to, digest = false) {
    const msDiff = moment(to).diff(moment(from));

    if (!digest) {
        // ~1分
        if (msDiff <= 60000) {
            return { amount: 10, key: 'seconds' };
        }
        // ~10分
        if (msDiff <= 600000) {
            return { amount: 1, key: 'minutes' };
        }
        // ~20分
        if (msDiff <= 1200000) {
            return { amount: 2, key: 'minutes' };
        }
        // ~1時間
        if (msDiff <= 3600000) {
            return { amount: 5, key: 'minutes' };
        }
        // ~3時間
        if (msDiff <= 10800000) {
            return { amount: 15, key: 'minutes' };
        }
        // ~6時間
        if (msDiff <= 21600000) {
            return { amount: 30, key: 'minutes' };
        }
    }
        
    // ~12時間
    if (msDiff <= 43200000) {
        return { amount: 1, key: 'hours' };
    }
    // ~24時間
    if (msDiff <= 86400000) {
        return { amount: 2, key: 'hours' };
    }
    // ~48時間
    if (msDiff <= 172800000) {
        return { amount: 4, key: 'hours' };
    }
    // ~72時間
    if (msDiff <= 259200000) {
        return { amount: 6, key: 'hours' };
    }
    // ~1週間
    if (msDiff < 604800000) {
        return { amount: 12, key: 'hours' };
    }
    // ~2週間
    if (msDiff <= 1209600000) {
        return { amount: 1, key: 'days' };
    }
    // ~4週間
    if (msDiff <= 2419200000) {
        return { amount: 2, key: 'days' };
    }
    return { amount: 1, key: 'weeks' };

}