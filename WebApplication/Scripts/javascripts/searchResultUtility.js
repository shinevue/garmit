/**
 * @license Copyright 2018 DENSO
 * 
 * searchResult関係のユーティリティ
 * 
 */

'use strict';

import { SEARCHRESULT_CELL_TYPE } from 'constant';

/**
 * SeachResult型のデータを2次元配列に変換する
 * @param {object} searchResult searchResult型のオブジェクト
 * @returns {array} 変換後のアセット詳細のページリスト
 */
export function convertTo2DArray(searchResult) {
    const header = [getSearchResultHeaders(searchResult)];
    
    var rows = [];
    searchResult.rows.forEach((row) => {
        var cells = row.cells.filter((cell, index) => !(searchResult.excludedColumnIndexes && searchResult.excludedColumnIndexes.indexOf(index) >= 0)
                            ).map((cell) => getCellValue(cell));

        if (row.rows && row.rows.length > 0) {
            var beforeCells = cells ? cells.slice(0, row.rowsIndex) : [];
            var afterCells = cells ? cells.slice(row.rowsIndex, cells.length) : [];
            row.rows.map((splitRow) => {
                let splitCells = splitRow.cells.map((cell) => getCellValue(cell));
                rows.push(beforeCells.concat(splitCells, afterCells))
            })
        } else {
            rows.push(cells);
        }
    });

    return header.concat(rows);    
}

/**
 * 二次元配列を転置する
 * @param {any} array2D
 */
export function transpose2DArray(array2D) {
    return array2D[0].map((_, i) => array2D.map((array) => array[i]));
}

/**
 * SeachResultのヘッダを取得する（除外インデックスに指定されているものは除外する）
 * @param {object} searchResult searchResult型のオブジェクト
 * @returns {array} ヘッダ配列
 */
function getSearchResultHeaders(searchResult) {
    if (searchResult.headers && searchResult.excludedColumnIndexes) {
        return searchResult.headers.filter((header, index) => searchResult.excludedColumnIndexes.indexOf(index) < 0);
    } else {
        return searchResult.headers ? searchResult.headers : [];
    }
}

/**
 * セルの値を取得する
 * @param {object} cell セル情報
 */
function getCellValue(cell) {
    if (cell.cellType === SEARCHRESULT_CELL_TYPE.image) {
        return '';
    } else {
        return cell.value;
    }
}