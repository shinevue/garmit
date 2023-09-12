'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import InputTable from 'Common/Form/InputTable';
import LabelForm from 'Common/Form/LabelForm';
import SoundForm from 'SoundSetting/SoundForm';

export default class DataTypeSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataTypes: props.dataTypes,
            target: null
        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, soundFileList, checked, dataTypes, isReadOnly } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>データ種別毎サウンド</Box.Title>
                </Box.Header>
                <Box.Body>
                {dataTypes &&
                    <InputTable
                        headerInfo={[
                            { label: 'データ種別', columnSize: 1, className: 'garmit-input-header' },
                            { label: '上限異常', columnSize: 2 },
                            { label: '上限注意', columnSize: 2 },
                            { label: '下限異常', columnSize: 2 },
                            { label: '下限注意', columnSize: 2 },
                        ]}
                        inputComponentList={[LabelForm, SoundForm, SoundForm, SoundForm, SoundForm]}
                        data={
                            dataTypes.map((dt, i) => ({
                                id: i,
                                columnInfo: [
                                    { value: dt.name },
                                    {
                                        isReadOnly: isReadOnly,
                                        name: dt.upperErrorSound,
                                        checked: checked[i] && checked[i].upperErrorSound,
                                        onCheckButtonClick: () => this.props.onCheckChange(i, 'upperErrorSound'),
                                        onClearButtonClick: () => this.props.onClearClick(i, 'upperErrorSound')
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        name: dt.upperAlarmSound,
                                        checked: checked[i] && checked[i].upperAlarmSound,
                                        onCheckButtonClick: () => this.props.onCheckChange(i, 'upperAlarmSound'),
                                        onClearButtonClick: () => this.props.onClearClick(i, 'upperAlarmSound')
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        name: dt.lowerErrorSound,
                                        checked: checked[i] && checked[i].lowerErrorSound,
                                        onCheckButtonClick: () => this.props.onCheckChange(i, 'lowerErrorSound'),
                                        onClearButtonClick: () => this.props.onClearClick(i, 'lowerErrorSound')
                                    },
                                    {
                                        isReadOnly: isReadOnly,
                                        name: dt.lowerAlarmSound,
                                        checked: checked[i] && checked[i].lowerAlarmSound,
                                        onCheckButtonClick: () => this.props.onCheckChange(i, 'lowerAlarmSound'),
                                        onClearButtonClick: () => this.props.onClearClick(i, 'lowerAlarmSound')
                                    },
                                ]
                            }))
                        }
                    />
                }
                </Box.Body>
            </Box>
        );
    }
}