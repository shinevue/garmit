/**
 * @license Copyright 2019 DENSO
 * 
 * 開錠目的編集モーダル Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, __esModule } from 'react-bootstrap';
import TextForm from 'Common/Form/TextForm';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import { validateText, VALIDATE_STATE } from 'inputCheck';

const MAX_LENGTH_PURPOSE = 30;

/**
 * 開錠目的編集モーダル
 * @param {boolaen} show モーダルを表示するかどうか
 * @param {object} unlockPurpose 編集対象
 * @param {function} onSave 開錠目的を保存する
 * @param {function} onDelete 開錠目的を削除する
 */
export default class UnlockPurposeEditModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { unlockPurpose } = props;
        this.state = { 
            purpose: unlockPurpose ? unlockPurpose.purpose : '', 
            validate: this.validatePurpose(unlockPurpose&&unlockPurpose.purpose)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { show, unlockPurpose } = nextProps;
        if (this.props.show !== show && show) {
            this.setState({ 
                purpose: unlockPurpose ? unlockPurpose.purpose : '', 
                validate: this.validatePurpose(unlockPurpose&&unlockPurpose.purpose)
            })
        }
    }

    /**
     * render
     */
    render() {
        const { show, isReadOnly } = this.props;
        const { validate, purpose } = this.state;
        return (
            <Modal bsSize="sm" show={show} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>開錠目的編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TextForm value={purpose} 
                              validationState={validate.state}
                              helpText={validate.helpText}
                              onChange={(value) => this.handleChangePurpose(value)} 
                              maxlength={MAX_LENGTH_PURPOSE}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <SaveButton disabled={isReadOnly||this.invalid(validate)} onClick={() => this.handleSave()} />
                    <CancelButton onClick={() => this.handleCancel()} />
                </Modal.Footer>
            </Modal>
        );
    }
    
    //#region イベントハンドラ

    /**
     * 開錠目的変更イベント
     * @param {*} value 変更後の値
     */
    handleChangePurpose(value) {
        this.setState({ purpose: value, validate: this.validatePurpose(value) });
    }

    /**
     * 保存ボタンの押下イベント
     */
    handleSave() {
        if (this.props.onSave){
            var update = this.props.unlockPurpose && _.cloneDeep(this.props.unlockPurpose);
            if (!update) {
                update = {
                    unlockPurposeId: 0
                };
            }
            update.purpose = this.state.purpose;
            this.props.onSave(update);
        }
    }
    
    /**
     * キャンセルボタンの押下イベント
     */
    handleCancel(){
        if (this.props.onCancel){
            this.props.onCancel();
        }
    }

    //#endregion

    //#region 入力検証

    /**
     * 開錠目的の入力検証
     * @param {string} value 開錠目的
     */
    validatePurpose(value) {
        return validateText(value, MAX_LENGTH_PURPOSE);
    }

    /**
     * 保存が無効かどうか
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか  
     */
    invalid(validate) {
        return !(validate.state === VALIDATE_STATE.success);
    }

    //#endregion
    
}

UnlockPurposeEditModal.propTypes = {
    show: PropTypes.bool,
    unlockPurpose: PropTypes.object,
    onSave: PropTypes.func,
    onCancel: PropTypes.func
}
