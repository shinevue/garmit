'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import { ButtonToolbar, Grid, Row, Col, Checkbox, FormGroup, HelpBlock } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';

import { validateText, validateSelect, validateInteger, validateReal, validateIpAddress, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

const PROTOCOL_TYPES = [
    { value: 1, name: 'SNMPv1', needIpAdress: true },
    { value: 2, name: 'SNMPv2c', needIpAdress: true },
    { value: 32, name: 'SNMPv2cTrap', needIpAdress: true },
    { value: 11, name: '標準ModbusTCP', needIpAdress: true },
    { value: 12, name: 'AnywireModbusTCP', needIpAdress: true },
    { value: 21, name: 'MQTT', needIpAdress: false },
    { value: 51, name: 'SHINEI BatteryMonitorProtocol', needIpAdress: true }
]

const GATE_TYPE_NULL = {
    value: -1, realValue: null
}

const GATE_TYPE_OPTIONS = [
    { value: GATE_TYPE_NULL.value, name: '指定なし' },
    { value: 1, name: 'バッテリモニタ' }
];

const EMPTY_INPUTCHECK = {
    name: {},
    ipAddress: {},
    portNo: {},
    database: {},
    protocolType: {},
    comOption: {},
    useFlg: {},
    poolInterval: {},
    readFlg: {},
    writeFlg: {},
    gateType: {}
}

const MAX_LENGTH = {
    name: 32,
    comOption: 32
}


export default class DeviceEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datagate: props.datagate,
            inputCheck: EMPTY_INPUTCHECK
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        this.initValidation(this.props.datagate);
    }

    /**
     * 保存ボタンクリック時
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.datagate);
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
     * 編集されたとき
     * @param {any} val
     * @param {any} key
     */
    onEdit(val, key) {
        const datagate = Object.assign({}, this.state.datagate);
        datagate[key] = val;
        const inputCheck = Object.assign({}, this.state.inputCheck);
        if (key === 'readFlg' || key === 'writeFlg') {
            inputCheck.readFlg = this.checkValidation(datagate.readFlg, key, datagate);
            inputCheck.writeFlg = this.checkValidation(datagate.writeFlg, key, datagate);
        } else {
            inputCheck[key] = this.checkValidation(val, key, datagate);
        }

        if (key == 'protocolType') {
            inputCheck.ipAddress = this.checkValidation(datagate.ipAddress, 'ipAddress', datagate);
        }

        this.setState({ datagate: datagate, inputCheck: inputCheck });
    }

    /**
     * 入力チェックをする
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key, datagate) {
        switch (key) {
            case 'name':
                return validateText(val, MAX_LENGTH.name, false);

            case 'ipAddress':
                const type = PROTOCOL_TYPES.find((type) => type.value == datagate.protocolType);
                return validateIpAddress(val, type ? !type.needIpAdress : true);

            case 'portNo':
                return validateInteger(val, 0, 65535, true);

            case 'database':
                return validateSelect(val && val.dbId);

            case 'protocolType':
                return validateSelect(val);

            case 'comOption':
                return validateText(val, MAX_LENGTH.comOption, true);

            case 'useFlg':
                return validateSelect(val.toString());

            case 'poolInterval':
                let min = 1;
                let max = 3600;

                if (application.appSettings) {
                    if (application.appSettings.pollIntervalMinSec) {
                        min = parseFloat(application.appSettings.pollIntervalMinSec);
                    }
                    if (application.appSettings.pollIntervalMaxSec) {
                        max = parseFloat(application.appSettings.pollIntervalMaxSec);
                    }
                }
                return validateReal(val, min, max, true, 3);

            case 'readFlg':
            case 'writeFlg':
                return (datagate.readFlg || datagate.writeFlg) ? successResult : errorResult("必須項目です");

            default:
                return successResult;
        }
    }

    /**
     * 入力チェックを初期化する
     * @param {any} datagate
     */
    initValidation(datagate) {
        if (datagate == null) {
            this.setState({ inputCheck: EMPTY_INPUTCHECK });
            return;
        }

        const inputCheck = Object.assign({}, this.state.inputCheck);
        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(datagate[key], key, datagate);
        }
        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 入力エラーがあるか
     */
    hasError() {
        const { inputCheck } = this.state;
        for (let key of Object.keys(inputCheck)) {
            if (inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * 機器種別を取得する
     * @param {*} value 変更後の値
     */
    getGateType(value) {
        if (GATE_TYPE_NULL.value.toString() === value) {
            return GATE_TYPE_NULL.realValue;
        }
        return value;
    }

    /**
     * render
     */
    render() {
        const { databases, isLoading, isReadOnly } = this.props;
        const { datagate, inputCheck } = this.state;

        return (
            <div>
                <Grid fluid>
                    <Row className="mb-05">
                        <ButtonToolbar className="pull-right">
                            <Button
                                bsStyle="success"
                                onClick={() => this.handleSubmit()}
                                disabled={this.hasError()}
                            >
                                <Icon className="fal fa-save mr-05" />
                                <span>保存</span>
                            </Button>
                            <Button
                                iconId="uncheck"
                                bsStyle="lightgray"
                                onClick={() => this.handleCancel()}
                            >
                                キャンセル
                            </Button>
                        </ButtonToolbar>
                    </Row>
                </Grid>
                <Box boxStyle='default' isLoading={isLoading}>
                    <Box.Header>
                        <Box.Title>機器編集</Box.Title>
                    </Box.Header >
                    <Box.Body>
                    {datagate && 
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="機器ID" columnCount={2}>
                                    <LabelForm
                                        value={datagate.gateId}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="機器名称" columnCount={2} isRequired={true} >
                                    <TextForm
                                        isReadOnly={isReadOnly}
                                        value={datagate.name}
                                        maxlength={MAX_LENGTH.name}
                                        onChange={(v) => this.onEdit(v, 'name')}
                                        validationState={!isReadOnly && inputCheck.name.state}
                                        helpText={!isReadOnly && inputCheck.name.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="IPアドレス" columnCount={2} isRequired={true} >
                                    <TextForm
                                        isReadOnly={isReadOnly}
                                        value={datagate.ipAddress}
                                        maxlength={15}  //IPv4では最大15文字
                                        onChange={(v) => this.onEdit(v, 'ipAddress')}
                                        validationState={!isReadOnly && inputCheck.ipAddress.state}
                                        helpText={!isReadOnly && inputCheck.ipAddress.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="ポート番号" columnCount={2} isRequired={false} >
                                    <TextForm
                                        isReadOnly={isReadOnly}
                                        value={datagate.portNo}
                                        onChange={(v) => this.onEdit(v, 'portNo')}
                                        validationState={!isReadOnly && inputCheck.portNo.state}
                                        helpText={!isReadOnly && inputCheck.portNo.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="計測" columnCount={2} isRequired={true}>
                                    <FormGroup validationState={!isReadOnly && inputCheck.readFlg.state}>
                                        <Checkbox inline
                                            disabled={isReadOnly}
                                            checked={datagate.readFlg}
                                            onClick={() => this.onEdit(!datagate.readFlg, 'readFlg')}
                                        >
                                            計測
                                        </Checkbox>
                                        <Checkbox inline
                                            disabled={isReadOnly}
                                            checked={datagate.writeFlg}
                                            onClick={() => this.onEdit(!datagate.writeFlg, 'writeFlg')}
                                        >
                                            出力
                                        </Checkbox>
                                        {!isReadOnly && inputCheck.readFlg.helpText &&
                                            <HelpBlock>{inputCheck.readFlg.helpText}</HelpBlock>
                                        }
                                    </FormGroup>
                                </InputForm.Col>
                                <InputForm.Col label="記録先" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={isReadOnly}
                                        options={databases && databases.map((db) => ({value: db.dbId, name: db.dispName }))}
                                        value={datagate.database ? datagate.database.dbId : -1}
                                        onChange={(v) => this.onEdit(v != -1 ? databases.find((db) => db.dbId == v) : -1, 'database')}
                                        validationState={!isReadOnly && inputCheck.database.state}
                                        helpText={!isReadOnly && inputCheck.database.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="通信プロトコル" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={isReadOnly}
                                        options={PROTOCOL_TYPES}
                                        value={datagate.protocolType}
                                        onChange={(v) => this.onEdit(v, 'protocolType')}
                                        validationState={!isReadOnly && inputCheck.protocolType.state}
                                        helpText={!isReadOnly && inputCheck.protocolType.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="通信オプション" columnCount={2} isRequired={false} >
                                    <TextForm
                                        isReadOnly={isReadOnly}
                                        value={datagate.comOption}
                                        maxlength={MAX_LENGTH.comOption}
                                        onChange={(v) => this.onEdit(v, 'comOption')}
                                        validationState={!isReadOnly && inputCheck.comOption.state}
                                        helpText={!isReadOnly && inputCheck.comOption.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="使用状況" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={isReadOnly}
                                        options={[{ value: true, name: '使用中' }, { value: false, name: '未使用' }]}
                                        value={datagate.useFlg.toString()}
                                        onChange={(v) => this.onEdit(v, 'useFlg')}
                                        validationState={!isReadOnly && inputCheck.useFlg.state}
                                        helpText={!isReadOnly && inputCheck.useFlg.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="ポーリング周期" columnCount={2} isRequired={false} >
                                    <TextForm
                                        isReadOnly={isReadOnly}
                                        value={datagate.poolInterval}
                                        onChange={(v) => this.onEdit(v, 'poolInterval')}
                                        unit="秒"
                                        validationState={!isReadOnly && inputCheck.poolInterval.state}
                                        helpText={!isReadOnly && inputCheck.poolInterval.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="機器種別" columnCount={2} isRequired={false} >
                                    <SelectForm
                                        isReadOnly={isReadOnly}
                                        options={GATE_TYPE_OPTIONS}
                                        value={datagate.gateType !== GATE_TYPE_NULL.realValue? datagate.gateType : GATE_TYPE_NULL.value}
                                        isRequired
                                        onChange={(v) => this.onEdit(this.getGateType(v), 'gateType')}
                                        validationState={!isReadOnly && inputCheck.gateType.state}
                                        helpText={!isReadOnly && inputCheck.gateType.helpText}
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