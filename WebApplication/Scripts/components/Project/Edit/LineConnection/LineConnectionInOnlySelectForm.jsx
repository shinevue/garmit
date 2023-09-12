/**
 * @license Copyright 2022 DENSO
 * 
 * LineConnectionInOnlySelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import IdfSequencesSelectForm from 'Project/Edit/Form/IdfSequencesSelectForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import PatchCableLabelForm from 'Project/Edit/Form/PatchCableLabelForm';
import MessageModal from 'Assets/Modal/MessageModal';
import SearchAlert from './SearchAlert';
import { FIRST_SERIES_NO, SECOND_SERIES_NO, START_SEQ_NO_IDF_PATCHCABLE, SEQ_NO_IN_PATCHCABLE } from 'projectLineUtility';
import { getLineConnections, validateLineConnection_InOnly } from 'projectLineUtility';
import { getSelectedInPatchCable, getInPatchCables, getIdfPatchCables, getSelectedIdfPatchCables, getUsedPatchCableSequences } from 'projectLineUtility';
import { getChangeInPatchborad, getChangeInPatchNo } from 'projectLineUtility';
import { getSamePatchCableName, replacePatchCable, hasIdfSelctions } from 'projectLineUtility';
import { successResult } from 'inputCheck';


/**
 * 新設の線番＋線番(2)行コンポーネント（仮登録方法：局入のみ）
 * @param {array} lineConnections 選択中の線番
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {boolean} hasWireType ワイヤ種別ありかどうか
 * @param {boolean} notSearched 未検索かどうか
 * @param {number} firstSeriesNo 線番(1)の局入系統No
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onChangeInPatchCable 局入線番変更時に呼び出す
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 * @param {function} onCopy 局入線番をコピーする
 * @param {function} onClearIdfPatchCables IDF線番クリア時に呼び出す
 * @param {function} onAddIdfPatchCable IDF配線盤選択追加時に呼び出す
 * @param {function} onChangeError IDF線番エラー変更時に呼び出す
 */
