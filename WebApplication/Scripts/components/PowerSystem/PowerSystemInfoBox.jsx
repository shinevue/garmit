/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源系統情報ボックス Reactコンポーネント
 * <PowerSystemInfoBox />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { POWER_DISTRIBUTION_SYSTEM } from 'constant';
import { VALIDATE_STATE, successResult } from 'inputCheck';
import { LAVEL_TYPE } from 'authentication';

import { Button, ButtonToolbar, FormGroup, FormControl, HelpBlock, Grid, Row, Col, InputGroup, Checkbox } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import Text2DForm from 'Common/Form/Text2DForm';
import SelectForm from 'Common/Form/SelectForm';
import TreeView from 'Common/Widget/TreeView';
import EgroupSelectModal from 'Assets/Modal/EgroupSelectModal';
import EgroupForm from 'Assets/Condition/EgroupForm';

/**
 * 電源系統情報ボックス
 * <PowerSystemInfoBox layoutInfo={}></PowerSystemInfoBox>
 * @param {object} layoutInfo レイアウト情報
 */
export default class PowerSystemInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    /**
     * 分岐電源に紐づけるチェック変更イベント
     */
    changeLinkCheck(checked) {
        this.props.onIsEgroupLinkChange(checked);
    }

    /**
     * 親電源系統選択イベント
     */
    onSelectParent(egroup) {
        this.setState({ showModal: false });
        this.props.onChange([{ value: egroup, key: 'parent' }, { value: null, key: 'connectedBreaker' }]);
    }

    /**
     * 分岐電源数の入力チェックを生成
     */
    makeMaxBreakerCountInputCheck() {
        const { rowCount, colCount } = this.props.inputCheck;

        if (rowCount.state === VALIDATE_STATE.error) {
            return { state: VALIDATE_STATE.error, helpText: `行: ${rowCount.helpText}` };
        }
        if (colCount.state === VALIDATE_STATE.error) {
            return { state: VALIDATE_STATE.error, helpText: `列: ${colCount.helpText}` };
        }

        return successResult;
    }


    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, level, egroup, egroupList, onChange, inputCheck, maxlength, isEgroupLink } = this.props;
        const { showModal } = this.state;

        const maxBreakerCountInputCheck = this.makeMaxBreakerCountInputCheck();

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                {egroupList &&
                    <EgroupSelectModal
                        egroupList={egroupList}
                        showModal={showModal}
                        onSubmit={(egroup) => this.onSelectParent(egroup)}
                        onCancel={() => this.setState({ showModal: false })}
                    />
                }
                <Box.Header>
                    <Box.Title>電源系統</Box.Title>
                </Box.Header >
                <Box.Body>
                    {egroup ?
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="親電源系統" columnCount={1} isRequired={false}>
                                    <EgroupForm
                                        disabled={isReadOnly || level === LAVEL_TYPE.operator}
                                        selectedEgroup={egroup.parent}
                                        egroupList={egroupList}
                                        onChange={(egroup) => this.onSelectParent(egroup)}
                                        validationState={!isReadOnly && inputCheck.parent.state}
                                        helpText={!isReadOnly && inputCheck.parent.helpText}
                                    />
                                    {egroup.parent && (isReadOnly || inputCheck.parent.state != VALIDATE_STATE.error) &&
                                        <div>
                                            <Checkbox
                                                disabled={isReadOnly || level === LAVEL_TYPE.operator}
                                                checked={isEgroupLink}
                                                onClick={() => this.changeLinkCheck(!isEgroupLink)}
                                            >
                                                分岐電源に紐づける
                                            </Checkbox>
                                            <SelectForm
                                                isReadOnly={!isEgroupLink || isReadOnly || level === LAVEL_TYPE.operator}
                                                value={egroup.connectedBreaker ? egroup.connectedBreaker.breakerNo : -1}
                                                options={egroup.parent && egroup.parent.breakers && egroup.parent.breakers
                                                    .filter((b) => !b.connectedEgroup || b.connectedEgroup.egroupId == egroup.egroupId)
                                                    .map((b) => ({ value: b.breakerNo, name: b.breakerName }))
                                                }
                                                onChange={(val) => onChange([
                                                    { value: egroup.parent.breakers.find((breaker) => breaker.breakerNo == val), key: 'connectedBreaker' }
                                                ])}
                                                validationState={!isReadOnly && isEgroupLink && inputCheck.connectedBreaker.state}
                                                helpText={!isReadOnly && isEgroupLink && inputCheck.connectedBreaker.helpText}
                                            />
                                        </div>
                                    }
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="電源系統名" columnCount={2} isRequired={true}>
                                    <TextForm
                                        isReadOnly={isReadOnly}
                                        value={egroup.egroupName}
                                        maxlength={maxlength.egroupName}
                                        onChange={(val) => onChange([{ value: val, key: 'egroupName' }])}
                                        validationState={!isReadOnly && inputCheck.egroupName.state}
                                        helpText={!isReadOnly && inputCheck.egroupName.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="配電方式" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        isReadOnly={isReadOnly || level === LAVEL_TYPE.operator}
                                        value={egroup.distributionSystem}
                                        options={POWER_DISTRIBUTION_SYSTEM}
                                        onChange={(val) => onChange([{ value: val, key: 'distributionSystem' }])}
                                        validationState={!isReadOnly && inputCheck.distributionSystem.state}
                                        helpText={!isReadOnly && inputCheck.distributionSystem.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="定格電流値" columnCount={2} isRequired={false}>
                                    <TextForm
                                        isReadOnly={isReadOnly || level === LAVEL_TYPE.operator}
                                        value={egroup.ratedCurrent}
                                        onChange={(val) => onChange([{ value: val, key: 'ratedCurrent' }])}
                                        unit="A"
                                        validationState={!isReadOnly && inputCheck.ratedCurrent.state}
                                        helpText={!isReadOnly && inputCheck.ratedCurrent.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="定格電圧値" columnCount={2} isRequired={false}>
                                    <TextForm
                                        isReadOnly={isReadOnly || level === LAVEL_TYPE.operator}
                                        value={egroup.ratedVoltage}
                                        onChange={(val) => onChange([{ value: val, key: 'ratedVoltage' }])}
                                        unit="V"
                                        validationState={!isReadOnly && inputCheck.ratedVoltage.state}
                                        helpText={!isReadOnly && inputCheck.ratedVoltage.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label='定格周波数' columnCount={2} isRequired={false}>
                                    <TextForm
                                        isReadOnly={isReadOnly || level === LAVEL_TYPE.operator}
                                        value={egroup.ratedFrequency}
                                        onChange={(val) => onChange([{ value: val, key: 'ratedFrequency' }])}
                                        unit="Hz"
                                        validationState={!isReadOnly && inputCheck.ratedFrequency.state}
                                        helpText={!isReadOnly && inputCheck.ratedFrequency.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label='分岐電源数' columnCount={2} isRequired={true}>
                                    <Row>
                                        <Col sm={8} >
                                            <Text2DForm
                                                isReadOnly={isReadOnly}
                                                value={{ row: egroup.rowCount, col: egroup.colCount }}
                                                onChange={(v) => onChange([
                                                    { value: v.row, key: 'rowCount' },
                                                    { value: v.col, key: 'colCount' },
                                                    { value: v.row * v.col, key: 'maxBreakerCount' }
                                                ])}
                                                validationState={!isReadOnly && maxBreakerCountInputCheck.state}
                                                helpText={!isReadOnly && maxBreakerCountInputCheck.helpText}
                                            />
                                        </Col>
                                        <Col sm={4}>
                                            <TextForm isReadOnly value={egroup.maxBreakerCount} />
                                        </Col>
                                    </Row>
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                        :
                        <div className="pa-1 ta-c">電源系統が選択されていません</div>
                        }
                </Box.Body>
            </Box>
        );
    }
}

PowerSystemInfoBox.propTypes = {
    
};

