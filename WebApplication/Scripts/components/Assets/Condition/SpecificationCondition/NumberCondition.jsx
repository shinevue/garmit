/**
 * @license Copyright 2018 DENSO
 * 
 * NumberCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';

import { validateReal, successResult, errorResult } from 'inputCheck';
import { CONDITION_OPTION_NUMBER } from 'searchConditionUtility';

//定数
const OPTIONS_LIST = [ 
    { value: CONDITION_OPTION_NUMBER.between,       name: '次の値の間' }, 
    { value: CONDITION_OPTION_NUMBER.notbetween,    name: '次の値の間以外' }, 
    { value: CONDITION_OPTION_NUMBER.equal,         name: '次の値に等しい' }, 
    { value: CONDITION_OPTION_NUMBER.notequal,      name: '次の値に等しくない' }, 
    { value: CONDITION_OPTION_NUMBER.greater,       name: '次の値より大きい' }, 
    { value: CONDITION_OPTION_NUMBER.less,          name: '次の値より小さい' }, 
    { value: CONDITION_OPTION_NUMBER.greaterOrequal,name: '次の値以上' }, 
    { value: CONDITION_OPTION_NUMBER.lessOrequal,   name: '次の値以下' }
];

const OPTION_HAS_FROMTO = [ CONDITION_OPTION_NUMBER.between, CONDITION_OPTION_NUMBER.notbetween ];

/**
 * 数値検索条件コンポーネント
 * @param {string} value 検索値
 * @param {string} valueFrom 開始値
 * @param {string} valueTo 終了値
 * @param {number} option オプション値
 * @param {function} onChange テキスト変更時に呼び出す。
 */
