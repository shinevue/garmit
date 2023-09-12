'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { OverlayTrigger, Tooltip, Form } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';

import ThresholdSettingForm from 'Point/ThresholdSettingForm';
import DefaultApplyModal from 'Point/DefaultApplyModal';

import { LAVEL_TYPE } from 'authentication';　　

export default class AlarmSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
    }

    /**
     * 閾値が変更されたとき
     * @param {any} value
     * @param {any} percentage
     * @param {any} key
     */
    onThresholdChange(value, percentage, key) {
        this.props.onEdit([{ value: value, key: key }, { value: percentage, key: `${key}Percentage` }]);
    }

    render() {
        const { lookUp, point, onEdit, inputCheck, bulk, checked, onCheckChange, level } = this.props;
        const { showModal } = this.state;

        const isReadOnly = level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal;

        return (
            <Box boxStyle='default'>
                <Box.Header>
                    <Box.Title>アラーム判定情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    <DefaultApplyModal
                        showModal={this.state.showModal}
                        onHide={() => this.setState({ showModal: false })}
                        onApply={(values) => this.props.onEdit(values)}
                        point={point}
                    />
                    {!bulk &&
                        <Button
                            disabled={isReadOnly || point.datatype == null || point.datatype == -1}
                            className="mb-1"
                            iconId="default"
                            onClick={() => this.setState({ showModal: true })}
                        >
                            <span>デフォルト値適用</span>
                        </Button>
                    }
                    {point.ratedCurrent &&
                        <LabelForm
                            label="定格値:　"
                            value={point.ratedCurrent}
                            className="mr-2"
                        />
                    }
                    <div>閾値は 上限異常>上限注意>下限注意>下限異常 となるよう入力してください</div>
                    <InputForm>
                        {point.ratedCurrent ?
                            <div>
                                <InputForm.Row>
                                    <InputForm.Col
                                        label='閾値（上限異常）'
                                        columnCount={1}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.upperError}
                                        onCheckChange={() => onCheckChange([{ value: !checked.upperError, key: 'upperError' }])}
                                    >
                                        <ThresholdSettingForm
                                            disabled={(bulk && !checked.upperError) || isReadOnly}
                                            unit={point.unit}
                                            value={point.upperError}
                                            percentage={point.upperErrorPercentage}
                                            rated={point.ratedCurrent}
                                            onChange={(val, percentage) => this.onThresholdChange(val, percentage, "upperError")}
                                            valueValidationState={(!bulk || checked.upperError) && inputCheck.upperError && inputCheck.upperError.state}
                                            valueHelpText={(!bulk || checked.upperError) && inputCheck.upperError && inputCheck.upperError.helpText}
                                            percentageValidationState={(!bulk || checked.upperError) && inputCheck.upperErrorPercentage && inputCheck.upperErrorPercentage.state}
                                            percentageHelpText={(!bulk || checked.upperError) && inputCheck.upperErrorPercentage && inputCheck.upperErrorPercentage.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col
                                        label='閾値（上限注意）'
                                        columnCount={1}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.upperAlarm}
                                        onCheckChange={() => onCheckChange([{ value: !checked.upperAlarm, key: 'upperAlarm' }])}
                                    >
                                        <ThresholdSettingForm
                                            disabled={(bulk && !checked.upperAlarm) || isReadOnly}
                                            unit={point.unit}
                                            value={point.upperAlarm}
                                            percentage={point.upperAlarmPercentage}
                                            rated={point.ratedCurrent}
                                            onChange={(val, percentage) => this.onThresholdChange(val, percentage, "upperAlarm")}
                                            valueValidationState={(!bulk || checked.upperAlarm) && inputCheck.upperAlarm && inputCheck.upperAlarm.state}
                                            valueHelpText={(!bulk || checked.upperAlarm) && inputCheck.upperAlarm && inputCheck.upperAlarm.helpText}
                                            percentageValidationState={(!bulk || checked.upperAlarm) && inputCheck.upperAlarmPercentage && inputCheck.upperAlarmPercentage.state}
                                            percentageHelpText={(!bulk || checked.upperAlarm) && inputCheck.upperAlarmPercentage && inputCheck.upperAlarmPercentage.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col
                                        label='閾値（下限注意）'
                                        columnCount={1}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.lowerAlarm}
                                        onCheckChange={() => onCheckChange([{ value: !checked.lowerAlarm, key: 'lowerAlarm' }])}
                                    >
                                        <ThresholdSettingForm
                                            disabled={(bulk && !checked.lowerAlarm) || isReadOnly}
                                            unit={point.unit}
                                            value={point.lowerAlarm}
                                            percentage={point.lowerAlarmPercentage}
                                            rated={point.ratedCurrent}
                                            onChange={(val, percentage) => this.onThresholdChange(val, percentage, "lowerAlarm")}
                                            valueValidationState={(!bulk || checked.lowerAlarm) && inputCheck.lowerAlarm && inputCheck.lowerAlarm.state}
                                            valueHelpText={(!bulk || checked.lowerAlarm) && inputCheck.lowerAlarm && inputCheck.lowerAlarm.helpText}
                                            percentageValidationState={(!bulk || checked.lowerAlarm) && inputCheck.lowerAlarmPercentage && inputCheck.lowerAlarmPercentage.state}
                                            percentageHelpText={(!bulk || checked.lowerAlarm) && inputCheck.lowerAlarmPercentage && inputCheck.lowerAlarmPercentage.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col
                                        label='閾値（下限異常）'
                                        columnCount={1}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.lowerError}
                                        onCheckChange={() => onCheckChange([{ value: !checked.lowerError, key: 'lowerError' }])}
                                    >
                                        <ThresholdSettingForm
                                            disabled={(bulk && !checked.lowerError) || isReadOnly}
                                            unit={point.unit}
                                            value={point.lowerError}
                                            percentage={point.lowerErrorPercentage}
                                            rated={point.ratedCurrent}
                                            onChange={(val, percentage) => this.onThresholdChange(val, percentage, "lowerError")}
                                            valueValidationState={(!bulk || checked.lowerError) && inputCheck.lowerError && inputCheck.lowerError.state}
                                            valueHelpText={(!bulk || checked.lowerError) && inputCheck.lowerError && inputCheck.lowerError.helpText}
                                            percentageValidationState={(!bulk || checked.lowerError) && inputCheck.lowerErrorPercentage && inputCheck.lowerErrorPercentage.state}
                                            percentageHelpText={(!bulk || checked.lowerError) && inputCheck.lowerErrorPercentage && inputCheck.lowerErrorPercentage.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                            </div>
                            :
                            <div>
                                <InputForm.Row>
                                    <InputForm.Col
                                        label='閾値（上限異常）'
                                        columnCount={2}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.upperError}
                                        onCheckChange={() => onCheckChange([{ value: !checked.upperError, key: 'upperError' }])}
                                    >
                                        <TextForm
                                            isReadOnly={(bulk && !checked.upperError) || isReadOnly}
                                            unit={point.unit}
                                            value={point.upperError}
                                            onChange={(val) => onEdit([{ value: val, key: 'upperError' }])}
                                            validationState={(!bulk || checked.upperError) && inputCheck.upperError && inputCheck.upperError.state}
                                            helpText={(!bulk || checked.upperError) && inputCheck.upperError && inputCheck.upperError.helpText}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col
                                        label='閾値（上限注意）'
                                        columnCount={2}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.upperAlarm}
                                        onCheckChange={() => onCheckChange([{ value: !checked.upperAlarm, key: 'upperAlarm' }])}
                                    >
                                        <TextForm
                                            isReadOnly={(bulk && !checked.upperAlarm) || isReadOnly}
                                            unit={point.unit}
                                            value={point.upperAlarm}
                                            onChange={(val) => onEdit([{ value: val, key: 'upperAlarm' }])}
                                            validationState={(!bulk || checked.upperAlarm) && inputCheck.upperAlarm && inputCheck.upperAlarm.state}
                                            helpText={(!bulk || checked.upperAlarm) && inputCheck.upperAlarm && inputCheck.upperAlarm.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col
                                        label='閾値（下限異常）'
                                        columnCount={2}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.lowerError}
                                        onCheckChange={() => onCheckChange([{ value: !checked.lowerError, key: 'lowerError' }])}
                                    >
                                        <TextForm
                                            isReadOnly={(bulk && !checked.lowerError) || isReadOnly}
                                            unit={point.unit}
                                            value={point.lowerError}
                                            onChange={(val) => onEdit([{ value: val, key: 'lowerError' }])}
                                            validationState={(!bulk || checked.lowerError) && inputCheck.lowerError && inputCheck.lowerError.state}
                                            helpText={(!bulk || checked.lowerError) && inputCheck.lowerError && inputCheck.lowerError.helpText}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col
                                        label='閾値（下限注意）'
                                        columnCount={2}
                                        isRequired={false}
                                        checkbox={bulk}
                                        checked={bulk && checked.lowerAlarm}
                                        onCheckChange={() => onCheckChange([{ value: !checked.lowerAlarm, key: 'lowerAlarm' }])}
                                    >
                                        <TextForm
                                            isReadOnly={(bulk && !checked.lowerAlarm) || isReadOnly}
                                            unit={point.unit}
                                            value={point.lowerAlarm}
                                            onChange={(val) => onEdit([{ value: val, key: 'lowerAlarm' }])}
                                            validationState={(!bulk || checked.lowerAlarm) && inputCheck.lowerAlarm && inputCheck.lowerAlarm.state}
                                            helpText={(!bulk || checked.lowerAlarm) && inputCheck.lowerAlarm && inputCheck.lowerAlarm.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                            </div>
                        }
                        <InputForm.Row>
                            <InputForm.Col
                                label='不感時間（異常発生）'
                                columnCount={2}
                                isRequired={false}
                                checkbox={bulk}
                                checked={bulk && checked.errorOccurBlindTime}
                                onCheckChange={() => onCheckChange([{ value: !checked.errorOccurBlindTime, key: 'errorOccurBlindTime' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.errorOccurBlindTime) || isReadOnly}
                                    value={point.errorOccurBlindTime}
                                    unit="秒"
                                    onChange={(val) => onEdit([{ value: val, key: "errorOccurBlindTime" }])}
                                    validationState={inputCheck.errorOccurBlindTime && inputCheck.errorOccurBlindTime.state}
                                    helpText={inputCheck.errorOccurBlindTime && inputCheck.errorOccurBlindTime.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col
                                label='不感時間（注意発生）'
                                columnCount={2}
                                isRequired={false}
                                checkbox={bulk}
                                checked={bulk && checked.alarmOccurBlindTime}
                                onCheckChange={() => onCheckChange([{ value: !checked.alarmOccurBlindTime, key: 'alarmOccurBlindTime' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.alarmOccurBlindTime) || isReadOnly}
                                    value={point.alarmOccurBlindTime}
                                    unit="秒"
                                    onChange={(val) => onEdit([{ value: val, key: "alarmOccurBlindTime" }])}
                                    validationState={inputCheck.alarmOccurBlindTime && inputCheck.alarmOccurBlindTime.state}
                                    helpText={inputCheck.alarmOccurBlindTime && inputCheck.alarmOccurBlindTime.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col
                                label='不感時間（異常復旧）'
                                columnCount={2}
                                isRequired={false}
                                checkbox={bulk}
                                checked={bulk && checked.errorRecoverBlindTime}
                                onCheckChange={() => onCheckChange([{ value: !checked.errorRecoverBlindTime, key: 'errorRecoverBlindTime' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.errorRecoverBlindTime) || isReadOnly}
                                    value={point.errorRecoverBlindTime}
                                    unit="秒"
                                    onChange={(val) => onEdit([{ value: val, key: "errorRecoverBlindTime" }])}
                                    validationState={inputCheck.errorRecoverBlindTime && inputCheck.errorRecoverBlindTime.state}
                                    helpText={inputCheck.errorRecoverBlindTime && inputCheck.errorRecoverBlindTime.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col
                                label='不感時間（注意復旧）'
                                columnCount={2}
                                isRequired={false}
                                checkbox={bulk}
                                checked={bulk && checked.alarmRecoverBlindTime}
                                onCheckChange={() => onCheckChange([{ value: !checked.alarmRecoverBlindTime, key: 'alarmRecoverBlindTime' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.alarmRecoverBlindTime) || isReadOnly}
                                    value={point.alarmRecoverBlindTime}
                                    unit="秒"
                                    onChange={(val) => onEdit([{ value: val, key: "alarmRecoverBlindTime" }])}
                                    validationState={inputCheck.alarmRecoverBlindTime && inputCheck.alarmRecoverBlindTime.state}
                                    helpText={inputCheck.alarmRecoverBlindTime && inputCheck.alarmRecoverBlindTime.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}