export default class LineConnectionInOnlySelectForm extends Component {
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        const fisrtLineConnection = getLineConnections(props.lineConnections, props.firstSeriesNo);
        var idfPatchCableErrors = [{
            seriesNo: props.firstSeriesNo,
            isError: true
        }];
        props.hasWireType && idfPatchCableErrors.push({ seriesNo: props.firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO, isError: true });
        this.state = { 
            validateInPatchCable: validateLineConnection_InOnly(fisrtLineConnection, props.usedPatchCables, props.lineConnections),
            idfPatchCableErrors: idfPatchCableErrors,
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
            
            const fisrtLineConnection = getLineConnections(nextProps.lineConnections, nextProps.firstSeriesNo);
            const validate = validateLineConnection_InOnly(fisrtLineConnection, nextProps.usedPatchCables, nextProps.lineConnections);
            
            const isErrorChanged = this.isError(this.state.validateInPatchCable, this.state.idfPatchCableErrors) !== this.isError(validate, errors);
            
            this.setState({
                validateInPatchCable: validate,
                idfPatchCableErrors: errors
            }, () => isErrorChanged && this.onChangeError(this.isError(validate, errors)));
        }
    }

    /**
     * render
     */
    render() {
        const { lineConnections, linePatchCableSelections, hasWireType, usedPatchCables, firstSeriesNo, notSearched } =  this.props;
        const { validateInPatchCable, modalInfo } = this.state;
        const secondSeriesNo = firstSeriesNo === FIRST_SERIES_NO ? SECOND_SERIES_NO : FIRST_SERIES_NO;
        
        const firstInPatchCables = getInPatchCables(linePatchCableSelections, firstSeriesNo);
        const firstInPatchCableSequence = getSelectedInPatchCable(lineConnections, firstSeriesNo);
        const secondInPatchCableSequence = getSelectedInPatchCable(lineConnections, secondSeriesNo);

        const firstIdfSelections = getIdfPatchCables(linePatchCableSelections, firstSeriesNo);
        const secondIdfSelections = getIdfPatchCables(linePatchCableSelections, secondSeriesNo);
        const firstIdfPatchCableSequences = getSelectedIdfPatchCables(lineConnections, firstSeriesNo);
        const secondIdfPatchCableSequences = getSelectedIdfPatchCables(lineConnections, secondSeriesNo);

        const isSelected = firstInPatchCableSequence && firstInPatchCableSequence.patchboardId && firstInPatchCableSequence.patchCableNo;
        const isSearchedFirst = hasIdfSelctions(firstIdfSelections);
        const isSearchedSecond = hasIdfSelctions(secondIdfSelections);

        const searchable = validateInPatchCable && !(this.isErrorInPatchCable(validateInPatchCable))

        return (
            <div>
                <InputForm.Row>
                    <InputForm.Col label="線番" columnCount={1} isRequired>
                        <SearchAlert show={notSearched} />
                        <div className="mb-1">
                            <label className="mb-05">局入線番</label>
                            <PatchCableSelectForm
                                copyButton
                                searchButton
                                patchCables={firstInPatchCables}
                                selectedPatchboardId={firstInPatchCableSequence&&firstInPatchCableSequence.patchboardId}
                                selectedPatchNo={firstInPatchCableSequence&&firstInPatchCableSequence.patchCableNo&&firstInPatchCableSequence.patchCableNo.no}
                                validationState={validateInPatchCable&&validateInPatchCable.state}
                                helpText={validateInPatchCable&&validateInPatchCable.helpText}
                                isReadOnlyCopy={!isSearchedFirst}
                                isReadOnlySearch={!isSelected||!searchable}
                                onChangePatchborad={(patchboardId, patchboardName) => this.changePatchborad(firstSeriesNo, patchboardId, patchboardName)}
                                onChangePatchNo={(patchCableNo) => this.changePatchNo(firstSeriesNo, patchCableNo)}
                                onCopy={() => this.copyPatchCable(firstSeriesNo, firstInPatchCableSequence.patchboardName, firstInPatchCableSequence.patchCableNo.no)}
                                onSearch={() => this.onSearch(firstInPatchCableSequence)}
                            />
                        </div>
                        <IdfSequencesSelectForm 
                            patchCableSelections={firstIdfSelections?firstIdfSelections:[]}
                            selectedPatchCables={firstIdfPatchCableSequences?firstIdfPatchCableSequences:[]}
                            usedPatchCables={usedPatchCables}
                            usedPatchCableSequences={getUsedPatchCableSequences(lineConnections, secondSeriesNo)}
                            isReadOnly={!isSearchedFirst}
                            onChange={(patchCableSequences, isError, seqNo) => this.changePatchCableSequences(firstSeriesNo, seqNo, patchCableSequences, isError)}
                            onClear={(seqNo, patchCableSequences, isError) => this.clearPatchCables(firstSeriesNo, seqNo, patchCableSequences, isError)}
                            onAdd={(patchboardId, patchCableSequences, isError) => this.addIdfPatchCable(firstSeriesNo, patchboardId, patchCableSequences, isError)}
                            onChangeError={(isError) => this.changeError(firstSeriesNo, isError)}
                        />
                    </InputForm.Col>
                </InputForm.Row>
                {hasWireType&&
                    <InputForm.Row>
                        <InputForm.Col label="線番(2)" columnCount={1} isRequired>
                            <PatchCableLabelForm copyButton
                                className="mb-1"
                                label="局入線番"
                                patchCableSequence={secondInPatchCableSequence}
                                isReadOnly={!isSearchedSecond}
                                onCopy={() => this.copyPatchCable(secondSeriesNo, secondInPatchCableSequence.patchboardName, secondInPatchCableSequence.patchCableNo.no)}
                            />
                            <IdfSequencesSelectForm 
                                patchCableSelections={secondIdfSelections?secondIdfSelections:[]}
                                selectedPatchCables={secondIdfPatchCableSequences?secondIdfPatchCableSequences:[]}
                                usedPatchCables={usedPatchCables}
                                usedPatchCableSequences={getUsedPatchCableSequences(lineConnections, firstSeriesNo)}
                                isReadOnly={!isSearchedSecond}
                                onChange={(patchCableSequences, isError, seqNo) => this.changePatchCableSequences(secondSeriesNo, seqNo, patchCableSequences, isError)}
                                onClear={(seqNo, patchCableSequences, isError) => this.clearPatchCables(secondSeriesNo, seqNo, patchCableSequences, isError)}
                                onAdd={(patchboardId, patchCableSequences, isError) => this.addIdfPatchCable(secondSeriesNo, patchboardId, patchCableSequences, isError)}
                                onChangeError={(isError) => this.changeError(secondSeriesNo, isError)}
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
    changePatchborad(seriesNo, patchboardId, patchboardName) {
        let updates = getChangeInPatchborad(seriesNo, patchboardId, patchboardName, this.props.lineConnections, true);
        const fisrtLineConnection = getLineConnections(updates, this.props.firstSeriesNo);        
        const validate = validateLineConnection_InOnly(fisrtLineConnection, this.props.usedPatchCables, updates);
        this.onChangeInPatchCable(updates, this.isError(validate, this.state.idfPatchCableErrors), seriesNo);
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
        this.onChangeInPatchCable(updates, this.isError(validate, this.state.idfPatchCableErrors), seriesNo);
    }

    /**
     * エラーかどうか
     * @param {array} validate 入力検証
     */
    isErrorInPatchCable(validate) {
        return validate.state !== successResult.state;
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
        }, () => this.onChange(this.getUpdateLineConnections(seriesNo, patchCableSequences), this.isError(this.state.validateInPatchCable, errors), seriesNo, seqNo));
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
        }, () => this.onClearIdfPatchCables(seriesNo, seqNo, updates, this.isError(this.state.validateInPatchCable, errors)));
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
        this.onAddIdfPatchCable(seriesNo, patchboardId, updates, this.isError(this.state.validateInPatchCable, errors), () => {
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
        if (this.isError(this.state.validateInPatchCable, errors) !== this.isError(this.state.validateInPatchCable, this.state.idfPatchCableErrors)) {
            this.setState({
                idfPatchCableErrors: errors
            }, () => {
                if (this.props.onChangeError) {
                    this.props.onChangeError(this.isError(this.state.validateInPatchCable, errors));
                }
            });

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
                    this.onCopy(seriesNo, START_SEQ_NO_IDF_PATCHCABLE, updates, this.isError(this.state.validateInPatchCable, errors), patchboardChanged);
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
     * 局入線番変更イベント呼び出し
     * @param {array} lineConnections 変更後のLineConnections
     * @param {boolean} isError エラーどうか
     * @param {number} seriesNo 局入系統No
     */
    onChangeInPatchCable(lineConnections, isError, seriesNo) {
        if (this.props.onChangeInPatchCable) {
            this.props.onChangeInPatchCable(lineConnections, isError, seriesNo, SEQ_NO_IN_PATCHCABLE);
        }
    }

    /**
     * 局入線番をコピーする
     * @param {number} seriesNo 局入系統No
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
     * @param {object} validateInPatchCable 局入線番の入力検証結果
     * @param {array} idfPatchCableErrors IDF線番のエラー一覧
     */
    isError(validateInPatchCable, idfPatchCableErrors) {
        var isErrorInPatchCable = this.isErrorInPatchCable(validateInPatchCable);
        if (isErrorInPatchCable) {
            return isErrorInPatchCable;
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