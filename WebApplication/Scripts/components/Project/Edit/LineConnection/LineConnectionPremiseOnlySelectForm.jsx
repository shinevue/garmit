/**
 * @license Copyright 2022 DENSO
 * 
 * LineConnectionPremiseOnlySelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import IdfConnectSearchForm from 'Project/Edit/Form/IdfConnectSearchForm';
import IdfConnectLabelForm from 'Project/Edit/Form/IdfConnectLabelForm';
import MessageModal from 'Assets/Modal/MessageModal';
import SearchAlert from './SearchAlert';
import { FIRST_SERIES_NO, SECOND_SERIES_NO, SEQ_NO_IN_PATCHCABLE, START_SEQ_NO_IDF_PATCHCABLE } from 'projectLineUtility';
import { validateLineConnections } from 'projectLineUtility';
import { getSelectedInPatchCable, getInPatchCables, getIdfPatchCablesBySeqNo, getSelectedIdfPatchCables, getSelectedEndIdfPatchCables, getSelectedRelPatchCables } from 'projectLineUtility';
import { getChangeIdfPatchborad, getChangeIdfPatchNo } from 'projectLineUtility';
import { getSamePatchCableName, replacePatchCable, hasPatchCables } from 'projectLineUtility';
import { VALIDATE_STATE } from 'inputCheck';

/**
 * 新設の線番＋線番(2)行コンポーネント（仮登録方法：構内のみ）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {boolean} notSearched 未検索かどうか
 * @param {number} firstSeriesNo 線番(1)の局入系統No
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onChangeIdfPatchCable IDF線番変更時に呼び出す（検索条件のIDF線番変更時）
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 * @param {function} onChangeError エラー変更時に呼び出す
 */
export default class LineConnectionPremiseOnlySelectForm extends Component {
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        this.state = { 
            validates: validateLineConnections(props.lineConnections, props.usedPatchCables),
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
            const validates = validateLineConnections(nextProps.lineConnections, nextProps.usedPatchCables);
            const nextError = this.isError(validates);            
            const isErrorChanged = this.isError(this.state.validates) !== nextError;            
            this.setState({
                validates: validates,
            }, () => isErrorChanged && this.onChangeError(nextError));
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, hasWireType, firstSeriesNo, notSearched } =  this.props;
        const { validates, modalInfo } = this.state;
        const secondSeriesNo = firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO;
        
        const firstInPatchCables = getInPatchCables(linePatchCableSelections, firstSeriesNo);
        const secondInPatchCables = getInPatchCables(linePatchCableSelections, secondSeriesNo);
        const firstInPatchCableSequence = getSelectedInPatchCable(lineConnections, firstSeriesNo);
        const secondInPatchCableSequence = getSelectedInPatchCable(lineConnections, secondSeriesNo);

        const firstIdfPatchCableSequence = getSelectedEndIdfPatchCables(lineConnections, firstSeriesNo);
        const firstRelPatchCableSequences = getSelectedRelPatchCables(lineConnections, firstSeriesNo);
        const secondPatchCableSequences = getSelectedIdfPatchCables(lineConnections, secondSeriesNo);
        const firstIdfSelections = firstIdfPatchCableSequence ? getIdfPatchCablesBySeqNo(linePatchCableSelections, firstSeriesNo, firstIdfPatchCableSequence.seqNo) : [];

        const firstValidateInPatchCable = this.getValidate(firstSeriesNo, SEQ_NO_IN_PATCHCABLE, validates);
        const secondValidateInPatchCable = this.getValidate(secondSeriesNo, SEQ_NO_IN_PATCHCABLE, validates);
        const validateIdfPatchCable = this.getValidate(firstSeriesNo, START_SEQ_NO_IDF_PATCHCABLE, validates);

        const isSelected = firstIdfPatchCableSequence && firstIdfPatchCableSequence.patchboardId && firstIdfPatchCableSequence.patchCableNo;
        const isSearchedFirst = hasPatchCables(firstInPatchCables);
        const isSearchedSecond = hasPatchCables(secondInPatchCables);

        const searchable = validateIdfPatchCable && validateIdfPatchCable.state === VALIDATE_STATE.success;

