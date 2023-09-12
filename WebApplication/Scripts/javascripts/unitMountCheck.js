/**
 * @license Copyright 2018 DENSO
 * 
 * ユニット搭載チェック関数
 * 
 */
'use strict';

import { VALIDATE_STATE, successResult, errorResult } from 'inputCheck';
import { convertNumber } from 'numberUtility';

/********************************************
 * ラック搭載図関連のチェック
 ********************************************/

/**
 * 対象位置（高さ+Y位置）が行番号と一致しているかどうか
 * @param {object} unitView 表示ユニット情報 
 * @param {number} rowNo 行番号
 * @returns {boolean} 対象位置（高さ+Y位置）が一致しているかどうか
 */
export function isMatchRowNo(unitView, rowNo){
	return ((unitView.position.y + unitView.size.height - 1) === rowNo);
}

/**
 * 対象位置（列）が一致しているかどうか
 * @param {object} unitView 表示ユニット情報 
 * @param {number} columnNo 列番号
 * @returns {boolean}  対象位置（横）が一致しているかどうか
 */
export function isMatchColumnNo(unitView, columnNo){
	return (unitView.position.x === columnNo);
}

/**
 * ラック列にユニットが含まれるかどうか
 * @param {object} unitView 表示ユニット情報
 * @param {number} columnNo 列番号
 * @returns 対象列番号にユニットが含まれているかどうか
 */
export function includedRackColumn(unitView, columnNo){
	return (
        (unitView.position.x <=  columnNo) && 
        (unitView.position.x + unitView.size.width - 1) >= columnNo
    );
}

/**
 * ラック行にユニットが含まれるかどうか
 * @param {object} unitView 表示ユニット情報
 * @param {number} rowNo 行番号
 * @return 対象ユニット番号にユニットが含まれているかどうか
 */
export function includedRackRow(unitView, rowNo){
    return (
        (unitView.position.y <=  rowNo) && 
        (unitView.position.y + unitView.size.height - 1) >= rowNo
    );
}

/**
 * 対象位置の表示ユニットかどうか
 * @param {object} unitView 表示ユニット情報
 * @param  {number} rowNo 行番号
 * @return 対象位置の搭載ユニットかどうか
 */
export function isMountUnitView(unitView, rowNo){
    return (unitView.position.y === rowNo);
}

/**
 * ハイライトするユニット行かどうか
 * @param {object} unitView 対象の表示ユニット
 * @param {array} highlightUnits ハイライトするユニット（表示用のユニットではない）
 * @returns {boolean} ハイライトするかどうか
 */
export function isHighlightUnitRow(unitView, highlightUnits) {
    //対象ユニットがなければ、ハイライトしない
    if (!unitView) {
        return false;
    }

    //ハイライトするユニットと一致するユニットがあれば、ハイライトする行である
    return highlightUnits.some((item) => {
                //選択されたユニットがあるか
                return unitView.units.some(u => 
                            u.unitId === item.unitId
                    );
            });
}


/********************************************
 * 搭載チェック関連（ラック）
 ********************************************/

/**
 * 表示ユニットの中で、ラックのユニット数を超えていないかチェックする（列）
 * @param {array} unitViews 表示ユニット一覧
 * @param {number|string} rackCol ラックの列
 * @returns {boolean} 超えていない場合、true
 */
export function rackColumnCheck(unitViews, rackCol) {
    const columns = unitViews ? unitViews.map((unit) => (unit.position.x + unit.size.width - 1)) : [];
    const maxColumn = Math.max.apply(null, columns);
    return rackCol >= maxColumn;
}

/**
 * 表示ユニットの中で、ラックのユニット数を超えていないかチェックする（行）
 * @param {array} unitViews 表示ユニット一覧
 * @param {number|string} rackRow ラックの行
 * @returns {boolean} 超えていない場合、true
 */
export function rackRowCheck(unitViews, rackRow) {
    const rows = unitViews ? unitViews.map((unit) => (unit.position.y + unit.size.height - 1)) : [];
    const maxRow = Math.max.apply(null, rows);
    return rackRow >= maxRow;
}

