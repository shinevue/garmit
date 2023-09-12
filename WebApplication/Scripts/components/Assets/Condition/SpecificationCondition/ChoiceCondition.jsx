/**
 * @license Copyright 2018 DENSO
 * 
 * ChoiceCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectForm from 'Common/Form/SelectForm';

import { validateSelect, successResult } from 'inputCheck';
import { CONDITION_OPTION_CHOICE } from 'searchConditionUtility';

//定数
const OPTIONS_LIST = [ 
    { value: CONDITION_OPTION_CHOICE.match,     name : '一致' },
    { value: CONDITION_OPTION_CHOICE.notmatch,  name: '不一致' }
];

/**
 * 選択肢条件コンポーネント
 * @param {number} value 検索値
 * @param {number} option オプション値
 * @param {array} choices 選択肢リスト
 * @param {function} onChange 選択肢条件を変更したときに呼び出す
 */
export default class ChoiceCondition extends Component {
    
    /**
     * render
     */
    render() {
        const { value, option, choices } = this.props;
        const validate = validateSelect(value);
        const choiceList = choices ? choices.map((choice) => 
                                        { return { value: choice.choiceNo, name: choice.choiceName }})
                                    : 
                                    [];
        return (
            <div className="form-inline condition">
                <SelectForm 
                    value={value?value:-1} 
                    options={choiceList} 
                    validationState={validate.state}
                    helpText={validate.helpText}
                    onChange={(val) => this.changeValue(val, option)} 
                />
                <SelectForm 
                    className="ml-1 va-t" 
                    value={option} 
                    options={OPTIONS_LIST} 
                    isRequired 
                    onChange={(o) => this.changeSelectOption(o)} 
                />
            </div>
        );
    }
    
    /**
     * オプションの選択を変更する
     * @param {string} option オプション番号
     */
    changeSelectOption(option) {
        this.changeValue(this.props.value, parseInt(option))
    }

    /**
     * 値を変更する
     * @param {string} value 変更した値
     * @param {number} option オプション番号
     */
    changeValue(value, option) {
        const validate = validateSelect(value);
        this.onChange(parseInt(value), option, validate)
    }

    /**
     * 値変更イベントを発生させる
     * @param {number} value 変更後の値 
     * @param {number} option オプション番号
     * @param {object} validate 検証結果
     */
    onChange(value, option, validate) {
        if (this.props.onChange) {
            this.props.onChange(value, option, (validate.state !== successResult.state));
        }
    }
}

ChoiceCondition.propTypes = {
    value: PropTypes.number,
    option: PropTypes.number.isRequired,
    choices: PropTypes.arrayOf(PropTypes.shape({
        choiceNo: PropTypes.number.isRequired,
        choiceName: PropTypes.string.isRequired
    })),
    onChange: PropTypes.func
}