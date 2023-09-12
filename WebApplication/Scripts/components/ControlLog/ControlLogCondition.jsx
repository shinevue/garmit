/**
 * @license Copyright 2019 DENSO
 * 
 * ControlLogCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import MultiSelectForm from 'Common/Form/MultiSelectForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import { validateMultiSelect, validateDate, successResult, errorResult } from 'inputCheck';

export const DATETIME_FORMAT = "YYYY/MM/DD HH:mm";

/**
 * 制御ログの追加検索条件コンポーネント
 * @param {object} controlTypes 実行種別一覧
 * @param {array} selectedControlTypes 選択中の実行種別
 * @param {date} startDate 開始時刻
 * @param {date} endDate 終了時刻
 * @param {function} onChangeDateTime 実行時刻条件の変更時に呼び出す
 * @param {function} onChangeControlTypes 実行種別条件の変更時に呼び出す
 */
export default class ControlLogCondition extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            validate: {
                startDate: successResult,
                endDate: successResult,
                controlTypes: successResult
            }
        };
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        const { startDate: beforeStartDate, endDate: beforeEndDate, selectedControlTypes: beforeTypes } = this.props;
        const { startDate: nextStartDate, endDate: nextEndDate, selectedControlTypes: nextTypes } = nextProps;
        if (beforeStartDate !== nextStartDate || beforeEndDate !== nextEndDate || beforeTypes !== nextTypes) {
            this.setState({ validate: {
                startDate: this.validateDateFormat(nextStartDate),
                endDate: this.validateEndDate(nextStartDate, nextEndDate),
                controlTypes: this.validateControlTypes(nextTypes)
            }});
        }
    }    

    /**
     * render
     */
    render() {
        const { controlTypes, selectedControlTypes, startDate, endDate, isReadOnly } = this.props;
        const { validate } = this.state;
        return (
            <Grid fluid>
                <ControlTypesMultiSelectForm
                    isReadOnly={isReadOnly}
                    options={controlTypes&&Object.keys(controlTypes).map((key) => { return { value: key, name: controlTypes[key] } })}
                    types={selectedControlTypes}
                    validate={validate.controlTypes}
                    onChange={this.handleChangeControlTypes}
                />
                <ControlDateTimeFrom
                    startDate={startDate}
                    endDate={endDate}
                    startValidation={validate.startDate}
                    endValidation={validate.endDate}
                    onChange={this.handleChangeDateTime}
                />
            </Grid>
        );
    }

    //#region イベントハンドラ

    /**
     * 実行種別変更イベント
     */
    handleChangeControlTypes = (values) => {
        var validate = Object.assign(this.state.validate);
        validate.controlTypes = this.validateControlTypes(values);
        this.setState({ validate: validate }, () => {
            if (this.props.onChangeControlTypes) {
                this.props.onChangeControlTypes(values, this.isError(this.state.validate));
            }
        });
    }

    /**
     * 実行日時変更イベント
     */
    handleChangeDateTime = (start, end) => {
        var validate = Object.assign(this.state.validate);
        validate.startDate = this.validateDateFormat(start);
        validate.endDate = this.validateEndDate(start, end);
        this.setState({ validate: validate }, () => {
            if (this.props.onChangeDateTime) {
                this.props.onChangeDateTime(start, end, this.isError(this.state.validate));
            }
        });
    }

    //#endregion

    //#region 入力検証

    /**
     * 日時のフォーマット入力チェック
     */
    validateDateFormat(date) {
        return validateDate(date, DATETIME_FORMAT, true);
    }

    /**
    * 終了日時の入力チェック
    */
    validateEndDate(startDate, endDate) {
        let validate = this.validateDateFormat(endDate);
        if (validate.state === successResult.state) {
            if (endDate && startDate >= endDate) {
                validate = errorResult('終了日時は開始日時以降となるように設定してください。');
            }
        }
        return validate;
    }

    /**
     * 実行種別の入力検証
     * @param {array} controlTypes 実行種別リスト
     */
    validateControlTypes(controlTypes) {
        return validateMultiSelect(controlTypes);
    }

    /**
     * 条件がにエラーが含まれているかどうか
     * @param {object} validate 入力検証結果
     */
    isError(validate) {
        if (validate.startDate.state !== successResult.state ||
            validate.endDate.state !== successResult.state ||
            validate.controlTypes.state !== successResult.state
            ) {
            return true;
        } 
        return false;
    }

    //#endregion
}

ControlLogCondition.propTypes = {
    controlTypes: PropTypes.object,
    selectedControlTypes: PropTypes.array,
    startDate: PropTypes.date,
    endDate: PropTypes.date,
    onChangeDateTime: PropTypes.func,
    onChangeControlTypes: PropTypes.func
}

/**
 * 実行ステータスドロップダウン 
 */
const ControlTypesMultiSelectForm = ({ options, types, validate, onChange: handleChangeTypes }) => {
    return (
        <Row>
            <Col md={12} className="flex-baseline">
                <label className="inline-block">実行種別：</label>
                <MultiSelectForm
                    className="inline-block"
                    value={types}
                    options={options}
                    validationState={validate.state}
                    helpText={validate.helpText}
                    onChange={handleChangeTypes}
                />
            </Col>
        </Row>
    );
}

const ControlDateTimeFrom = ({ startDate, endDate, startValidation, endValidation, onChange: handleChangeDateTime }) => {
    return (
        <Row>
            <Col md={12} className="flex-baseline">
                <label className="inline-block">実行日時：</label>
                <DateTimeSpanForm
                    from={startDate}
                    to={endDate}
                    format={DATETIME_FORMAT}
                    timePicker={true}
                    onChange={handleChangeDateTime}
                    validationFrom={startValidation}
                    validationTo={endValidation}
                />
            </Col>
        </Row>
    );
}