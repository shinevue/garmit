/**
 * Copyright 2019 DENSO Solutions
 * 
 * 確認モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal, ControlLabel, FormGroup, Checkbox, HelpBlock } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import TextareaForm from 'Common/Form/TextareaForm';
import UnlockPurposeSelectForm from 'Assets/Form/UnlockPurposeSelectForm';
import ExtendedItemFormList from 'Assets/ExtendedItemFormList';

import { validateTextArea, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { isErrorExtendedData } from 'assetUtility'

export default class ConfirmModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            front: true,
            rear: true,
            memo: '',
            extendedItems: [],
            inputCheck: {
                targets: successResult,
                memo: successResult
            }
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal != this.props.showModal && nextProps.showModal) {
            const nextELockOpLogExtendedPages = nextProps.initialELockOpLogExtendedPages || [];
            this.setState({
                front: true,
                rear: true,
                memo: nextProps.initialMemo || '',
                extendedItems: nextELockOpLogExtendedPages.length > 0 ? _.cloneDeep(nextELockOpLogExtendedPages[0].extendedItems) : [],
                inputCheck: {
                    targets: successResult,
                    memo: successResult
                },
                isErrorExtendedItems: isErrorExtendedData(nextELockOpLogExtendedPages)
            })
        }
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            const { front, rear, memo, extendedItems } = this.state;
            const { selectedUnlockPurpose, initialELockOpLogExtendedPages } = this.props;
            const extendedPages = this.convertExtendedPages(extendedItems, initialELockOpLogExtendedPages);
            this.props.onSubmit(front, rear, memo, selectedUnlockPurpose && selectedUnlockPurpose.purpose, extendedPages);
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

    /**
     * 開錠目的を変更する
     * @param {any} purpose
     */
    handleChangeUnlockPurpose(purpose) {
        if (this.props.onChangeUnlockPurpose) {
            this.props.onChangeUnlockPurpose(purpose);
        }
    }

    /**
     * 開錠目的を保存する
     * @param {any} purpose
     * @param {any} callback
     */
    handleSaveUnlockPurpose(purpose, callback) {
        if (this.props.onSaveUnlockPurpose) {
            this.props.onSaveUnlockPurpose(purpose, callback);
        }
    }

    /**
     * 開錠目的を削除する
     * @param {any} purpose
     */
    handleDeleteUnlockPurpose(purpose) {
        if (this.props.onDeleteUnlockPurpose) {
            this.props.onDeleteUnlockPurpose(purpose);
        }
    }

    /**
     * メモが変更された時
     * @param {any} val
     */
    onMemoChange(val) {
        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.memo = validateTextArea(val, 300, true);
        this.setState({ memo: val, inputCheck: inputCheck });
    }

    /**
     * 対象が変更された時
     * @param {any} front
     * @param {any} rear
     */
    onTargetChange(front, rear) {
        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.targets = (!front && !rear) ? errorResult('必須項目です') : successResult;
        this.setState({ front: front, rear: rear, inputCheck: inputCheck });
    }

    /**
     * 詳細項目を変更する
     * @param {array} 変更後の詳細項目
     */
    handleChangeExtendedItems(extendedItems, isError) {
        this.setState({ extendedItems: extendedItems, isErrorExtendedItems: isError });
    }

    /**
     * 施錠/開錠ボタンを使用可能かどうか
     */
    isEnableSubmit() {
        const { inputCheck, isErrorExtendedItems } = this.state;
        const { isErrorUnlockPurpose, isLock } = this.props;
        for (let k of Object.keys(inputCheck)) {
            if (inputCheck[k].state == VALIDATE_STATE.error) {
                return false;
            }
        }
        return !isErrorExtendedItems && (isLock ? true : !isErrorUnlockPurpose);
    }

    /**
     * ExtendedPage型に変換する
     * @param {array} extendedItems 詳細項目リスト
     * @param {array} beforePages 変更前の詳細ページ情報
     */
    convertExtendedPages(extendedItems, beforePages) {
        const extendedPages = beforePages ? _.cloneDeep(beforePages) : [];
        if (extendedPages.length > 0) {
            extendedPages[0].extendedItems = extendedItems;
        }
        return extendedPages
    }

    /**
     * render
     */
    render() {
        const { showModal, isLock, unlockPurposes, selectedUnlockPurpose, onlyTargetBoth } = this.props
        const { front, rear, memo, extendedItems, inputCheck } = this.state

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>{isLock ? '施' : '開'}錠対象選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!isLock &&
                        <UnlockPurposeSelectForm
                            unlockPurposes={unlockPurposes}
                            selectedPurpose={selectedUnlockPurpose}
                            onChange={(purpose) => this.handleChangeUnlockPurpose(purpose)}
                            onSave={(purpose, callback) => this.handleSaveUnlockPurpose(purpose, callback)}
                            onDelete={(purpose) => this.handleDeleteUnlockPurpose(purpose)}
                        />
                    }
                    {extendedItems.length > 0 &&
                        <ExtendedItemFormList
                            extendedItems={extendedItems}
                            onChange={(extendedItems, isError) => this.handleChangeExtendedItems(extendedItems, isError)}
                        />
                    }
                    <TextareaForm
                        label="メモ"
                        placeholder="メモ"
                        value={memo}
                        onChange={(val) => this.onMemoChange(val)}
                        validationState={inputCheck.memo.state}
                        helpText={inputCheck.memo.helpText}
                        maxlength={300}
                    />
                    {!onlyTargetBoth &&
                        <FormGroup validationState={inputCheck.targets.state}>
                            <div>
                                <ControlLabel>{isLock ? '施' : '開'}錠対象（前面/背面別操作ラックの場合）</ControlLabel>
                            </div>
                            <Checkbox inline
                                checked={front}
                                onClick={() => this.onTargetChange(!front, rear)}
                            >
                                前面
                            </Checkbox>
                            <Checkbox inline
                                checked={rear}
                                onClick={() => this.onTargetChange(front, !rear)}
                            >
                                背面
                            </Checkbox>
                            <HelpBlock>{inputCheck.targets.helpText}</HelpBlock>
                        </FormGroup>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        disabled={!this.isEnableSubmit()}
                        bsStyle={isLock ? 'lightgray' : 'success'}
                        onClick={() => this.handleSubmit()}
                    >
                        <Icon className={isLock ? 'fal fa-lock-alt mr-05' : 'fal fa-lock-open-alt mr-05'} />
                        <span>{isLock ? '施' : '開'}錠</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        onClick={() => this.handleCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}