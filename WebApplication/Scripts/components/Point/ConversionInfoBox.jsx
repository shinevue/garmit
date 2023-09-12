'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';

import { CONVERSION_TYPE } from 'constant';
import { LAVEL_TYPE } from 'authentication';
import { OPERAND_TYPE } from 'expressionUtility';

import { maxLength } from 'pointUtility';

const MAX_COUNT = 3;

export default class ConversionInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * 換算係数が変化したとき
     * @param {any} value
     * @param {any} key
     * @param {any} index
     */
    onCoefficientChange(value, key, i) {
        if (key === 'convertType' && value == -1) {
            this.onRemoveClick(i);
            return;
        }

        const coefficients = this.props.point.convertCoefficients.slice();
        const obj = Object.assign({}, coefficients[i]);
        obj[key] = value;
        coefficients[i] = obj;
        this.props.onEdit([{ value: coefficients, key: 'convertCoefficients' }]);
    }

    /**
     * 追加ボタンクリック
     */
    onAddClick() {
        const coefficients = this.props.point.convertCoefficients.slice();
        coefficients.push({ convertType: 0, coefficientValue: '', index: coefficients.length + 1 });
        this.props.onEdit([{ value: coefficients, key: 'convertCoefficients' }]);
    }

    /**
     * 削除
     * @param {any} i
     */
    onRemoveClick(i) {
        const coefficients = this.props.point.convertCoefficients.slice();
        coefficients.splice(i, 1);
        for (let j = i; j < coefficients.length; j++) {
            coefficients[j].index = j + 1; // インデックスを振りなおす
        }
        this.props.onEdit([{ value: coefficients, key: 'convertCoefficients' }]);
    }

    /**
     * 換算式のフォームを生成する
     */
    makeConvertCoefficientForm(convertCoefficients, inputCheck, disabled) {
        return (
            <div className="flex-top-left" style={{ flexWrap: 'wrap', flexDirection: 'row', margin: -5 }}>
                <LabelForm className="pa-05" value="換算値 = 測定値" />
                {convertCoefficients && convertCoefficients.map((item, i) =>
                    <span className="flex-top-left pa-05" style={{ flexWrap: 'no-wrap', flexDirection: 'row' }}>
                        <SelectForm
                            isReadOnly={disabled}
                            value={item.convertType.toString()}
                            options={CONVERSION_TYPE}
                            onChange={(val) => this.onCoefficientChange(val, 'convertType', i)}
                            validationState={inputCheck && inputCheck[i].convertType.state}
                            helpText={inputCheck && inputCheck[i].convertType.helpText}
                            placeholder="なし"
                        />
                        <span className="mr-05" />
                        <TextForm
                            isReadOnly={disabled}
                            value={item.coefficientValue}
                            onChange={(val) => this.onCoefficientChange(val, 'coefficientValue', i)}
                            validationState={inputCheck && inputCheck[i].coefficientValue.state}
                            helpText={inputCheck && inputCheck[i].coefficientValue.helpText}
                        />
                                
                        {false && <Button onClick={() => this.onRemoveClick(i)}><i class="fa fa-trash" /></Button>}
                    </span>
                )}
                {convertCoefficients.length < MAX_COUNT &&
                    <OverlayTrigger placement="bottom" overlay={<Tooltip>追加</Tooltip>}>
                        <Button
                            className="mt-05"
                            iconId="add"
                            isCircle={true}
                            disabled={disabled}
                            onClick={() => this.onAddClick()}
                        />
                    </OverlayTrigger>
                }
            </div>
        );
    }

    /**
     * render
     */
    render() {
        const { lookUp, point, onEdit, inputCheck, bulk, checked, onCheckChange, level } = this.props;

        const isReadOnly = level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal;

        return (
            <Box boxStyle="default">
                <Box.Header>
                    <Box.Title>換算情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col
                                label="換算式"
                                columnCount={1}
                                isRequired={false}
                                checkbox={bulk}
                                checked={bulk && checked.convertCoefficients}
                                onCheckChange={() => onCheckChange([{ value: !checked.convertCoefficients, key: 'convertCoefficients' }])}
                            >
                                {this.makeConvertCoefficientForm(point.convertCoefficients, inputCheck.convertCoefficients && inputCheck.convertCoefficients.inputCheck, (bulk && !checked.convertCoefficients) || isReadOnly)}
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col
                                label="換算値フォーマット"
                                columnCount={2}
                                isRequired={true}
                                checkbox={bulk}
                                checked={bulk && checked.convertFormat}
                                onCheckChange={() => onCheckChange([{ value: !checked.convertFormat, key: 'convertFormat' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.convertFormat) || isReadOnly}
                                    value={point.convertFormat}
                                    maxlength={maxLength.convertFormat}
                                    onChange={(val) => onEdit([{ value: val, key: 'convertFormat' }])}
                                    validationState={inputCheck.convertFormat && inputCheck.convertFormat.state}
                                    helpText={inputCheck.convertFormat && inputCheck.convertFormat.helpText}
                                />
                            </InputForm.Col>
                            {(!point.calcPointSet || !point.calcPointSet[0] || [OPERAND_TYPE.alarm, OPERAND_TYPE.error].indexOf(point.calcPointSet[0].calcDetails[0].valueType) < 0) &&
                                <InputForm.Col
                                    label="換算値単位"
                                    columnCount={2}
                                    isRequired={false}
                                    checkbox={bulk}
                                    checked={bulk && checked.convertUnit}
                                    onCheckChange={() => onCheckChange([{ value: !checked.convertUnit, key: 'convertUnit' }])}
                                >
                                    <TextForm
                                        isReadOnly={(bulk && !checked.convertUnit) || isReadOnly}
                                        value={point.convertUnit}
                                        maxlength={maxLength.convertUnit}
                                        onChange={(val) => onEdit([{ value: val, key: 'convertUnit' }])}
                                        validationState={inputCheck.convertUnit && inputCheck.convertUnit.state}
                                        helpText={inputCheck.convertUnit && inputCheck.convertUnit.helpText}
                                    />
                                </InputForm.Col>
                            }
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}