/**
 * @license Copyright 2022 DENSO
 * 
 * TempPremiseOnlyLineConnectionSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import IdfSequencesSelectForm from 'Project/Edit/Form/IdfSequencesSelectForm';
import { FIRST_SERIES_NO, SECOND_SERIES_NO } from 'projectLineUtility';
import { getIdfPatchCables, getSelectedIdfPatchCables } from 'projectLineUtility';

/**
 * 仮登録の線番＋線番(2)行コンポーネント（登録方法：構内のみ）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onChangeError エラー変更時に呼び出す
 * @param {function} onClearIdfPatchCables IDF線番クリア時に呼び出す
 * @param {function} onAddIdfPatchCable IDF配線盤選択追加時に呼び出す
 */
export default class TempPremiseOnlyLineConnectionSelectForm extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        var errors = [{
            seriesNo: FIRST_SERIES_NO,
            isError: true
        }];
        props.hasWireType && errors.push({ seriesNo: SECOND_SERIES_NO, isError: true });
        this.state = {            
            isError:errors
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.lineConnections) !== JSON.stringify(this.props.lineConnections)) {
            let errors = _.cloneDeep(this.state.isError);            
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
            const isErrorChanged = this.isError(errors) !== this.isError(this.state.isError);
            this.setState({
                isError: errors
            }, () => isErrorChanged && this.onChangeError(errors));
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, hasWireType, usedPatchCables } =  this.props;
        const firstPatchCableSequences = getSelectedIdfPatchCables(lineConnections, FIRST_SERIES_NO);
        const secondPatchCableSequences = getSelectedIdfPatchCables(lineConnections, SECOND_SERIES_NO);
        const firstIdfSelections = getIdfPatchCables(linePatchCableSelections, FIRST_SERIES_NO);
        const secondIdfSelections = getIdfPatchCables(linePatchCableSelections, SECOND_SERIES_NO);
        return (
            <div>
                <LineRow
                    seriesNo={FIRST_SERIES_NO}
                    patchCableSelections={firstIdfSelections}
                    selectedPatchCables={firstPatchCableSequences}
                    usedPatchCables={usedPatchCables}
                    usedPatchCableSequences={secondPatchCableSequences}
                    onChange={(seriesNo, seqNo, patchCableSequences, isError) => this.changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError)}
                    onClear={(seriesNo, seqNo, patchCableSequences, isError) => this.onClearIdfPatchCables(seriesNo, seqNo, patchCableSequences, isError)}
                    onAdd={(seriesNo, patchboardId, patchCableSequences, isError) => this.onAddIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                    onChangeError={(seriesNo, isError) => this.changeError(seriesNo, isError)}
                />  
                {hasWireType&&
                    <LineRow 
                        seriesNo={SECOND_SERIES_NO}
                        patchCableSelections={secondIdfSelections}
                        selectedPatchCables={secondPatchCableSequences}
                        usedPatchCables={usedPatchCables}
                        usedPatchCableSequences={firstPatchCableSequences}
                        onChange={(seriesNo, seqNo, patchCableSequences, isError) => this.changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError)}
                        onClear={(seriesNo, seqNo, patchCableSequences, isError) => this.onClearIdfPatchCables(seriesNo, seqNo, patchCableSequences, isError)}
                        onAdd={(seriesNo, patchboardId, patchCableSequences, isError) => this.onAddIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                        onChangeError={(seriesNo, isError) => this.changeError(seriesNo, isError)}
                    />  
                }
            </div>
        );
    }

    /**
     * 回線線番を変更する
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo 変更した回線線番No
     * @param {array} patchCableSequences 回線線番情報
     * @param {boolean} isError エラーどうか
     */
    changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError) {      
        const error = this.getUpdateErrors(seriesNo, isError);
        this.setState({
            isError: error
        }, () => this.onChange(this.getUpdateLineConnections(seriesNo, patchCableSequences), this.isError(error), seriesNo, seqNo));
    }

    /**
     * 回線線番クリア変更イベント
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo クリアする開始回線線番No
     * @param {array} patchCableSequences 回線線番情報
     * @param {boolean} isError エラーどうか
     */
    onClearIdfPatchCables(seriesNo, seqNo, patchCableSequences, isError) {     
        const error = this.getUpdateErrors(seriesNo, isError);
        this.setState({
            isError: error
        }, () => {
            if (this.props.onClearIdfPatchCables) {
                this.props.onClearIdfPatchCables(seriesNo, seqNo, this.getUpdateLineConnections(seriesNo, patchCableSequences), this.isError(error));
            }
        });
    }

    /**
     * 回線線番追加イベント
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {array} patchCableSequences 回線線番情報
     * @param {boolean} isError エラーどうか
     */
    onAddIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError) { 
        const errors = this.getUpdateErrors(seriesNo, isError);
        if (this.props.onAddIdfPatchCable) {
            this.props.onAddIdfPatchCable(seriesNo, patchboardId, this.getUpdateLineConnections(seriesNo, patchCableSequences), this.isError(errors), () => {
                this.setState({
                    isError: errors
                });
            });
        }
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
     * エラーかどうかを変更して、取得する
     * @param {number} seriesNo 局入系統No
     * @param {boolean} isError エラーかどうか
     * @returns 
     */
    getUpdateErrors(seriesNo, isError) {
        let errors = _.cloneDeep(this.state.isError);
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
     * エラー変更イベント呼び出し
     * @param {array} errors エラーリスト
     */
    onChangeError(errors) {
        if (this.props.onChangeError) {
            this.props.onChangeError(this.isError(errors));
        }
    }

    /**
     * IDF線番のエラー情報変更時に呼び出す
     * @param {number} seriesNo 局入系統No
     * @param {boolean} isError エラーかどうか
     */
    changeError(seriesNo, isError) {
        const errors = this.getUpdateIdfPatchCableErrors(seriesNo, isError);
        if (this.isError(errors) !== this.isError(this.state.isError)) {
            this.setState({
                isError: errors
            }, () => {
                this.onChangeError(errors);
            });

        }
    }

    /**
     * エラーかどうかを変更して、取得する
     * @param {number} seriesNo 局入系統No
     * @param {boolean} isError エラーかどうか
     * @returns 
     */
    getUpdateIdfPatchCableErrors(seriesNo, isError) {
        let errors = _.cloneDeep(this.state.isError);
        errors.forEach((e) => {
            if (e.seriesNo === seriesNo) {
                e.isError = isError;
            }
        });
        return errors;
    }

    /**
     * エラーかどうか
     * @param {array} errors エラー情報一覧
     */
    isError(errors) {
        return errors ? errors.some((v) => v.isError === true) : false;
    }
}


/**
 * 線番選択行 
 */
const LineRow = ({seriesNo, patchCableSelections, selectedPatchCables, usedPatchCables, usedPatchCableSequences, isReadOnly, onChange, onClear, onAdd, onChangeError }) => {
    return (
        <InputForm.Row>
            <InputForm.Col label={'線番'+ (seriesNo&&seriesNo!==FIRST_SERIES_NO?'(' + seriesNo + ')' : '')} columnCount={1} isRequired>
                <IdfSequencesSelectForm
                    patchCableSelections={patchCableSelections?patchCableSelections:[]}
                    selectedPatchCables={selectedPatchCables?selectedPatchCables:[]}
                    usedPatchCables={usedPatchCables}
                    usedPatchCableSequences={usedPatchCableSequences}
                    isReadOnly={isReadOnly}
                    onChange={(patchCableSequences, isError, seqNo) => onChange(seriesNo, seqNo, patchCableSequences, isError)}
                    onClear={(seqNo, patchCableSequences, isError) => onClear(seriesNo, seqNo, patchCableSequences, isError)}
                    onAdd={(patchboardId, patchCableSequences, isError) => onAdd(seriesNo, patchboardId, patchCableSequences, isError)}
                    onChangeError={(isError) => onChangeError(seriesNo, isError)}
                />
            </InputForm.Col>
        </InputForm.Row>
    )
}