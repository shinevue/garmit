/**
 * @license Copyright 2018 DENSO
 * 
 * ソート用の比較関数
 * 
 */

'use strict';

export const SORT_TYPE = {
    asc: 'asc',
    desc: 'desc'
};

/**
 * 昇順に並び替える場合に現在と次の値を比較する
 * @param {*} current 現在の値
 * @param {*} next 次の値
 * @param {number} 現在の方が大きい：1、現在の方が小さい：-1、同じ：0 
 */
export function compareAscending(current, next){
    if (current < next) {
        return -1;
    } else if (current > next) {
        return 1;
    }
    return 0;
}

/**
 * 降順に並び変える場合に現在と次の値を比較する
 * @param {*} current 現在の値
 * @param {*} next 次の値
 * @param {number} 現在の方が大きい：-1、現在の方が小さい：1、同じ：0 
 */
export function compareDescending(current, next){
    if (current > next) {
        return -1;
    } else if (current < next) {
        return 1;
    }
    return 0;
}

/**
 * positionで昇順に並び替える場合に現在と次の値を比較する
 * @param {*} current 現在の値
 * @param {*} next 次の値
 * @param {number} 現在の方が大きい：1、現在の方が小さい：-1、同じ：0 
 */
export function comparePositionAscending(current, next) {
    if (current.position < next.position) {
        return -1;
    } else if (current.position > next.position) {
        return 1;
    }
    return 0;
}

/**
 * 安定ソート(通常のsortは不安定なため)
 * @param {array} array ソートする配列
 * @param {function} func 比較関数 
 */
export function stableSort (array, func) {
    if (!func) {
      func = compareAscending;          //比較関数の指定がない場合はcompareAscendingを指定する
    }
  
    var i;
    var length = array.length;
  
    if (length === 0) {
        return array;
    }
  
    //値とインデックスのペアにする
    for (i = 0; i < length; i++) {
      array[i] = [array[i], i];
    }
  
    array.sort(function (p1, p2) {
      var compare = func(p1[0], p2[0]);
      if (compare !== 0) {
        // ペアの0番目同士が等しくない場合はその比較結果を返す
        return compare;
      } else {
        // 等しい場合は、インデックスを比較した結果を返す
        return p1[1] - p2[1];
      }
    });
  
    // ペアの0番目を取り出す
    for (i = 0; i < length; i++) {
      array[i] = array[i][0];
    }
  
    return array;
  }