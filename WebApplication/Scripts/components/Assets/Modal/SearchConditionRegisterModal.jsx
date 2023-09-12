/**
 * @license Copyright 2022 DENSO
 * 
 * SearchConditionRegisterModal Reactコンポーネント
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap';
import TextForm from 'Common/Form/TextForm';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { validateText, VALIDATE_STATE, errorResult } from 'inputCheck';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const NAME_MAX_LENGTH = 50;

/**
 * 検索条件保存モーダル
 * @param {boolean} showModal モーダルを表示するか
 * @param {number} functionId 機能ID
 * @param {array} conditionList 検索条件リスト
 * @param {object} searchCondition 保存する検索条件
 * @param {function} onSaved 保存が完了したかどうか
 * @param {function} onHide モーダルを閉じる際に呼び出す
 */
export default class SearchConditionRegisterModal extends Component {
    
    /**
     * コンストラクタ
     */
     constructor(props) {
        super(props);
        this.state = { 
            name: '' ,
            message: { show: false },
            isSaving: false
        };
    }
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.showModal && nextProps.showModal !== this.props.showModal) {
            this.setState({ 
                name: '',
                message: { show: false },
                isSaving: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { showModal } = this.props;
        const { name, isSaving, message } = this.state;
        const validate = this.validateName(name);
        return (
            <Modal show={showModal} bsSize="sm" backdrop="static" onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>検索条件保存</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TextForm label="名称"
                              value={name} 
                              maxlength={NAME_MAX_LENGTH}
                              validationState={validate.state}
                              helpText={validate.helpText}
                              onChange={(v) => this.nameChanged(v)} 
                    />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
                <WaitingMessage show={isSaving} type="save" />                    
                </Modal.Body>
                <Modal.Footer>
                    <SaveButton disabled={this.invalid(validate)} onClick={() => this.handleSave()} />
                    <CancelButton onClick={() => this.onHide()} />
                </Modal.Footer>
            </Modal>
        );
    }

    //#region イベント
    
    /**
     * 保存ボタンの押下イベント
     */
    handleSave() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '確認',
                message: '検索条件を保存してよろしいですか？',
                onCancel: () => this.closeMessage(),
                onOK: () => {
                    this.closeMessage();
                    this.saveCondition();
                }
            }
        })
    }

    /**
     * モーダルを閉じるイベント発生
     */
    onHide(){
        if (this.props.onHide){
            this.props.onHide();
        }
    }

    /**
     * 保存完了イベント発生
     */
    onSaved() {
        if (this.props.onSaved){
            this.props.onSaved();
        }
    }

    //#endregion

    //#region API呼び出し

    /**
     * 検索条件を保存する
     */
     saveCondition() {
        const { searchCondition, functionId } = this.props;
        const { name } = this.state;
        const sendingData = {
            functionId,
            name,
            condition: searchCondition ? JSON.stringify(searchCondition) : null
        }
        this.setState({ isSaving: true }, () => {
            sendData(EnumHttpMethod.post, '/api/searchCondition/set', sendingData, (result, networkError) => {
                this.setState({ isSaving: false });
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else if (result) {
                    if (result.isSuccess) {
                        this.showSaveSuccessMessage(result.message);
                    } else {
                        this.showErrorMessage(result.message);
                    }                        
                } else {
                    this.showErrorMessage('検索条件保存に失敗しました。');
                }
            });
        });        
    }

    //#endregion
    
    //#region 入力値変更

    /**
     * 名称を変更する
     * @param {string} value 変更後の値
     */
    nameChanged(value) {
        this.setState({ name : value });
    }

    //#endregion

    //#region 入力検証

    /**
     * 名称の入力チェック
     * @param {string} name 名称
     */
    validateName(name) {
        const { conditionList } = this.props;
        let validate = validateText(name, NAME_MAX_LENGTH);
        if (validate.state === VALIDATE_STATE.success && 
            conditionList.some((condition) => condition.name === name)) {
                validate = errorResult('既存の検索条件の名称と重複しています。'); 
        }
        return validate;
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
    
    
    //#region エラーメッセージ
   
    /**
     * エラーメッセージを表示する
     * @param {string} message メッセージ
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.closeMessage()
            }
        });
    }

    /**
     * 保存完了メッセージを表示する
     * @param {string} message メッセージ
     */
    showSaveSuccessMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: '保存完了',
                message: message,
                onCancel: () => {
                    this.closeMessage();
                    this.onSaved();
                }
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージモーダルを閉じる
     */
    closeMessage() {
        this.setState({ message: { show: false } });
    }

    //#endregion

}

SearchConditionRegisterModal.propTypes = {
    showModal: PropTypes.bool,
    conditionList: PropTypes.array,
    onSaved: PropTypes.func,
    onCancel: PropTypes.func
}
