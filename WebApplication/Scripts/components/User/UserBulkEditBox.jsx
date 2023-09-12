'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import { ButtonToolbar, Checkbox, Popover, OverlayTrigger, Grid, Row } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Icon from 'Common/Widget/Icon';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import PasswordForm from 'Common/Form/PasswordForm';

import { SaveHotKeyButton, CancelButton } from 'Assets/GarmitButton';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';

import { successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

export default class UserBulkEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            common: {
                enterprises: null
            },
            inputCheck: {
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
     * 適用ボタンクリック時
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            const { common } = this.state;
            let users = this.props.users.slice();

            for (let i = 0; i < users.length; i++) {
                let user = Object.assign({}, users[i]);
                // 一括編集したキーの値を置き換える
                for (let key of Object.keys(common)) {
                    user[key] = common[key];
                }
                users[i] = user;
            }

            this.props.onSubmit(users);
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
     * 値が変更された時
     * @param {any} val 値
     * @param {any} key 変更されたキー
     */
    onEdit(keyValuePairs) {
        // 共通部分に値を入れる
        const common = Object.assign({}, this.state.common);
        const inputCheck = Object.assign({}, this.state.inputCheck);

        keyValuePairs.forEach((pair) => {
            common[pair.key] = pair.val;
            if (pair.key in inputCheck) {
                inputCheck[pair.key] = this.checkValidation(pair.val, pair.key);
            }
        });

        // 値と入力チェックの更新
        this.setState({ common: common, inputCheck: inputCheck }, () => {
            // 保存ボタンの使用可否をセット
            this.setEnableSave();
        });
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key) {
        switch (key) {
            case 'enterprises':
                return val && val.length > 0 ? successResult : errorResult("必須項目です");
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { common } = this.state
        let inputCheck = Object.assign({}, this.state.inputCheck)

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(common[key], key);
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
        const { lookUp, users } = this.props;
        const { enableSave, common, inputCheck } = this.state;

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
                <Box boxStyle="default">
                    <Box.Header>
                        <Box.Title>
                            ユーザー編集（一括編集）
                        </Box.Title>
                    </Box.Header >
                    <Box.Body>
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="所属" columnCount={1} isRequired={false} >
                                    <EnterpriseForm multiple
                                        enterpriseList={lookUp && lookUp.enterprises ? lookUp.enterprises : []}
                                        checkedEnterprises={common.enterprises || []}
                                        mainEnterprise={common.mainEnterprise}
                                        onChange={(enterprises, main) => this.onEdit([{ val: enterprises, key: 'enterprises' }, { val: main, key: 'mainEnterprise' }])}
                                        validationState={inputCheck.enterprises.state}
                                        helpText={inputCheck.enterprises.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    </Box.Body>
                </Box>
            </div>
        );
    }
}