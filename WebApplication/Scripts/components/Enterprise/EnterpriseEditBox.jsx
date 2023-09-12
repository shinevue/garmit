'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonToolbar, Form, Checkbox, Grid, Row, Table } from 'react-bootstrap';

import { validateText, validateTextArea, validateEmail, validateSelect, validateInteger, validateDate, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { ENTERPRISE_LEVEL } from 'constant';
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
import ListTable from 'Enterprise/ListTable';

const DATE_FORMAT = 'YYYY/MM/DD';

export default class EnterpriseEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            inputCheck: {
                enterpriseName: {},
                mailTo: {},
                level: {},
                parent: {},
                comment: {},
                allowLocations: {},
                maxUser: {},
                dataRefStartDate: {}
            }
        };
    }

    /**
     * コンポーネントがマウントされる前に呼ばれます。
     */
    componentWillMount() {
        this.setEnterprise(this.props.enterprise, () => {
            this.setValidation();
        });
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.enterprise !== nextProps.enterprise) {
            this.setEnterprise(nextProps.enterprise, () => {
                this.setValidation();
            });
        }
    }

    /**
     * 適用ボタンクリック時
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.enterprise);
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
        let enterprise = Object.assign({}, this.state.enterprise);
        enterprise[key] = val;

        let inputCheck = Object.assign({}, this.state.inputCheck);
        if (key in inputCheck) {
            inputCheck[key] = this.checkValidation(val, key, enterprise);
        }

        // 親所属を変更したとき
        if (key == 'parent') {
            if (val) {
                // 親の通知対象アラームで送信しないものを送信しないようにする
                for (let type of Object.keys(val.mailAlarmTypeEnable)) {
                    if (!val.mailAlarmTypeEnable[type]) {
                        enterprise.mailAlarmTypeEnable[type] = false;
                    }
                }

                // 親のアクセスレベルが非表示のものは非表示にする
                enterprise.allowFunctions = enterprise.allowFunctions.map((func) => {
                    const target = val.allowFunctions.find((f) => f.functionId == func.functionId);
                    if (!target || target.allowTypeNo == 0) {
                        return Object.assign({}, func, { allowTypeNo: 0 });
                    } else {
                        return func;
                    }
                });
            } else {

                // 通知対象アラームを全て送信しないにする
                for (let type of Object.keys(enterprise.mailAlarmTypeEnable)) {
                    enterprise.mailAlarmTypeEnable[type] = false;
                }

                // アクセスレベルを全て非表示にする
                enterprise.allowFunctions = enterprise.allowFunctions.map((func) => {
                    return Object.assign({}, func, { allowTypeNo: 0 });
                });
            }

            // 許可ロケーションを空にする
            enterprise.allowLocations = [];
            inputCheck.allowLocations = this.checkValidation([], 'allowLocations', enterprise);
        } else if (['occueredMail', 'recoveredMail', 'continueMail'].indexOf(key) >= 0) {
            if (!enterprise.occueredMail && !enterprise.recoveredMail && !enterprise.continueMail) {
                enterprise.mailTo = [''];
            }

            inputCheck.mailTo = this.checkValidation(enterprise.mailTo, 'mailTo', enterprise);
        }

        this.setState({ enterprise: enterprise, inputCheck: inputCheck });
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key, enterprise) {
        switch (key) {
            case 'enterpriseName':
                return validateText(val, this.props.maxlength.enterpriseName, false);

            case 'mailTo':
                const validation = {};
                validation.state = VALIDATE_STATE.success;
                if (val) {
                    for (let i = 0; i < val.length; i++) {
                        validation[i] = validateEmail(val[i], this.props.maxlength.mailTo, !enterprise.occueredMail && !enterprise.recoveredMail && !enterprise.continueMail);
                        if (validation[i].state === VALIDATE_STATE.error) {
                            validation.state = VALIDATE_STATE.error
                        }
                    }
                }
                return validation;                

            case 'level':
                return validateSelect(val);

            case 'comment':
                return validateTextArea(val, this.props.maxlength.comment, true);

            case 'maxUser':
                return validateInteger(val, 0, 2147483647, false);

            case 'dataRefStartDate':
                return validateDate(val, DATE_FORMAT, false);

            case 'parent':
                if (!val) {
                    return errorResult('必須項目です');
                }

                if (val.enterpriseId == this.state.enterprise.enterpriseId) {
                    return errorResult('自身を親所属に設定することはできません');
                }

                return successResult;

            case 'allowLocations':
                if (!val || val.length == 0) {
                    return errorResult('必須項目です');
                }

                return successResult;

            default:
                return successResult;
        }
    }

    /**
     * 所属をセットする
     * @param {any} enterprises
     * @param {any} callback
     */
    setEnterprise(enterprise, callback) {
        if (!enterprise) {
            callback();
        }
        const obj = Object.assign({}, enterprise);
        obj.dataRefStartDate = moment(obj.dataRefStartDate);
        if (obj.mailTo.length == 0) {
            obj.mailTo = [''];
        }
        this.setState({ enterprise: obj }, () => {
            callback();
        });
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { enterprise } = this.state
        let inputCheck = Object.assign({}, this.state.inputCheck)

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(enterprise[key], key, enterprise);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 入力エラーがあるかどうか
     */
    hasError() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state == VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * ロケーションリストを生成する
     * @param {any} locations
     * @param {any} allowLocations
     */
    createLocationList(locations, allowLocations) {
        if (!locations || !allowLocations) {
            return [];
        }

        const list = [];
        locations.forEach((location) => {
            const isAllowed = allowLocations.some((loc) => loc.locationId == location.locationId);
            const children = isAllowed ? location.children : this.createLocationList(location.children, allowLocations);

            if (isAllowed || (children && children.length > 0)) {
                list.push(Object.assign({}, location, { isAllowed: isAllowed, children: children }));
            }
        });
        return list;
    }

    /**
     * render
     */
    render() {
        const { lookUp, level, maxlength } = this.props;
        const { enterprise, inputCheck } = this.state

        return (
            <div>
                <Grid fluid>
                    <Row className="mb-05">
                        <ButtonToolbar className="pull-right">
                            <SaveHotKeyButton
                                onClick={() => this.handleSubmit()}
                                disabled={this.hasError()}
                            />
                            <CancelButton
                                onClick={() => this.handleCancel()}
                            />
                        </ButtonToolbar>
                    </Row>
                </Grid>
                <Box boxStyle="default">
                    <Box.Header>
                        <Box.Title>所属編集</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="所属ID（編集不可）" columnCount={2}>
                                    <LabelForm
                                        value={enterprise.enterpriseId || ""}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="所属名称" columnCount={2} isRequired={true} >
                                    <TextForm
                                        isReadOnly={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        value={enterprise.enterpriseName}
                                        maxlength={maxlength.enterpriseName}
                                        onChange={(val) => this.onEdit(val, 'enterpriseName')}
                                        validationState={inputCheck.enterpriseName.state}
                                        helpText={inputCheck.enterpriseName.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="親所属" columnCount={2} isRequired={true} >
                                    <EnterpriseForm
                                        disabled={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        enterpriseList={lookUp && lookUp.enterprises}
                                        selectedEnterprise={enterprise.parent}
                                        onChange={(val) => this.onEdit(val, 'parent')}
                                        validationState={inputCheck.parent.state}
                                        helpText={inputCheck.parent.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="子所属（編集不可）" columnCount={2} isRequired={false}>
                                    {enterprise.children && enterprise.children.length > 0 &&
                                        <ListTable
                                            headers={['所属名称', '上限ユーザー数']}
                                            data={enterprise.children.map((child) =>
                                                [child.enterpriseName, child.maxUser]
                                            )}
                                        />
                                    }
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="権限レベル" columnCount={2} isRequired={true} >
                                    <SelectForm
                                        isReadOnly={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        value={enterprise.level}
                                        options={ENTERPRISE_LEVEL}
                                        onChange={(val) => this.onEdit(val, 'level')}
                                        validationState={inputCheck.level.state}
                                        helpText={inputCheck.level.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="上限ユーザー数" columnCount={2} isRequired={true} >
                                    <TextForm
                                        isReadOnly={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        value={enterprise.maxUser}
                                        onChange={(val) => this.onEdit(val, 'maxUser')}
                                        validationState={inputCheck.maxUser.state}
                                        helpText={inputCheck.maxUser.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="メール送信タイミング" columnCount={2} isRequired={false}>
                                    <Checkbox inline
                                        disabled={level === LAVEL_TYPE.normal}
                                        checked={enterprise.occueredMail}
                                        onClick={() => this.onEdit(!(enterprise && enterprise.occueredMail), 'occueredMail')}
                                    >
                                        発生時
                                    </Checkbox>
                                    <Checkbox inline
                                        disabled={level === LAVEL_TYPE.normal}
                                        checked={enterprise.recoveredMail}
                                        onClick={() => this.onEdit(!(enterprise && enterprise.recoveredMail), 'recoveredMail')}
                                    >
                                        復旧時
                                    </Checkbox>
                                    <Checkbox inline
                                        disabled={level === LAVEL_TYPE.normal}
                                        checked={enterprise.continueMail}
                                        onClick={() => this.onEdit(!(enterprise && enterprise.continueMail), 'continueMail')}
                                    >
                                        継続時
                                    </Checkbox>
                                </InputForm.Col>
                                <InputForm.Col label="データ参照開始日" columnCount={2} isRequired={true} >
                                    <DateTimeForm
                                        isReadOnly={level === LAVEL_TYPE.normal}
                                        value={enterprise.dataRefStartDate}
                                        format={DATE_FORMAT}
                                        onChange={(val) => this.onEdit(val, 'dataRefStartDate')}
                                        validationState={inputCheck.dataRefStartDate.state}
                                        helpText={inputCheck.dataRefStartDate.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="メール送信先" columnCount={2} isRequired={enterprise.occueredMail || enterprise.recoveredMail || enterprise.continueMail} >
                                    <MailAddressForm
                                        isReadOnly={level === LAVEL_TYPE.normal || !(enterprise.occueredMail || enterprise.recoveredMail || enterprise.continueMail)}
                                        maxLength={maxlength.mailTo}
                                        maxCount={10}
                                        addresses={enterprise.mailTo || []}
                                        onChange={(val) => this.onEdit(val, 'mailTo')}
                                        validation={inputCheck.mailTo}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="通知対象アラーム" columnCount={2} isRequired={true} >
                                    <MailAlarmTypeForm
                                        disabled={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        alarmType={enterprise.mailAlarmTypeEnable}
                                        parentAlarmType={enterprise.parent && enterprise.parent.mailAlarmTypeEnable}
                                        onChange={(val) => this.onEdit(val, 'mailAlarmTypeEnable')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="コメント" columnCount={1}>
                                    <TextareaForm
                                        value={enterprise.comment}
                                        maxlength={maxlength.comment}
                                        onChange={(val) => this.onEdit(val, 'comment')}
                                        validationState={inputCheck.comment.state}
                                        helpText={inputCheck.comment.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                        <div className="mtb-2" />
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="ロケーション" columnCount={1} isRequired={true} >
                                    <LocationForm
                                        multiple
                                        disabled={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        locationList={lookUp && enterprise.parent && this.createLocationList(lookUp.locations, enterprise.parent.allowLocations) || []}
                                        checkedLocations={enterprise.allowLocations || []}
                                        onChange={(val) => this.onEdit(val, 'allowLocations')}
                                        validationState={inputCheck.allowLocations.state}
                                        helpText={inputCheck.allowLocations.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="アクセスレベル" columnCount={2} isRequired={true} >
                                    <AccessLevelForm
                                        disabled={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        functions={enterprise.allowFunctions || []}
                                        parentFunctions={enterprise.parent && enterprise.parent.allowFunctions}
                                        onChange={(val) => this.onEdit(val, 'allowFunctions')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="所属ユーザー（編集不可）" columnCount={2} isRequired={false} >
                                    {enterprise.loginUsers && enterprise.loginUsers.length > 0 &&
                                        <ListTable
                                            headers={['ユーザーID', 'ユーザー名称', 'メイン所属']}
                                            data={enterprise.loginUsers.map((user) => [
                                                user.userId,
                                                user.userName,
                                                (user.mainEnterprise && user.mainEnterprise.enterpriseId == enterprise.enterpriseId) ? '○' : ''
                                            ])}
                                        />
                                    }
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    </Box.Body>
                </Box>
            </div>
        );
    }
}