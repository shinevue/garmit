/**
 * @license Copyright 2017 DENSO
 * 
 * 開錠目的選択フォーム Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectForm from 'Common/Form/SelectForm';
import UnlockPurposeEditModal from 'Assets/Modal/UnlockPurposeEditModal';
import MessageModal from 'Assets/Modal/MessageModal';
import { VALIDATE_STATE, validateSelect } from 'inputCheck';
import { convertNumber } from 'numberUtility';

/**
 * 開錠目的選択フォーム
 * @param {array} unlockPurposes 開錠目的リスト
 * @param {object} selectedPurpose 選択中の開錠目的
 * @param {function} onChange 開錠目的変更時に呼び出す
 * @param {function} onSave 開錠目的保存時に呼び出す
 * @param {function} onDelete 開錠目的削除時に呼び出す
 */
export default class UnlockPurposeSelectForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            showEditModal: false,
            isRegister: false,
            options: props.unlockPurposes ? props.unlockPurposes.map((purpose) => { return { value: purpose.unlockPurposeId, name: purpose.purpose }; }) : [],
            confirmModal: {
                show: false
            },
            isOnly: this.isOnlyUnlockPurpose(props.unlockPurposes)
        };
    }

    /**
     * Propsが更新されたときに呼ばれます。
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.unlockPurposes) != JSON.stringify(nextProps.unlockPurposes)) {
            this.setState({
                options: nextProps.unlockPurposes ? nextProps.unlockPurposes.map((purpose) => { return { value: purpose.unlockPurposeId, name: purpose.purpose }; }) : [],
                isOnly: this.isOnlyUnlockPurpose(nextProps.unlockPurposes)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { selectedPurpose, isReadOnly, unlockPurposes } = this.props;
        const { showEditModal, isRegister, options, confirmModal, isOnly } = this.state;
        const disabled = selectedPurpose ? false : true;
        const selectFormRequired = !(unlockPurposes && unlockPurposes.length === 0);
        const validate = validateSelect(selectedPurpose&&selectedPurpose.unlockPurposeId);
        return (
            <div>
                <SelectForm
                    label="開錠目的*"
                    isRequired={selectFormRequired}
                    value={selectedPurpose&&selectedPurpose.unlockPurposeId}
                    options={options}
                    onChange={this.handleChange}
                    addonButton={[
                        {
                            key: 'add',
                            tooltipLabel: '開錠目的追加',                        
                            onClick: () => this.openEditModal(true),
                            iconId: 'add',
                            isCircle: true
                        },
                        {
                            key: 'edit',
                            tooltipLabel: '開錠目的編集',    
                            onClick: () => this.openEditModal(false),
                            disabled: disabled,
                            iconId: 'edit',
                            isCircle: true
                        },
                        {
                            key: 'delete',
                            tooltipLabel: '開錠目的削除',                        
                            onClick: this.handleDelete,
                            disabled: disabled||isOnly,
                            iconId: 'delete',
                            isCircle: true
                        }
                    ]}
                    validationState={validate.state}
                    helpText={validate.helpText}
                />
                <UnlockPurposeEditModal 
                    show={showEditModal}
                    isReadOnly={isReadOnly}
                    unlockPurpose={isRegister?null:selectedPurpose}
                    onSave={this.handleSave}
                    onCancel={this.handleModalCancel}
                />                
                <MessageModal
                    title={confirmModal.title}
                    show={confirmModal.show}
                    bsSize="sm"
                    buttonStyle={confirmModal.buttonStyle}
                    onOK={this.handleClickOKButton}
                    onCancel={this.handleCloseMessageModal}
                >
                    {confirmModal.message}
                </MessageModal>
            </div>
        );
    }

    //#region イベントハンドラ

    /**
     * 開錠目的の選択を変更
     * @param {*} value 選択したValue
     */
    handleChange = (value) => {
        const { unlockPurposes } = this.props;
        const selectedPurpose = unlockPurposes && unlockPurposes.find((purpose) => purpose.unlockPurposeId === convertNumber(value));
        if (this.props.onChange) {
            this.props.onChange(selectedPurpose);
        }
    }

    /**
     * 開錠目的の保存イベント
     * @param {object} purpose 保存する開錠目的
     */
    handleSave = (purpose) => {        
        if (this.props.onSave) {
            this.props.onSave(purpose, (isSuccess) => {
                isSuccess && this.hideEditModal();
            });
        }
    }

    /**
     * 開錠目的削除イベント
     */
    handleDelete = () => {
        this.openMessageModal('確認', '選択中の開錠目的を削除してもよろしいですか？', 'confirm' ,'delete');
    }

    /**
     * モーダルのキャンセルイベント
     */
    handleModalCancel = () => {
        this.hideEditModal();
    }

    /**
     * メッセージモーダルのOKボタンクリックイベント
     */
    handleClickOKButton = () => {
        if (this.state.confirmModal.okOperation === 'delete') {
            this.hideMessageModal();
            if (this.props.onDelete) {
                const { selectedPurpose } = this.props;            
                this.props.onDelete(selectedPurpose);
            }
        }
    }

    /**
     * メッセージモーダルのキャンセルイベント
     */
    handleCloseMessageModal = () => {
        this.setState({ confirmModal: { show: false } });
    }

    //#endregion

    //#region その他

    /**
     * 編集モーダルを開く
     */
    openEditModal(isRegister) {
        this.setState({ showEditModal: true, isRegister });
    }

    /**
     * 編集モーダルを閉じる
     */
    hideEditModal() {
        this.setState({ showEditModal: false });
    }

    /**
     * メッセージモーダルを開く
     * @param {string} title タイトル
     * @param {string} message メッセージ
     * @param {string} buttonStyle ボタンスタイル
     * @param {string} okOperation　OK時の操作キー
     */
    openMessageModal(title, message, buttonStyle, okOperation) {
        this.setState({ confirmModal: { show: true, title, message, buttonStyle, okOperation } });
    }

    /**
     * メッセージモーダルを閉じる
     */
    hideMessageModal() {
        this.setState({ confirmModal: { show: false } });
    }

    /**
     * 開錠目的が1つしかないか
     * @param {array} unlockPurposes 開錠目的リスト
     */
    isOnlyUnlockPurpose(unlockPurposes) {
        return !(unlockPurposes && unlockPurposes.length > 1)
    }

    //#endregion
}

UnlockPurposeSelectForm.propTypes = {
    unlockPurposes: PropTypes.array,
    selectedPurpose: PropTypes.object,
    onChange: PropTypes.func,
    onSave: PropTypes,
    onDelete: PropTypes
}
