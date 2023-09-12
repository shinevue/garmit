
/**
 * Copyright 2017 DENSO Solutions
 * 
 * 演算式表示ボックス Reactコンポーネント
 *  
 */

'use strict';

import React, { Component } from 'react';
import { sendData, EnumHttpMethod } from 'http-request';

import { CALC_TYPE, SUM_TYPE_OPTIONS, GROUPALARM_OPTIONS, OPERATION, OPERAND_TYPE } from 'expressionUtility';
import { getOperandPointName, getOperandConstName } from 'expressionUtility';
import Box from 'Common/Layout/Box';
import Chip from 'Common/Widget/Chip';

/**
* 演算式表示ボックス
*/
const DisplayExpressionBox = (props) => {
    const { calcPointSet, isGroupAlarm, isLoading, onRemoveClick:handleRemoveClick } = props;
    return(
        <Box header="演算式">
            <Box.Header>
                <Box.Title>演算式</Box.Title>
            </Box.Header>
            <Box.Body>
                <table>
                    {calcPointSet &&
                        calcPointSet.map((operand) =>
                            <DisplayOperandForm
                                operand={operand}
                                isGroupAlarm={isGroupAlarm}
                                onRemoveClick={(paramNo, detailNo, operation) => !isLoading && handleRemoveClick && handleRemoveClick(paramNo, detailNo, operation)}
                            />
                        )}
                </table>
            </Box.Body>
        </Box>
    );
}

export default DisplayExpressionBox;

/**
* 演算項表示フォーム
*/
const DisplayOperandForm = ({ operand, isGroupAlarm, onRemoveClick:handleRemoveClick}) => {
    return (
        <tr>
            <OperatorCell paramNo={operand.paramNo} calcType={operand.calcType} />
            <AbsoluteCell isAbsolute={operand.isAbsolute} />
            <CalcTypeCell sumType={operand.sumType} isGroupAlarm={isGroupAlarm} />
            <td className="va-t" style={{ "padding-top": "6px" }}>
                <span>&nbsp;(&nbsp;</span>
            </td>
            <CalcTargetCell
                calcDetails={operand.calcDetails}
                isAbsolute={operand.isAbsolute}
                onRemoveClick={(detailNo) => handleRemoveClick && handleRemoveClick(operand.paramNo, detailNo, OPERATION.delete)}
            />
        </tr>
    );
}

/**
* 演算子セル
*/
const OperatorCell = ({ paramNo, calcType }) => {
    let operator = "";
    if (paramNo !== 1) {
        Object.keys(CALC_TYPE).forEach((key) => {
            if (calcType === CALC_TYPE[key].id) {
                operator = CALC_TYPE[key].value;
            };
        })
    }
    return (
        <td className="va-t" style={{ "padding-top": "6px" }}>
            <span style={{ "font-weight": "bold" }} className="mr-1">{operator}</span>
        </td>
    );
}

/**
* 絶対値セル
*/
const AbsoluteCell = ({ isAbsolute }) => {
    if (isAbsolute) {
        return (
            <td className="va-t" style={{ "padding-top": "6px" }}>
                <span style={{ "font-weight": "bold" }} >ABS</span>
                <span>&nbsp;(&nbsp;</span>
            </td>
        );
    }
    return <div />
}

/**
* 演算種別セル
*/
const CalcTypeCell = ({ sumType, isGroupAlarm }) => {
    let displaySumType = "";
    if (isGroupAlarm) {
        Object.keys(GROUPALARM_OPTIONS).forEach((key) => {
            if (sumType === GROUPALARM_OPTIONS[key].value) {
                displaySumType = GROUPALARM_OPTIONS[key].expressionName;
            };
        });
    }
    else {
        Object.keys(SUM_TYPE_OPTIONS).forEach((key) => {
            if (sumType === SUM_TYPE_OPTIONS[key].value) {
                displaySumType = SUM_TYPE_OPTIONS[key].expressionName;
            };
        });
    }
    return (
        <td className="va-t" style={{ "padding-top": "6px" }}>
            <span style={{ "font-weight": "bold" }} >{displaySumType}</span>
        </td>
    );
}

/**
* 演算対象セル
*/
const CalcTargetCell = ({ calcDetails, isAbsolute, onRemoveClick: handleRemoveClick }) => {
    return (
        <td className="flex-top-left flex-wrap">
            {calcDetails &&
                calcDetails.map((pointInfo) => {
                    return (
                        <PointChip
                            removeButton={true}
                            pointInfo={pointInfo}
                            onRemoveClick={(detailNo) => handleRemoveClick && handleRemoveClick(detailNo)}
                        />
                    );
                }
                )}
            <span className="va-t" style={{ "margin-top": "6px" }}>&nbsp;)</span>
            {isAbsolute && <span className="va-t" style={{ "margin-top": "6px" }}>&nbsp;)</span>}
        </td>
    );
}


/**
* 演算対象ポイントチップ
*/
const PointChip = ({ pointInfo, removeButton, onRemoveClick:handleRemoveClick }) => {
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
        <div style={{marginBottom:"4px"}}>
            <Chip
                name={operandName}
                className={valueType === OPERAND_TYPE.constant?"constant":""}
                removeButton={removeButton}
                onRemoveClick={() => handleRemoveClick && handleRemoveClick(detailNo)}
            />
        </div>
    );
}
//#endregion