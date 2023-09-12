/**
 * @license Copyright 2018 DENSO
 * 
 * DateCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import { validateDate, validateInteger, successResult, errorResult } from 'inputCheck';
import { CONDITION_OPTION_DATETIME } from 'searchConditionUtility';

/**
 * 日付検索条件コンポーネント
 * @param {string} value 検索値
 * @param {string} valueFrom 開始値
 * @param {string} valueTo 終了値
 * @param {number} option オプション値
 * @param {boolean} isAlarm アラーム監視ありの項目かどうか
 * @param {function} onChange テキスト変更時に呼び出す。スペースorカンマ区切りで分けた文字列配列を渡す。

 */
export default class DateCondition extends Component {
   
    /**
     * 検索条件オプション
     */
    optionList(isAlarm) {
        var optionList = [ { value: CONDITION_OPTION_DATETIME.fromToEnd, name : '期間' } ];
        if (isAlarm) {
            optionList.push({ value: CONDITION_OPTION_DATETIME.daysToExpiration, name: '期限までの日数' });
            optionList.push({ value: CONDITION_OPTION_DATETIME.expired, name: '期限切れ' });
        }
        return optionList;
    }

    /**
     * render
     */
    render() {
        const { option, isAlarm } = this.props;
        return (
            <div className="form-inline condition">
                <FormGroup className={classNames("mr-1", (!option || option === CONDITION_OPTION_DATETIME.fromToEnd) ? "va-t" : "")}>
                    <FormControl componentClass="select" value={option} onChange={(e) => this.changeSelectOption(e.target.value)}>
                        {this.makeOptions(isAlarm)}
                    </FormControl>
                </FormGroup>
                {this.makeDateCondition()}
            </div>
        );
    }

    /**
     * 検索対象のセレクトボックスのオプションをつくる
     * @param {boolean} isAlarm アラーム監視かどうか
     * @returns {array} オプションリスト
     */
    makeOptions(isAlarm) {
        let options = []
        this.optionList(isAlarm).forEach((item, index) => {
            options.push(
                <option
                    key={index}
                    value={item.value}
                >
                    {item.name}
                </option>
            )
        })
        return options
    }

    /**
     * 日付検索条件を作成する
     */
    makeDateCondition() {
        const { option, value, valueFrom, valueTo } = this.props;
        const validate = this.validate(value, valueFrom, valueTo, option);
        switch (option) {
            case CONDITION_OPTION_DATETIME.daysToExpiration:
                return  <FormGroup className="va-t" validationState={validate.value.state} >
                            <span className="mr-05">あと</span>
                            <FormControl 
                                className="mr-05"
                                type="text" 
                                value={value} 
                                onChange={(e) => this.valueChanged(e.target.value, option)} />
                            <span>日</span>
                            {validate.value.helpText&& 
                                <HelpBlock>{validate.value.helpText}</HelpBlock>
                            }
                        </FormGroup>
            case CONDITION_OPTION_DATETIME.expired:
                return  null;

            default:
                return <DateTimeSpanForm 
                            from={valueFrom} 
                            to={valueTo} 
                            format="yyyy/MM/dd" 
                            validationFrom={validate.valueFrom}
                            validationTo={validate.valueTo}
                            onChange={(from, to) => this.valueFromToChanged(from, to, option)}
                        />;  
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
        this.onChange(
            {value: null, from: null, to: null}, 
            option, 
            !(option === CONDITION_OPTION_DATETIME.expired)
        );
    }
    
    /**
     * 値変更イベント
     * @param {string} value 
     * @param {number} option オプション
     */
    valueChanged(value, option) {
        const validate = this.validateTogo(value);
        const isError = this.isError(validate);
        var retValue = value;
        if (!isError) {
            retValue = parseInt(value);
        }
        this.onChange({value: retValue, from: null, to: null}, option,  isError);
    }

    /**
     * 開始と終了の値を変更したときのイベント
     * @param {moment} valueFrom 開始値
     * @param {moment} valueTo 終了値
     * @param {number} option オプション
     */
    valueFromToChanged(valueFrom, valueTo, option) {
        const validate = this.validateBetween(valueFrom, valueTo);
        if (validate.valueTo.state === successResult.state) {
            valueTo = valueTo.endOf('day');
        }
        this.onChange({ value: null, from: valueFrom, to: valueTo }, option, this.isError(validate));
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
     * 入力検証
     * @param {string} value 検索値
     * @param {string|datetime} from 開始日
     * @param {string|datetime} to 終了日
     * @param {number} option オプション
     */
    validate(value, from, to, option) {
        var validate = this.validateSuccess();
        if (option === CONDITION_OPTION_DATETIME.fromToEnd) {
            validate = this.validateBetween(from, to);
        } else if (option === CONDITION_OPTION_DATETIME.daysToExpiration) {
            validate = this.validateTogo(value);
        }
        return validate;
    }

    /**
     * 入力検証（期間）
     * @param {string|datetime} from 開始日
     * @param {string|datetime} to 終了日
     */
    validateBetween(from, to){
        var validate = {
            value: successResult,
            valueFrom: validateDate(from, 'yyyy/MM/dd', false),
            valueTo: validateDate(to, 'yyyy/MM/dd', false)
        }
        if (validate.valueFrom.state == successResult.state && 
            validate.valueTo.state == successResult.state && 
            !moment(to).endOf('day').isAfter(from)) {
                validate.valueTo = errorResult('終了日は開始日以降となるように設定してください');
        }
        return validate;
    }

    /**
     * 入力検証（期限までの日数）
     * @param {string} value 
     */
    validateTogo(value) {
        return {
            value: validateInteger(value, 0, 365, false),
            valueFrom: successResult,
            valueTo: successResult
        }
    }

    /**
     * 成功の検証結果
     */
    validateSuccess() {
        return {
            value: successResult,
            valueFrom: successResult,
            valueTo: successResult
        }
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

    //#endregion

}

DateCondition.propTypes = {
    value: PropTypes.string,
    valueFrom: PropTypes.string,
    valueTo: PropTypes.string,
    option: PropTypes.number.isRequired,
    isAlarm: PropTypes.bool,
    onChange: PropTypes.func
}