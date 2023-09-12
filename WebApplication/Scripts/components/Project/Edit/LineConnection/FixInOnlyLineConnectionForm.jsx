/**
 * @license Copyright 2022 DENSO
 * 
 * FixInOnlyLineConnectionForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import PatchCableLabelForm from 'Project/Edit/Form/PatchCableLabelForm';
import IdfSequencesSelectForm from 'Project/Edit/Form/IdfSequencesSelectForm';
import SearchAlert from './SearchAlert';
import { FIRST_SERIES_NO, SECOND_SERIES_NO } from 'projectLineUtility';
import { getSelectedInPatchCable, getSelectedIdfPatchCables, getIdfPatchCables, getUsedPatchCableSequences } from 'projectLineUtility';
import { hasIdfSelctions } from 'projectLineUtility';

/**
 * 修正の線番を検索する線番＋線番(2)行コンポーネント（検索：局入のみ、工事種別：修正（仮登録）・修正（残置）） * 
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} beforeLineConnections 修正前の線番情報
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} notSearched 未検索かどうか
 * @param {number} firstSeriesNo 線番(1)の局入系統No
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onClearIdfPatchCables IDF線番クリア時に呼び出す
 * @param {function} onAddIdfPatchCable IDF配線盤選択追加時に呼び出す
 * @param {function} onChangeError IDF線番エラー変更時に呼び出す
 */
