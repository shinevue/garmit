/**
 * @license Copyright 2022 DENSO
 * 
 * LineConnectionPremiseOnlySearchForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import IdfConnectSearchForm from 'Project/Edit/Form/IdfConnectSearchForm'
import IdfConnectLabelForm from 'Project/Edit/Form/IdfConnectLabelForm';
import SearchAlert from './SearchAlert';
import { FIRST_SERIES_NO, SECOND_SERIES_NO } from 'projectLineUtility';
import { validatePatchCableSequence } from 'projectLineUtility';
import { getSelectedRelPatchCables, getSelectedEndIdfPatchCables, getIdfPatchCablesBySeqNo, getSelectedIdfPatchCables } from 'projectLineUtility';
import { getChangeIdfPatchborad, getChangeIdfPatchNo } from 'projectLineUtility';
import { VALIDATE_STATE } from 'inputCheck';

/**
 * 撤去の線番を検索する線番＋線番(2)行コンポーネント（検索方法：構内のみ）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {boolean} notSearched 未検索かどうか
 * @param {number} firstSeriesNo 線番(1)の局入系統No
 * @param {function} onChangeIdfPatchCable 配線盤・線番変更時に呼び出す
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 */
export default class LineConnectionPremiseOnlySearchForm extends Component {
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        const firstIdfPatchCableSequence = getSelectedEndIdfPatchCables(props.lineConnections, props.firstSeriesNo);
        this.state = { 
            validate: validatePatchCableSequence(firstIdfPatchCableSequence, props.usedPatchCables, [])
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.lineConnections) !== JSON.stringify(this.props.lineConnections)) {
            const firstIdfPatchCableSequence = getSelectedEndIdfPatchCables(nextProps.lineConnections, nextProps.firstSeriesNo);
            this.setState({
                validate: validatePatchCableSequence(firstIdfPatchCableSequence, nextProps.usedPatchCables, [])
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

        const firstIdfPatchCableSequence = getSelectedEndIdfPatchCables(lineConnections, firstSeriesNo);
        const firstRelPatchCableSequences = getSelectedRelPatchCables(lineConnections, firstSeriesNo);
        const secondPatchCableSequences = getSelectedIdfPatchCables(lineConnections, secondSeriesNo);

        const firstIdfSelections = firstIdfPatchCableSequence ? getIdfPatchCablesBySeqNo(linePatchCableSelections, firstSeriesNo, firstIdfPatchCableSequence.seqNo) : [];

        const isSelected = firstIdfPatchCableSequence && firstIdfPatchCableSequence.patchboardId && firstIdfPatchCableSequence.patchCableNo;
        const searchable = validate && !this.isError(validate);

        return (
            <div>
                <InputForm.Row>
                    <InputForm.Col label="線番" columnCount={1} isRequired>
                        <SearchAlert show={notSearched} />
                        <IdfConnectSearchForm
                            searchButton
                            patchCables={firstIdfSelections}
                            selectedPatchCable={firstIdfPatchCableSequence}
                            relPatchCables={firstRelPatchCableSequences}
                            validate={validate}
                            isReadOnlySearch={!isSelected||!searchable}
                            onChangePatchborad={(patchboardId, patchboardName) => this.changePatchborad(firstSeriesNo, patchboardId, patchboardName)}
                            onChangePatchNo={(patchCableNo, patchboardId, patchboardName) => this.changePatchNo(firstSeriesNo, patchboardId, patchboardName, patchCableNo)}
                            onSearch={(patchCableSequence) => this.onSearch(patchCableSequence)}
                        />
                    </InputForm.Col>
                </InputForm.Row>
                {hasWireType&&
                    <InputForm.Row>
                        <InputForm.Col label="線番(2)" columnCount={1} isRequired>
                            <IdfConnectLabelForm
                                patchCableSequences={secondPatchCableSequences}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                }
            </div>
        );
    }

    //#region IDF線番関連

    /**
     * 配線盤選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     */
    changePatchborad(seriesNo, patchboardId, patchboardName) {
        let updates = getChangeIdfPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections);
        const firstIdfPatchCableSequence = getSelectedEndIdfPatchCables(updates, this.props.firstSeriesNo);
        const validate = validatePatchCableSequence(firstIdfPatchCableSequence, this.props.usedPatchCables, updates);
        this.onChangeIdfPatchCable(updates, this.isError(validate));
    }

    /**
     * 回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(seriesNo, patchboardId, patchboardName, patchCableNo) {
        let updates = getChangeIdfPatchNo(seriesNo, patchboardId, patchboardName, patchCableNo, this.props.lineConnections);        
        const firstIdfPatchCableSequence = getSelectedEndIdfPatchCables(updates, this.props.firstSeriesNo);
        const validate = validatePatchCableSequence(firstIdfPatchCableSequence, this.props.usedPatchCables, updates);
        this.onChangeIdfPatchCable(updates, this.isError(validate));
    }    

    //#endregion

    //#region イベント呼び出し
    
    /**
     * 配線盤・線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーかどうか
     */
    onChangeIdfPatchCable(lineConnections, isError) {
        if (this.props.onChangeIdfPatchCable) {
            this.props.onChangeIdfPatchCable(lineConnections, isError);
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