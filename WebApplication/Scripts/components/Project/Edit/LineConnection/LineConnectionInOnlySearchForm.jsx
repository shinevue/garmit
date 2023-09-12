/**
 * @license Copyright 2022 DENSO
 * 
 * LineConnectionInOnlySearchForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import PatchCableLabelForm from 'Project/Edit/Form/PatchCableLabelForm';
import SearchAlert from './SearchAlert';
import { FIRST_SERIES_NO, SECOND_SERIES_NO } from 'projectLineUtility';
import { validateLineConnection_InOnly } from 'projectLineUtility';
import { getSelectedInPatchCable, getInPatchCables, getLineConnections } from 'projectLineUtility';
import { getChangeInPatchborad, getChangeInPatchNo } from 'projectLineUtility';
import { VALIDATE_STATE } from 'inputCheck';

/**
 * 撤去の線番を検索する線番＋線番(2)行コンポーネント（検索方法：局入のみ）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {boolean} notSearched 未検索かどうか
 * @param {number} firstSeriesNo 線番(1)の局入系統No
 * @param {function} onChangeInPatchCable 配線盤・線番変更時に呼び出す
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 */
export default class LineConnectionInOnlySearchForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const fisrtLineConnection = getLineConnections(props.lineConnections, props.firstSeriesNo);
        this.state = { 
            validate: validateLineConnection_InOnly(fisrtLineConnection, props.usedPatchCables, props.lineConnections)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.lineConnections) !== JSON.stringify(this.props.lineConnections)) {
            const fisrtLineConnection = getLineConnections(nextProps.lineConnections, nextProps.firstSeriesNo);
            this.setState({
                validate: validateLineConnection_InOnly(fisrtLineConnection, nextProps.usedPatchCables, nextProps.lineConnections)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, hasWireType, firstSeriesNo, notSearched } =  this.props;
        const { validate } = this.state;
        const secondSeriesNo = firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO;
        
        const firstInPatchCables = getInPatchCables(linePatchCableSelections, firstSeriesNo);
        const firstInPatchCableSequence = getSelectedInPatchCable(lineConnections, firstSeriesNo);
        const secondInPatchCableSequence = getSelectedInPatchCable(lineConnections, secondSeriesNo);

        const isSelected = firstInPatchCableSequence && firstInPatchCableSequence.patchboardId && firstInPatchCableSequence.patchCableNo;
        const searchable = validate && !this.isError(validate);

        return (
            <div>
                <InputForm.Row>
                    <InputForm.Col label="線番" columnCount={1} isRequired>
                        <SearchAlert show={notSearched} />
                        <div className="mb-1">
                            <label className="mb-05">局入線番</label>
                            <PatchCableSelectForm searchButton
                                patchCables={firstInPatchCables}
                                selectedPatchboardId={firstInPatchCableSequence&&firstInPatchCableSequence.patchboardId}
                                selectedPatchNo={firstInPatchCableSequence&&firstInPatchCableSequence.patchCableNo&&firstInPatchCableSequence.patchCableNo.no}
                                isReadOnlySearch={!isSelected||!searchable}
                                validationState={validate&&validate.state}
                                helpText={validate&&validate.helpText}
                                onChangePatchborad={(patchboardId, patchboardName) => this.changePatchborad(firstSeriesNo, patchboardId, patchboardName)}
                                onChangePatchNo={(patchCableNo) => this.changePatchNo(firstSeriesNo, patchCableNo)}
                                onSearch={() => this.onSearch(firstInPatchCableSequence)}                                
                            />
                        </div>
                    </InputForm.Col>
                </InputForm.Row>
                {hasWireType&&
                    <InputForm.Row>
                        <InputForm.Col label="線番(2)" columnCount={1} isRequired>
                            <PatchCableLabelForm
                                label="局入線番"
                                patchCableSequence={secondInPatchCableSequence}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
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
        let updates = getChangeInPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections, true);
        const fisrtLineConnection = getLineConnections(updates, this.props.firstSeriesNo);        
        const validate = validateLineConnection_InOnly(fisrtLineConnection, this.props.usedPatchCables, updates);
        this.onChangeInPatchCable(updates, this.isError(validate));
    }

    /**
     * 回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(seriesNo, patchCableNo) {
        let updates = getChangeInPatchNo(seriesNo, patchCableNo, this.props.lineConnections, true);
        const fisrtLineConnection = getLineConnections(updates, this.props.firstSeriesNo);        
        const validate = validateLineConnection_InOnly(fisrtLineConnection, this.props.usedPatchCables, updates);
        this.onChangeInPatchCable(updates, this.isError(validate));
    }

    //#endregion

    //#region イベント呼び出し
    
    /**
     * 配線盤・線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーかどうか
     */
    onChangeInPatchCable(lineConnections, isError) {
        if (this.props.onChangeInPatchCable) {
            this.props.onChangeInPatchCable(lineConnections, isError);
        }
    }

    /**
     * 回線情報検索イベントを呼び出す
     * @param {number} patchCableSequence 検索する回線情報
     */
    onSearch(patchCableSequence) {
        if (this.props.onSearch) {
            this.props.onSearch(patchCableSequence);
        }
    }

    //#endregion

    /**
     * エラーかどうか
     * @param {object} vaildate 入力検証結果
     */
    isError(vaildate) {
        return vaildate.state !== VALIDATE_STATE.success
    }
}