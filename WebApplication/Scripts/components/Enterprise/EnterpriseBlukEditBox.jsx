'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonToolbar, Form, Checkbox, Popover, OverlayTrigger, Grid, Row } from 'react-bootstrap';

import { validateText, validateTextArea, validateEmail, validateSelect, validateDate, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { ENTERPRISE_LEVEL } from 'constant.js';
import { LAVEL_TYPE } from 'authentication';　　

import Box from 'Common/Layout/Box';
import Icon from 'Common/Widget/Icon';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';
import DateTimeForm from 'Common/Form/DateTimeForm';

import { SaveHotKeyButton, CancelButton } from 'Assets/GarmitButton';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';
import LocationForm from 'Assets/Condition/LocationForm';

import MailAddressForm from 'Enterprise/MailAddressForm';
import AccessLevelForm from 'Enterprise/AccessLevelForm';
import MailAlarmTypeForm from 'Enterprise/MailAlarmTypeForm';

const DATE_FORMAT = 'YYYY/MM/DD';

export default class EnterpriseEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            common: {
                mailAlarmTypeEnable: this.getInitMailAlarmTypeEnable(),
                level: -1,
                comment: '',
                dataRefStartDate: moment().startOf('day')
            },
            inputCheck: {
                level: {},
                comment: {},
                dataRefStartDate: {}
            },
            enableSave: false,
            checked: {
                mailAlarmTypeEnable: false,
                level: false,
                comment: false,
                dataRefStartDate: false               
            }
        };
    }

    /**
     * コンポーネントがマウントされる前に呼ばれます。
     */
    componentWillMount() {

    }
    
    /**
     * 適用ボタンクリック時
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            const { common, checked } = this.state;
            let enterprises = this.props.enterprises.slice();

            for (let i = 0; i < enterprises.length; i++) {
                let enterprise = Object.assign({}, enterprises[i]);
                // 一括編集したキーの値を置き換える
                for (let key of Object.keys(common)) {
                    if (checked[key]) {
                        enterprise[key] = common[key];  // チェックされている場合のみ置き換える
                    }
                }
                enterprises[i] = enterprise;
            }

            this.props.onSubmit(enterprises);
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
    onEdit(val, key) {
        let common = Object.assign({}, this.state.common);
        common[key] = val;

        let inputCheck = Object.assign({}, this.state.inputCheck);
        if (key in inputCheck) {
            inputCheck[key] = this.checkValidation(val, key);
        }

        this.setState({ common: common, inputCheck: inputCheck }, () => {
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
            case 'level':
                return validateSelect(val);

            case 'comment':
                return validateTextArea(val, this.props.maxlength.comment, true);

            case 'dataRefStartDate':
                return validateDate(val, DATE_FORMAT, false);

            default:
                return successResult;
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { common, checked } = this.state
        let inputCheck = Object.assign({}, this.state.inputCheck)

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = checked[key] ? this.checkValidation(common[key], key) : { state: '', helpText: '' };
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
     * チェックボックスのチェック状態が変更された時
     * @param {any} keyValues
     */
    onCheckChange(keyValues) {
        const checked = Object.assign({}, this.state.checked);

        keyValues.forEach((item) => {
            checked[item.key] = item.value;
        });

        this.setState({ checked: checked }, () => {
            this.setValidation();
        });
    }

    /**
     * メール送信アラーム種別の初期データを取得
     */
    getInitMailAlarmTypeEnable() {
        const mailAlarmTypeEnable = Object.assign({}, this.props.enterprises[0].mailAlarmTypeEnable);
        for (let key of Object.keys(mailAlarmTypeEnable)) {
            mailAlarmTypeEnable[key] = false;
        }
        return mailAlarmTypeEnable;
    }

    /**
     * 同じ親を持つかどうか
     */
    isSameParent() {
        const { enterprises } = this.props;
        return !enterprises.some((ent) => !ent.parent || ent.parent.enterpriseId !== enterprises[0].parent.enterpriseId);
    }

    /**
     * render
     */
    render() {
        const { lookUp, enterprises, level, maxlength } = this.props;
        const { common, inputCheck, enableSave, checked } = this.state;

        const isSameParent = this.isSameParent();

        return (
            <div>
                <Grid fluid>
                    <Row className="mb-05">
                        <ButtonToolbar className="pull-right">
                            <SaveHotKeyButton
                                onClick={() => this.handleSubmit()}
                                disabled={!enableSave}
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
                            所属編集（一括編集）
                        </Box.Title>
                    </Box.Header >
                    <Box.Body>
                        {common &&
                            <InputForm>
                                {level !== LAVEL_TYPE.operator && level !== LAVEL_TYPE.normal &&
                                    <InputForm.Row>
                                        <InputForm.Col
                                            label="権限レベル"
                                            columnCount={1}
                                            isRequired={true}
                                            checkbox={true}
                                            checked={checked.level}
                                            onCheckChange={() => this.onCheckChange([{ value: !checked.level, key: 'level' }])}
                                        >
                                            <SelectForm
                                                isReadOnly={!checked.level}
                                                value={common.level}
                                                options={ENTERPRISE_LEVEL}
                                                onChange={(val) => this.onEdit(val, 'level')}
                                                validationState={inputCheck.level.state}
                                                helpText={inputCheck.level.helpText}
                                            />
                                        </InputForm.Col>
                                    </InputForm.Row>

                                }
                                {level !== LAVEL_TYPE.normal &&
                                    <InputForm.Row>
                                        <InputForm.Col
                                            label="データ参照開始日"
                                            columnCount={1}
                                            isRequired={true}
                                            checkbox={true}
                                            checked={checked.dataRefStartDate}
                                            onCheckChange={() => this.onCheckChange([{ value: !checked.dataRefStartDate, key: 'dataRefStartDate' }])}
                                        >
                                            <DateTimeForm
                                                isReadOnly={!checked.dataRefStartDate}
                                                value={common.dataRefStartDate}
                                                format={DATE_FORMAT}
                                                onChange={(val) => this.onEdit(val, 'dataRefStartDate')}
                                                validationState={inputCheck.dataRefStartDate.state}
                                                helpText={inputCheck.dataRefStartDate.helpText}
                                            />
                                        </InputForm.Col>
                                    </InputForm.Row>
                                }
                                {level !== LAVEL_TYPE.operator && level !== LAVEL_TYPE.normal && ((checked.parent && common.parent) || (!checked.parent && isSameParent)) &&
                                    <InputForm.Row>
                                        <InputForm.Col
                                            label="通知対象アラーム"
                                            columnCount={1}
                                            isRequired={true}
                                            checkbox={true}
                                            checked={checked.mailAlarmTypeEnable}
                                            onCheckChange={() => this.onCheckChange([{ value: !checked.mailAlarmTypeEnable, key: 'mailAlarmTypeEnable' }])}
                                        >
                                            <MailAlarmTypeForm
                                                alarmType={common.mailAlarmTypeEnable}
                                                parentAlarmType={(checked.parent ? common.parent.mailAlarmTypeEnable : enterprises[0].parent.mailAlarmTypeEnable)}
                                                disabled={!checked.mailAlarmTypeEnable}
                                                onChange={(val) => this.onEdit(val, 'mailAlarmTypeEnable')}
                                            />
                                        </InputForm.Col>
                                    </InputForm.Row>
                                }
                                <InputForm.Row>
                                    <InputForm.Col
                                        label="コメント"
                                        columnCount={1}
                                        checkbox={true}
                                        checked={checked.comment}
                                        onCheckChange={() => this.onCheckChange([{ value: !checked.comment, key: 'comment' }])}
                                    >
                                        <TextareaForm
                                            isReadOnly={!checked.comment}
                                            value={common.comment}
                                            maxlength={maxlength.comment}
                                            onChange={(val) => this.onEdit(val, 'comment')}
                                            validationState={inputCheck.comment.state}
                                            helpText={inputCheck.comment.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                            </InputForm>
                        }
                    </Box.Body>
                </Box>
            </div>
        );
    }
}