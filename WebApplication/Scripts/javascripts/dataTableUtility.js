/**
 * @license Copyright 2018 DENSO
 * 
 * DataTable関係のユーティリティ
 * 
 */

'use strict';

/**
 * 対象のページに表示する行に絞り込む
 * @param {array} rows 全行 
 * @param {number} pageNo 絞り込むページ番号
 * @param {number} pageSize 1ページに表示する件数
 * @returns {array} 対象ページに表示する行
 */
export function getCurrentPageRows(rows, pageNo, pageSize) {
    return  rows.filter((row, i) => {
        return ((pageNo - 1) * pageSize <= i) && (i < pageNo * pageSize)
    });
}
