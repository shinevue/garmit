'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';

import InputTable from 'Common/Form/InputTable';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';

export default class PointSettingBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, dataTypes, onEdit, inputCheck, isReadOnly, maxlength } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ポイント</Box.Title>
                </Box.Header >
                <Box.Body>
                    <div>閾値は 上限異常>上限注意>下限注意>下限異常 となるよう入力してください</div>
                    <InputTable
                        headerInfo={[
                            { label: 'データ種別', columnSize: 1, className: 'garmit-input-header' },
                            { label: '単位', columnSize: 1 },
                            { label: 'フォーマット', columnSize: 1, isRequired: true },
                            { label: '閾値（上限異常）', columnSize: 1 },
                            { label: '閾値（上限注意）', columnSize: 1 },
                            { label: '閾値（下限注意）', columnSize: 1 },
                            { label: '閾値（下限異常）', columnSize: 1 },
                            { label: '不感時間（異常発生）（秒）', columnSize: 1 },
                            { label: '不感時間（注意発生）（秒）', columnSize: 1 },
                            { label: '不感時間（異常復旧）（秒）', columnSize: 1 },
                            { label: '不感時間（注意復旧）（秒）', columnSize: 1 }
                        ]}
                        inputComponentList={[LabelForm, TextForm, TextForm, TextForm, TextForm, TextForm, TextForm, TextForm, TextForm, TextForm, TextForm]}
                        data={
                            dataTypes && dataTypes.map((dt, i) => ({
                                id: i,
                                columnInfo: [
                                    { value: dt.name },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultUnit,
                                        maxlength: maxlength.defaultUnit,
                                        onChange: (val) => onEdit(val, i, 'defaultUnit'),
                                        validationState: !isReadOnly && inputCheck[i].defaultUnit.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultUnit.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultFormat,
                                        maxlength: maxlength.defaultFormat,
                                        onChange: (val) => onEdit(val, i, 'defaultFormat'),
                                        validationState: !isReadOnly && inputCheck[i].defaultFormat.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultFormat.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultUpperError,
                                        onChange: (val) => onEdit(val, i, 'defaultUpperError'),
                                        validationState: !isReadOnly && inputCheck[i].defaultUpperError.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultUpperError.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultUpperAlarm,
                                        onChange: (val) => onEdit(val, i, 'defaultUpperAlarm'),
                                        validationState: !isReadOnly && inputCheck[i].defaultUpperAlarm.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultUpperAlarm.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultLowerAlarm,
                                        onChange: (val) => onEdit(val, i, 'defaultLowerAlarm'),
                                        validationState: !isReadOnly && inputCheck[i].defaultLowerAlarm.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultLowerAlarm.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultLowerError,
                                        onChange: (val) => onEdit(val, i, 'defaultLowerError'),
                                        validationState: !isReadOnly && inputCheck[i].defaultLowerError.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultLowerError.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultErrorOcBlindTime,
                                        onChange: (val) => onEdit(val, i, 'defaultErrorOcBlindTime'),
                                        validationState: !isReadOnly && inputCheck[i].defaultErrorOcBlindTime.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultErrorOcBlindTime.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultAlarmOcBlindTime,
                                        onChange: (val) => onEdit(val, i, 'defaultAlarmOcBlindTime'),
                                        validationState: !isReadOnly && inputCheck[i].defaultAlarmOcBlindTime.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultAlarmOcBlindTime.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultErrorRcBlindTime,
                                        onChange: (val) => onEdit(val, i, 'defaultErrorRcBlindTime'),
                                        validationState: !isReadOnly && inputCheck[i].defaultErrorRcBlindTime.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultErrorRcBlindTime.helpText
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        value: dt.defaultAlarmRcBlindTime,
                                        onChange: (val) => onEdit(val, i, 'defaultAlarmRcBlindTime'),
                                        validationState: !isReadOnly && inputCheck[i].defaultAlarmRcBlindTime.state,
                                        helpText: !isReadOnly && inputCheck[i].defaultAlarmRcBlindTime.helpText
                                    }
                                ]
                            }))
                        }
                    />
                </Box.Body>
            </Box>
        );
    }
}