        return (
            <div>
                <InputForm.Row>
                    <InputForm.Col label="線番" columnCount={1} isRequired>
                        <SearchAlert show={notSearched} />
                        <div className="mb-1">
                            <label className="mb-05">局入線番</label>
                            <PatchCableSelectForm
                                patchCables={firstInPatchCables}
                                selectedPatchboardId={firstInPatchCableSequence&&firstInPatchCableSequence.patchboardId}
                                selectedPatchNo={firstInPatchCableSequence&&firstInPatchCableSequence.patchCableNo&&firstInPatchCableSequence.patchCableNo.no}
                                validationState={firstValidateInPatchCable&&firstValidateInPatchCable.state}
                                helpText={firstValidateInPatchCable&&firstValidateInPatchCable.helpText}
                                isReadOnly={!isSearchedFirst}
                                onChangePatchborad={(patchboardId, patchboardName) => this.changeInPatchborad(firstSeriesNo, patchboardId, patchboardName)}
                                onChangePatchNo={(patchCableNo) => this.changeInPatchNo(firstSeriesNo, patchCableNo)}
                            />
                        </div>
                        <IdfConnectSearchForm
                            copyButton
                            searchButton
                            patchCables={firstIdfSelections}
                            selectedPatchCable={firstIdfPatchCableSequence}
                            relPatchCables={firstRelPatchCableSequences}
                            validate={validateIdfPatchCable}
                            isReadOnlyCopy={!isSearchedFirst}
                            isReadOnlySearch={!isSelected||!searchable}
                            onChangePatchborad={(patchboardId, patchboardName) => this.changeIdfPatchborad(firstSeriesNo, patchboardId, patchboardName)}
                            onChangePatchNo={(patchCableNo, patchboardId, patchboardName) => this.changeIdfPatchNo(firstSeriesNo, patchboardId, patchboardName, patchCableNo)}
                            onCopy={(patchboardName, no) => this.copyPatchCable(firstSeriesNo, patchboardName, no)}
                            onSearch={(patchCableSequence) => this.onSearch(patchCableSequence)}
                        />
                    </InputForm.Col>
                </InputForm.Row>
                {hasWireType&&
                    <InputForm.Row>
                        <InputForm.Col label="線番(2)" columnCount={1} isRequired>
                            <div className="mb-1">
                                <label className="mb-05">局入線番</label>
                                <PatchCableSelectForm
                                    patchCables={secondInPatchCables}
                                    selectedPatchboardId={secondInPatchCableSequence&&secondInPatchCableSequence.patchboardId}
                                    selectedPatchNo={secondInPatchCableSequence&&secondInPatchCableSequence.patchCableNo&&secondInPatchCableSequence.patchCableNo.no}
                                    validationState={secondValidateInPatchCable&&secondValidateInPatchCable.state}
                                    helpText={secondValidateInPatchCable&&secondValidateInPatchCable.helpText}
                                    isReadOnly={!isSearchedSecond}
                                    onChangePatchborad={(patchboardId, patchboardName) => this.changeInPatchborad(secondSeriesNo, patchboardId, patchboardName)}
                                    onChangePatchNo={(patchCableNo) => this.changeInPatchNo(secondSeriesNo, patchCableNo)}
                                />
                            </div>
                            <IdfConnectLabelForm copyButton
                                patchCableSequences={secondPatchCableSequences}
                                isReadOnly={!isSearchedSecond}
                                onCopy={(patchboardName, no) => this.copyPatchCable(secondSeriesNo, patchboardName, no)}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
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
    changeInPatchborad(seriesNo, patchboardId, patchboardName) {
        let updates = this.getChangeInPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections);
        const validates = validateLineConnections(updates, this.props.usedPatchCables);
        this.onChange(updates, this.isError(validates));
    }

    /**
     * 回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchCableNo 回線線番
     */
    changeInPatchNo(seriesNo, patchCableNo) {
        let updates = this.getChangeInPatchNo(seriesNo, patchCableNo, this.props.lineConnections);
        const validates = validateLineConnections(updates, this.props.usedPatchCables);
        this.onChange(updates, this.isError(validates));
    }

    /**
     * 配線盤選択の変更（局入線番のみ）
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     * @param {array} beforeLineConnections 変更前の回線線番情報
     */
    getChangeInPatchborad(seriesNo, patchboardId, patchboardName, beforeLineConnections) {
        let updates = _.cloneDeep(beforeLineConnections);
        updates.forEach((item) => {
            if (item.seriesNo === seriesNo) {                
                item.patchCableSequences.forEach((cable) => {
                    if (cable.seqNo === SEQ_NO_IN_PATCHCABLE) {
                        cable.patchboardId = patchboardId;
                        cable.patchboardName = patchboardName;
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
            }
        });
        return updates;
    }

    /**
     * 回線線番選択の変更（局入線番）
     * @param {number} seriesNo 局入系統No
     * @param {number} patchCableNo 回線線番
     * @param {array} beforeLineConnections 変更前の回線線番情報
     */
    getChangeInPatchNo(seriesNo, patchCableNo, beforeLineConnections) {
        let updates = _.cloneDeep(beforeLineConnections);
        updates.forEach((item) => {
            if (item.seriesNo === seriesNo) {
                item.patchCableSequences.forEach((cable) => {
                    if (cable.seqNo === SEQ_NO_IN_PATCHCABLE) {
                        cable.patchCableNo = { no: patchCableNo };
                    }
                });
            }
        });
        return updates;
    }

    //#endregion

    //#region IDF線番関連

    /**
     * IDF配線盤選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     */
    changeIdfPatchborad(seriesNo, patchboardId, patchboardName) {
        let updates = getChangeIdfPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections);
        const validates = validateLineConnections(updates, this.props.usedPatchCables);
        this.onChangeIdfPatchCable(updates, this.isError(validates));
    }

    /**
     * IDF回線線番選択の変更
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     * @param {number} patchCableNo 回線線番
     */
    changeIdfPatchNo(seriesNo, patchboardId, patchboardName, patchCableNo) {
        let updates = getChangeIdfPatchNo(seriesNo, patchboardId, patchboardName, patchCableNo, this.props.lineConnections);
        const validates = validateLineConnections(updates, this.props.usedPatchCables);
        this.onChangeIdfPatchCable(updates, this.isError(validates));
    }

    //#endregion

    //#region コピー

    /**
     * IDF線番からIDF線番（一番目）にコピーする
     * @param {number} seriesNo 局入系統No
     * @param {string} patchboardName 配線盤名称
     * @param {number} no 線番番号
     */
    copyPatchCable(seriesNo, patchboardName, no) {
        const { lineConnections: beforeLineConnections } = this.props;
        const patchCable= getSamePatchCableName(seriesNo, SEQ_NO_IN_PATCHCABLE, patchboardName, no, this.props.linePatchCableSelections);
        if (patchCable) {
            const updates = replacePatchCable(seriesNo, SEQ_NO_IN_PATCHCABLE, patchCable, beforeLineConnections);
            const validates = validateLineConnections(updates, this.props.usedPatchCables);
            this.setState({
                validates: validates
            }, () => { 
                if (JSON.stringify(updates) !== JSON.stringify(beforeLineConnections)) {
                    this.onChange(updates, this.isError(validates));
                }
            });

        } else {
            this.showErrorMessageModal('同じ局入線番はありません。');
        }
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

    /**
     * IDF線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
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

    /**
     * エラー情報変更時に呼び出す
     * @param {boolean} isError エラーかどうか
     */
    onChangeError(isError) {
        if (this.props.onChangeError) {
            this.props.onChangeError(isError);
        }
    }
    
    //#endregion

    //#region エラーや入力検証関連

    /**
     * 指定された入力検証結果を取得する
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo クリアする開始回線線番No
     * @param {array} validates 入力検証結果
     */
    getValidate(seriesNo, seqNo, validates) {
        const validate = validates.find((v) => v.seriesNo === seriesNo);
        return validate && validate.validates.find((v) => v.seqNo === seqNo);
    }

    /**
     * エラーかどうか
     * @param {array} vaildates 入力検証結果
     */
    isError(vaildates) {
        return vaildates.some((val) => val.validates.some((v) => v.state !== VALIDATE_STATE.success));
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