export default class FixInOnlyLineConnectionForm extends Component {
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        var idfPatchCableErrors = [{
            seriesNo: props.firstSeriesNo,
            isError: true
        }];
        props.hasWireType && idfPatchCableErrors.push({ seriesNo: props.firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO, isError: true });
        this.state = {    
            idfPatchCableErrors: idfPatchCableErrors
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.lineConnections) !== JSON.stringify(this.props.lineConnections)) {
            var errors = _.cloneDeep(this.state.idfPatchCableErrors);
            if (nextProps.hasWireType !== this.props.hasWireType) {
                if (nextProps.hasWireType) {
                    errors.push({
                        seriesNo: SECOND_SERIES_NO,
                        isError: true
                    });
                } else {
                    errors = errors.filter((e) => e.seriesNo !== SECOND_SERIES_NO);
                }
            }
            
            const isErrorChanged = this.isError(errors) !== this.isError(this.state.idfPatchCableErrors);
            this.setState({
                idfPatchCableErrors: errors
            }, () => isErrorChanged && this.onChangeError(errors));
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, beforeLineConnections, firstSeriesNo, isReadOnly, hasWireType, usedPatchCables, notSearched } =  this.props;
        const secondSeriesNo = firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO;
        
        const firstBeforeInPatchCableSequence = getSelectedInPatchCable(beforeLineConnections, firstSeriesNo);
        const secondBeforeInPatchCableSequence = getSelectedInPatchCable(beforeLineConnections, secondSeriesNo);

        const firstIdfSelections = getIdfPatchCables(linePatchCableSelections, firstSeriesNo);
        const secondIdfSelections = getIdfPatchCables(linePatchCableSelections, secondSeriesNo);
        const firstIdfPatchCableSequences = getSelectedIdfPatchCables(lineConnections, firstSeriesNo);
        const secondIdfPatchCableSequences = getSelectedIdfPatchCables(lineConnections, secondSeriesNo);
    
        const isSearchedFirst = hasIdfSelctions(firstIdfSelections);
        const isSearchedSecond = hasIdfSelctions(secondIdfSelections);

        return (
            <div>
                <LineRow
                    seriesKey={FIRST_SERIES_NO}
                    seriesNo={firstSeriesNo}
                    showSearchAlart={notSearched}
                    beforePatchCableSequence={firstBeforeInPatchCableSequence}
                    isReadOnly={isReadOnly||!isSearchedFirst}
                    patchCableSelections={firstIdfSelections}
                    selectedPatchCables={firstIdfPatchCableSequences}
                    usedPatchCables={usedPatchCables}
                    usedPatchCableSequences={getUsedPatchCableSequences(lineConnections, secondSeriesNo)}
                    onChange={(seriesNo, seqNo, patchCableSequences, isError) => this.changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError)}
                    onClearIdfPatchCable={(seriesNo, seqNo, patchCableSequences, isError) => this.clearPatchCables(seriesNo, seqNo, patchCableSequences, isError)}
                    onAddIdfPatchCable={(seriesNo, patchboardId, patchCableSequences, isError) => this.addIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                    onChangeError={(seriesNo, isError) => this.changeError(seriesNo, isError)}
                />  
                {hasWireType&&
                    <LineRow
                        seriesKey={SECOND_SERIES_NO}
                        seriesNo={secondSeriesNo}
                        beforePatchCableSequence={secondBeforeInPatchCableSequence}
                        isReadOnly={isReadOnly||!isSearchedSecond}
                        patchCableSelections={secondIdfSelections}
                        selectedPatchCables={secondIdfPatchCableSequences}
                        usedPatchCables={usedPatchCables}
                        usedPatchCableSequences={getUsedPatchCableSequences(lineConnections, firstSeriesNo)}
                        onChange={(seriesNo, seqNo, patchCableSequences, isError) => this.changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError)}
                        onClearIdfPatchCable={(seriesNo, seqNo, patchCableSequences, isError) => this.clearPatchCables(seriesNo, seqNo, patchCableSequences, isError)}
                        onAddIdfPatchCable={(seriesNo, patchboardId, patchCableSequences, isError) => this.addIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                        onChangeError={(seriesNo, isError) => this.changeError(seriesNo, isError)}
                    />  
                }
            </div>
        );
    }

    //#region IDF線番関連

    /**
     * 回線線番を変更する
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo 変更した回線線番No
     * @param {array} patchCableSequences 回線線番情報
     * @param {boolean} isError エラーどうか
     */
    changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError) {
        const errors = this.getUpdateIdfPatchCableErrors(seriesNo, isError); 
        this.setState({
            idfPatchCableErrors: errors
        }, () => this.onChange(this.getUpdateLineConnections(seriesNo, patchCableSequences), this.isError(errors), seriesNo, seqNo));
    }

    /**
     * 更新した回線線番情報を取得する
     * @param {number} seriesNo 局入系統No
     * @param {array} patchCableSequences 回線線番情報
     * @returns 回線線番情報（LineConnection型）
     */
    getUpdateLineConnections(seriesNo, patchCableSequences) {
        let updates = _.cloneDeep(this.props.lineConnections);
        updates.forEach((item) => {
            if (item.seriesNo === seriesNo) {  
                item.patchCableSequences = _.cloneDeep(patchCableSequences);
            }
        });
        return updates;
    }
    
    /**
     * 回線線番クリア変更イベント
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo クリアする開始回線線番No
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
     */
    clearPatchCables(seriesNo, seqNo, patchCableSequences, isError) {
        const updates = this.getUpdateLineConnections(seriesNo, patchCableSequences);
        const errors = this.getUpdateIdfPatchCableErrors(seriesNo, isError); 
        this.setState({
            idfPatchCableErrors: errors
        }, () => this.onClearIdfPatchCables(seriesNo, seqNo, updates, this.isError(errors)));
    }
    
    /**
     * 回線線番追加イベント
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {array} patchCableSequences 回線線番情報
     * @param {boolean} isError エラーどうか
     */
    addIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError) {
        const updates = this.getUpdateLineConnections(seriesNo, patchCableSequences);
        const errors = this.getUpdateIdfPatchCableErrors(seriesNo, isError); 
        this.onAddIdfPatchCable(seriesNo, patchboardId, updates, this.isError(errors), () => {
            this.setState({
                idfPatchCableErrors: errors
            });
        });
        
    }

    /**
     * IDF線番のエラー情報変更する
     * @param {number} seriesNo 局入系統No
     * @param {boolean} isError エラーかどうか
     */
    changeError(seriesNo, isError) {
        const errors = this.getUpdateIdfPatchCableErrors(seriesNo, isError);
        if (this.isError(errors) !== this.isError(this.state.idfPatchCableErrors)) {
            this.setState({
                idfPatchCableErrors: errors
            }, () => {
                this.onChangeError(errors);
            });

        }
    }

    //#endregion

    //#region イベント呼び出し
    
    /**
     * 配線盤・線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーかどうか
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo 変更した回線線番No
     */
    onChange(lineConnections, isError, seriesNo, seqNo) {
        if (this.props.onChange) {
            this.props.onChange(lineConnections, isError, seriesNo, seqNo);
        }
    }

    /**
     * 回線線番クリア変更イベント
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo クリアする開始回線線番No
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
     */
    onClearIdfPatchCables(seriesNo, seqNo, lineConnections, isError) {
        if (this.props.onClearIdfPatchCables) {
            this.props.onClearIdfPatchCables(seriesNo, seqNo, lineConnections, isError);
        }
    }

    /**
     * 回線線番追加イベント
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
     * @param {function} callback コールバック関数
     */
    onAddIdfPatchCable(seriesNo, patchboardId, lineConnections, isError, callback) {
        if (this.props.onAddIdfPatchCable) {
            this.props.onAddIdfPatchCable(seriesNo, patchboardId, lineConnections, isError, callback);
        }
    }
    
    /**
     * エラー変更イベント呼び出し
     * @param {array} errors エラーリスト
     */
    onChangeError(errors) {
        if (this.props.onChangeError) {
            this.props.onChangeError(this.isError(errors));
        }
    }

    //#endregion

    /**
     * エラーかどうかを変更して、取得する
     * @param {number} seriesNo 局入系統No
     * @param {boolean} isError エラーかどうか
     * @returns 
     */
    getUpdateIdfPatchCableErrors(seriesNo, isError) {
        let errors = _.cloneDeep(this.state.idfPatchCableErrors);
        errors.forEach((e) => {
            if (e.seriesNo === seriesNo) {
                e.isError = isError;
            }
        });
        if (!errors.some((e) => e.seriesNo === seriesNo)) {
            errors.push({
                seriesNo: seriesNo,
                isError: isError
            });
        }
        return errors;
    }

    /**
     * エラーかどうか
     * @param {array} idfPatchCableErrors IDF線番のエラー一覧
     */
    isError(idfPatchCableErrors) {
        return idfPatchCableErrors ? idfPatchCableErrors.some((v) => v.isError === true) : false;
    }
}


