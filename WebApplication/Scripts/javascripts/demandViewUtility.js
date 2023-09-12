/**
 * @license Copyright 2019 DENSO
 * 
 * デマンド設定関係のユーティリティ
 * 
 */

'use strict';

import { DISPLAY_TIME_SPANS } from 'constant';

/**
 * 時間を丸める
 * @param {any} date
 * @param {any} displayTimeSpanId
 */
export function floorDate(date, displayTimeSpanId) {
    switch (displayTimeSpanId) {
        case DISPLAY_TIME_SPANS.halfAnHour:
        case DISPLAY_TIME_SPANS.hour:
            return moment(date).startOf('hour').minutes(date.minutes() < 30 ? 0 : 30);

        case DISPLAY_TIME_SPANS.day_byHalfAnHour:
        case DISPLAY_TIME_SPANS.day_byHour:
            return moment(date).startOf('day');

        case DISPLAY_TIME_SPANS.month:
            return moment(date).startOf('month');

        case DISPLAY_TIME_SPANS.year:
            return moment(date).startOf('year');

        default:
            return moment(date);
    }
}

/**
 * 前後の時刻を求める
 * @param {any} date
 * @param {any} displayTimeSpanId
 * @param {any} isForward
 */
export function getNextDate(date, displayTimeSpanId, isForward = true) {
    const sign = isForward ? 1 : -1;

    switch (displayTimeSpanId) {
        case DISPLAY_TIME_SPANS.halfAnHour:
            return moment(date).add(sign * 30, 'minute');

        case DISPLAY_TIME_SPANS.hour:
            return moment(date).add(sign * 1, 'hour');

        case DISPLAY_TIME_SPANS.day_byHalfAnHour:
        case DISPLAY_TIME_SPANS.day_byHour:
            return moment(date).add(sign * 1, 'day');

        case DISPLAY_TIME_SPANS.month:
            return moment(date).add(sign * 1, 'month');

        case DISPLAY_TIME_SPANS.year:
            return moment(date).add(sign * 1, 'year')

        default:
            return moment(date);
    }
}

/**
 * X軸の間隔を取得する
 * @param {any} displayTimeSpanId
 */
export function getXInterval(displayTimeSpanId) {
    switch (displayTimeSpanId) {
        case DISPLAY_TIME_SPANS.halfAnHour:
        case DISPLAY_TIME_SPANS.hour:
            return { key: 'minute', value: 1 };

        case DISPLAY_TIME_SPANS.day_byHalfAnHour:
            return { key: 'minute', value: 30 };

        case DISPLAY_TIME_SPANS.day_byHour:
            return { key: 'hour', value: 1 };

        case DISPLAY_TIME_SPANS.month:
            return { key: 'day', value: 1 };

        case DISPLAY_TIME_SPANS.year:
            return { key: 'month', value: 1 };
    }
}