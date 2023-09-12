/**
 * @license Copyright 2021 DENSO
 * 
 * ElectricLockSettingEditBox Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';

import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

import LocationForm from 'Assets/Condition/LocationForm';

import { ELECTRIC_RACK_TARGET, KEY_TYPE_ID, KEY_TYPE_OPTIONS } from 'constant'; 

export default class ElectricLockSettingEditBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * ロケーションが変更された時
     * @param {any} location
     */
    onChangeLocation(location) {
        this.props.onEdit([
            { val: location, key: 'location' },
            { val: null, key: 'keyPoint' },
            { val: null, key: 'useOnValueAsKeyLockValue' },
            { val: null, key: 'doorPoint' },
            { val: null, key: 'useOnValueAsDoorCloseValue' }
        ]);
    }

    /**
     * 鍵種別を変更
     * @param {any} lockType 鍵種別
     */
    onChangeLockType(lockType) { 
        const isPhysicalKey = (lockType === KEY_TYPE_ID.physicalKey);
        this.props.onEdit([
            { val: lockType, key: 'lockType' },
            { val: isPhysicalKey ? null : 3, key: 'target' },
            { val: null, key: 'keyPoint' },
            { val: null, key: 'useOnValueAsKeyLockValue' },
            { val: null, key: 'doorPoint' },
            { val: null, key: 'useOnValueAsDoorCloseValue' },
            { val: isPhysicalKey ? null : 60, key: 'lockedOpenErrOcBlindTime' },
            { val: isPhysicalKey ? null : 60, key: 'lockedOpenErrRcBlindTime' }
        ])
    }

    /**
     * チェック状態が変化したとき
     * @param {any} checked
     * @param {any} key
     */
    onCheckChange(checked, key) {
        this.props.onCheckChange(checked, key)
    }

    /**
     * ポイントリストを取得する
     */
    getPointList() {
        const { points } = this.props;
        if (!points) {
            return [];
        }
        return points.filter((p) => (p.datatype && p.datatype.isContact) && p.datagate && p.address);
    }

    /**
     * render
     */
    render() {
        const { isLoading, lookUp, eRackSet, inputCheck, bulk, checked } = this.props;
        const pointList = this.getPointList();
        const isPhysicalKey = (eRackSet.lockType === KEY_TYPE_ID.physicalKey);
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>電気錠設定編集</Box.Title>
                </Box.Header >
                <Box.Body>
                {!bulk ?
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="ID" columnCount={1}>
                                <LabelForm value={eRackSet.eRackSetId > 0 && eRackSet.eRackSetId} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ロケーション" columnCount={1} isRequired>
                                <LocationForm
                                    locationList={(lookUp && lookUp.locations) || []}
                                    selectedLocation={eRackSet.location}
                                    onChange={(val) => this.onChangeLocation(val)}
                                    validationState={inputCheck.location.state}
                                    helpText={inputCheck.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="鍵種別" columnCount={1} isRequired>
                                <KeyTypeSwhitch 
                                    value={eRackSet.lockType} 
                                    options={KEY_TYPE_OPTIONS} 
                                    onChange={(val) => this.onChangeLockType(val)} />
                            </InputForm.Col>
                        </InputForm.Row>
                        {!isPhysicalKey&&
                            <InputForm.Row>
                                <InputForm.Col label="対象" columnCount={1} isRequired>
                                    <SelectForm
                                        value={eRackSet.target}
                                        options={[
                                            { value: ELECTRIC_RACK_TARGET.front, name: '前面' },
                                            { value: ELECTRIC_RACK_TARGET.rear, name: '背面' },
                                            { value: ELECTRIC_RACK_TARGET.both, name: '前面 / 背面' }
                                        ]}
                                        onChange={(val) => this.props.onEdit([{ val: val, key: 'target' }])}
                                        validationState={inputCheck.target.state}
                                        helpText={inputCheck.target.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                        {!isPhysicalKey&&
                            <InputForm.Row>
                                <InputForm.Col label="電気錠ポイント" columnCount={2} isRequired>
                                    <SelectForm
                                        value={eRackSet.keyPoint && eRackSet.keyPoint.pointNo}
                                        options={pointList.map((p) => ({ value: p.pointNo, name: p.pointName }))}
                                        onChange={(val) => this.props.onEdit([{ val: pointList.find((p) => p.pointNo == val), key: 'keyPoint' }])}
                                        validationState={inputCheck.keyPoint.state}
                                        helpText={inputCheck.keyPoint.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="電気錠施錠値" columnCount={2} isRequired>
                                    <SelectForm
                                        value={eRackSet.useOnValueAsKeyLockValue != null && eRackSet.useOnValueAsKeyLockValue.toString()}
                                        options={eRackSet.keyPoint && [
                                            { value: false, name: eRackSet.keyPoint.offMessage ? `${eRackSet.keyPoint.offValue}（${eRackSet.keyPoint.offMessage}）` : eRackSet.keyPoint.offValue },
                                            { value: true, name: eRackSet.keyPoint.onMessage ? `${eRackSet.keyPoint.onValue}（${eRackSet.keyPoint.onMessage}）` : eRackSet.keyPoint.onValue }
                                        ]}
                                        onChange={(val) => this.props.onEdit([{ val: val, key: 'useOnValueAsKeyLockValue' }])}
                                        validationState={inputCheck.useOnValueAsKeyLockValue.state}
                                        helpText={inputCheck.useOnValueAsKeyLockValue.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                        {!isPhysicalKey&&
                            <InputForm.Row>
                                <InputForm.Col label="ドアセンサポイント" columnCount={2} isRequired>
                                    <SelectForm
                                        value={eRackSet.doorPoint && eRackSet.doorPoint.pointNo}
                                        options={pointList.map((p) => ({ value: p.pointNo, name: p.pointName }))}
                                        onChange={(val) => this.props.onEdit([{ val: pointList.find((p) => p.pointNo == val), key: 'doorPoint' }])}
                                        validationState={inputCheck.doorPoint.state}
                                        helpText={inputCheck.doorPoint.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="ドア閉値" columnCount={2} isRequired>
                                    <SelectForm
                                        value={eRackSet.useOnValueAsDoorCloseValue != null && eRackSet.useOnValueAsDoorCloseValue.toString()}
                                        options={eRackSet.doorPoint && [
                                            { value: false, name: eRackSet.doorPoint.offMessage ? `${eRackSet.doorPoint.offValue}（${eRackSet.doorPoint.offMessage}）` : eRackSet.doorPoint.offValue },
                                            { value: true, name: eRackSet.doorPoint.onMessage ? `${eRackSet.doorPoint.onValue}（${eRackSet.doorPoint.onMessage}）` : eRackSet.doorPoint.onValue }
                                        ]}
                                        onChange={(val) => this.props.onEdit([{ val: val, key: 'useOnValueAsDoorCloseValue' }])}
                                        validationState={inputCheck.useOnValueAsDoorCloseValue.state}
                                        helpText={inputCheck.useOnValueAsDoorCloseValue.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                        {!isPhysicalKey&&
                            <InputForm.Row>
                                <InputForm.Col
                                    label="こじ開け発生不感時間"
                                    columnCount={2}
                                >
                                    <TextForm
                                        value={eRackSet ? eRackSet.lockedOpenErrOcBlindTime : ''}
                                        onChange={(val) => this.props.onEdit([{ val: val, key: 'lockedOpenErrOcBlindTime' }])}
                                        validationState={inputCheck.lockedOpenErrOcBlindTime.state}
                                        helpText={inputCheck.lockedOpenErrOcBlindTime.helpText}
                                        unit="秒"
                                    />
                                </InputForm.Col>
                                <InputForm.Col
                                    label="こじ開け復旧不感時間"
                                    columnCount={2}
                                >
                                    <TextForm
                                        value={eRackSet ? eRackSet.lockedOpenErrRcBlindTime : ''}
                                        onChange={(val) => this.props.onEdit([{ val: val, key: 'lockedOpenErrRcBlindTime' }])}
                                        validationState={inputCheck.lockedOpenErrRcBlindTime.state}
                                        helpText={inputCheck.lockedOpenErrRcBlindTime.helpText}
                                        unit="秒"
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                    </InputForm>
                    :
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col
                                label="こじ開け発生不感時間"
                                columnCount={2}
                                isRequired
                                checkbox
                                checked={checked.lockedOpenErrOcBlindTime}
                                onCheckChange={() => this.onCheckChange(!checked.lockedOpenErrOcBlindTime, 'lockedOpenErrOcBlindTime')}
                            >
                                <TextForm
                                    isReadOnly={!checked.lockedOpenErrOcBlindTime}
                                    value={eRackSet ? eRackSet.lockedOpenErrOcBlindTime : ''}
                                    onChange={(val) => this.props.onEdit([{ val: val, key: 'lockedOpenErrOcBlindTime' }])}
                                    validationState={checked.lockedOpenErrOcBlindTime && inputCheck.lockedOpenErrOcBlindTime.state}
                                    helpText={checked.lockedOpenErrOcBlindTime && inputCheck.lockedOpenErrOcBlindTime.helpText}
                                    unit="秒"
                                />
                            </InputForm.Col>
                            <InputForm.Col
                                label="こじ開け復旧不感時間"
                                columnCount={2}
                                isRequired
                                checkbox
                                checked={checked.lockedOpenErrRcBlindTime}
                                onCheckChange={() => this.onCheckChange(!checked.lockedOpenErrRcBlindTime, 'lockedOpenErrRcBlindTime')}
                            >
                                <TextForm
                                    isReadOnly={!checked.lockedOpenErrRcBlindTime}
                                    value={eRackSet ? eRackSet.lockedOpenErrRcBlindTime : ''}
                                    onChange={(val) => this.props.onEdit([{ val: val, key: 'lockedOpenErrRcBlindTime' }])}
                                    validationState={checked.lockedOpenErrRcBlindTime && inputCheck.lockedOpenErrRcBlindTime.state}
                                    helpText={checked.lockedOpenErrRcBlindTime && inputCheck.lockedOpenErrRcBlindTime.helpText}
                                    unit="秒"
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    }
                </Box.Body>
            </Box>
        );
    }
}

/**
 * 鍵種別スイッチ
 */
const KeyTypeSwhitch = ({ options, value, onChange: handleChange }) => {
    return (
        <ToggleSwitch 
            bsSize="sm"
            name="keyType"
            value={value}
            swichValues={options}
            onChange={(value) => handleChange(value)} 
        />
    );
}
