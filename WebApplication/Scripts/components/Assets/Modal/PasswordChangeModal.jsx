/**
 * @license Copyright 2018 DENSO
 * 
 * PasswordChangeModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal, Form, Col, FormGroup, FormControl, HelpBlock, ControlLabel } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateCurrentPassword, validatePassword, validatePasswordMatchError, successResult } from 'inputCheck';
import { MESSAGEMODAL_BUTTON } from 'constant';

/**
 * パスワード変更モーダル
 * @param {boolean} show モーダルを表示するかどうか
 * @param {object} user ユーザー情報
 * @param {function} onHide モーダルを非表示とするときに呼び出す
 */
export default class PasswordChangeModal extends Component {
    
    //MEMO 任意のstaticメソッドはここに追加します。

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            password: '',
            newPassword: '',
            confirmPassword: '',
            validate: {
                password: {state: null, helpText: null },
                newPassword: { state: null, helpText: null },
                confirmPassword: { state: null, helpText: null }
            },
            modalInfo: {
                show: false,
                type: 'message',
                title: '',
                message: null,
                callback: null
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.show && nextProps.show !== this.props.show) {
            this.setState({
                password: '',
                newPassword: '',
                confirmPassword: '',
                validate: {
                    password: this.validatePresentPassword(''),
                    newPassword: this.validateNewPassword(''),
                    confirmPassword: this.validateConfirmPassword('', '')
                }
            });
        }
    }

    /**
     * render
     */
    render() {
        const { show, user } = this.props;
        const { password, newPassword, confirmPassword, validate, modalInfo, isWaiting } = this.state;
        return (
            <Modal show={show} backdrop="static" onHide={() => this.onHide()} >
                <Modal.Header closeButton>
                    <Modal.Title>パスワード変更</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form horizontal>
                        <StaticTextForm label='ユーザーID' value={user.userId}/>
                        <PasswordForm initalFocus={true}
                                    label="現在のパスワード"
                                    value={password} 
                                    validationState={validate.password.state}
                                    helpText={validate.password.helpText}
                                    onChange={(value) => this.handlePasswordChanged(value)}
                        />
                        <PasswordForm label="新しいパスワード"
                                    value={newPassword} 
                                    canSwichingShow
                                    validationState={validate.newPassword.state}
                                    helpText={validate.newPassword.helpText}
                                    onChange={(value) => this.handleNewPasswordChanged(value)}
                        />
                        <PasswordForm label="新しいパスワード(確認)"
                                    value={confirmPassword} 
                                    canSwichingShow
                                    validationState={validate.confirmPassword.state}
                                    helpText={validate.confirmPassword.helpText}
                                    onChange={(value) => this.handleConfirmPasswordChanged(value)}
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" 
                            disabled={this.invalid()} 
                            onClick={() => 
                                this.changeMessageModalState(
                                        true, 
                                        '保存確認',
                                        MESSAGEMODAL_BUTTON.save,
                                        'パスワードを保存しますか？'
                                )}>
                        <Icon className="fal fa-save mr-05" />
                        <span>パスワード変更</span>
                    </Button>
                    <Button iconId="uncheck" bsStyle="lightgray" onClick={() => this.onHide()}>
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
                <MessageModal show={modalInfo.show} 
                              title={modalInfo.title} 
                              bsSize="small"
                              buttonStyle={modalInfo.type}
                              onOK={() => this.savePassword()} 
                              onCancel={() => {modalInfo.callback ? modalInfo.callback() : this.changeMessageModalState(false)}} >
                              {modalInfo.show&&
                                <div>{modalInfo.message}</div>
                              }
                </MessageModal>
                <WaitingMessage show={isWaiting} type='save' />
            </Modal>
        );
    }

    //#region データ通信

    savePassword() {
        const passwordParam = {
            password: this.state.password,
            newPassword: this.state.newPassword
        };
        this.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/User/setPassword', passwordParam, (result, networkError) => {
            this.setWaitingState(false);
            if (networkError) {
                this.changeMessageModalState(true, 'エラー', MESSAGEMODAL_BUTTON.message, NETWORKERROR_MESSAGE);
            } else if (result&&result.isSuccess) {
                this.changeMessageModalState(true, '保存完了', MESSAGEMODAL_BUTTON.message, result.message, () => {
                    this.changeMessageModalState(false)
                    this.onHide();
                });                 
            } else {
                this.changeMessageModalState(true, 'エラー', MESSAGEMODAL_BUTTON.message, result ? result.message : '保存に失敗しました。');
            }
        });
    }

    //#endregion

    //#region イベントハンドラ

    /**
     * 現在のパスワード入力変更イベント
     * @param {string} value 現在のパスワード
     */
    handlePasswordChanged(value) {
        var validate = Object.assign({}, this.state.validate);
        validate.password = this.validatePresentPassword(value);
        this.setState({ password: value, validate: validate });
    }

    /**
     * 新しいパスワード入力変更イベント
     * @param {string} value 変更後のパスワード
     */
    handleNewPasswordChanged(value) {
        var validate = Object.assign({}, this.state.validate);
        validate.newPassword = this.validateNewPassword(value);
        validate.confirmPassword = this.validateConfirmPassword(this.state.confirmPassword, value);
        this.setState({ newPassword: value, validate: validate });
    }

    /**
     * 新しいパスワード（確認）の入力変更イベント
     * @param {string} value 変更後のパスワード（確認）
     */
    handleConfirmPasswordChanged(value) {
        var validate = Object.assign({}, this.state.validate);
        validate.confirmPassword = this.validateConfirmPassword(value, this.state.newPassword);
        this.setState({ confirmPassword: value, validate: validate });
    }

    //#endregion

    //#region 入力検証

    /**
     * 現在のパスワードの入力検証
     * @param {string} password 
     */
    validatePresentPassword(password) {
        return validateCurrentPassword(password, 50);
    }

    /**
     * 新しいパスワードの入力検証
     * @param {string} password 
     */
    validateNewPassword(password) {
        return validatePassword(password, 8, 50);
    }

    /**
     * 新しいパスワード（確認）の入力検証
     * @param {string} target 
     * @param {string} password 
     */
    validateConfirmPassword(target, password) {
        return validatePasswordMatchError(target, password);
    }

    /**
     * 保存が無効かどうか
     */
    invalid() {
        const { validate } = this.state;
        if (validate.password.state === successResult.state &&
            validate.newPassword.state === successResult.state &&
            validate.confirmPassword.state === successResult.state) {
                return false;
        }
        return true;
    }

    //#endregion

    //#region モーダル関係

    /**
     * モーダルを閉じるイベントを発生
     */
    onHide() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    /**
     * メッセージモーダルのstateを変更する
     * @param {boolean} show モーダルを表示するかどうか
     * @param {string} title モーダルのタイトル
     * @param {string} type モーダルの種別
     * @param {string} message モーダルに表示するメッセージ
     * @param {function} callback コールバック関数
     */
    changeMessageModalState(show, title, type, message, callback) {
        this.setState({
            modalInfo: {
                show: show,
                title: title,
                type: type,
                message: message,
                callback: callback
            }
        })
    }

    //#endregion

    /**
     * 保存の待ち状態を変更する
     * @param {boolean} isWaiting 待ち状態かどうか
     */
    setWaitingState(isWaiting) {
        this.setState({
            isWaiting: isWaiting
        });
    }
}

