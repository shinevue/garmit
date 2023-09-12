
/**
 * Copyright 2017 DENSO Solutions
 * 
 * 演算式編集ボックス Reactコンポーネント
 *  
 */

'use strict';

import React, { Component } from 'react';

import { CALC_TYPE, SUM_TYPE, SUM_TYPE_OPTIONS, GROUPALARM_OPTIONS, OPERATION, OPERAND_TYPE } from 'expressionUtility';
import { getOperandPointName, getOperandConstName } from 'expressionUtility';

import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import Chip from 'Common/Widget/Chip';
import SelectForm from 'Common/Form/SelectForm';

import GarmitBox from 'Assets/GarmitBox';
import { AddButton, AddCircleButton, DeleteCircleButton, EditCircleButton } from 'Assets/GarmitButton';

import { MAX_POINT_NUM } from 'expressionUtility';

/**
* 演算式編集ボックス
*/
export const EditExpressionBox = (props) => {
    const { isGroupAlarm, calcPointSet, isLoading, children } = props;
    const { onRemoveClick: handleRemoveClick, onChangeCalcPoint: handleChangeCalcPoint } = props;
    const { onOpenModal: handleOpenModal } = props;

    return (
        <div className="calc-item-wrapper">
            <div className="calc-item">
                <CalcItemIteration />
                <div className="calc-item-body">
                    <CalcItemHeader
                        isLoading={isLoading}
                        onClickDelete={handleChangeCalcPoint.bind(this, calcPointSet.paramNo, OPERATION.delete, null)}
                        onClickEdit={handleOpenModal}
                    />
                    <CalcItemContent
                        isGroupAlarm={isGroupAlarm}
                        calcPointSet={calcPointSet}
                        onOpenModal={handleOpenModal}
                        onRemoveClick={handleRemoveClick}
                    />
                    <CalcMessage isPointExist={calcPointSet.calcDetails.length >0? true:false} />
                </div>
            </div>
        </div>
    );
}

/**
* 演算式編集ボックスの番号表示コンポーネント
*/
const CalcItemIteration = () => {
    return (
        <div className="calc-item-iteration">
            <span className="calc-item-num"></span>
        </div>
    );
}

/**
* 演算式編集ボックスのヘッダコンポーネント
*/
const CalcItemHeader = ({ isLoading, onClickEdit:handleClickEdit, onClickDelete:handleClickDelete }) => {
    return (
        <div className="calc-item-head clearfix">
            <div className="btn-toolbar pull-right">
                <EditCircleButton
                    className="btn-xs"
                    disabled={isLoading}
                    onClick={handleClickEdit.bind(this, OPERATION.edit)} />
                <DeleteCircleButton
                    className="btn-xs"
                    disabled={isLoading}
                    onClick={handleClickDelete}
                />
            </div>
        </div>
    );
}

/**
* 演算式編集ボックスの演算式表示コンポーネント
*/
const CalcItemContent = ({ isGroupAlarm, calcPointSet, onOpenModal: handleOpenModal, onRemoveClick: handleRemoveClick }) => {
    const isConstValue = _.get(calcPointSet, "calcDetails[0].valueType") === OPERAND_TYPE.constant;
    const hideSumType = (isConstValue && _.get(calcPointSet, "calcDetails").length <= 1);
    const disableAddButton = _.size(calcPointSet.calcDetails) >= MAX_POINT_NUM;
    return (
        <div className="calc-item-content">      
            <ChipBefore
                isGroupAlarm={isGroupAlarm}
                hideCalcType={calcPointSet.paramNo===1}
                hideSumType={hideSumType}
                isAbsolute={calcPointSet.isAbsolute}
                calcType={calcPointSet.calcType}
                sumType={calcPointSet.sumType}
                onClick={handleOpenModal}
            />
            <ChipForm
                calcDetails={_.get(calcPointSet, "calcDetails", [])}
                onRemoveClick={handleRemoveClick}
            />
            <ChipAfter
                disableAddButton={disableAddButton}
                isConstValue={isConstValue}
                hideSumType={hideSumType}
                isAbsolute={calcPointSet.isAbsolute}
                onClick={handleOpenModal}
            />
        </div>
    );
}

/**
* 演算子、絶対値、集計種別表示コンポーネント
*/
const ChipBefore = ({ isGroupAlarm, hideCalcType,  hideSumType, isAbsolute, calcType, sumType, onClick:handleClick }) => {
    const selectedCalcType = !hideCalcType &&_.find(CALC_TYPE, { 'id': calcType });
    const options = isGroupAlarm ? GROUPALARM_OPTIONS : SUM_TYPE_OPTIONS;
    const selectedSumType = _.find(options, { 'value': sumType });
    return (
        <span className="calc-item-chip-before">
            <Button className="btn btn-link btn-calc-item-function" onClick={handleClick.bind(this, OPERATION.edit)}>
                {selectedCalcType && <span className="calc-operator">{selectedCalcType.value}</span>}
                {isAbsolute &&
                    <span className="calc-function-open">
                        <span className="calc-function-name">ABS</span>
                        &nbsp;(&nbsp;
                    </span>
                }
                {!hideSumType &&
                    <span className="calc-function-open">
                    <span className="calc-function-name">{selectedSumType && selectedSumType.expressionName}</span>
                        &nbsp;(
                    </span>
                }
            </Button>
        </span>
    );
}

/**
* ポイントチップフォーム表示コンポーネント
*/
const ChipForm = ({ calcDetails, onRemoveClick: handleRemoveClick }) => {
    return (
        <span className="chip-form">
            {calcDetails &&
                calcDetails.map((pointInfo) => {
                    return (
                        <PointChip
                            removeButton={true}
                            pointInfo={pointInfo}
                            onRemoveClick={handleRemoveClick}
                        />
                    );
                })
            }
        </span>
    );
}

/**
* 演算対象ポイントチップ
*/
const PointChip = ({ pointInfo, removeButton, onRemoveClick: handleRemoveClick }) => {
    if (!pointInfo) return <div />; //ポイント情報が空の場合return

    const { valueType, isCoef, point, constValue, detailNo } = pointInfo;
    let operandName = "";

    if (valueType === OPERAND_TYPE.constant) {
        operandName = getOperandConstName(constValue);
    }
    else {
        operandName = getOperandPointName(isCoef, point && point.pointName);
    }
    return (
        <Chip
            name={operandName}
            className={valueType === OPERAND_TYPE.constant ? "constant" : ""}
            removeButton={removeButton}
            onRemoveClick={handleRemoveClick.bind(this, detailNo)}
        />
    );
}

/**
* ポイント追加ボタン、括弧閉じ表示コンポーネント
*/
const ChipAfter = ({ disableAddButton, isConstValue, isAbsolute, hideSumType, onClick:handleClick }) => {
    return (
        <span className="calc-item-chip-after">
            {!isConstValue &&
                <AddCircleButton disabled={disableAddButton} className="btn-xs" onClick={handleClick.bind(this, OPERATION.add)} />
            }
            {isAbsolute &&
                <span class="calc-function-close">&nbsp;)</span> 
            }            
            {!hideSumType &&
                <span class="calc-function-close">&nbsp;)</span>
            }
        </span>
    );
}

/**
* ポイント未選択時のメッセージ表示コンポーネント
*/
const CalcMessage = ({ isPointExist }) => {
    return (
        <div className="calc-item-message">
            {!isPointExist && "集計するポイントを追加してください。"}
        </div>
    );
}
