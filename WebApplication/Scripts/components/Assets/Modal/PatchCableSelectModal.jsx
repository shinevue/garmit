/**
 * @license Copyright 2022 DENSO
 * 
 * PatchCableSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { AddCircleButton , ApplyButton, CancelButton } from 'Assets/GarmitButton';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import { validateSelect, errorResult, VALIDATE_STATE } from 'inputCheck';

const MAX_PATCH_CABLE = 20;
const NOT_SELECTED_NO = -1;

/**
 * 線番選択モーダル
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {boolean} isInPatchCable 局入かどうか
 * @param {array} patchCables 線番情報一覧
 * @param {array} selectedPatchCableConnects 選択中の線番情報一覧
 * @param {function} onSubmit 適用ボタン押下時に呼び出す
 * @param {function} onCancel キャンセルボタン押下時に呼び出す
 */
export default class PatchCableSelectModal extends Component {
    
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        const selectedPatchCableConnects = this.initializeSelectedPatchCableConnects(props.selectedPatchCableConnects);
        this.state = {
            selectedPatchCableConnects: selectedPatchCableConnects,
            validates: this.validates(selectedPatchCableConnects)
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出す
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.selectedPatchCableConnects !== nextProps.selectedPatchCableConnects
            || this.props.showModal !== nextProps.showModal) {
            this.setStateValue(this.initializeSelectedPatchCableConnects(nextProps.selectedPatchCableConnects));
        }
    }


    /**
     * render
     */
    render() {
        const { isInPatchCable, showModal, patchCables } = this.props;
        const { selectedPatchCableConnects, validates } = this.state;
        const invalid = this.invalid(validates);
        const selectedLength = selectedPatchCableConnects.length;
        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>{isInPatchCable ? '局入線番選択' : 'IDF線番選択'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPatchCableConnects.map((connect) => {
                        const validate = validates.find((val) => val.index === connect.index);
                        const isReadOnlyClear = !connect.patchboardId && selectedLength === 1;
                        return <PatchCableSelectForm claerButton isRequiredAllChoice
                                    className="mb-05"
                                    patchCables={patchCables}
                                    selectedPatchboardId={connect.patchboardId}
                                    selectedPatchNo={connect.no}
                                    validationState={validate && validate.state}
                                    helpText={validate && validate.helpText}
                                    isReadOnlyClear={isReadOnlyClear}
                                    onChangePatchborad={(patchboardId, patchboardName) => this.changePatchborad(patchboardId, patchboardName, connect.index)}
                                    onChangePatchNo={(patchCableNo) => this.changePatchNo(patchCableNo, connect.index) }
                                    onClear={() => this.clearPatchCable(connect.index)}
                               />
                    })}
                    {selectedLength<MAX_PATCH_CABLE &&
                        <AddCircleButton disabled={invalid} onClick={() => this.addPatchCable()} />
                    }
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton disabled={invalid} onClick={() => this.handleSubmit()} />
                    <CancelButton onClick={() => this.handleCancel()} />
                </Modal.Footer>
            </Modal>
        )
    }
    
    //#region イベント

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            const patchCableConnects = this.state.selectedPatchCableConnects.map((connect) => { return _.omit(connect, 'index') });
            this.props.onSubmit(patchCableConnects)
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    //#endregion

    //#region 線番変更

    /**
     * 線番を追加する
     */
    addPatchCable(){
        var workConnects = _.cloneDeep(this.state.selectedPatchCableConnects);
        var indexArray = workConnects.map((connect) => connect.index);
        const maxCount = Math.max(...indexArray);
        workConnects.push(this.getNewPatchCableConnect(maxCount + 1));
        this.setStateValue(workConnects);
    }

    /**
     * 線番をクリアする
     * @param {number} index 対象インデックス
     */
    clearPatchCable(index) {
        var workConnects = _.cloneDeep(this.state.selectedPatchCableConnects);
        workConnects = workConnects.filter((connect) => connect.index !== index);
        if (workConnects.length === 0) {
            workConnects.push(this.getNewPatchCableConnect());
        }
        this.setStateValue(workConnects);
    }

    /**
     * 配線盤変更イベント
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     * @param {number} index インデックス
     */
    changePatchborad(patchboardId, patchboardName, index) {
        const workConnects = _.cloneDeep(this.state.selectedPatchCableConnects);
        workConnects.forEach((connect) => {
            if (connect.index === index) {
                connect.patchboardId = patchboardId;
                connect.patchboardName = patchboardName;
                connect.no = NOT_SELECTED_NO;
            }
        });
        this.setStateValue(workConnects);
    }

    /**
     * 線番変更イベント
     * @param {number} patchCableNo 線番番号
     * @param {number} index インデックス
     */
    changePatchNo(patchCableNo, index) {
        const workConnects = _.cloneDeep(this.state.selectedPatchCableConnects);
        workConnects.forEach((connect) => {
            if (connect.index === index) {
                connect.no = patchCableNo;
            }
        });
        this.setStateValue(workConnects);
    }


    //#endregion

    //#region 入力検証

    /**
     * 線番一覧の入力検証
     * @param {array} connects 線番一覧
     */
    validates(connects) {
        return connects.map((connect) => {
            let validate = this.validate(connect, connects);
            validate.index = connect.index;
            return validate;
        });
    }

    /**
     * 線番情報の入力検証
     * @param {object} connect 線番情報
     * @param {array} patchCableConnects 現在選択中の線番情報リスト
     */
    validate(connect, patchCableConnects) {
        var validate = this.validatePatchboard(connect);
        if (validate.state === VALIDATE_STATE.success) {
            validate = this.validatePatchCableNo(connect);
        }
        if (validate.state === VALIDATE_STATE.success && this.isPatchCableSelected(connect.no)) {
            const isDuplicate = patchCableConnects.some((cable) => {
                if (cable.index !== connect.index && cable.patchboardId === connect.patchboardId) {
                    if (connect.no === null) {
                        return this.isPatchCableSelected(cable.no);
                    } else {
                        return cable.no === null || cable.no === connect.no;
                    }
                }
                return false;
            })
            if (isDuplicate) {
                validate = errorResult('線番が重複しています。');
            }          
        }
        return _.cloneDeep(validate);
    }
    
    /**
     * 配線盤選択の入力検証
     * @param {object} connect 線番情報
     */
     validatePatchboard(connect) {
        var validate = validateSelect(connect.patchboardId);
        if (validate.state === VALIDATE_STATE.error) {
            validate.helpText = '配線盤は' + validate.helpText;
        }
        return validate;
    }

    /**
     * 線番選択の入力検証
     * @param {object} connect 線番情報
     */
    validatePatchCableNo(connect) {
        var validate = connect.no !== null ? validateSelect(connect.no) : { state: VALIDATE_STATE.success };
        if (validate.state === VALIDATE_STATE.error) {
            validate.helpText = '線番は' + validate.helpText;
        }        
        return validate;
    }

    /**
     * 適用ボタンが無効かどうか
     * @param {array} validate 入力検証一覧
     */
    invalid(validates) {
        return validates.some((validate) => validate.state !== VALIDATE_STATE.success);
    }

    //#endregion

    //#region その他

    /**
     * state値をセットする
     * @param {array} connects 線番一覧
     */
    setStateValue(connects) {        
        this.setState({
            selectedPatchCableConnects: connects,
            validates: this.validates(connects)
        });
    }

    /**
     * 選択中の線番一覧を初期化する
     * @param {array} connects 線番一覧(indexなし)
     */    
    initializeSelectedPatchCableConnects(connects) {
        let selectedConnects = [ this.getNewPatchCableConnect() ];
        if (connects && connects.length > 0) {
            selectedConnects = this.getInitialSelectedPatchCableConnects(connects);
        }
        return selectedConnects;
    }

    /**
     * 初期化した選択中の線番一覧を取得する
     * @param {array} connects 線番一覧(indexなし)
     */
    getInitialSelectedPatchCableConnects(connects) {
        var index = 1;
        var workConnects = connects.map((connect) => {
            connect.index = index;
            index++;
            return connect;
        });
        return workConnects;
    }

    /**
     * 線番情報未選択時の初期線番情報を取得する
     */
    getNewPatchCableConnect(index = 1) {
        var connect = {
            index: index,
            patchboardId: null,
            patchboardName: null,
            no: NOT_SELECTED_NO
        }
        return connect;
    }

    /**
     * 線番が選択済みかどうか
     * @param {*} no 線番番号
     */
    isPatchCableSelected(no) {
        return (no >= 0 || no === null)
    }

    //#endregion
}