/**
 * ラベルフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 表示文字列
 */
class StaticTextForm extends Component {
    render(){
        const { label, value } = this.props;
        return (
            <HorizontalLabelForm label={label} value={value} labelCol={{sm: 4}} valueCol={{sm: 8}} />
        );
    }
}

/**
 * ラベルフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 表示文字列
 * @param {boolean} initalFocus 初期表示でフォーカスするかどうか
 */
class PasswordForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            showPassword: false
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        if (this.passwordBox && this.props.initalFocus) {
            setTimeout(() => {
                this.passwordBox.focus();
              }, 0);

        }
    }

    /**
     * render
     */
    render(){
        const { label, value, helpText, validationState, canSwichingShow } = this.props;
        const { showPassword } = this.state;
        const iconClass = showPassword ? "fa-eye-slash" : "fa-eye"
        return (
            <FormGroup className="has-feedback" validationState={validationState} >
                <Col componentClass={ControlLabel} sm={4}>
                    {label}
                </Col>
                <Col sm={7}>
                    <FormControl inputRef={(ref) => this.passwordBox = ref} maxLength={50} autoFocus type={showPassword?"text":"password"} autocomplete="off" value={value} placeholder="Password" onChange={(e)=>this.handleOnChange(e)} />
                    {canSwichingShow&&<span className="form-control-feedback" >
                        <Icon className={classNames('fas', iconClass, 'pointer-events-on')} 
                              onMouseDown={() => this.changeShowState(true)} 
                              onMouseUp={() => this.changeShowState(false)} 
                              onMouseLeave={() => this.changeShowState(false)}
                              onTouchStart={() => this.changeShowState(true)}
                              onTouchEnd={() => this.changeShowState(false)} 
                        />
                    </span>}
                    {helpText&&<HelpBlock>{helpText}</HelpBlock>}
                </Col>
            </FormGroup>
        );
    }

    /**
     * テキスト変更イベント
     * @param {any} event イベント情報
     */
    handleOnChange(event) {
        if (this.props.onChange) {
            this.props.onChange(event.target.value);
        }
    }

    /**
     * パスワード表示/非表示を切り替える
     */
    changeShowState(show) {
        this.setState({showPassword: show})
    }

}

PasswordChangeModal.propTypes = {
    show: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onHide: PropTypes.func
}