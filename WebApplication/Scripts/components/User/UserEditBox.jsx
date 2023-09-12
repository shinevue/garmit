'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import { ButtonToolbar, Checkbox, Grid, Row } from 'react-bootstrap';

import { validateAlphanumeric, validateText, validateEmail, validatePassword, validatePasswordMatchError, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { LAVEL_TYPE } from 'authentication';
import { LOGIN_TYPE } from 'constant';

import Box from 'Common/Layout/Box';
import Icon from 'Common/Widget/Icon';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import PasswordForm from 'Common/Form/PasswordForm';

import { SaveHotKeyButton, CancelButton } from 'Assets/GarmitButton';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';

export default class UserEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            targetUser: this.props.user,
            inputCheck: {
                userId: {},
                userName: {},
                password: {},
                confirmPassword: {},
                enterprises: {}
            },
            enableSave: false
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        this.setValidation();
    }

    /**
     * propsが変化したときの処理
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.user !== nextProps.user) {
            this.setState({ targetUser: nextProps.user }, () => {
                this.setValidation();
            });
        }
    }

    /**
     * 適用ボタンクリック時
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.targetUser);
        }
    }

    /**
     * キャンセルボタンクリック時
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * 値が変更されたとき
     * @param {any} val
     * @param {any} key
     */
    onEdit(keyValuePairs) {
        let user = Object.assign({}, this.state.targetUser);
        let inputCheck = Object.assign({}, this.state.inputCheck);

        keyValuePairs.forEach((pair) => {
            user[pair.key] = pair.val;
            if (pair.key in inputCheck) {
                inputCheck[pair.key] = this.checkValidation(pair.val, pair.key, user);
                if (pair.key === 'password') {
                    // パスワードが変更された時には確認パスワードもチェック
                    inputCheck.confirmPassword = this.checkValidation(user.confirmPassword, 'confirmPassword', user);
                }
            }
        });

        // 値と入力チェックの更新
        this.setState({ targetUser: user, inputCheck: inputCheck }, () => {
            // 保存ボタンの使用可否をセット
            this.setEnableSave();
        });
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key, user) {
        const { maxlength, minlength } = this.props;

        switch (key) {
            case 'userId':
                if (this.props.loginType == LOGIN_TYPE.mailAddress) {
                    return validateEmail(val, maxlength.userId, false);
                } else {
                    return validateAlphanumeric(val, 0, maxlength.userId, false);
                }
                
            case 'userName':
                return validateText(val, maxlength.userName, false);

            case 'password':
                const acceptBlank = this.props.mode === 'edit' ? true : false;
                return validatePassword(val, minlength.password, maxlength.password, acceptBlank);

            case 'confirmPassword':
                return validatePasswordMatchError(user.password, val);

            case 'enterprises':
                return val && val.length > 0 ? successResult : errorResult("必須項目です");
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { targetUser } = this.state
        let inputCheck = Object.assign({}, this.state.inputCheck)

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(targetUser[key], key, targetUser);
        }

        this.setState({ inputCheck: inputCheck }, () => {
            this.setEnableSave(callback);
        });
    }

    /**
     * 保存ボタン使用可否をセットする
     * @param {func} callback
     */
    setEnableSave(callback) {
        const { inputCheck } = this.state;

        let enableSave = true;

        for (let k of Object.keys(inputCheck)) {
            if (inputCheck[k].state == VALIDATE_STATE.error) {
                enableSave = false;
                break;
            }
        }

        this.setState({ enableSave: enableSave }, callback);
    }

    /**
     * render
     */
    render() {
        const { user, lookUp, level, mode, maxlength, minlength } = this.props;
        const { targetUser, enableSave, inputCheck } = this.state;

        return (
            <div>
                <Grid fluid>
                    <Row className="mb-05">
                        <ButtonToolbar className="pull-right">
                            <SaveHotKeyButton
                                disabled={!enableSave}
                                onClick={() => this.handleSubmit()}
                            />
                            <CancelButton
                                onClick={() => this.handleCancel()}
                            />
                        </ButtonToolbar>
                    </Row>
                </Grid>
                <Box boxStyle='default'>
                    <Box.Header>
                        <Box.Title>ユーザー編集</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        {(mode != 'add' && targetUser.passChangeDate != null) &&
                            <div className="mb-05">
                                {targetUser.passwordValidDays < 0 ?
                                    `パスワードの有効期限が${-targetUser.passwordValidDays}日前に切れました`
                                    :
                                    `パスワードの有効期限は残り${targetUser.passwordValidDays}日です`
                                }
                            </div>
                        }
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="ユーザーID" columnCount={2} isRequired={mode === 'add'}>
                                    {mode === 'add' ?
                                        <TextForm
                                            isReadOnly={level === LAVEL_TYPE.operator}
                                            maxlength={maxlength.userId}
                                            value={targetUser && targetUser.userId}
                                            onChange={(val) => this.onEdit([{ val: val, key: 'userId' }])}
                                            validationState={inputCheck.userId.state}
                                            helpText={inputCheck.userId.helpText}
                                        />
                                        :
                                        <LabelForm
                                            value={targetUser && targetUser.userId}
                                        />
                                    }
                                </InputForm.Col>
                                <InputForm.Col label="ユーザー名称" columnCount={2} isRequired={true} >
                                    <TextForm
                                        value={targetUser && targetUser.userName}
                                        maxlength={maxlength.userName}
                                        onChange={(val) => this.onEdit([{ val: val, key: 'userName' }])}
                                        validationState={inputCheck.userName.state}
                                        helpText={inputCheck.userName.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="パスワード" columnCount={2} isRequired={true} >
                                    <PasswordForm
                                        isReadOnly={level === LAVEL_TYPE.operator}
                                        value={targetUser && targetUser.password}
                                        maxlength={maxlength.password}
                                        onChange={(val) => this.onEdit([{ val: val, key: 'password' }])}
                                        validationState={inputCheck.password.state}
                                        helpText={inputCheck.password.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="パスワード（確認）" columnCount={2} isRequired={true} >
                                    <PasswordForm
                                        isReadOnly={level === LAVEL_TYPE.operator}
                                        value={targetUser && targetUser.confirmPassword}
                                        maxlength={maxlength.password}
                                        onChange={(val) => this.onEdit([{ val: val, key: 'confirmPassword' }])}
                                        validationState={inputCheck.confirmPassword.state}
                                        helpText={inputCheck.confirmPassword.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label='所属' columnCount={1} isRequired={true} >
                                    <EnterpriseForm multiple
                                        enterpriseList={lookUp && lookUp.enterprises ? lookUp.enterprises : []}
                                        checkedEnterprises={targetUser && targetUser.enterprises ? targetUser.enterprises : []}
                                        mainEnterprise={targetUser && targetUser.mainEnterprise}
                                        onChange={(enterprises, main) => this.onEdit([{ val: enterprises, key: 'enterprises' }, { val: main, key: 'mainEnterprise' }])}
                                        validationState={inputCheck.enterprises.state}
                                        helpText={inputCheck.enterprises.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                        <Checkbox
                            checked={targetUser.isInvalid}
                            onClick={() => this.onEdit([{ val: !targetUser.isInvalid, key: "isInvalid" }])}
                        >利用停止</Checkbox>
                    </Box.Body>
                </Box>
            </div>
        );
    }
}