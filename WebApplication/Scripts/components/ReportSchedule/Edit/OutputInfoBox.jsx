/**
 * @license Copyright 2019 DENSO
 * 
 * OutputInfoBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import GarmitBox from 'Assets/GarmitBox';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import ToggleSwitch  from 'Common/Widget/ToggleSwitch';

import { validateFileName as validateFileNameString, VALIDATE_STATE, successResult } from 'inputCheck';
import { VALUE_TYPE, VALUE_TYPE_OPTIONS, REPORT_OUTPUT_TYPE, REALTIME_OUTPUT_OPTIONS, DIGEST_OUTPUT_OPTIONS, RECORD_INTERVAL, RECORD_INTERVAL_OPTIONS, OUTPUT_SUMMARY_TYPE_OPTION } from 'constant';
import { convertNumber } from 'numberUtility';

const MAXLENGTH_OUTPUT_FILE_NAME = 100;

/**
 * 出力情報ボックスコンポーネント
 * @param {object} schedule スケジュール情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange 出力情報が変更されたときに呼び出す
 */
export default class OutputInfoBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { schedule } = props;
        this.state = {
            validate: {
                outputFileName: schedule ? this.validateFileName(schedule.outputFileName) : { state: null, helpText: null },
                outputType: schedule ? successResult : { state: null, helpText: null },
                outputPriod: schedule ? successResult : { state: null, helpText: null },
                recordInterval: schedule ? successResult : { state: null, helpText: null },
                summaryType: schedule ? successResult : { state: null, helpText: null }
            }
        }
    }

    //#region React ライフサイクルメソッド

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforescheduleId = this.props.schedule && this.props.schedule.reportScheduleId;
        const nextSchedule = nextProps.schedule;
        const nextscheduleId = nextSchedule && nextSchedule.reportScheduleId;
        if ((!beforescheduleId && nextscheduleId) || (beforescheduleId !== nextscheduleId)){
            this.setState({
                validate: {
                    outputFileName: nextSchedule ? this.validateFileName(nextSchedule.outputFileName) : { state: null, helpText: null },
                    outputType: nextSchedule ? successResult : { state: null, helpText: null },
                    outputPriod: nextSchedule ? successResult : { state: null, helpText: null },
                    recordInterval: nextSchedule ? successResult : { state: null, helpText: null },
                    summaryType: nextSchedule ? successResult : { state: null, helpText: null }
                }
            })
        }
    }

    /**
     * render
     */
    render() {
        const { schedule, isLoading } = this.props;
        if (schedule) {
            var { outputFileName, valueType, outputType, outputStartDay, outputEndDay, recordInterval, summaryType, isConvert } = schedule;
        }
        const { validate } = this.state;
        const isRealTime = (parseInt(valueType) === VALUE_TYPE.realTime);
        const isPeriod = (parseInt(outputType) === REPORT_OUTPUT_TYPE.period);
        return (
            <GarmitBox title="出力情報" isLoading={isLoading}>
                <div>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label='出力ファイル名' columnCount={1} isRequired={true} >
                                <TextForm value={outputFileName}
                                          validationState={validate.outputFileName.state}
                                          helpText={validate.outputFileName.helpText}
                                          maxlength={MAXLENGTH_OUTPUT_FILE_NAME}
                                          onChange={(value) => this.onChange('outputFileName', value, this.validateFileName(value))} 
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    <ValueTypeSelectForm className="mt-1 mb-05"
                                         type={valueType}
                                         valueTypeOptions={VALUE_TYPE_OPTIONS} 
                                         validationState={validate.outputType.state}
                                         helpText={validate.outputType.helpText}
                                         onChange={(value) => this.onChange('valueType', value)} 
                    />
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label='出力種別' columnCount={isPeriod?2:1} isRequired={true} >
                                <SelectForm 
                                    value={outputType}
                                    isRequired={true}
                                    validationState={validate.outputType.state}
                                    helpText={validate.outputType.helpText}
                                    options={isRealTime ? REALTIME_OUTPUT_OPTIONS : DIGEST_OUTPUT_OPTIONS}
                                    onChange={(value) => this.onChange('outputType', value)}
                                />
                            </InputForm.Col>
                            {isPeriod&&
                                <InputForm.Col label='出力期間' columnCount={2} isRequired={true} >
                                    <OutputPeriodForm startDay={outputStartDay} 
                                                      endDay={outputEndDay} 
                                                      validationState={validate.outputPriod.state}
                                                      helpText={validate.outputPriod.helpText}
                                                      onChange={(key, value) => this.onChange(key, value)}
                                    />
                                </InputForm.Col>
                            }
                        </InputForm.Row>
                        <InputForm.Row>
                            {isRealTime?
                                <InputForm.Col label='出力間隔' columnCount={2} isRequired={true} >
                                    <SelectForm
                                        isRequired={true}
                                        value={this.getRecordInterval(recordInterval)}
                                        options={RECORD_INTERVAL_OPTIONS}
                                        validationState={validate.recordInterval.state}
                                        helpText={validate.recordInterval.helpText}
                                        onChange={(value) => this.onChange('recordInterval', value)}
                                    />
                                </InputForm.Col>
                            :
                                <InputForm.Col label='集計種別' columnCount={2} isRequired={true} >
                                    <SelectForm
                                        isRequired={true}
                                        value={summaryType}
                                        options={OUTPUT_SUMMARY_TYPE_OPTION}
                                        validationState={validate.summaryType.state}
                                        helpText={validate.summaryType.helpText}
                                        onChange={(value) => this.onChange('summaryType', value)}
                                    />
                                </InputForm.Col>
                            }
                            
                            <InputForm.Col label="換算する" columnCount={2} isRequired={true} >
                                <CheckboxSwitch text={isConvert?"ON":"OFF"} 
                                                checked={isConvert} 
                                                onChange={(checked) => this.onChange('isConvert', checked)}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </div>
            </GarmitBox>
        );
    }
    
    //#region 入力変更

    /**
     * 入力変更イベントを発生させる
     * @param {string} key 変更値のオブジェクトキー
     * @param {any} value 変更後の値
     * @param {object} validate 入力検証結果
     */
    onChange(key, value, validate){
        const validateResult = this.setValidate(validate, key);
        if (this.props.onChange) {
            if (key === 'recordInterval') {
                var val = RECORD_INTERVAL_OPTIONS.find((option) => option.value === convertNumber(value)) ? value : null;
            } else {
                var val = value;
            }
            this.props.onChange(key, val, this.invalid(validateResult));
        }
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate) {
        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) && 
                validate[key].state !== VALIDATE_STATE.success) {
                    invalid = true;
                    break; 
            }
        }
        return invalid;
    }

    //#endregion

    //#region 入力検証

    /**
     * 出力ファイル名の入力検証
     * @param {string} name 名称
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateFileName(name) {
        return validateFileNameString(name, MAXLENGTH_OUTPUT_FILE_NAME, false);        
    }
    
    /**
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, key) {        
        var validate = Object.assign({}, this.state.validate);
        if (validate.hasOwnProperty(key) && targetValidate) {
            validate[key] = targetValidate;
            this.setState({validate:validate});
        }        
        return validate;
    }

    /**
     * 出力間隔を取得する
     * @param {number|string} interval 出力間隔
     */
    getRecordInterval(interval) {
        if (interval === null || interval === 'null') {
            var intervalValue = null;
        } else {
            var intervalValue = convertNumber(interval);
        }
        if (!(intervalValue === null || intervalValue === 1 || intervalValue === 5 || intervalValue === 10)) {
            return null;
        }
        return interval;
    }

    //#endregion
}

