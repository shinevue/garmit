/**
 * @license Copyright 2022 DENSO
 * 
 * LineConnectionSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import IdfSequencesSelectForm from 'Project/Edit/Form/IdfSequencesSelectForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import MessageModal from 'Assets/Modal/MessageModal';
import { FIRST_SERIES_NO, SECOND_SERIES_NO, SEQ_NO_IN_PATCHCABLE, START_SEQ_NO_IDF_PATCHCABLE } from 'projectLineUtility';
import { validateLineConnections_InOnly } from 'projectLineUtility';
import { getSelectedInPatchCable, getInPatchCables, getIdfPatchCables, getSelectedIdfPatchCables, getUsedPatchCableSequences } from 'projectLineUtility';
import { getChangeInPatchborad, getChangeInPatchNo } from 'projectLineUtility';
import { getSamePatchCableName, replacePatchCable } from 'projectLineUtility';
import { successResult } from 'inputCheck';

/**
 * 新設の線番＋線番(2)行コンポーネント（仮登録なし）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onChangeInPatchborad 局入配線盤変更時に呼び出す
 * @param {function} onCopy 局入線番をコピーする
 * @param {function} onClearIdfPatchCables IDF線番クリア時に呼び出す
 * @param {function} onAddIdfPatchCable IDF配線盤選択追加時に呼び出す
 * @param {function} onChangeError IDF線番エラー変更時に呼び出す
 */
