/**
 * @license Copyright 2018 DENSO
 * 
 * 閾値設定関連
 * 
 */

'use strict';

/**
 * 値を持っているかどうか
 * @param {number} value トースト表示ステータス値
 */
export function hasValue(value) {
    if (value === null || value === undefined || value === "") {
        return false;
    }
    return true;
}

/**
 * 注意・異常部分の閾値バーグラフの幅(now)を取得する
  * @param {number} main 閾値
  * @param {number} sub 幅を決める閾値
 */
function getErrorBarRange(max, min, main, sub, range) {
    if (!hasValue(main)) {
        return 0;
    }
    else if (!hasValue(sub)) {
        return 10;
    }
    return Math.abs(main - sub)/(max - min) * range;
}

/**
 * 閾値バーグラフ表示用情報を取得する
 */
export function getBarInfo(max, min, upperError, upperAlarm, lowerError, lowerAlarm) {
    const lowerErrorRange = hasValue(lowerError) ? 10 : 0;
    const upperErrorRange = hasValue(upperError) ? 10 : 0;
    const warningRange = 100 - (lowerErrorRange + upperErrorRange);
    let lowerAlarmRange= getErrorBarRange(max, min, lowerAlarm, lowerError, warningRange);
    let upperAlarmRange = getErrorBarRange(max, min, upperAlarm, upperError, warningRange);
    let successRange = warningRange - (lowerAlarmRange + upperAlarmRange);
    if (successRange === 0) {   //正常範囲が表示されない場合は調整(上限のみ設定or下限のみ設定時)
        successRange = 10;
        if (lowerAlarmRange > 10) { //下限注意・異常の2つを設定している場合
            lowerAlarmRange = lowerAlarmRange - 10;
        }
        else if (upperAlarmRange > 10) {    //上限注意・異常の2つを設定している場合
            upperAlarmRange = upperAlarmRange - 10;
        }
    }

    let barInfo = [];
    barInfo.push({ bsStyle: "danger", now: lowerErrorRange, key: 1, value: lowerError, position: lowerErrorRange });
    barInfo.push({ bsStyle: "warning", now: lowerAlarmRange, key: 2, value: lowerAlarm, position: lowerErrorRange + lowerAlarmRange });
    barInfo.push({ bsStyle: "success", now: successRange, key: 3, value: upperAlarm, position: lowerErrorRange + lowerAlarmRange + successRange });
    barInfo.push({ bsStyle: "warning", now: upperAlarmRange, key: 4, value: upperError, position: lowerErrorRange + lowerAlarmRange + successRange + upperAlarmRange});
    barInfo.push({ bsStyle: "danger", now: upperErrorRange, key: 5 });
    return barInfo;
}


