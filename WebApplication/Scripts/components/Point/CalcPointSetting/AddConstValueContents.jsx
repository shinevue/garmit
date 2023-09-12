/**
 * Copyright 2017 DENSO Solutions
 * 
 * 固定値登録コンテンツ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { FormGroup, HelpBlock } from 'react-bootstrap';
import { OPERATION } from 'expressionUtility';
import TextForm from 'Common/Form/TextForm';
import { AddCircleButton, RemoveCircleButton } from 'Assets/GarmitButton';

/**
* 固定値登録コンテンツ
*/
const ConstValueContents = (props) => {
    const { valueList, onClick:handleClick, onChange:handleChange } = props;
    return (
        <div>
            <div className="flex-top-left flex-wrap">
                {valueList.map((info, index) => {
                    return(
                        <ConstValueFormGroup
                            index={index}
                            value={info.value && info.value.toString()}
                            state={info.state}
                            helpText={info.helpText}
                            onChange={(index, value) => handleChange && handleChange(index, value)}
                            onClick={(type, index) => handleClick && handleClick(type, index)}
                        />
                    );
                    })
                }
            </div>
            {valueList.length < 20 &&
                <AddCircleButton
                    className="ml-05 mt-05 pull-right"
                    onClick={() => handleClick && handleClick(OPERATION.add)}
                />
            }
        </div>
    )
}
export default ConstValueContents;

/**
* 固定値登録フォームグループ
*/
const ConstValueFormGroup = ({ index, value, state, helpText, onChange:handleChange, onClick:handleClick }) => {
    return (
        <FormGroup style={{ width: "280px" }} validationState={state}>
            <div className="flex-bottom">
                <TextForm
                    className="mb-0"
                    label={"固定値" + (index + 1)}
                    value={value? value:""}
                    onChange={(value) => handleChange(index, value)}
                />
                <RemoveCircleButton
                    className="ml-05"
                    onClick={() => handleClick(OPERATION.delete, index)}
                />
            </div>
            {helpText && <HelpBlock>{helpText}</HelpBlock>}
        </FormGroup>
    )
}
//#endregion