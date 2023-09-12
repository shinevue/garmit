'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Form } from 'react-bootstrap';

import Box from 'Common/Layout/Box';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';

import MaintenanceScheduleModal from 'Point/MaintenanceScheduleModal';

import { LAVEL_TYPE } from 'authentication';　
import { maxLength } from 'pointUtility';
import { OPERAND_TYPE } from 'expressionUtility';

export default class MeasurementInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showMaintScheduleModal: false
        };
    }

    render() {
        const { lookUp, point, onEdit, inputCheck, bulk, checked, level, maintenanceSchedules } = this.props;
        const { showDatagateSettingModal, showMaintScheduleModal } = this.state;

        return (
            <Box boxStyle="default">
                <Box.Header>
                    <Box.Title>測定情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    {!bulk ?
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="計測機器" columnCount={1} isRequired={false}>
                                    <SelectForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        style={{ display: 'inline-block' }}
                                        value={point.datagate ? point.datagate.gateId : -1}
                                        options={lookUp && lookUp.datagates && lookUp.datagates.map((gate) => ({ value: gate.gateId, name: `(${gate.gateId}) ${gate.name}` }))}
                                        onChange={(id) => onEdit([{ value: id != -1 ? lookUp.datagates.find((gate) => gate.gateId == id) : -1, key: 'datagate' }])}
                                        validationState={inputCheck.datagate && inputCheck.datagate.state}
                                        helpText={inputCheck.datagate && inputCheck.datagate.helpText}
                                    />
                                    {point.datagate && point.datagate.ipAddress &&
                                        <LabelForm style={{ display: 'inline-block' }} value={`　IPアドレス: ${point.datagate.ipAddress}`} />}
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="サブゲートID" columnCount={2} isRequired={false}>
                                    <TextForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.subGateId ? point.subGateId : ''}
                                        onChange={(val) => onEdit([{ value: val, key: 'subGateId' }])}
                                        validationState={inputCheck.subGateId && inputCheck.subGateId.state}
                                        helpText={inputCheck.subGateId && inputCheck.subGateId.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="アドレス" columnCount={2} isRequired={false}>
                                    <TextareaForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.address ? point.address : ''}
                                        maxlength={maxLength.address}
                                        onChange={(val) => onEdit([{ value: val, key: 'address' }])}
                                        validationState={inputCheck.address && inputCheck.address.state}
                                        helpText={inputCheck.address && inputCheck.address.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="データ保存先" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.database && point.database.dbId}
                                        options={lookUp && lookUp.databases && lookUp.databases.map((db) => ({ value: db.dbId, name: db.dispName }))}
                                        onChange={(dbId) => onEdit([{ value: dbId != -1 ? lookUp.databases.find((db) => db.dbId == dbId) : -1, key: 'database' }])}
                                        validationState={inputCheck.database && inputCheck.database.state}
                                        helpText={inputCheck.database && inputCheck.database.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="データ倍率" columnCount={2} isRequired={false}>
                                    <TextForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.scale}
                                        onChange={(val) => onEdit([{ value: val, key: 'scale' }])}
                                        validationState={inputCheck.scale && inputCheck.scale.state}
                                        helpText={inputCheck.scale && inputCheck.scale.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="データ収集" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.useFlg.toString()}
                                        options={[{ value: 'true', name: '収集中' }, { value: 'false', name: '停止中' }]}
                                        onChange={(val) => onEdit([{ value: val, key: 'useFlg' }])}
                                        validationState={inputCheck.useFlg && inputCheck.useFlg.state}
                                        helpText={inputCheck.useFlg && inputCheck.useFlg.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="収集周期" columnCount={2} isRequired={true}>
                                    <TextForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.recordInterval ? point.recordInterval : ''}
                                        onChange={(val) => onEdit([{ value: val, key: 'recordInterval' }])}
                                        unit="秒"
                                        validationState={inputCheck.recordInterval && inputCheck.recordInterval.state}
                                        helpText={inputCheck.recordInterval && inputCheck.recordInterval.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="判定開始状況" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                        value={point.detectedFlg.toString()}
                                        options={[{ value: true, name: '判定開始' }, { value: false, name: '判定停止' }]}
                                        onChange={(val) => onEdit([{ value: val, key: "detectedFlg" }])}
                                        validationState={inputCheck.detectedFlg && inputCheck.detectedFlg.state}
                                        helpText={inputCheck.detectedFlg && inputCheck.detectedFlg.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="アラーム監視" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={level === LAVEL_TYPE.normal}
                                        value={point.maintMode.toString()}
                                        options={[{ value: true, name: '監視しない' }, { value: false, name: '監視する' }]}
                                        onChange={(val) => onEdit([{ value: val, key: "maintMode" }])}
                                        addonButton={maintenanceSchedules && maintenanceSchedules.length > 0 && {
                                            iconId: 'category-schedule',
                                            isCircle: true,
                                            tooltipLabel: 'メンテンナンススケジュール確認',
                                        }}
                                        onButtonClick={() => this.setState({ showMaintScheduleModal: true })}
                                        validationState={inputCheck.maintMode && inputCheck.maintMode.state}
                                        helpText={inputCheck.maintMode && inputCheck.maintMode.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="データフォーマット" columnCount={2} isRequired={true} >
                                    <TextForm
                                        isReadOnly={level === LAVEL_TYPE.normal}
                                        value={point.format}
                                        maxlength={maxLength.format}
                                        onChange={(val) => onEdit([{ value: val, key: 'format' }])}
                                        validationState={inputCheck.format && inputCheck.format.state}
                                        helpText={inputCheck.format && inputCheck.format.helpText}
                                    />
                                </InputForm.Col>
                                {(!point.calcPointSet || !point.calcPointSet[0] || [OPERAND_TYPE.alarm, OPERAND_TYPE.error].indexOf(point.calcPointSet[0].calcDetails[0].valueType) < 0) &&
                                    <InputForm.Col label="単位" columnCount={2} isRequired={false} >
                                        <TextForm
                                            isReadOnly={level === LAVEL_TYPE.normal}
                                            value={point.unit}
                                            maxlength={maxLength.unit}
                                            onChange={(val) => onEdit([{ value: val, key: 'unit' }])}
                                            validationState={inputCheck.unit && inputCheck.unit.state}
                                            helpText={inputCheck.unit && inputCheck.unit.helpText}
                                        />
                                    </InputForm.Col>
                                }
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="デマンド区分" columnCount={2} isRequired={false} helpText="デマンドグラフやデマンドサマリで参照したい場合に設定してください。">
                                    <SelectForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.pointType && point.pointType.pointTypeNo.toString()}
                                        options={lookUp && lookUp.pointTypes && lookUp.pointTypes.map((pt) => ({ value: pt.pointTypeNo, name: pt.name }))}
                                        onChange={(pointTypeNo) => onEdit([{ value: pointTypeNo != -1 ? lookUp.pointTypes.find((pt) => pt.pointTypeNo == pointTypeNo) : null, key: 'pointType' }])}
                                        validationState={inputCheck.pointType && inputCheck.pointType.state}
                                        helpText={inputCheck.pointType && inputCheck.pointType.helpText}
                                    />
                                </InputForm.Col>                             
                                <InputForm.Col label="カウンタストップ値" columnCount={2} isRequired={false} >
                                    <TextForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.loopMaxValue ? point.loopMaxValue : ''}
                                        onChange={(val) => onEdit([{ value: val, key: 'loopMaxValue' }])}
                                        validationState={inputCheck.loopMaxValue && inputCheck.loopMaxValue.state}
                                        helpText={inputCheck.loopMaxValue && inputCheck.loopMaxValue.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="MQTTデータ倍率" columnCount={2} isRequired={false} >
                                    <TextForm
                                        isReadOnly={level !== LAVEL_TYPE.administrator}
                                        value={point.bufferScale}
                                        onChange={(val) => onEdit([{ value: val, key: 'bufferScale' }])}
                                        validationState={inputCheck.bufferScale && inputCheck.bufferScale.state}
                                        helpText={inputCheck.bufferScale && inputCheck.bufferScale.helpText}
                                    />
                                </InputForm.Col> 
                            </InputForm.Row>
                        </InputForm>
                        :
                        <InputForm>
                            {level === LAVEL_TYPE.administrator &&
                                <InputForm.Row>
                                    <InputForm.Col
                                        label="データ倍率"
                                        columnCount={3}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.scale}
                                        onCheckChange={() => this.props.onCheckChange([{ value: !checked.scale, key: 'scale' }])}
                                    >
                                        <TextForm
                                            value={point.scale}
                                            onChange={(val) => onEdit([{ value: val, key: 'scale' }])}
                                            validationState={inputCheck.scale && inputCheck.scale.state}
                                            helpText={inputCheck.scale && inputCheck.scale.helpText}
                                            isReadOnly={!checked.scale}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col
                                        label="データ収集"
                                        columnCount={3}
                                        isRequired={true}
                                        checkbox={bulk}
                                        checked={bulk && checked.useFlg}
                                        onCheckChange={() => this.props.onCheckChange([{ value: !checked.useFlg, key: 'useFlg' }])}
                                    >
                                        <SelectForm
                                            isReadOnly={!checked.useFlg}
                                            value={point.useFlg}
                                            options={[{ value: true, name: '収集中' }, { value: false, name: '停止中' }]}
                                            onChange={(val) => onEdit([{ value: val, key: 'useFlg' }])}
                                            validationState={inputCheck.useFlg && inputCheck.useFlg.state}
                                            helpText={inputCheck.useFlg && inputCheck.useFlg.helpText}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col
                                        label="収集周期"
                                        columnCount={3}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.recordInterval}
                                        onCheckChange={() => this.props.onCheckChange([{ value: !checked.recordInterval, key: 'recordInterval' }])}
                                    >
                                        <TextForm
                                            isReadOnly={!checked.recordInterval}
                                            value={point.recordInterval ? point.recordInterval : ''}
                                            onChange={(val) => onEdit([{ value: val, key: 'recordInterval' }])}
                                            unit="秒"
                                            validationState={inputCheck.recordInterval && inputCheck.recordInterval.state}
                                            helpText={inputCheck.recordInterval && inputCheck.recordInterval.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                            }
                            <InputForm.Row>
                                <InputForm.Col
                                    label="アラーム監視"
                                    columnCount={3}
                                    isRequired={true}
                                    checkbox={bulk}
                                    checked={bulk && checked.maintMode}
                                    onCheckChange={() => this.props.onCheckChange([{ value: !checked.maintMode, key: 'maintMode' }])}
                                >
                                    <SelectForm
                                        isReadOnly={!checked.maintMode}
                                        value={point.maintMode.toString()}
                                        options={[{ value: true, name: 'しない' }, { value: false, name: 'する' }]}
                                        onChange={(val) => onEdit([{ value: val, key: "maintMode" }])}
                                        validationState={inputCheck.maintMode && inputCheck.maintMode.state}
                                        helpText={inputCheck.maintMode && inputCheck.maintMode.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col
                                    label="データフォーマット"
                                    columnCount={3}
                                    isRequired={true}
                                    checkbox={bulk}
                                    checked={bulk && checked.format}
                                    onCheckChange={() => this.props.onCheckChange([{ value: !checked.format, key: 'format' }])}
                                >
                                    <TextForm
                                        isReadOnly={!checked.format}
                                        value={point.format}
                                        maxlength={maxLength.format}
                                        onChange={(val) => onEdit([{ value: val, key: 'format' }])}
                                        validationState={inputCheck.format && inputCheck.format.state}
                                        helpText={inputCheck.format && inputCheck.format.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col
                                    label="単位"
                                    columnCount={3}
                                    isRequired={false}
                                    checkbox={bulk}
                                    checked={bulk && checked.unit}
                                    onCheckChange={() => this.props.onCheckChange([{ value: !checked.unit, key: 'unit' }])}
                                >
                                    <TextForm
                                        isReadOnly={!checked.unit}
                                        value={point.unit}
                                        maxlength={maxLength.unit}
                                        onChange={(val) => onEdit([{ value: val, key: 'unit' }])}
                                        validationState={inputCheck.unit && inputCheck.unit.state}
                                        helpText={inputCheck.unit && inputCheck.unit.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            {level === LAVEL_TYPE.administrator &&
                                <InputForm.Row>
                                    <InputForm.Col
                                        label="カウンタストップ値"
                                        columnCount={2}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.loopMaxValue}
                                        onCheckChange={() => this.props.onCheckChange([{ value: !checked.loopMaxValue, key: 'loopMaxValue' }])}
                                    >
                                        <TextForm
                                            value={point.loopMaxValue}
                                            onChange={(val) => onEdit([{ value: val, key: 'loopMaxValue' }])}
                                            validationState={inputCheck.loopMaxValue && inputCheck.loopMaxValue.state}
                                            helpText={inputCheck.loopMaxValue && inputCheck.loopMaxValue.helpText}
                                            isReadOnly={!checked.loopMaxValue}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col
                                        label="MQTTデータ倍率"
                                        columnCount={2}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.bufferScale}
                                        onCheckChange={() => this.props.onCheckChange([{ value: !checked.bufferScale, key: 'bufferScale' }])}
                                    >
                                        <TextForm
                                            value={point.bufferScale}
                                            onChange={(val) => onEdit([{ value: val, key: 'bufferScale' }])}
                                            validationState={inputCheck.bufferScale && inputCheck.bufferScale.state}
                                            helpText={inputCheck.bufferScale && inputCheck.bufferScale.helpText}
                                            isReadOnly={!checked.bufferScale}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                            }
                        </InputForm>
                    }
                    <MaintenanceScheduleModal
                        showModal={showMaintScheduleModal}
                        pointNo={point.pointNo}
                        maintenanceSchedules={maintenanceSchedules}
                        onHide={() => this.setState({ showMaintScheduleModal: false })}
                    />
                </Box.Body>
            </Box>
        );
    }
}