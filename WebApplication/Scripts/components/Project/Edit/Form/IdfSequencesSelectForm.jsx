/**
 * @license Copyright 2022 DENSO
 * 
 * IdfSequencesSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import { AddCircleButton } from 'Assets/GarmitButton';
import { validatePatchCableSequence, START_SEQ_NO_IDF_PATCHCABLE, MAX_IDF_PATCH_CABLE } from 'projectLineUtility';
import { VALIDATE_STATE } from 'inputCheck';

/**
 * IDF線番セレクトボックスリスト（追加あり）
 * @param {array} patchCableSelections IDF線番セレクトボックスの選択肢一覧
 * @param {array} selectedPatchCables 選択中のIDF線番一覧
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {array} usedPatchCableSequences 現在選択中の線番情報リスト（回線選択モーダル内の他の回線で使用中）
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isReadOnlyAddButton 追加ボタンが読み取り専用かどうか
 * @param {string} addIdfLabelText タイトルに追加する文字列
 * @param {string} className クラス名
 * @param {function} onChange 配線盤・線番変更時に呼び出す
 * @param {function} onClear クリアボタンクリック時に呼び出す
 * @param {function} onAdd 追加ボタンクリック時に呼び出す
 * @param {function} onChangeError エラーかどうかが変更されたときに呼び出す
 */
