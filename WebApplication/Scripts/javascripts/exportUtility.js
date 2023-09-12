/**
 * @license Copyright 2018 DENSO
 * 
 * エクスポート関係のユーティリティ
 * 
 */

'use strict';

import { convertTo2DArray, transpose2DArray } from 'searchResultUtility';


/**
 * searchResult型データをCSVとして出力する
 * @param {any} searchResult
 * @param {any} exportName
 */
export function outputSearchResult(searchResult, exportName, isAddDate = false) {
    const exportData = convertTo2DArray(searchResult);
    outputCSVFile(exportData, exportName, isAddDate);
}

/**
 * reportResultをCSV出力する
 * @param {any} reportResult
 * @param {any} exportName
 */
export function outputReportResult(reportResult, exportName) {
    let exportData = convertTo2DArray(reportResult);
    exportData = transpose2DArray(exportData);  // 転置する
    outputCSVFile(exportData, exportName);
}

/**
 * 2次元配列データをCSVとして出力する
 * @param {any} exportData 出力するデータ（2次元配列）
 * @param {any} exportName ファイル名
 */
export function outputCSVFile(exportData, exportName, isAddDate=false) {
    if (!exportData) {
        return;
    }

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    outputFile([bom, createCSVdata(exportData)], createCSVFileName(exportName, isAddDate), 'text/csv');
}

/**
 * 1次元配列データ(カンマ区切りの行の配列)をCSVとして出力する
 * @param {any} rows
 * @param {any} exportName
 * @param {any} isAddDate
 */
export function outputCSVRows(rows, exportName, isAddDate = false) {
    if (!rows) {
        return;
    }

    let content = '';
    rows.forEach((row) => {
        content += row + '\r\n'
    });

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    outputFile([bom, content], createCSVFileName(exportName, isAddDate), 'text/csv');
}

/**
 * ファイルを出力する
 * @param {any} data
 * @param {any} fileName
 * @param {any} fileType
 */
export function outputFile(data, fileName, fileType) {
    if (!data) {
        return;
    }

    const blob = new Blob(data, { 'type': fileType });

    // IEか他ブラウザかを判定
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName);

    } else {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.target = '_blank';
        a.download = fileName;
        a.click();
    }
}

/**
 * CSV出力データを生成する
 * @param {any} exportData
 */
function createCSVdata(exportData) {
    let data = "";
    exportData.forEach((rowData) => {
        data += createCSVRow(rowData);
    });

    return data;
}

/**
 * 一行分のデータを生成する
 * @param {any} rowData
 */
function createCSVRow(rowData) {
    let row = '';
    for (let i = 0; i < rowData.length; i++) {
        row += `"${rowData[i] ? rowData[i] : ''}",`;
    }

    row = row.substr(0, row.length - 1); // 末尾の「,」を削除する
    row += '\r\n';  // 末尾に改行コードを追加
    return row;
}

/**
 * CSVファイル名を生成する
 * @param {any} exportName
 * @param {any} isAddDate
 */
function createCSVFileName(exportName, isAddDate) {
    // CSVファイル名を生成する（名前_日時.csv）
    if (isAddDate) {
        return `${exportName}_${moment().format("YYYYMMDDHHmmss")}.csv`;
    }
    else {
        return `${exportName}.csv`;
    }
}