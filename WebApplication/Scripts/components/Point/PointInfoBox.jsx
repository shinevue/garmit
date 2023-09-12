'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Checkbox, Radio } from 'react-bootstrap';

import { validateText, validateTextArea, validateSelect, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { POINT_TYPE_OPTIONS } from 'constant';
import { LAVEL_TYPE } from 'authentication';
import { maxLength } from 'pointUtility';

import Box from 'Common/Layout/Box';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';

import LocationForm from 'Assets/Condition/LocationForm';
import TagForm from 'Assets/Condition/TagForm';

export default class PointInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * データ種別を取得する
     * @param {int} dtType
     */
    getDataType(dtType) {
        return this.props.lookUp.dataTypes.find((dataType) => dataType.dtType == dtType) || -1;
    }

    /**
     * render
     */
    render() {
        const { lookUp, point, inputCheck, onEdit, bulk, checked, onClickCalcEdit, level, tagOverwriting } = this.props;

        return (
            <Box boxStyle="default">
                <Box.Header>
                    <Box.Title>
                        ポイント情報
                    </Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        {!bulk &&
                            <span>
                                <InputForm.Row>
                                    <InputForm.Col label="ポイント番号" columnCount={1} isRequired={false}>
                                        <LabelForm value={point.pointNo > 0 && point.pointNo} />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col label="ポイント名称" columnCount={2} isRequired={true}>
                                        <TextForm
                                            isReadOnly={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                            value={point.pointName}
                                            maxlength={maxLength.pointName}
                                            onChange={(val) => onEdit([{ value: val, key: 'pointName' }])}
                                            validationState={inputCheck.pointName && inputCheck.pointName.state}
                                            helpText={inputCheck.pointName && inputCheck.pointName.helpText}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col label="表示名称" columnCount={2} isRequired={false} >
                                        <TextForm
                                            isReadOnly={level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal}
                                            value={point.dispName}
                                            maxlength={maxLength.dispName}
                                            onChange={(val) => onEdit([{ value: val, key: 'dispName' }])}
                                            validationState={inputCheck.dispName && inputCheck.dispName.state}
                                            helpText={inputCheck.dispName && inputCheck.dispName.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col label="ロケーション" columnCount={1} isRequired={true} >
                                        <LocationForm multiple
                                            disabled={level === LAVEL_TYPE.normal}
                                            locationList={lookUp && lookUp.locations}
                                            checkedLocations={point.locations || []}
                                            separateCheckMode={true}
                                            onChange={(val) => onEdit([{ value: val, key: 'locations' }])}
                                            validationState={inputCheck.locations && inputCheck.locations.state}
                                            helpText={inputCheck.locations && inputCheck.locations.helpText}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                                <InputForm.Row>
                                    <InputForm.Col label="データ種別" columnCount={2} isRequired={true} >
                                        <SelectForm
                                            isReadOnly={level !== LAVEL_TYPE.administrator}
                                            value={(point.datatype && point.datatype.dtType) || -1}
                                            options={(lookUp && lookUp.dataTypes) && lookUp.dataTypes.map((item) => {
                                                return { value: item.dtType, name: item.name }
                                            })}
                                            onChange={(val) => {
                                                const dataType = this.getDataType(val);
                                                onEdit([{ value: dataType, key: 'datatype' }, { value: dataType.defaultUnit, key: 'unit' }, { value: dataType.defaultFormat, key: 'format' }]);
                                            }}
                                            validationState={inputCheck.datatype && inputCheck.datatype.state}
                                            helpText={inputCheck.datatype && inputCheck.datatype.helpText}
                                        />
                                    </InputForm.Col>
                                    <InputForm.Col label="測定/演算" columnCount={2} isRequired={true} >
                                        <SelectForm
                                            isReadOnly={level !== LAVEL_TYPE.administrator}
                                            value={point.calcPoint.toString()}
                                            options={POINT_TYPE_OPTIONS}
                                            onChange={(val) => onEdit([{ value: val, key: 'calcPoint' }])}
                                            addonButton={{
                                                iconId: 'math',
                                                isCircle: true,
                                                tooltipLabel: '演算設定',
                                                disabled: point.calcPoint == 0
                                            }}
                                            validationState={inputCheck.calcPoint && inputCheck.calcPoint.state}
                                            helpText={inputCheck.calcPoint && inputCheck.calcPoint.helpText}
                                            onButtonClick={()=>onClickCalcEdit && onClickCalcEdit()}
                                        />
                                    </InputForm.Col>
                                </InputForm.Row>
                            </span>
                        }
                        {level !== LAVEL_TYPE.normal &&
                            <InputForm.Row>
                                <InputForm.Col
                                    label="メール送信"
                                    columnCount={2}
                                    isRequired={true}
                                    checkbox={bulk}
                                    checked={bulk && checked.enterpriseMail}
                                    onCheckChange={() => this.props.onCheckChange([{ value: !checked.enterpriseMail, key: 'enterpriseMail' }])}
                                >
                                    <SelectForm
                                        value={point.enterpriseMail.toString()}
                                        options={[{ value: true, name: '送信する' }, { value: false, name: '送信しない' }]}
                                        onChange={(val) => onEdit([{ value: val, key: 'enterpriseMail' }])}
                                        validationState={inputCheck.enterpriseMail && inputCheck.enterpriseMail.state}
                                        helpText={inputCheck.enterpriseMail && inputCheck.enterpriseMail.helpText}
                                        checkbox={bulk}
                                        checked={bulk && checked.enterpriseMail}
                                        isReadOnly={(bulk && !checked.enterpriseMail) || level === LAVEL_TYPE.normal}
                                    />
                                </InputForm.Col>
                                <InputForm.Col
                                    label="タグ"
                                    columnCount={2}
                                    isRequired={false}
                                    checkbox={bulk}
                                    checked={bulk && checked.tags}
                                    onCheckChange={() => this.props.onCheckChange([{ value: !checked.tags, key: 'tags' }])}
                                >
                                    <TagForm
                                        disabled={(bulk && !checked.tags) || level === LAVEL_TYPE.normal}
                                        tagList={lookUp && lookUp.tags}
                                        checkedTags={point.tags || []}
                                        onChange={(val) => onEdit([{ value: val, key: 'tags' }])}
                                        validationState={inputCheck.tags && inputCheck.tags.state}
                                        helpText={inputCheck.tags && inputCheck.tags.helpText}
                                    />
                                    {bulk &&
                                        <div>
                                            <Radio inline
                                                disabled={(bulk && !checked.tags) || level === LAVEL_TYPE.normal}
                                                checked={!tagOverwriting}
                                                onClick={() => this.props.onTagModeChange(false)}
                                            >
                                                追加する
                                            </Radio>
                                            <Radio inline
                                                disabled={(bulk && !checked.tags) || level === LAVEL_TYPE.normal}
                                                checked={tagOverwriting}
                                                onClick={() => this.props.onTagModeChange(true)}
                                            >
                                                上書きする
                                            </Radio>
                                        </div>
                                    }
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                        <InputForm.Row>
                            <InputForm.Col
                                label="コメント"
                                columnCount={1}
                                checkbox={bulk}
                                checked={bulk && checked.comment}
                                onCheckChange={() => this.props.onCheckChange([{ value: !checked.comment, key: 'comment' }])}
                            >
                                <TextareaForm
                                    isReadOnly={bulk && !checked.comment}
                                    value={point.comment || ''}
                                    maxlength={maxLength.comment}
                                    onChange={(val) => onEdit([{ value: val, key: 'comment' }])}
                                    validationState={inputCheck.comment && inputCheck.comment.state}
                                    helpText={inputCheck.comment && inputCheck.comment.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}