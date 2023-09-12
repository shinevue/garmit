/**
 * @license Copyright 2021 DENSO
 * 
 * ICCardCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import { Checkbox } from 'react-bootstrap';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

import { validateDate, VALIDATE_STATE, errorResult } from 'inputCheck';

import { DATE_TIME_FORMAT} from 'constant';

const DATE_FORMAT = DATE_TIME_FORMAT.date;
const ADMIN_TYPE = {
    isAdmin: 1, 
    isNonAdmin: 2,
    both: 3
};
const ADMIN_TYPE_OPTIONS = [
    {value: ADMIN_TYPE.both, text: 'すべて'}, 
    {value: ADMIN_TYPE.isAdmin, text: '管理者のみ'},
    {value: ADMIN_TYPE.isNonAdmin, text: 'それ以外'}
];
const INVALID_TYPE = {
    isValid: 1, 
    isInvalid: 2,
    both: 3
};
const INVALID_TYPE_OPTIONS = [
    {value: INVALID_TYPE.both, text: 'すべて'}, 
    {value: INVALID_TYPE.isValid, text: '有効'},
    {value: INVALID_TYPE.isInvalid, text: '無効'}
];

/**
 * ICカード検索条件コンポーネント
 * @param {object} condition 検索条件 { dateSpecified, dateFrom, dateTo, isAdmin, isNonAdmin, isInvalid, isValid } 
 * @param {object} validate 入力検証結果
 * @param {function} onChange 検索条件変更イベント
 */
export default class ICCardCondition extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    /**
     * render
     */
    render() {
        const { condition, validate } = this.props;
        const { dateSpecified, dateFrom, dateTo, isAdmin, isNonAdmin, isInvalid, isValid } = condition;
        const adminType = this.getAdminType(isAdmin, isNonAdmin);
        const invalidType = this.getInvalidType(isValid, isInvalid);
        return (            
            <dl className="garmit-additional-condition">
                <dt>
                    有効期間：
                </dt>
                <dd className={"mb-2"/*"mb-1"*/} style={{paddingTop: "7px"}}>
                    <Checkbox className="ma-1" checked={!dateSpecified} onClick={() => this.handleDateSpecifiedClick()} className="mt-0">期間を指定しない</Checkbox>      
                    <DateTimeSpanForm
                        from={dateFrom}
                        to={dateTo}
                        format={DATE_FORMAT}
                        isReadOnly={!dateSpecified}
                        onChange={(from, to) => this.handleDateChange(from, to)}
                        validationFrom={validate.dateFrom}
                        validationTo={validate.dateTo}
                    />
                </dd>
                <dt >
                    権限：
                </dt>
                <dd style={{height: "34px"}} >
                    <ToggleSwitch
                        name="isAdmin" 
                        bsSize="sm"
                        value={adminType}
                        swichValues={ADMIN_TYPE_OPTIONS}
                        onChange={(value) => this.hanldeAdminTypeCahnge(value)}
                    />
                </dd>
                <dd style={{height: "34px"}} className="pa-t-1">                            
                    <ToggleSwitch
                        name="isInvalid" 
                        bsSize="sm"
                        value={invalidType}
                        swichValues={INVALID_TYPE_OPTIONS}
                        onChange={(value) => this.hanldeInvalidTypeCahnge(value)}
                    />
                </dd>
            </dl>
        );
    }

    /**
     * 「期間を指定しない」チェックボックスがクリックされたとき
     */
    handleDateSpecifiedClick() {
        const { dateFrom, dateTo } = this.props.condition;
        const newDateSpecified = !this.props.condition.dateSpecified;

        this.onChangeDateTimeSpan(dateFrom, dateTo, newDateSpecified);
    }

    /**
     * 操作日時指定に変更があったとき
     * @param {any} from 開始日
     * @param {any} to 終了日
     */
    handleDateChange(from, to) {
        this.onChangeDateTimeSpan(from, to, this.props.condition.dateSpecified);
    }

    /**
     * 有効期限が変更されたとき
     * @param {any} from
     * @param {any} to
     * @param {bool} dateSpecified
     */
    onChangeDateTimeSpan(from, to, dateSpecified) {
        const validate =  this.validateDateTimeSpan(from, to, dateSpecified);
        const obj = _.cloneDeep(this.props.condition);
        obj.dateSpecified = dateSpecified;
        obj.dateFrom = from;
        obj.dateTo = to;
        this.onChange(obj, validate);
    } 

    /**
     * 有効期間の入力検証
     * @param {*} from 開始日
     * @param {*} to 終了日
     * @param {*} dateSpecified 日付指定ありかどうか
     */
    validateDateTimeSpan(from, to, dateSpecified) {
        var validate = {
            dateFrom: null,
            dateTo: null
        };
        if (dateSpecified) {
            validate.dateFrom = validateDate(from, DATE_FORMAT, false);
            validate.dateTo = validateDate(to, DATE_FORMAT, false);
            if (validate.dateFrom.state == VALIDATE_STATE.success && 
                validate.dateTo.state == VALIDATE_STATE.success && 
                !moment(to).isAfter(from)) {
                validate.dateTo = errorResult('終了日は開始日以降となるように設定してください');
            }
        }
        return validate;
    }

    /**
     * 管理者種別を取得する
     * @param {boolean} isAdmin 管理者か
     * @param {boolean} isNonAdmin それ以外が
     * @returns 
     */
    getAdminType(isAdmin, isNonAdmin) {
        var adminType = 0;
        if (isAdmin) {
            adminType = adminType + ADMIN_TYPE.isAdmin;
        }
        if (isNonAdmin) {
            adminType = adminType + ADMIN_TYPE.isNonAdmin
        }
        return adminType;
    }

    /**
     * 管理者種別変更
     * @param {number} value 変更後の値
     */
    hanldeAdminTypeCahnge(value) {        
        const obj = _.cloneDeep(this.props.condition);
        obj.isAdmin = (value & 0b0001) !== 0;
        obj.isNonAdmin = ((value >> 1) & 0b0001) !== 0;
        this.onChange(obj, this.props.validate);
    }

    /**
     * 有効/無効種別取得する
     * @param {boolean} isValid 有効
     * @param {boolean} isInvalid 無効
     * @returns 
     */
     getInvalidType(isValid, isInvalid) {
        var invalidType = 0;
        if (isValid) {
            invalidType = invalidType + INVALID_TYPE.isValid;
        }
        if (isInvalid) {
            invalidType = invalidType + INVALID_TYPE.isInvalid
        }
        return invalidType;
    }

    /**
     * 有効/無効種別変更
     * @param {number} value 変更後の値
     */
     hanldeInvalidTypeCahnge(value) {        
        const obj = _.cloneDeep(this.props.condition);
        obj.isValid = (value & 0b0001) !== 0;
        obj.isInvalid = ((value >> 1) & 0b0001) !== 0;
        this.onChange(obj, this.props.validate);
    }

    /**
     * 検索条件変更イベント
     * @param {object} condition 検索条件
     * @param {object} validate 検証結果
     */
     onChange(condition, validate) {
        if (this.props.onChange) {
            this.props.onChange(condition, validate);
        }
    }

}