export default class NumberCondition extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            valueStr: props.value ? String(props.value) : '',
            valueFromStr: props.valueFrom ? String(props.valueFrom) : '',
            valueToStr: props.valueTo ? String(props.valueTo) : '',
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { value: nextValue, valueFrom: nextValueFrom, valueTo: nextValueTo } = nextProps;
        if ((!nextValue && nextValue !== 0) && 
            (!nextValueFrom && nextValueFrom !== 0) && 
            (!nextValueTo && nextValueTo !== 0)) {
            this.setState({
                valueStr: null,
                valueFromStr: null,
                valueToStr: null
            });
        } else if (nextValue !== this.props.value || nextValueFrom !== this.props.valueFrom || nextValueTo !== this.props.valueTo ) {
            const { valueStr, valueFromStr, valueToStr } = this.state;
            this.setState({
                valueStr: nextValue && this.checkCancanConvertString(nextValue, valueStr) ? String(nextValue) : valueStr,
                valueFromStr: nextValueFrom && this.checkCancanConvertString(nextValueFrom, valueFromStr) ? String(nextValueFrom) : valueFromStr,
                valueToStr: nextValueTo && this.checkCancanConvertString(nextValueTo, valueToStr) ? String(nextValueTo) : valueToStr
            });
        }
    }

    /**
     * render
     */
    render() {
        const { option } = this.props;
        return (
            <div className="form-inline condition">
                <SelectForm className="mr-1 va-t" value={option} options={OPTIONS_LIST} isRequired onChange={(o) => this.changeSelectOption(o)} />
                {this.makeNumberCondition()}
            </div>
        );
    }

    /**
     * 数値条件を作成する
     */
    makeNumberCondition() {
        const { option, value, valueFrom, valueTo } = this.props;
        const { valueStr, valueFromStr, valueToStr } = this.state;
        const validate = this.validate(value, valueFrom, valueTo, option);
        if (OPTION_HAS_FROMTO.indexOf(option) < 0) {
            return <TextForm 
                        value={valueStr}
                        validationState={validate.value.state}
                        helpText={validate.value.helpText}
                        onChange={(value) => this.valueChanged(value, option)}
                   />
        } else {
            return <span>
                        <TextForm 
                            className="va-t mr-05"
                            value={valueFromStr}
                            validationState={validate.valueFrom.state}
                            helpText={validate.valueFrom.helpText}
                            onChange={(value) => this.valueFromToChanged(value, valueToStr, option)}
                        />
                        <FormControl.Static componentClass="span" className="va-t mr-05">～</FormControl.Static>                        
                        <TextForm 
                            className="va-t"
                            value={valueToStr}
                            validationState={validate.valueTo.state}
                            helpText={validate.valueTo.helpText}
                            onChange={(value) => this.valueFromToChanged(valueFromStr, value, option)}
                        />
                   </span>;
        }
    }
    
    //#region イベント

    /********************************************
     * イベント
     ********************************************/

    /**
     * オプション選択を変更する
     * @param {string} optionText オプション値の文字列
     */
    changeSelectOption(optionText) {
        const option = parseInt(optionText);
        this.onChange({ value: null, from: null, to: null }, option, true)
    }

    /**
     * 値変更イベント
     * @param {string} value 
     * @param {number} option オプション
     */
    valueChanged(value, option) {
        const validate = this.validate(value, null, null, option);    
        const isError = this.isError(validate);    
        var retValue = value;
        if (!isError) {
            retValue = parseFloat(value);
        }              
        this.setState({
            valueStr: value,
            valueFromStr: null,
            valueToStr: null
        }, () => this.onChange({ value: retValue, from: null, to: null }, option, isError));
    }

    /**
     * 開始と終了の値を変更したときのイベント
     * @param {string} valueFrom 開始値
     * @param {string} valueTo 終了値
     * @param {number} option オプション
     */
    valueFromToChanged(valueFrom, valueTo, option) {
        const validate = this.validate(null, valueFrom, valueTo, option);   
        const isError = this.isError(validate);    
        var retValue = { value: null, from: valueFrom, to: valueTo };
        if (!isError) {
            retValue.from = parseFloat(valueFrom);
            retValue.to = parseFloat(valueTo);
        }        
        this.setState({
            valueStr: null,
            valueFromStr: valueFrom,
            valueToStr: valueTo
        }, () => this.onChange(retValue, option, isError));
    }

    /**
     * 変更イベントを発生させる
     * @param {object} value 値 { value: xx, from: xx, to: xx }
     * @param {number} option オプション値
     * @param {boolean} isError エラーかどうか
     */
    onChange(value, option, isError) {
        if (this.props.onChange) {
            this.props.onChange(value, option, isError);
        }
    }

    //#endregion

    //#region 入力検証

    /********************************************
     * 入力検証
     ********************************************/

    /**
     * 数値の入力検証
     * @param {string} value 数値の入力検証 
     */
    validateNumber(value) {
        return validateReal(value, -10000000, 10000000, false)
    }
    
    /**
     * 入力検証
     * @param {string} from 開始値
     * @param {string} to 終了値
     */
    validate(value, from, to, option){
        const hasFromTo = (OPTION_HAS_FROMTO.indexOf(option) >= 0);
        var validate = {
            value: !hasFromTo ? this.validateNumber(value) : successResult,
            valueFrom: hasFromTo ? this.validateNumber(from) : successResult,
            valueTo: hasFromTo ? this.validateNumber(to) : successResult
        };

        if (hasFromTo && !this.isError(validate)) {
            if (parseFloat(from) > parseFloat(to)) {
                validate.valueTo = errorResult('開始値よりも小さくなってます。');
            }
        }

        return validate;
    }

    /**
     * エラーかどうか
     * @param {object} validate 入力検証結果 
     */
    isError(validate) {
        if (validate.value.state === successResult.state &&
            validate.valueFrom.state === successResult.state && 
            validate.valueTo.state === successResult.state) {
            return false;
        }
        return true;
    }

    /**
     * 数字を文字列に変換してよいか
     * @param {number | string} value 対象のValue
     * @param {string} valueStr 現在のValue文字列
     * @returns 
     */
     checkCancanConvertString(value, valueStr) {
        var canConverted  = true;
        if (typeof value === 'number') {
            const validate = this.validateNumber(valueStr);
            if (validate.state === successResult.state) {
                canConverted = !(parseFloat(valueStr) === value);
            } else {
                canConverted = true;
            }
        }
        return canConverted;    
    }

    //#endregion

}

NumberCondition.propTypes = {
    value: PropTypes.string,
    valueFrom: PropTypes.string,
    valueTo: PropTypes.string,
    option: PropTypes.number.isRequired,
    onChange: PropTypes.func
}