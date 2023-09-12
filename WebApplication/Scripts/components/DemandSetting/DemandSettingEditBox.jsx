'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { LAVEL_TYPE } from 'authentication';　　

import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LocationForm from 'Assets/Condition/LocationForm';
import MessageModal from 'Assets/Modal/MessageModal';

import { isSocTrigger } from 'demandSetUtility';

export default class DemandSettingEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: {}
        };
    }

    /**
     * ロケーションが変更された時
     * @param {any} location
     */
    onChangeLocation(location) {       
        const triggerThresholds = this.props.demandSet.triggerThresholds
            .filter((tt) => !isSocTrigger(tt.triggerType.triggerId))
            .map((tt) => Object.assign({}, tt, { pointNo: null, pointName: null }));

        this.props.onEdit([
            { val: location, key: 'location' },
            { val: triggerThresholds, key: 'triggerThresholds' }
        ]);
    }

    /**
     * デマンド設定可能なロケーションのリストを生成する
     * @param {any} locations
     */
    makeAvailableLocationList(locations) {
        const locs = $.extend(true, [], locations);
        locs.forEach((loc) => {
            loc.children = (loc.children && loc.children.length > 0) ? this.makeAvailableLocationList(loc.children) : null;
            loc.unselectable = loc.hasDemandSet;
        });
        return locs;
    }

    /**
     * メッセージを消す
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * render
     */
    render() {
        const { lookUp, level, maxlength, demandSet, inputCheck, points, mode, isLoading } = this.props;
        const { message } = this.state

        return (            
            <Box boxStyle="default" isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>デマンド</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="ロケーション" columnCount={1} isRequired>
                                <LocationForm
                                    disabled={mode == 'edit'}
                                    locationList={(lookUp && this.makeAvailableLocationList(lookUp.locations)) || []}
                                    selectedLocation={demandSet.location}
                                    onChange={(val) => this.onChangeLocation(val)}
                                    validationState={inputCheck.location.state}
                                    helpText={inputCheck.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="契約電力" columnCount={2} >
                                <TextForm
                                    isReadOnly={level !== LAVEL_TYPE.administrator}
                                    value={demandSet ? demandSet.contractPower : ''}
                                    onChange={(val) => this.props.onEdit([{ val: val, key: 'contractPower' }])}
                                    validationState={inputCheck.contractPower && inputCheck.contractPower.state}
                                    helpText={inputCheck.contractPower && inputCheck.contractPower.helpText}
                                    unit="kW"
                                />
                            </InputForm.Col>
                            <InputForm.Col label="目標電力量値" columnCount={2}>
                                <TextForm
                                    isReadOnly={level !== LAVEL_TYPE.administrator}
                                    value={demandSet ? demandSet.targetEnergy : ''}
                                    onChange={(val) => this.props.onEdit([{ val: val, key: 'targetEnergy' }])}
                                    validationState={inputCheck.targetEnergy && inputCheck.targetEnergy.state}
                                    helpText={inputCheck.targetEnergy && inputCheck.targetEnergy.helpText}
                                    unit="kWh"
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    <MessageModal
                        show={message.show}
                        title={message.title}
                        bsSize={message.bsSize}
                        buttonStyle={message.buttonStyle}
                        onOK={message.onOK}
                        onCancel={message.onCancel}
                    >
                        {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    </MessageModal>
                </Box.Body>
            </Box>
        );
    }
}