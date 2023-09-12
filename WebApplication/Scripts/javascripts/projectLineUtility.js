/**
 * @license Copyright 2022 DENSO
 * 
 * 案件回線ユーティリティ(projectLineUtility)
 * 
 */

'use strict';

import { PROJECT_TYPE, LINE_TEMP_TYPE, LINE_LEFT_TYPE, LINE_SEARCH_TYPE } from 'constant';
import { validateText, validateSelect, isBlankError, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { compareAscending } from 'sortCompare';
import { convertJsonDateToMoment } from 'datetimeUtility';
import { PROJECT_DATE_FORMAT } from 'projectUtility';

//#region 定数

export const MAXLENGTH_PROJECT_LINE_ID = 20;
export const MAXLENGTH_PROJECT_LINE_NAME = 32;

export const KEY_PROJECT_LINE_ID = 'lineId';
export const KEY_PROJECT_LINE_ID_1 = KEY_PROJECT_LINE_ID + '1';
export const KEY_PROJECT_LINE_ID_2 = KEY_PROJECT_LINE_ID + '2';
export const KEY_PROJECT_LINE_ID_3 = KEY_PROJECT_LINE_ID + '3';
export const KEY_PROJECT_LINE_NAME = 'lineName';
export const KEY_PROJECT_LOCATION = 'location';

export const MAX_IDF_PATCH_CABLE = 6;

export const FIRST_SERIES_NO = 1;
export const SECOND_SERIES_NO = 2;

export const SEQ_NO_IN_PATCHCABLE = 1;
export const START_SEQ_NO_IDF_PATCHCABLE = 2;

export const FIX_PROJECT_TYPES = [PROJECT_TYPE.fix_temp, PROJECT_TYPE.fix_left];

//#endregion

//#region 案件回線(ProjectLine)関連

/**
 * 空の案件回線情報を取得
 */
export function getEmptyProjectLine(projectType) {
    var searchType = null;
    if (projectType === PROJECT_TYPE.remove) {
        searchType = LINE_SEARCH_TYPE.inUse;
    } else if ([PROJECT_TYPE.fix_temp, PROJECT_TYPE.fix_left].includes(projectType)) {
        searchType = LINE_SEARCH_TYPE.inOnly;
    }

    var lineConnection = getEmptyLineConnection(FIRST_SERIES_NO);
    if (projectType === PROJECT_TYPE.temp) {
        lineConnection = getEmptyLineConnection(FIRST_SERIES_NO, true, SEQ_NO_IN_PATCHCABLE);
    } else if (isFixProjectType(projectType)) {
        lineConnection = getEmptyLineConnection(FIRST_SERIES_NO, true, START_SEQ_NO_IDF_PATCHCABLE);
    }

    return {
        lineId1: '',
        lineId2: '',
        lineId3: '',
        wiringType: null, 
        lineName: '', 
        location: null, 
        lineConnections: [ lineConnection ],
        beforeLineConnections: [],
        memo: '',
        openDate: null,
        closeDate: null,
        tempType: projectType === PROJECT_TYPE.temp ? LINE_TEMP_TYPE.inOnly : null,
        hasTemp: projectType === PROJECT_TYPE.new ? false : null,
        searchType: searchType,
        leftType: projectType === PROJECT_TYPE.left ? LINE_LEFT_TYPE.inOnly : null
    }
}

/**
 * 空の回線線番情報を取得する
 * @param {number} seriesNo 局入系統線番
 * @param {boolean} isOnly 対象の回線線番のみとするかどうか
 * @param {boolean} targetSeqNo isOnly=trueの場合、対象の線番番号
 */
export function getEmptyLineConnection(seriesNo, isOnly = false, targetSeqNo = 1) {
    var lineConnection = {
        seriesNo: seriesNo,
        patchCableSequences: []
    };

    if (isOnly) {
        lineConnection.patchCableSequences = [
            {
                seqNo: targetSeqNo,
                patchboardId: null,
                patchboardName: null,
                patchCableNo: null
            }
        ];
    } else {
        lineConnection.patchCableSequences = [
            {
                seqNo: 1,
                patchboardId: null,
                patchboardName: null,
                patchCableNo: null
            },
            {
                seqNo: 2,
                patchboardId: null,
                patchboardName: null,
                patchCableNo: null
            }
        ];
    }
    return lineConnection;
}

/**
 * 回線情報リストの年月日を型変換する
 * @param {array} lines 回線情報リスト
 */
export function formatLineListDate(lines) {
    return lines.map((line) => {
        line.openDate = line.openDate && convertJsonDateToMoment(line.openDate, PROJECT_DATE_FORMAT);
        line.closeDate = line.closeDate && convertJsonDateToMoment(line.closeDate, PROJECT_DATE_FORMAT);
        return line;
    });    
}

/**
 * 回線一覧に年月日をセットする
 * @param {array} lines 回線情報リスト
 * @param {string} key 対象キー
 * @param {date} date 年月日
 * @param {boolean} isDateOverwrite 上書きするか
 */
export function setLineDate(lines, key, date, isDateOverwrite) {
    return lines && lines.map((line) => {
        if (!line[key] || isDateOverwrite) {
            line[key] = date;
        }
        return line;
    })
}

/**
 * 修正（仮登録）or修正（残置）かどうか
 * @param {number} projectType 工事種別
 */
export function isFixProjectType (projectType) {
     return FIX_PROJECT_TYPES.includes(projectType);
}

/**
 * 検索する工事種別かどうか
 * @param {number} projectType 工事種別
 * @param {boolean} hasTemp 仮登録ありかどうか
 */
export function isSearchable(projectType, hasTemp) {
    return !(projectType === PROJECT_TYPE.temp || (projectType === PROJECT_TYPE.new && !hasTemp));
}

//#region 線番選択（選択肢・sagaから呼び出す）

/**
 * IDF線番選択肢をseqNoでソートする
 * @param {array} selections 選択肢
 */
export function sortIdfPatchCableSelections(selections) {
    let update = _.cloneDeep(selections);
    return update.sort((currnet, next) => compareAscending(currnet.seqNo, next.seqNo));
}

/**
 * 線番選択肢で必要ない選択肢をフィルタする
 * @param {array} patchCableSelections 線番選択肢リスト
 */
export function filterPatchCableSelections(patchCableSelections) {
    let update = _.cloneDeep(patchCableSelections);
    update = update.filter((patchCable) => patchCable.cableNos && patchCable.cableNos.length > 0);
    return update ? update : [];
}

/**
 * IDF線番選択肢で必要ない選択肢をフィルタする
 * @param {array} idfPatchCableSelections IDF線番選択肢リスト(idfPatchCableSelections.patchCables)
 */
export function filterIdfPatchCableSelections(idfPatchCableSelections) {
    let update = _.cloneDeep(idfPatchCableSelections);
    update = update.map((selection) => {
        selection.patchCables = selection.patchCables.filter((cable) => cable.cableNos && cable.cableNos.length > 0);
        selection.patchCables = selection.patchCables ? selection.patchCables : [];
        return selection;
    }) 
    return update ? update : [];
}

/**
 * 対象のSeqNoのIDF線番選択肢で配線盤の線番があるかどうかチェックする
 * @param {array} idfPatchCableSelections IDF線番選択肢リスト
 * @param {number} targetSeqNo 対象のSeqNo
 */
export function checkExistIdfPatchCableSelections(idfPatchCableSelections, targetSeqNo) {
    const target = idfPatchCableSelections.find((sel) => sel.seqNo === targetSeqNo);
    if (target) {
        return target.patchCables.some((patchCable) => patchCable.cableNos && patchCable.cableNos.length > 0);
    }
    return false;    
}

/**
 * 線番選択肢で必要ないプロパティを削除する
 * @param {array} patchCableSelections 線番選択肢リスト
 */
export function omitPatchCableSelections(patchCableSelections) {
    let update = _.cloneDeep(patchCableSelections);
    update = update.map((patchCable) => {
        patchCable.cableNos = patchCable.cableNos.map((cableNo) => { return { no: cableNo.no } });
        return patchCable;
    });
    return update ? update : [];
}

/**
 * IDF線番選択肢で必要ない選択肢をフィルタする
 * @param {array} idfPatchCableSelections IDF線番選択肢リスト(idfPatchCableSelections.patchCables)
 */
export function omitIdfPatchCableSelections(idfPatchCableSelections) {
    let update = _.cloneDeep(idfPatchCableSelections);
    update = update.map((selection) => {
        selection.patchCables = omitPatchCableSelections(selection.patchCables);
        selection.patchCables = selection.patchCables ? selection.patchCables : [];
        return selection;
    }) 
    return update ? update : [];
}
//#endregion

//#region 線番選択（各線番行コンポーネントから呼び出す）

//#region 選択肢関連

/**
 * 局入/IDF線番選択肢リストから局入線番一覧を取得する
 * @param {array} linePatchCableSelections 
 * @param {number} seriesNo 局入系統No
 */
export function getInPatchCables(linePatchCableSelections, seriesNo) {
    const selections = linePatchCableSelections && linePatchCableSelections.find((s) => s.seriesNo === seriesNo);
    return selections ? selections.inPatchCables : [];
}

/**
 * 局入/IDF線番選択肢リストからIDF線番一覧リストを取得する
 * @param {array} linePatchCableSelections 
 * @param {number} seriesNo 局入系統No
 */
export function getIdfPatchCables(linePatchCableSelections, seriesNo) {
    const selections = linePatchCableSelections && linePatchCableSelections.find((s) => s.seriesNo === seriesNo);
    return selections ? selections.idfPatchCableSelections : [];
}

/**
 * 局入/IDF線番選択肢リストからIDF線番一覧リストを取得する（回線線番Noまで絞り込む）
 * @param {array} linePatchCableSelections 
 * @param {number} seriesNo 局入系統No
 * @param {number} seqNo 回線線番No
 */
export function getIdfPatchCablesBySeqNo(linePatchCableSelections, seriesNo, seqNo) {
    const selections = linePatchCableSelections && linePatchCableSelections.find((s) => s.seriesNo === seriesNo);
    const targetSelection = selections && selections.idfPatchCableSelections.find((s) => s.seqNo === seqNo);
    return targetSelection ? targetSelection.patchCables : [];
}

/**
 * IDF選択肢があるかどうか
 * @param {array} selections 選択肢リスト
 */
export function  hasIdfSelctions(selections) {
    var selection  = selections.find((s) => s.seqNo === START_SEQ_NO_IDF_PATCHCABLE);
    return hasPatchCableSelections(selection);
}

/**
 * IDF線番選択肢のpatchCablesがあるかどうか
 * @param {object} selection 線番一覧（選択肢の一覧）
 */
export function hasPatchCableSelections(selection) {
    if (selection && selection.patchCables.length > 0) {
        return true;
        }
    return false;
}

/**
 * patchCablesがあるかどうか
 * @param {array} patchCables 線番一覧
 */
 export function hasPatchCables(patchCables) {
    if (patchCables && patchCables.length > 0) {
        return true;
        }
    return false;
}

//#endregion

//#region 選択中線番情報

/**
 * 選択中の局入線番情報を取得する
 * @param {array} lineConnections 回線線番一覧
 * @param {number} seriesNo 局入系統No
 * @returns {object} 選択中の局入線番 (patchCableSequence型)
 */
export function getSelectedInPatchCable(lineConnections, seriesNo) {
    const lineConnection = lineConnections && lineConnections.find((connection) => connection.seriesNo === seriesNo);        
    const isSelected = lineConnection && lineConnection.patchCableSequences && lineConnection.patchCableSequences.length > 0;
    return isSelected ? lineConnection.patchCableSequences.find((patchCable) => patchCable.seqNo === SEQ_NO_IN_PATCHCABLE) : null;
}

/**
 * 選択中のIDF線番情報を取得する
 * @param {array} lineConnections 回線線番一覧
 * @param {number} seriesNo 局入系統No
 * @returns {array} 選択中のIDF線番リスト (patchCableSequence型の配列)
 */
export function getSelectedIdfPatchCables(lineConnections, seriesNo) {
    const lineConnection = lineConnections && lineConnections.find((connection) => connection.seriesNo === seriesNo);        
    const isSelected = lineConnection && lineConnection.patchCableSequences && lineConnection.patchCableSequences.length > 0;
    return isSelected ? lineConnection.patchCableSequences.filter((patchCable) => patchCable.seqNo >= START_SEQ_NO_IDF_PATCHCABLE) : [];
}

/**
 * 選択中のIDF線番情報を取得する（末端のIDF線番取得）
 * @param {array} lineConnections 回線線番一覧
 * @param {number} seriesNo 局入系統No
 * @returns {object} 末端のIDF線番 (patchCableSequence型)
 */
export function getSelectedEndIdfPatchCables(lineConnections, seriesNo) {
    const lineConnection = lineConnections && lineConnections.find((connection) => connection.seriesNo === seriesNo);
    const seqNos = lineConnection && lineConnection.patchCableSequences && lineConnection.patchCableSequences.map((patchCable) => patchCable.seqNo);
    const maxSeqNos = seqNos ? Math.max.apply(null, seqNos) : 0;
    return maxSeqNos ? lineConnection.patchCableSequences.find((patchCable) => patchCable.seqNo === maxSeqNos) : null;
}

/**
 * 選択中の中継線番情報を取得する
 * @param {array} lineConnections 回線線番一覧
 * @param {number} seriesNo 局入系統No
 * @returns {array} 選択中のIDF線番リスト (patchCableSequence型の配列)
 */
export function getSelectedRelPatchCables(lineConnections, seriesNo) {    
    const lineConnection = lineConnections && lineConnections.find((connection) => connection.seriesNo === seriesNo);        
    const isSelected = lineConnection && lineConnection.patchCableSequences && lineConnection.patchCableSequences.length > 0;
    const idfPatchCable = getSelectedEndIdfPatchCables(lineConnections, seriesNo);
    return isSelected ? lineConnection.patchCableSequences.filter((patchCable) => patchCable.seqNo >= START_SEQ_NO_IDF_PATCHCABLE && patchCable.seqNo < idfPatchCable.seqNo) : [];
}
/**
 * 他方で使用中の線番一覧を取得する（局入線番・IDF線番どちらも）
 * @param {array} lineConnections 回線線番一覧
 * @param {number} seriesNo 局入系統No
 */
export function getUsedPatchCableSequences(lineConnections, seriesNo) {
    const lineConnection = lineConnections && lineConnections.find((connection) => connection.seriesNo === seriesNo);        
    const isSelected = lineConnection && lineConnection.patchCableSequences && lineConnection.patchCableSequences.length > 0;
    return isSelected ? lineConnection.patchCableSequences : [];

}

/**
 * 対象局入系統NoのLineConnectionを取得する
 * @param {array} lineConnections LineConnections
 * @param {number} seriesNo 局入系統No
 * @returns 
 */
export function  getLineConnections(lineConnections, seriesNo) {
    return lineConnections && lineConnections.find((connection) => connection.seriesNo === seriesNo);
}

//#endregion

//#region 線番変更関連

/**
 * 配線盤選択の変更（局入線番）
 * @param {number} seriesNo 局入系統No
 * @param {number} patchboardId 配線盤ID
 * @param {string} patchboardName 配線盤名称
 * @param {array} beforeLineConnections 変更前の回線線番情報
 * @param {boolean} isSearchable 検索機能ありかどうか
 */
export function getChangeInPatchborad(seriesNo, patchboardId, patchboardName, beforeLineConnections, isSearchable = false ) {
    let updates = _.cloneDeep(beforeLineConnections);
    updates.forEach((item) => {
        if (item.seriesNo === seriesNo) {                
            item.patchCableSequences.forEach((cable) => {
                if (cable.seqNo === SEQ_NO_IN_PATCHCABLE) {
                    cable.patchboardId = patchboardId;
                    cable.patchboardName = patchboardName;
                    cable.patchCableNo = null;
                } else if (cable.seqNo > SEQ_NO_IN_PATCHCABLE) {
                    cable.patchboardId = null;
                    cable.patchboardName = null;
                    cable.patchCableNo = null;
                }
            })
            if (!item.patchCableSequences.some((cable) => cable.seqNo === SEQ_NO_IN_PATCHCABLE)) {
                item.patchCableSequences.push({
                    seqNo: SEQ_NO_IN_PATCHCABLE,
                    patchboardId: patchboardId,
                    patchboardName: patchboardName,
                    patchCableNo: null
                });
            }
            item.patchCableSequences = item.patchCableSequences.filter((cable) => cable.seqNo <= SEQ_NO_IN_PATCHCABLE + 1);
        } else if (isSearchable) {
            item.patchCableSequences = item.patchCableSequences.filter((cable) => (cable.seqNo <= SEQ_NO_IN_PATCHCABLE + 1));
            item.patchCableSequences.forEach((cable) => {
                cable.patchboardId = null;
                cable.patchboardName = null;
                cable.patchCableNo = null;
            });
        }  
    });
    return updates;
}

/**
 * 回線線番選択の変更（局入線番）
 * @param {number} seriesNo 局入系統No
 * @param {number} patchCableNo 回線線番
 * @param {array} beforeLineConnections 変更前の回線線番情報
 * @param {boolean} isSearchable 検索機能ありかどうか
 */
export function getChangeInPatchNo(seriesNo, patchCableNo, beforeLineConnections, isSearchable = false) {
    let updates = _.cloneDeep(beforeLineConnections);
    updates.forEach((item) => {
        if (item.seriesNo === seriesNo) {
            item.patchCableSequences.forEach((cable) => {
                if (cable.seqNo === SEQ_NO_IN_PATCHCABLE) {
                    cable.patchCableNo = { no: patchCableNo };
                } else if (isSearchable) {
                    cable.patchboardId = null;
                    cable.patchboardName = null;
                    cable.patchCableNo = null;
                }
            });
            if (isSearchable) {
                item.patchCableSequences = item.patchCableSequences.filter((cable) => cable.seqNo <= SEQ_NO_IN_PATCHCABLE + 1);
            }
        } else if (isSearchable) {
            item.patchCableSequences = item.patchCableSequences.filter((cable) => (cable.seqNo <= SEQ_NO_IN_PATCHCABLE + 1));
            item.patchCableSequences.forEach((cable) => {
                cable.patchboardId = null;
                cable.patchboardName = null;
                cable.patchCableNo = null;
            });
        }
    });
    return updates;
}

/**
 * 配線盤選択の変更（IDF線番）
 * @param {number} seriesNo 局入系統No
 * @param {number} patchboardId 配線盤ID
 * @param {string} patchboardName 配線盤名称
 * @param {array} beforeLineConnections 変更前の回線線番情報
 */
export function getChangeIdfPatchborad(seriesNo, patchboardId, patchboardName, beforeLineConnections) {
    let updates = _.cloneDeep(beforeLineConnections);
    updates.forEach((item) => {
        if (item.seriesNo === seriesNo) {                
            item.patchCableSequences.forEach((cable) => {
                if (cable.seqNo === START_SEQ_NO_IDF_PATCHCABLE) {
                    cable.patchboardId = patchboardId;
                    cable.patchboardName = patchboardName;
                    cable.patchCableNo = null;
                } else if (cable.seqNo === SEQ_NO_IN_PATCHCABLE) {
                    cable.patchboardId = null;
                    cable.patchboardName = null;
                    cable.patchCableNo = null;
                }
            })
            if (!item.patchCableSequences.some((cable) => cable.seqNo === START_SEQ_NO_IDF_PATCHCABLE)) {
                item.patchCableSequences.push({
                    seqNo: START_SEQ_NO_IDF_PATCHCABLE,
                    patchboardId: patchboardId,
                    patchboardName: patchboardName,
                    patchCableNo: null
                });
            }
            item.patchCableSequences = item.patchCableSequences.filter((cable) => cable.seqNo <= START_SEQ_NO_IDF_PATCHCABLE);
        } else {
            item.patchCableSequences = item.patchCableSequences.filter((cable) => (cable.seqNo <= START_SEQ_NO_IDF_PATCHCABLE));
            item.patchCableSequences.forEach((cable) => {
                cable.patchboardId = null;
                cable.patchboardName = null;
                cable.patchCableNo = null;
            });
        }  
    });
    return updates;
}

/**
 * 回線線番選択の変更（IDF線番）
 * @param {number} seriesNo 局入系統No
 * @param {number} patchboardId 配線盤ID
 * @param {string} patchboardName 配線盤名称
 * @param {number} patchCableNo 回線線番
 * @param {array} beforeLineConnections 変更前の回線線番情報
 */
export function getChangeIdfPatchNo(seriesNo, patchboardId, patchboardName, patchCableNo, beforeLineConnections) {
    let updates = _.cloneDeep(beforeLineConnections);
    updates.forEach((item) => {
        if (item.seriesNo === seriesNo) {
            item.patchCableSequences.forEach((cable) => {
                if (cable.seqNo === START_SEQ_NO_IDF_PATCHCABLE) {
                    cable.patchboardId = patchboardId;
                    cable.patchboardName = patchboardName;
                    cable.patchCableNo = { no: patchCableNo };
                } else {
                    cable.patchboardId = null;
                    cable.patchboardName = null;
                    cable.patchCableNo = null;
                }
            });
            item.patchCableSequences = item.patchCableSequences.filter((cable) => cable.seqNo <= START_SEQ_NO_IDF_PATCHCABLE);
        } else {
            item.patchCableSequences = item.patchCableSequences.filter((cable) => (cable.seqNo <= START_SEQ_NO_IDF_PATCHCABLE));
            item.patchCableSequences.forEach((cable) => {
                cable.patchboardId = null;
                cable.patchboardName = null;
                cable.patchCableNo = null;
            });
        }
    });
    return updates;
}

//#endregion

//#endregion

//#region 入力検証（回線）

/**
 * 回線IDの入力検証
 * @param {string} lineId 回線ID
 * @param {array} otherIds 対象以外の回線ID（配列）
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateProjectLineId(lineId, otherIds) {
    var validate = validateText(lineId, MAXLENGTH_PROJECT_LINE_ID, true);
    if (validate.state === successResult.state) {
        if (isBlankError(lineId) && otherIds.every((id) => isBlankError(id))) {
            validate = errorResult('どれか1つは入力してください。');
        }
    }
    return validate;
}

/**
 * 回線名の入力検証
 * @param {string} name 名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateProjectLineName(name) {
    return validateText(name, MAXLENGTH_PROJECT_LINE_NAME, true);
}

/**
 * ロケーションの入力検証
 * @param {object} location ロケーション情報
 */
export function validateLocation(location) {
    return location ? successResult : errorResult('必須項目です'); 
}

//#endregion

//#region 入力検証（線番選択）

/**
 * 配線盤選択の入力検証
 * @param {object} sequence 回線線番情報
 */
export function validatePatchboard(sequence) {
    var validate = validateSelect(sequence&&sequence.patchboardId);
    if (validate.state === VALIDATE_STATE.error) {
        validate.helpText = '配線盤は' + validate.helpText;
    }
    return validate;
}

/**
 * 線番選択の入力検証
 * @param {object} sequence 回線線番情報
 */
export function validatePatchCableNo(sequence) {
    var validate = validateSelect(sequence&&sequence.patchCableNo&&sequence.patchCableNo.no);
    if (validate.state === VALIDATE_STATE.error) {
        validate.helpText = '線番は' + validate.helpText;
    }        
    return validate;
}

/**
 * 線番情報の入力検証（仮登録・新設時）
 * @param {array} lineConnections 線番情報リスト
 * @param {array} usedPatchCables 使用中の回線一覧
 * @param {array} 検証結果 [{ seriesNo, validates: [{ state, helpText, seqNo }] }]
 */
export function validateLineConnections(lineConnections, usedPatchCables) {        
    return lineConnections ? lineConnections.map((connection) => {
        let validate = {
            seriesNo: connection.seriesNo,
            validates: validateLineConnection(connection, usedPatchCables, lineConnections)
        };
        return validate;
    }) : null;
}

/**
 * 線番情報（単体）の入力検証（仮登録・新設時）
 * @param {object} lineConnection 線番情報
 * @param {array} usedPatchCables 使用中の回線一覧
 * @param {array} lineConnections 現在選択中の線番情報リスト
 * @param {array} 検証結果 [{ state, helpText, seqNo }]
 */
export function validateLineConnection(lineConnection, usedPatchCables, lineConnections) {
   var validates = [];
   const patchCableSequences = lineConnection ? lineConnection.patchCableSequences : [];
   patchCableSequences.forEach((sequence) => {
       let usedPatchCableSequences = [];
       lineConnections.forEach((connection) => {
           connection.patchCableSequences.forEach((cable) => {
               if (connection.seriesNo !== lineConnection.seriesNo || cable.seqNo !== sequence.seqNo) {
                   usedPatchCableSequences.push(_.cloneDeep(cable));
               }
           })
       })
       validates.push(validatePatchCableSequence(sequence, usedPatchCables, usedPatchCableSequences));
   })
   return validates;
}

/**
 * 回線線番情報の入力検証（仮登録・新設時）
 * @param {object} sequence 回線線番情報
 * @param {array} usedPatchCables 使用中の回線一覧
 * @param {array} usedPatchCableSequences 現在選択中の線番情報リスト
 * @param {boolean} isNew 新設かどうか
 * @param {object} 検証結果 { state, helpText, seqNo }
 */
export function validatePatchCableSequence(sequence, usedPatchCables, usedPatchCableSequences) {
    var validate = validatePatchboard(sequence);
    if (validate.state === VALIDATE_STATE.success) {
        validate = validatePatchCableNo(sequence);
    }
    if (validate.state === VALIDATE_STATE.success && sequence.patchCableNo) {
        if (usedPatchCables && usedPatchCables.some((cable) =>  cable.patchboardId === sequence.patchboardId && cable.patchCableNo && cable.patchCableNo.no === sequence.patchCableNo.no)) {
            validate = errorResult('他回線で使用中の線番です。');
        } else {
            if (usedPatchCableSequences.some((cable) => cable.patchboardId === sequence.patchboardId && cable.patchCableNo && cable.patchCableNo.no === sequence.patchCableNo.no)) {
                validate = errorResult('線番が重複しています。');
            }
            if (sequence.seqNo > MAX_IDF_PATCH_CABLE + 1) {
                validate = errorResult('IDF線番は' + MAX_IDF_PATCH_CABLE + '個までとなっています。' );
            }
        }            
    }
    validate = _.cloneDeep(validate);
    validate.seqNo = sequence.seqNo;
    return validate;
}

/**
 * 線番情報の入力検証（局入のみ）
 * @param {array} lineConnections 線番情報リスト
 * @param {array} usedPatchCables 使用中の回線一覧
 * @returns 
 */
export function validateLineConnections_InOnly(lineConnections, usedPatchCables) {        
    return lineConnections ? lineConnections.map((connection) => {
        let validate = validateLineConnection_InOnly(connection, usedPatchCables, lineConnections);
        validate.seriesNo = connection.seriesNo;
        return validate;
    }) : null;
}

/**
 * 線番情報（単体）の入力検証（仮登録・新設時）
 * @param {object} lineConnection 線番情報
 * @param {array} usedPatchCables 使用中の回線一覧
 * @param {array} lineConnections 現在選択中の線番情報リスト
 */
export function validateLineConnection_InOnly(lineConnection, usedPatchCables, lineConnections) {
    var validate = null;
    const patchCableSequence = lineConnection && lineConnection.patchCableSequences.find((sequence) => sequence.seqNo === SEQ_NO_IN_PATCHCABLE);
    if (patchCableSequence) {
        let usedPatchCableSequences = [];
        lineConnections.forEach((connection) => {
            connection.patchCableSequences.forEach((cable) => {
                if (connection.seriesNo !== lineConnection.seriesNo || cable.seqNo !== patchCableSequence.seqNo) {
                    usedPatchCableSequences.push(_.cloneDeep(cable));
                }
            })
        })
        validate = validatePatchCableSequence(patchCableSequence, usedPatchCables, usedPatchCableSequences);
    }
    return validate;
}

//#endregion

//#region IDFラベル関連

/**
 * IDF線番を取得する
 * @param {array} patchCableSequences 回線線番情報（patchCableSequences型）
 * @returns {object}  IDF線番情報（patchCableSequence型）
 */
export function getIdfPatchCableSequence(patchCableSequences) {
    const idfSeqNo = getIdfSeqNo(patchCableSequences);
    var idfSequence = null;
    if (idfSeqNo >= START_SEQ_NO_IDF_PATCHCABLE) {
        idfSequence = patchCableSequences.find((sequence) => sequence.seqNo === idfSeqNo);
    }
    return idfSequence;
}

/**
 * 中継線番一覧を取得する
 * @param {array} patchCableSequences 回線線番情報（patchCableSequences型）
 * @returns {array}  中継線番一覧（patchCableSequence型）
 */
export function getRelPatchCableSequences(patchCableSequences) {
    const idfSeqNo = getIdfSeqNo(patchCableSequences);
    var relSequences = [];
    if (idfSeqNo > START_SEQ_NO_IDF_PATCHCABLE) {
        relSequences = patchCableSequences.filter((sequence) => (START_SEQ_NO_IDF_PATCHCABLE <= sequence.seqNo && sequence.seqNo < idfSeqNo));
    }
    return relSequences;
}

/**
 * 回線線番情報があるか
 * @param {object} patchCableSequence 回線線番情報
 */
export function hasPatchCableSequence(patchCableSequence) {
    return patchCableSequence && patchCableSequence.patchCableNo;
}

/**
 * IDF線番の連番(seqNo)を取得する
 * @param {array} patchCableSequences 回線線番情報（patchCableSequences型）
 * @returns {number} 連番番号
 */
function getIdfSeqNo(patchCableSequences) {    
    const seqNos = patchCableSequences && patchCableSequences.map((sequence) => sequence.seqNo);
    return seqNos && seqNos.length > 0 ? Math.max.apply(null, seqNos) : 0;
}


//#endregion

//#region 線番コピー

/**
 * 同じ配線盤名・線番の回線線番を取得する
 * @param {number} seriesNo 局入系統No
 * @param {number} seqNo 検索対象の回線線番No
 * @param {string} patchboardName 検索する配線盤名称
 * @param {number} no 検索する線番番号
 * @param {array} linePatchCableSelections 選択する選択肢一覧
 */
export function getSamePatchCableName(seriesNo, seqNo, patchboardName, no, linePatchCableSelections) {
    const selections = linePatchCableSelections && linePatchCableSelections.find((s) => s.seriesNo === seriesNo);

    var patchCables = [];
    if (selections) {
        if (seqNo === SEQ_NO_IN_PATCHCABLE) {
            patchCables = selections.inPatchCables;
        } else {
            const idfSelections = selections.idfPatchCableSelections.find((s) => s.seqNo === seqNo);
            patchCables = idfSelections ? idfSelections.patchCables : [];
        }
    }
    const samePatchboard = patchCables.find((cable) => cable.patchboardName === patchboardName);
    const samePatchCableNo = samePatchboard && samePatchboard.cableNos.find((cableNo) => cableNo.no === no);
    return samePatchCableNo && { 
        patchboardId: samePatchboard.patchboardId,
        patchboardName: samePatchboard.patchboardName,
        patchCableNo: _.cloneDeep(samePatchCableNo) 
    };
}

/**
 * 回線線番を入れ替える
 * @param {number} seriesNo 局入系統No
 * @param {number} seqNo 対象の回線線番No
 * @param {object} patchCable 入れ替える回線線番
 * @param {array} beforeLineConnections 変更前の回線線番情報
 * @returns 
 */
export function replacePatchCable(seriesNo, seqNo, patchCable, beforeLineConnections) {
    let updates = _.cloneDeep(beforeLineConnections);
    updates.forEach((item) => {
        if (item.seriesNo === seriesNo) {
            let isSamePatchboard = false;
            item.patchCableSequences.forEach((cable) => {
                if (cable.seqNo === seqNo) {
                    isSamePatchboard = (cable.patchboardId === patchCable.patchboardId);
                    cable.patchboardId = patchCable.patchboardId;
                    cable.patchboardName = patchCable.patchboardName;
                    cable.patchCableNo = { no: patchCable.patchCableNo.no };
                }
            });
            if (!item.patchCableSequences.some((cable) => cable.seqNo === seqNo)) {
                item.patchCableSequences.push({
                    seqNo: seqNo,
                    patchboardId: patchCable.patchboardId,
                    patchboardName: patchCable.patchboardName,
                    patchCableNo: { no: patchCable.patchCableNo.no }
                });
            }
            if (!isSamePatchboard && seqNo >= START_SEQ_NO_IDF_PATCHCABLE) {
                item.patchCableSequences = item.patchCableSequences.filter((cable) => cable.seqNo <= seqNo);
            }
        }
    });
    return updates;
}

//#endregion