/********************************************
 * 搭載チェック関連（ユニット）
 ********************************************/

//重複している表示設定グループを取得
export function getDuplicateDispSettings(position, size, mountDispSettings) {
    var duplicateSettings = [];
    const startPosition = {
        x: position.x,
        y: position.y
    };

	const endPosition = {
        x: position.x + size.width - 1,
        y: position.y + size.height - 1
    };

    if (mountDispSettings) {
		for (let i = startPosition.x; i <= endPosition.x; i++) {
            var workSettings = mountDispSettings.filter((item) => includedRackColumn(item, i));       //該当列に搭載されている表示設定グループで絞り込む

            for (let j = startPosition.y; j <= endPosition.y; j++) {
                var targetDispSettings = workSettings.filter((item) => includedRackRow(item, j));       //該当行に搭載されている表示設定グループで絞り込む
                
                if (targetDispSettings || targetDispSettings.length > 0) {
                    duplicateSettings = duplicateSettings.concat(targetDispSettings);
                }
            }
		}
	}

    return duplicateSettings.filter((item, i, self) => self.indexOf(item) === i);
}

/**
 * 最小の位置の表示設定グループを取得する
 * @param {array} dispSettings 表示設定グループリスト
 * @returns {object} 最小の位置の表示設定グループ
 */
export function getMinPositionDispSetting(dispSettings) {

    if (!dispSettings || dispSettings.length <= 0 ) {
        return null;
    }

    //最小のX位置の表示設定グループを取得
    const minXPosition = Math.min.apply(null, dispSettings.map((item) => item.position.x));
    const minXDispSettings = dispSettings.filter((item) => item.position.x === minXPosition);

    //上記の中で最小のY位置のグループを取得
    const minYPosition = Math.min.apply(null, minXDispSettings.map((item) => item.position.y));
    
    return minXDispSettings.find((item) => item.position.y === minYPosition);

}

/**
 * ユニットサイズがラックサイズを超えていないか検証する
 * @param {object} size ユニットの占有ユニット数 ({ height: '', width: '' })
 * @param {object} position ユニットの搭載位置 ({ x: '', y: '' })
 * @param {object} rackSize ラックサイズ({height: 高さ、width：幅}) 
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateUnitSize(size, position, rackSize) {
    const endPosition = {
        x: convertNumber(position.x) + convertNumber(size.width) - 1,
        y: convertNumber(position.y) + convertNumber(size.height) - 1
    };

	//サイズ（幅）がラックのサイズを超えていないか？
    if (rackSize.width < endPosition.x || 
        rackSize.height < endPosition.y) {
		return errorResult('ラックのユニット数を超えています');
    }
    
    return successResult;
}


/********************************************
 * 搭載チェック関連（ユニット移動）
 ********************************************/

/**
 * ユニット一覧の中でラックのユニット数を超えているユニットはないかチェックする（小さいユニットで調べる）（列）
 * @param {array} unitViews ユニット一覧
 * @param {number|string} rackCol ラックの列
 * @param {number} targetCol 移動列番号
 * @returns {boolean} 超えていない場合、true
 */
export function rackColumnMinCheck(units, rackCol, targetCol) {
    const widths = units ? units.map((unit) => (unit.size.width)) : [];
    const minColumnWidth = Math.min.apply(null, widths);
    return rackCol >= (minColumnWidth + targetCol - 1);
}

/**
 * ユニット一覧の中でラックのユニット数を超えているユニットはないかチェックする（小さいユニットで調べる）（行）
 * @param {array} unitViews ユニット一覧
 * @param {number|string} rackRow ラックの行
 * @param {number} targetRow 移動行番号
 * @returns {boolean} 超えていない場合、true
 */
export function rackRowMinCheck(units, rackRow, targetRow) {
    const heights = units ? units.map((unit) => (unit.size.height)) : [];
    const minRowHeight = Math.min.apply(null, heights);
    return rackRow >= (minRowHeight + targetRow - 1);
}
