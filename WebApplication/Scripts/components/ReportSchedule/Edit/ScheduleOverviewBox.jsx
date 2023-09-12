/**
 * @license Copyright 2019 DENSO
 * 
 * ScheduleOutviewBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelFrom from 'Common/Form/LabelForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';

import { validateText, validateSelect, VALIDATE_STATE } from 'inputCheck';

const MAXLENGTH_SCHEDULE_NAME = 100;

/**
 * スケジュール情報コンポーネント
 * @param {object} schedule スケジュール情報
 * @param {array} enterprises 所属一覧
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange スケジュール情報が変更されたときに呼び出す
 * @param {function} onChangeEnterprise 所属が変更されたときに呼び出す
 */
export default class ScheduleOverviewBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { schedule } = props;
        this.state = {
            validate: {
                scheduleName: schedule ? this.validateName(schedule.scheduleName) : { state: null, helpText: null },
                enterprise: schedule ? validateSelect(schedule.enterpriseId) : { state: null, helpText: null }
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
                    scheduleName: nextSchedule ? this.validateName(nextSchedule.scheduleName) : { state: null, helpText: null },
                    enterprise: nextSchedule ? validateSelect(nextSchedule.enterpriseId) : { state: null, helpText: null }
                }
            })
        }
    }

    /**
     * render
     */
    render() {
        const { enterprises, schedule, isLoading } = this.props;
        const { validate } = this.state;
        const selectedEnterprise = schedule && { enterpriseId: schedule.enterpriseId, enterpriseName: schedule.enterpriseName };
        return (
            <GarmitBox title="スケジュール情報" isLoading={isLoading}>
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label='スケジュール名' columnCount={2} isRequired={true} >
                            <TextForm value={schedule&&schedule.scheduleName}
                                      validationState={validate.scheduleName.state}
                                      helpText={validate.scheduleName.helpText}
                                      maxlength={MAXLENGTH_SCHEDULE_NAME}
                                      onChange={(value) => this.onChange('scheduleName', value, this.validateName(value))} 
                            />
                        </InputForm.Col>
                        <InputForm.Col label='スケジュールID' columnCount={2} >
                            <LabelFrom value={schedule&&schedule.reportScheduleId > 0 ? schedule.reportScheduleId : ''} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label='所属' columnCount={2} isRequired={true} >
                            <EnterpriseForm
                                    selectedEnterprise={selectedEnterprise}
                                    enterpriseList={enterprises}
                                    validationState={validate.enterprise.state}
                                    helpText={validate.enterprise.helpText}
                                    onChange={(value) => this.onChangeEnterprise(value)}
                            />
                        </InputForm.Col>
                        <InputForm.Col label='実行する' columnCount={2} >
                            <CheckboxSwitch text={!(schedule&&schedule.isInvalid)?'ON':'OFF'} 
                                            checked={!(schedule&&schedule.isInvalid)} 
                                            onChange={(checked) => this.onChange('isInvalid', !checked)} 
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                </InputForm>
            </GarmitBox>
        );
    }

    //#endregion

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
            this.props.onChange(key, value, this.invalid(validateResult));
        }
    }

    /**
     * 所属変更イベントを発生
     * @param {object} value 変更後の値
     */
    onChangeEnterprise(value) {
        const enterpriseId = value&&value.enterpriseId;
        if (enterpriseId === this.props.schedule.enterpriseId) {
            return;
        }
        const validate = validateSelect(enterpriseId);
        const enterprise = value && _.pick(value, ['enterpriseId', 'enterpriseName']);
        const validateResult = this.setValidate(validate, 'enterprise');
        if (this.props.onChangeEnterprise) {
            this.props.onChangeEnterprise(enterprise, this.invalid(validateResult));
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
     * スケジュール名称の入力検証
     * @param {string} name 名称
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateName(name) {
        return validateText(name, MAXLENGTH_SCHEDULE_NAME, false);        
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

    //#endregion
}

ScheduleOverviewBox.propsTypes = {
    schedule: PropTypes.shape({
        reportScheduleId: PropTypes.number,
        enterpriseId: PropTypes.number,
        enterpriseName: PropTypes.string,
        scheduleName: PropTypes.string,
        isInvalid: false
    }),
    enterprises: PropTypes.arrayOf(PropTypes.shape({
        enterpriseId: PropTypes.number.isRequired,
        enterpriseName: PropTypes.string.isRequired
    })),
    isLoading: PropTypes.bool,
    onChange: PropTypes.func
}