export default class IdfSequencesSelectForm extends Component {
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        const validates = this.validate(props.selectedPatchCables, props.usedPatchCables, props.usedPatchCableSequences);
        this.state = { 
            validates: validates
        };
        this.onChangeError(this.isError(validates));
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.selectedPatchCables) !== JSON.stringify(this.props.selectedPatchCables) ||
            JSON.stringify(nextProps.usedPatchCableSequences) !== JSON.stringify(this.props.usedPatchCableSequences)) {
            const validates = this.validate(nextProps.selectedPatchCables, nextProps.usedPatchCables, nextProps.usedPatchCableSequences);
            if (JSON.stringify(validates) !== JSON.stringify(this.state.validates)) {
                this.setState({
                    validates: validates
                }, () => this.onChangeError(this.isError(validates)));
            }
        }
    }

    /**
     * render
     */
    render() {
        const { className, patchCableSelections, selectedPatchCables, isReadOnly, isReadOnlyAddButton, addIdfLabelText } = this.props;
        const { validates } = this.state;
        const addText = addIdfLabelText || '';
        const addButtonDisabled = validates ? validates.some((v) => v.state !== VALIDATE_STATE.success) : true;
        return (
            <div className={className}>
                <label className="mb-05">{'IDF線番'+addText}</label>
                {patchCableSelections.map((selection, index) => {
                    const seqNo = index + 2
                    const selectedPatchCable = selectedPatchCables.find((patchCable) => patchCable.seqNo === seqNo);
                    const selectedValidate = validates && validates.find((val) => val.seqNo === seqNo);
                    const isReadOnlyClear = (seqNo === START_SEQ_NO_IDF_PATCHCABLE && !(selectedPatchCable&&selectedPatchCable.patchboardId)) ? true : false;        //seqNo=2のときだけ選択してるかチェック
                    return <PatchCableSelectForm claerButton
                                className="mb-05" 
                                patchCables={selection.patchCables}
                                isReadOnly={isReadOnly}
                                isReadOnlyClear={isReadOnlyClear}
                                selectedPatchboardId={selectedPatchCable&&selectedPatchCable.patchboardId}
                                selectedPatchNo={selectedPatchCable&&selectedPatchCable.patchCableNo&&selectedPatchCable.patchCableNo.no}
                                validationState={selectedValidate&&selectedValidate.state}
                                helpText={selectedValidate&&selectedValidate.helpText}
                                onChangePatchborad={(patchboardId, patchboardName) => this.changePatchborad(seqNo, patchboardId, patchboardName)}
                                onChangePatchNo={(patchCableNo) => this.changePatchNo(seqNo, patchCableNo)}
                                onClear={() => this.clearLineConnection(seqNo)}
                            />
                })}                        
                {patchCableSelections&&patchCableSelections.length<MAX_IDF_PATCH_CABLE &&
                    <AddCircleButton disabled={isReadOnly||addButtonDisabled||isReadOnlyAddButton} onClick={() => this.addPatchCable(selectedPatchCables[selectedPatchCables.length - 1].patchboardId)} />
                }
            </div>
        );
    }

    /**
     * 配線盤選択の変更
     * @param {number} seqNo 回線線番No
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     */
    changePatchborad(seqNo, patchboardId, patchboardName) {
        let updates = _.cloneDeep(this.props.selectedPatchCables);
        updates.forEach((cable) => {
            if (cable.seqNo === seqNo) {
                cable.patchboardId = patchboardId;
                cable.patchboardName = patchboardName;
                cable.patchCableNo = null;
            } else if (cable.seqNo > seqNo) {
                cable.patchboardId = null;
                cable.patchboardName = null;
                cable.patchCableNo = null;
            }
        })
        if (!updates.some((cable) => cable.seqNo === seqNo)) {
            updates.push({
                seqNo: seqNo,
                patchboardId: patchboardId,
                patchboardName: patchboardName,
                patchCableNo: null
            });
        }
        updates = updates.filter((cable) => (cable.seqNo <= seqNo));
        this.onChange(updates, seqNo);
    }

    /**
     * 回線線番選択の変更
     * @param {number} seqNo 回線線番No
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(seqNo, patchCableNo) {
        let updates = _.cloneDeep(this.props.selectedPatchCables);
        updates.forEach((cable) => {
            if (cable.seqNo === seqNo) {
                cable.patchCableNo = { no: patchCableNo };
            }
        });
        this.onChange(updates);
    }

    /**
     * 回線線番をクリアする
     * @param {number} seqNo 回線線番No
     */
    clearLineConnection(seqNo) {
        let updates = _.cloneDeep(this.props.selectedPatchCables);
        updates = updates.filter((cable) => (cable.seqNo < seqNo));
        if (seqNo === START_SEQ_NO_IDF_PATCHCABLE) {
            updates.push({
                seqNo: START_SEQ_NO_IDF_PATCHCABLE,
                patchboardId: null,
                patchboardName: null,
                patchCableNo: null
            });
        }
        this.onClear((seqNo === START_SEQ_NO_IDF_PATCHCABLE) ? seqNo + 1 : seqNo, updates);
    }

    /**
     * 回線線番を追加する
     * @param {number} patchboardId 配線盤ID
     */
    addPatchCable(patchboardId) {   
        let updates = _.cloneDeep(this.props.selectedPatchCables);
        const seqNos = updates.map((item) => item.seqNo);
        const maxSeqNo = seqNos.length > 0 ? Math.max.apply(null, seqNos) : START_SEQ_NO_IDF_PATCHCABLE;
        updates.push({
            seqNo: maxSeqNo + 1,
            patchboardId: null,
            patchboardName: null,
            patchCableNo: null
        });
        this.onAdd(patchboardId, updates);
    }

    /**
     * 入力検証
     * @param {object} sequence 回線線番情報
     * @param {array} usedPatchCables 使用中の回線一覧
     * @param {array} usedPatchCableSequences 現在選択中の線番情報リスト
     */
    validate(sequences, usedPatchCables, usedPatchCableSequences) {
        var validates = [];
        sequences.forEach((sequence) => {
            var usedSequences = _.cloneDeep(usedPatchCableSequences);
            sequences.forEach((cable) => {
                if (cable.seqNo !== sequence.seqNo) {
                    usedSequences.push(_.cloneDeep(cable));
                }
            })
            validates.push(validatePatchCableSequence(sequence, usedPatchCables, usedSequences));
        })
        return validates;
    }

    
    /**
     * エラーかどうか
     * @param {object} validates 入力検証結果
     * @returns {boolean} エラーかどうか
     */
    isError(validates) {
        return validates.some((val) => val.state !== VALIDATE_STATE.success);
    }

    
    /**
     * 配線盤・線番変更
     * @param {array} patchCableSequences 変更後の配線盤・線番一覧
     * @param {number} seqNo 回線線番No
     */
    onChange(patchCableSequences, seqNo = null) {
        const validates = this.validate(patchCableSequences, this.props.usedPatchCables, this.props.usedPatchCableSequences);   
        if (this.props.onChange) {
            this.props.onChange(patchCableSequences, this.isError(validates), seqNo)
        }
    }

    /**
     * クリアボタンクリック
     * @param {number} seqNo 回線線番No（引数以下のセレクトボックスをクリア）
     * @param {array} patchCableSequences 変更後の配線盤・線番一覧
     */
    onClear(seqNo, patchCableSequences) { 
        const validates = this.validate(patchCableSequences, this.props.usedPatchCables, this.props.usedPatchCableSequences);   
        if (this.props.onClear) {
            this.props.onClear(seqNo, patchCableSequences, this.isError(validates))
        }
    }

    /**
     * 追加ボタンクリック
     * @param {number} patchboardId 追加時の最下層の配線盤ID
     * @param {array} patchCableSequences 変更後の配線盤・線番一覧
     */
    onAdd(patchboardId, patchCableSequences) {   
        const validates = this.validate(patchCableSequences, this.props.usedPatchCables, this.props.usedPatchCableSequences);
        if (this.props.onAdd) {
            this.props.onAdd(patchboardId, patchCableSequences, this.isError(validates));
        }
    }

    /**
     * エラーかどうかが変更されたときに呼び出す
     * @param {boolean} isError エラーかどうか
     */
    onChangeError(isError) {
        if (this.props.onChangeError) {
            this.props.onChangeError(isError);
        }
    }
}