export default class LineConnectionSelectForm extends Component {
    
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
            validateInPatchCable: validateLineConnections_InOnly(props.lineConnections, props.usedPatchCables),           
            idfPatchCableErrors: errors,
            modalInfo: { show: false, title: '', message: '' }
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
            const validates = validateLineConnections_InOnly(nextProps.lineConnections, nextProps.usedPatchCables);
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
            const nextError = this.isError(this.isErrorInPatchCable(validates), errors);
            const isErrorChanged = this.isError(this.isErrorInPatchCable(this.state.validateInPatchCable), this.state.idfPatchCableErrors) !== nextError;
            this.setState({
                validateInPatchCable: validates,
                idfPatchCableErrors: errors
            }, () => isErrorChanged && this.onChangeError(nextError));
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, hasWireType, usedPatchCables } =  this.props;
        const { validateInPatchCable, modalInfo } = this.state;
        
        const firstInPatchCables = getInPatchCables(linePatchCableSelections, FIRST_SERIES_NO);
        const secondInPatchCables = getInPatchCables(linePatchCableSelections, SECOND_SERIES_NO);
        const firstInPatchCableSequence = getSelectedInPatchCable(lineConnections, FIRST_SERIES_NO);
        const secondInPatchCableSequence = getSelectedInPatchCable(lineConnections, SECOND_SERIES_NO);
        const firstValidate = validateInPatchCable.find((v) => v.seriesNo === FIRST_SERIES_NO);
        const secondValidate = validateInPatchCable.find((v) => v.seriesNo !== FIRST_SERIES_NO);

        const firstIdfSelections = getIdfPatchCables(linePatchCableSelections, FIRST_SERIES_NO);
        const secondIdfSelections = getIdfPatchCables(linePatchCableSelections, SECOND_SERIES_NO);
        const firstIdfPatchCableSequences = getSelectedIdfPatchCables(lineConnections, FIRST_SERIES_NO);
        const secondIdfPatchCableSequences = getSelectedIdfPatchCables(lineConnections, SECOND_SERIES_NO);
    
        return (
            <div>
                <LineRow
                    seriesKey={FIRST_SERIES_NO}
                    seriesNo={FIRST_SERIES_NO}
                    inPatchCables={firstInPatchCables}
                    inSelectedPatchCable={firstInPatchCableSequence}
                    validateInPatchCable={firstValidate}
                    idfPatchCableSelections={firstIdfSelections}
                    idfSelectedPatchCables={firstIdfPatchCableSequences}
                    usedPatchCables={usedPatchCables}
                    usedPatchCableSequences={getUsedPatchCableSequences(lineConnections, SECOND_SERIES_NO)}
                    onCopy={(seriesNo, patchboardName, no) => this.copyPatchCable(seriesNo, patchboardName, no)}
                    onChangeInPatchborad={(seriesNo,patchboardId, patchboardName) => this.changePatchborad(seriesNo, patchboardId, patchboardName)}
                    onChangeInPatchNo={(seriesNo, patchboardId, patchCableNo) => this.changePatchNo(seriesNo, patchCableNo)}
                    onChangeIdfPatchCable={(seriesNo, seqNo, patchCableSequences, isError) => this.changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError)}
                    onClearIdfPatchCable={(seriesNo, seqNo, patchCableSequences, isError) => this.clearPatchCables(seriesNo, seqNo, patchCableSequences, isError)}
                    onAddIdfPatchCable={(seriesNo, patchboardId, patchCableSequences, isError) => this.addIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                    onChangeError={(seriesNo, isError) => this.changeError(seriesNo, isError)}
                />  
                {hasWireType&&
                    <LineRow
                        seriesKey={SECOND_SERIES_NO}
                        seriesNo={SECOND_SERIES_NO}
                        inPatchCables={secondInPatchCables}
                        inSelectedPatchCable={secondInPatchCableSequence}
                        validateInPatchCable={secondValidate}
                        idfPatchCableSelections={secondIdfSelections}
                        idfSelectedPatchCables={secondIdfPatchCableSequences}
                        usedPatchCables={usedPatchCables}
                        usedPatchCableSequences={getUsedPatchCableSequences(lineConnections, FIRST_SERIES_NO)}
                        onCopy={(seriesNo, patchboardName, no) => this.copyPatchCable(seriesNo, patchboardName, no)}
                        onChangeInPatchborad={(seriesNo,patchboardId, patchboardName) => this.changePatchborad(seriesNo, patchboardId, patchboardName)}
                        onChangeInPatchNo={(seriesNo, patchboardId, patchCableNo) => this.changePatchNo(seriesNo, patchCableNo)}
                        onChangeIdfPatchCable={(seriesNo, seqNo, patchCableSequences, isError) => this.changePatchCableSequences(seriesNo, seqNo, patchCableSequences, isError)}
                        onClearIdfPatchCable={(seriesNo, seqNo, patchCableSequences, isError) => this.clearPatchCables(seriesNo, seqNo, patchCableSequences, isError)}
                        onAddIdfPatchCable={(seriesNo, patchboardId, patchCableSequences, isError) => this.addIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                        onChangeError={(seriesNo, isError) => this.changeError(seriesNo, isError)}
                    />  
                }
                <MessageModal show={modalInfo.show} 
                              title={modalInfo.title} 
                              bsSize="small"
                              buttonStyle="message"
                              onCancel={() => this.hideMessageModal()}>
                    {modalInfo.message && modalInfo.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
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
        const validates = validateLineConnections_InOnly(updates, this.props.usedPatchCables);
        this.onChangeInPatchborad(seriesNo, patchboardId, updates, this.isError(this.isErrorInPatchCable(validates), this.state.idfPatchCableErrors));
    }

    /**
     * 回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(seriesNo, patchCableNo) {
        let updates = getChangeInPatchNo(seriesNo, patchCableNo, this.props.lineConnections);
        const validates = validateLineConnections_InOnly(updates, this.props.usedPatchCables);
        this.onChange(updates, this.isError(this.isErrorInPatchCable(validates), this.state.idfPatchCableErrors));
    }

    /**
     * エラーかどうか
     * @param {array} validates 入力検証
     */
    isErrorInPatchCable(validates) {
        return validates ? validates.some((v) => v.state !== successResult.state) : true;
    }

    //#endregion

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
        }, () => this.onChange(this.getUpdateLineConnections(seriesNo, patchCableSequences), this.isError(this.isErrorInPatchCable(this.state.validateInPatchCable), errors), seriesNo, seqNo));
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
                item.patchCableSequences =  item.patchCableSequences.filter(seq => seq.seqNo === SEQ_NO_IN_PATCHCABLE);
                item.patchCableSequences.push(..._.cloneDeep(patchCableSequences));
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
        }, () => this.onClearIdfPatchCables(seriesNo, seqNo, updates, this.isError(this.isErrorInPatchCable(this.state.validateInPatchCable), errors)));
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
        this.onAddIdfPatchCable(seriesNo, patchboardId, updates, this.isError(this.isErrorInPatchCable(this.state.validateInPatchCable), errors), () => {
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
        const inPatchCableError = this.isErrorInPatchCable(this.state.validateInPatchCable);
        if (this.isError(inPatchCableError, errors) !== this.isError(inPatchCableError, this.state.idfPatchCableErrors)) {
            this.setState({
                idfPatchCableErrors: errors
            }, () => this.onChangeError(this.isError(inPatchCableError, errors)));
        }
    }

    //#endregion

    //#region コピー

    /**
     * 局入線番からIDF線番（一番目）にコピーする
     * @param {number} seriesNo 局入系統No
     * @param {string} patchboardName 配線盤名称
     * @param {number} no 線番番号
     */
    copyPatchCable(seriesNo, patchboardName, no) {
        const { lineConnections: beforeLineConnections } = this.props;
        const patchCable= getSamePatchCableName(seriesNo, START_SEQ_NO_IDF_PATCHCABLE, patchboardName, no, this.props.linePatchCableSelections);
        if (patchCable) {
            const updates = replacePatchCable(seriesNo, START_SEQ_NO_IDF_PATCHCABLE, patchCable, beforeLineConnections);
            const errors = this.getUpdateIdfPatchCableErrors(seriesNo, false);
            const patchboardChanged = !beforeLineConnections.some((c) => c.seriesNo === seriesNo && c.patchCableSequences.some((s) => s.seqNo === START_SEQ_NO_IDF_PATCHCABLE && s.patchboardId === patchCable.patchboardId));
            this.setState({
                idfPatchCableErrors: errors
            }, () => { 
                if (JSON.stringify(updates) !== JSON.stringify(beforeLineConnections)) {
                    this.onCopy(seriesNo, START_SEQ_NO_IDF_PATCHCABLE, updates, this.isError(this.isErrorInPatchCable(this.state.validateInPatchCable), errors), patchboardChanged);
                }
            });
        } else {
            this.showErrorMessageModal('配下に同じIDF線番はありません。');
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
     * 局入配線盤変更イベント呼び出し
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
     */
    onChangeInPatchborad(seriesNo, patchboardId, lineConnections, isError) {
        if (this.props.onChangeInPatchborad) {
            this.props.onChangeInPatchborad(seriesNo, patchboardId, lineConnections, isError);
        }
    }

    /**
     * 局入線番をコピーする
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo クリアする開始回線線番No
     * @param {number} patchboardId 配線盤ID
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
     * @param {boolean} isClear クリアするかどうか
     */
    onCopy(seriesNo, seqNo, lineConnections, isError, isClear) {
        if (this.props.onCopy) {
            this.props.onCopy(seriesNo, seqNo, lineConnections, isError, isClear);
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
     * IDF線番のエラー情報変更時に呼び出す
     * @param {boolean} isError エラーかどうか
     */
    onChangeError(isError) {
        if (this.props.onChangeError) {
            this.props.onChangeError(isError);
        }
    }

    //#endregion

    //#region エラー関連

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
     * @param {boolean} inPatchCableError 局入線番のエラー
     * @param {array} idfPatchCableErrors IDF線番のエラー一覧
     */
    isError(inPatchCableError, idfPatchCableErrors) {
        if (inPatchCableError) {
            return inPatchCableError;
        } else {
            return idfPatchCableErrors ? idfPatchCableErrors.some((v) => v.isError === true) : false;
        }
    }

    //#endregion

    //#region メッセージモーダル

    /**
     * メッセージモーダルを閉じる
     */
    hideMessageModal() {
        this.setState({ modalInfo: { show: false, title: '',  message: '' }});
    }

    /**
     * エラーメッセージを表示する
     * @param {string} message メッセージ
     */
    showErrorMessageModal(message) {
        this.setState({ 
            modalInfo: { 
                show: true, 
                title: 'エラー', 
                buttonStyle:'message', 
                message: message,
            }
        });
    }

    //#endregion
}

/**
 * 線番選択行 
 */
const LineRow = ({ seriesKey, seriesNo,
                   inPatchCables, inSelectedPatchCable, validateInPatchCable, onChangeInPatchborad, onChangeInPatchNo, onCopy,
                   idfPatchCableSelections, idfSelectedPatchCables, usedPatchCables, usedPatchCableSequences, onChangeIdfPatchCable, onClearIdfPatchCable, onAddIdfPatchCable, onChangeError
                }) => {
    const isSelected = inSelectedPatchCable && inSelectedPatchCable.patchboardId && inSelectedPatchCable.patchCableNo;
    return (
        <InputForm.Row>
            <InputForm.Col label={'線番'+ (seriesKey&&seriesKey!==FIRST_SERIES_NO?'(' + seriesKey + ')' : '')} columnCount={1} isRequired>
                <div className="mb-1">
                    <label className="mb-05">局入線番</label>
                    <PatchCableSelectForm copyButton
                        patchCables={inPatchCables}
                        selectedPatchboardId={inSelectedPatchCable&&inSelectedPatchCable.patchboardId}
                        selectedPatchNo={inSelectedPatchCable&&inSelectedPatchCable.patchCableNo&&inSelectedPatchCable.patchCableNo.no}
                        validationState={validateInPatchCable&&validateInPatchCable.state}
                        helpText={validateInPatchCable&&validateInPatchCable.helpText}
                        isReadOnlyCopy={!isSelected}
                        onChangePatchborad={(patchboardId, patchboardName) => onChangeInPatchborad(seriesNo, patchboardId, patchboardName)}
                        onChangePatchNo={(patchCableNo) => onChangeInPatchNo(seriesNo, inSelectedPatchCable.patchboardId, patchCableNo)}
                        onCopy={() => onCopy(seriesNo, inSelectedPatchCable.patchboardName, inSelectedPatchCable.patchCableNo.no)}
                    />
                </div>
                <IdfSequencesSelectForm 
                    patchCableSelections={idfPatchCableSelections?idfPatchCableSelections:[]}
                    selectedPatchCables={idfSelectedPatchCables?idfSelectedPatchCables:[]}
                    usedPatchCables={usedPatchCables}
                    usedPatchCableSequences={usedPatchCableSequences}
                    isReadOnly={!isSelected}
                    isReadOnlyAddButton={!isSelected}
                    onChange={(patchCableSequences, isError, seqNo) => onChangeIdfPatchCable(seriesNo, seqNo, patchCableSequences, isError)}
                    onClear={(seqNo, patchCableSequences, isError) => onClearIdfPatchCable(seriesNo, seqNo, patchCableSequences, isError)}
                    onAdd={(patchboardId, patchCableSequences, isError) => onAddIdfPatchCable(seriesNo, patchboardId, patchCableSequences, isError)}
                    onChangeError={(isError) => onChangeError(seriesNo, isError)}
                />
            </InputForm.Col>
        </InputForm.Row>
    )
}