OutputInfoBox.propsTypes = {
    schedule: PropTypes.shape({
        reportScheduleId: PropTypes.number,
        outputFileName: PropTypes.string,
        valueType: PropTypes.number,
        outputType: PropTypes.number,
        outputStartDay: PropTypes.number,
        outputEndDay:  PropTypes.number,
        recordInterval: PropTypes.number,
        summaryType: PropTypes.number,
        isConvert: PropTypes.bool
    }),
    isLoading: PropTypes.bool,
    onChange: PropTypes.func
}

/**
 * 値種別選択フォーム
 * @param {*} param0 
 */
const ValueTypeSelectForm = ({type, valueTypeOptions, disabled, className, onChange: handleChangeValueType}) => {
    return (
        <ToggleSwitch
            className={className}
            value={type}
            disabled={disabled}
            bsSize="sm"
            name="valueType"
            swichValues={valueTypeOptions}
            onChange={handleChangeValueType}
        />
    );
}

/**
 * 出力期間フォーム
 */
const OutputPeriodForm = ({startDay, endDay, validationState, helpText, className, onChange: handleChanged}) => {
    var options = [];
    for (let index = 1; index < 31; index++) {
        options.push({value: index, name: index + '日'});
    }
    options.push({value: 99, name: '月末'});
    return (
        <FormGroup validationState={validationState} className={className}>
            <div className="garmit-input-group">
                <div className="garmit-input-item">
                    <FormControl componentClass='select' 
                                 value={startDay} 
                                 onChange={(e) => handleChanged('outputStartDay', e.target.value)} 
                        >
                        {options && options.map((i) => 
                            <option value={i.value}>{i.name}</option>
                        )}
                    </FormControl>
                </div>
                <div className="garmit-input-item ta-c">
                    <span>～</span>
                </div>
                <div className="garmit-input-item">
                    <FormControl componentClass='select' 
                                 value={endDay} 
                                 onChange={(e) => handleChanged('outputEndDay', e.target.value)} 
                        >
                        {options && options.map((i) => 
                            <option value={i.value}>{i.name}</option>
                        )}
                    </FormControl>
                </div>
            </div>
            {helpText&&<HelpBlock>{helpText}</HelpBlock>}
        </FormGroup>
    );
}