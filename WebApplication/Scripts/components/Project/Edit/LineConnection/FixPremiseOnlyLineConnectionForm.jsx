/**
 * @license Copyright 2022 DENSO
 * 
 * FixPremiseOnlyLineConnectionForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import IdfConnectLabelForm from 'Project/Edit/Form/IdfConnectLabelForm';
import SearchAlert from './SearchAlert';
import { FIRST_SERIES_NO, SECOND_SERIES_NO } from 'projectLineUtility';
import { validateLineConnections_InOnly } from 'projectLineUtility';
import { getSelectedInPatchCable, getInPatchCables, getSelectedIdfPatchCables, hasPatchCables } from 'projectLineUtility';
import { getChangeInPatchborad, getChangeInPatchNo } from 'projectLineUtility';
import { VALIDATE_STATE } from 'inputCheck';

/**
 * 修正の線番を検索する線番＋線番(2)行コンポーネント（検索：構内のみ、工事種別：修正（仮登録）・修正（残置））
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} beforeLineConnections 修正前の線番情報
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} notSearched 未検索かどうか
 * @param {number} firstSeriesNo 線番(1)の局入系統No
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 */
export default class FixPremiseOnlyLineConnectionForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            validates: validateLineConnections_InOnly(props.lineConnections, props.usedPatchCables)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.lineConnections) !== JSON.stringify(this.props.lineConnections)) {
            this.setState({
                validates: validateLineConnections_InOnly(nextProps.lineConnections, nextProps.usedPatchCables)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, beforeLineConnections, hasWireType, firstSeriesNo, isReadOnly, notSearched } =  this.props;
        const { validates } = this.state;
        const secondSeriesNo = firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO;
        
        const firstBeforePatchCableSequences = getSelectedIdfPatchCables(beforeLineConnections, firstSeriesNo);
        const secondBeforePatchCableSequences = getSelectedIdfPatchCables(beforeLineConnections, secondSeriesNo);

        const firstInPatchCables = getInPatchCables(linePatchCableSelections, firstSeriesNo);
        const secondInPatchCables = getInPatchCables(linePatchCableSelections, secondSeriesNo);
        const firstInPatchCableSequence = getSelectedInPatchCable(lineConnections, firstSeriesNo);
        const secondInPatchCableSequence = getSelectedInPatchCable(lineConnections, secondSeriesNo);
        const firstValidate = validates.find((v) => v.seriesNo === firstSeriesNo);
        const secondValidate = validates.find((v) => v.seriesNo !== firstSeriesNo);

        const isSearchedFirst = hasPatchCables(firstInPatchCables);
        const isSearchedSecond = hasPatchCables(secondInPatchCables);

        return (
            <div>
                <LineRow 
                    seriesKey={FIRST_SERIES_NO}
                    seriesNo={firstSeriesNo}
                    showSearchAlart={notSearched}
                    patchCables={firstInPatchCables}
                    selectedPatchCable={firstInPatchCableSequence}
                    validate={firstValidate}
                    beforePatchCableSequences={firstBeforePatchCableSequences}
                    isReadOnly={isReadOnly||!isSearchedFirst}
                    onChangePatchborad={(seriesNo, patchboardId, patchboardName) => this.changePatchborad(seriesNo, patchboardId, patchboardName)}
                    onChangePatchNo={(seriesNo, patchCableNo) => this.changePatchNo(seriesNo, patchCableNo)}
                />
                {hasWireType&&
                    <LineRow
                        seriesKey={SECOND_SERIES_NO}
                        seriesNo={secondSeriesNo}
                        patchCables={secondInPatchCables}
                        selectedPatchCable={secondInPatchCableSequence}
                        validate={secondValidate}
                        beforePatchCableSequences={secondBeforePatchCableSequences}
                        isReadOnly={isReadOnly||!isSearchedSecond}
                        onChangePatchborad={(seriesNo, patchboardId, patchboardName) => this.changePatchborad(seriesNo, patchboardId, patchboardName)}
                        onChangePatchNo={(seriesNo, patchCableNo) => this.changePatchNo(seriesNo, patchCableNo)}
                    />
                }
            </div>
        );
    }

    //#region 局入線番関連

    /**
     * 配線盤選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     */
    changePatchborad(seriesNo, patchboardId, patchboardName) {
        let updates = getChangeInPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections);
        const validates = validateLineConnections_InOnly(updates, this.props.usedPatchCables)
        this.onChange(updates, this.isError(validates));
    }

    /**
     * 回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(seriesNo, patchCableNo) {
        let updates = getChangeInPatchNo(seriesNo, patchCableNo, this.props.lineConnections);
        const validates = validateLineConnections_InOnly(updates, this.props.usedPatchCables)
        this.onChange(updates, this.isError(validates));
    }

    //#endregion

    //#region イベント呼び出し
    
    /**
     * 配線盤・線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーかどうか
     */
    onChange(lineConnections, isError) {
        if (this.props.onChange) {
            this.props.onChange(lineConnections, isError);
        }
    }

    //#endregion

    /**
     * エラーかどうか
     * @param {array} validates 入力検証
     */
     isError(validates) {
        return validates ? validates.some((v) => v.state !== VALIDATE_STATE.success) : true;
    }
}


/**
 * 線番選択行 
 */
 const LineRow = ({ seriesKey, seriesNo, patchCables, selectedPatchCable, beforePatchCableSequences, validate, isReadOnly, showSearchAlart, onChangePatchborad, onChangePatchNo }) => {    
    return (
        <InputForm.Row>
            <InputForm.Col label={"線番"+ (seriesKey&&seriesKey!==1?"(" + seriesKey + ")" : "")} columnCount={1} isRequired>
                <SearchAlert show={showSearchAlart} />
                <div className="mb-1">                            
                    <IdfConnectLabelForm
                        patchCableSequences={beforePatchCableSequences}
                        addIdfLabelText="（修正前）"
                    />
                </div>
                <div>↓ ↓ ↓</div>
                <div className="mt-1">
                    <label className="mb-05">局入線番（修正後）</label>
                    <PatchCableSelectForm
                        patchCables={patchCables}
                        selectedPatchboardId={selectedPatchCable&&selectedPatchCable.patchboardId}
                        selectedPatchNo={selectedPatchCable&&selectedPatchCable.patchCableNo&&selectedPatchCable.patchCableNo.no}
                        isReadOnly={isReadOnly}
                        validationState={validate&&validate.state}
                        helpText={validate&&validate.helpText}
                        onChangePatchborad={(patchboardId, patchboardName) => onChangePatchborad(seriesNo, patchboardId, patchboardName)}
                        onChangePatchNo={(patchCableNo) => onChangePatchNo(seriesNo, patchCableNo)}        
                    />
                </div>
            </InputForm.Col>
        </InputForm.Row>
    )
}