/**
 * @license Copyright 2022 DENSO
 * 
 * TempInOnlyLineConnectionSelectForm Reactコンポーネン
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import { validateLineConnections_InOnly, FIRST_SERIES_NO, SECOND_SERIES_NO } from 'projectLineUtility';
import { getSelectedInPatchCable, getInPatchCables } from 'projectLineUtility';
import { getChangeInPatchborad, getChangeInPatchNo } from 'projectLineUtility';
import { successResult } from 'inputCheck';


/**
 * 仮登録の線番＋線番(2)行コンポーネント（登録方法：局入のみ）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onChangeError エラー変更時に呼び出す
 */
export default class TempInOnlyLineConnectionSelectForm extends Component {
    
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
            const beforevalidates = validateLineConnections_InOnly(this.props.lineConnections, this.props.usedPatchCables);
            const validates = validateLineConnections_InOnly(nextProps.lineConnections, nextProps.usedPatchCables);
            if (JSON.stringify(beforevalidates) !== JSON.stringify(validates)) {
                this.setState({
                    validates: validates
                }, this.onChangeError(validates));
            }
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, hasWireType } =  this.props;
        const { validates } = this.state;
        const firstPatchCableSequence = getSelectedInPatchCable(lineConnections, FIRST_SERIES_NO);
        const secondPatchCableSequence = getSelectedInPatchCable(lineConnections, SECOND_SERIES_NO);
        const firstInPatchCables = getInPatchCables(linePatchCableSelections, FIRST_SERIES_NO);
        const secondInPatchCables = getInPatchCables(linePatchCableSelections, SECOND_SERIES_NO);
        const firstValidate = validates.find((v) => v.seriesNo === FIRST_SERIES_NO);
        const secondValidate = validates.find((v) => v.seriesNo !== FIRST_SERIES_NO);
        return (
            <div>
                <LineRow
                    seriesNo={FIRST_SERIES_NO}
                    patchCables={firstInPatchCables}
                    selectedPatchCable={firstPatchCableSequence}
                    validate={firstValidate}
                    onChangePatchborad={(seriesNo,patchboardId, patchboardName) => this.changePatchborad(seriesNo, patchboardId, patchboardName)}
                    onChangePatchNo={(seriesNo, patchboardId, patchCableNo) => this.changePatchNo(seriesNo, patchCableNo)}
                />  
                {hasWireType&&
                    <LineRow 
                        seriesNo={SECOND_SERIES_NO}
                        patchCables={secondInPatchCables}
                        selectedPatchCable={secondPatchCableSequence}
                        validate={secondValidate}
                        onChangePatchborad={(seriesNo, patchboardId, patchboardName) => this.changePatchborad(seriesNo, patchboardId, patchboardName)}
                        onChangePatchNo={(seriesNo, patchboardId, patchCableNo) => this.changePatchNo(seriesNo, patchCableNo)}
                    />  
                }
            </div>
        );
    }

    /**
     * 配線盤選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     */
    changePatchborad(seriesNo, patchboardId, patchboardName) {
        let updates = getChangeInPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections);
        this.onChange(updates);
    }

    /**
     * 回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(seriesNo, patchCableNo) {
        let updates = getChangeInPatchNo(seriesNo, patchCableNo, this.props.lineConnections);
        this.onChange(updates);
    }

    /**
     * 配線盤・線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     */
    onChange(lineConnections) {
        const validates = validateLineConnections_InOnly(lineConnections, this.props.usedPatchCables);
        if (this.props.onChange) {
            this.props.onChange(lineConnections, this.isError(validates));
        }
    }

    /**
     * エラー変更イベント呼び出し
     * @param {array} validates 入力検証結果
     */
    onChangeError(validates) {
        if (this.props.onChangeError) {
            this.props.onChangeError(this.isError(validates));
        }
    }

    /**
     * エラーかどうか
     * @param {array} validates 入力検証
     */
    isError(validates) {
        return validates ? validates.some((v) => v.state !== successResult.state) : true;
    }

}

/**
 * 線番選択行 
 */
const LineRow = ({ seriesNo, patchCables, selectedPatchCable, validate, onChangePatchborad, onChangePatchNo }) => {
    return (
        <InputForm.Row>
            <InputForm.Col label={"線番"+ (seriesNo&&seriesNo!==FIRST_SERIES_NO?"(" + seriesNo + ")" : "")} columnCount={1} isRequired>
                <div className="mb-1 mb-05">
                    <label className="mb-05">局入線番</label>
                    <PatchCableSelectForm 
                        className="mb-05"
                        patchCables={patchCables}
                        selectedPatchboardId={selectedPatchCable&&selectedPatchCable.patchboardId}
                        selectedPatchNo={selectedPatchCable&&selectedPatchCable.patchCableNo&&selectedPatchCable.patchCableNo.no}
                        validationState={validate&&validate.state}
                        helpText={validate&&validate.helpText}
                        onChangePatchborad={(patchboardId, patchboardName) => onChangePatchborad(seriesNo, patchboardId, patchboardName)}
                        onChangePatchNo={(patchCableNo) => onChangePatchNo(seriesNo, selectedPatchCable.patchboardId, patchCableNo)}
                    />
                </div>
            </InputForm.Col>
        </InputForm.Row>
    )
}