/**
 * 線番選択行 
 */
const LineRow = ({ seriesKey, seriesNo, beforePatchCableSequence, isReadOnly, showSearchAlart,
                   patchCableSelections, selectedPatchCables, usedPatchCables, usedPatchCableSequences, onChange, onClearIdfPatchCable, onAddIdfPatchCable, onChangeError }) => {    
    return (
        <InputForm.Row>
            <InputForm.Col label={"線番"+ (seriesKey&&seriesKey!==1?"(" + seriesKey + ")" : "")} columnCount={1} isRequired>
                    <SearchAlert show={showSearchAlart} />
                    <div className="mb-1">
                        <PatchCableLabelForm
                            label="局入線番（修正前）"
                            patchCableSequence={beforePatchCableSequence}
                        />
                    </div>
                    <div>↓ ↓ ↓</div>
                    <div className="mt-1">
                        <IdfSequencesSelectForm 
                            patchCableSelections={patchCableSelections?patchCableSelections:[]}
                            selectedPatchCables={selectedPatchCables?selectedPatchCables:[]}
                            usedPatchCables={usedPatchCables}
                            usedPatchCableSequences={usedPatchCableSequences}
                            isReadOnly={isReadOnly}
                            onChange={(patchCableSequences, isError, seqNo) => onChange(seriesNo, seqNo, patchCableSequences, isError)}
                            onClear={(seqNo, patchCableSequences, isError) => onClearIdfPatchCable(seriesNo, seqNo, patchCableSequences, isError)}
                            onAdd={(patchboardId, patchCableSequences, isError) => onAddIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                            onChangeError={(isError) => onChangeError(seriesNo, isError)}
                        />
                    </div>
                </InputForm.Col>
        </InputForm.Row>
    )
}
