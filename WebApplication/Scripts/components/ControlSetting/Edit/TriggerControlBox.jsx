/**
 * @license Copyright 2019 DENSO
 * 
 * TriggerControlBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import LocationForm from 'Assets/Condition/LocationForm';
import GarmitBox from 'Assets/GarmitBox';
import ControlOperationsEditForm from 'Assets/Control/ControlOperationsEditForm';
import DemandSettingModal from 'ControlSetting/Edit/DemandSettingModal'

import { convertNumber } from 'numberUtility';
import { VALIDATE_STATE, successResult } from 'inputCheck';
import { MAXLENGTH_TRIGGER_CONTROL_NAME, MAXCOUNT_CONTROL_OPERATION, } from 'controlSettingUtility';
import { validateTriggerControlName, validateBlindTime, validateLocation, validateTriggerType, validatePoint } from 'controlSettingUtility';
import { TRIGGER_TYPE_ALARM_POWER_NONE } from 'constant';

/**
 * トリガー制御設定ボックス
 * @param {array} locations ロケーションツリー情報
 * @param {object} triggerControl トリガー制御情報
 * @param {array} triggerControlOperations トリガー制御の実行制御一覧
 * @param {array} triggerTypes トリガー種別一覧
 * @param {object} demandSet デマンド設定 
 * @param {array} thresholds トリガー閾値一覧（ポイント）
 * @param {array} controlOperations 実行制御一覧
 * @param {array} controlLocations 実行制御のロケーション一覧
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange トリガー制御設定（実行制御以外）の変更時に呼び出す
 * @param {function} onChangeLocation ロケーション変更時に呼び出す
 * @param {function} onChangeTrigger 実行制御一覧の変更時に呼び出す
 * @param {function} onChangeOperations 実行制御一覧の変更時に呼び出す
 */
export default class TriggerControlBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { triggerControl, thresholds } = props;
        const hasThreshold = thresholds&&thresholds.length>0;
        this.state = { 
            validate : {
                triggerControlName: triggerControl ? validateTriggerControlName(triggerControl.triggerControlName) : { state: null, helpText: null },
                blindTime: triggerControl ? validateBlindTime(triggerControl.blindTime) : { state: null, helpText: null },
                location: triggerControl ? validateLocation(triggerControl.location) : { state: null, helpText: null },
                triggerType: triggerControl && triggerControl.triggerType ? validateTriggerType(triggerControl.triggerType.triggerId) : { state: null, helpText: null },
                point: triggerControl && triggerControl.triggerType && hasThreshold ? validatePoint(triggerControl.pointNo) : { state: null, helpText: null }
            },
            showModal: false
        };
    }

    //#region React ライフサイクルメソッド
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeTriggerControl = this.props.triggerControl
        const nextTriggerControl = nextProps.triggerControl;
        const beforeId = beforeTriggerControl && beforeTriggerControl.triggerControlId;
        const nextId = nextTriggerControl && nextTriggerControl.triggerControlId;
        const beforeTriggerId = beforeTriggerControl && beforeTriggerControl.triggerType && beforeTriggerControl.triggerType.triggerId;
        const nextTriggerId = nextTriggerControl && nextTriggerControl.triggerType && nextTriggerControl.triggerType.triggerId;
        const beforePointNo = beforeTriggerControl && beforeTriggerControl.pointNo;
        const nextPointNo = nextTriggerControl && nextTriggerControl.pointNo;
        if (((!beforeId && nextId) || (beforeId !== nextId)) || 
             beforeTriggerId !== nextTriggerId || 
             beforePointNo !== nextPointNo || nextProps.thresholds != this.props.thresholds){
            const hasThreshold = nextProps.thresholds&&nextProps.thresholds.length>0;
            this.setState({
                validate: {
                    triggerControlName: nextTriggerControl ? validateTriggerControlName(nextTriggerControl.triggerControlName) : { state: null, helpText: null },
                    blindTime: nextTriggerControl ? validateBlindTime(nextTriggerControl.blindTime) : { state: null, helpText: null },
                    location: nextTriggerControl ? validateLocation(nextTriggerControl.location) : { state: null, helpText: null },
                    triggerType: nextTriggerId !== null ? validateTriggerType(nextTriggerId) : { state: null, helpText: null },
                    point: nextTriggerId !== null && hasThreshold ? validatePoint(nextPointNo) : { state: null, helpText: null }
                }
            })
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { locations, thresholds, controlOperations, controlLocations, isLoading } = this.props;
        const { triggerControl, triggerControlOperations, demandSet } = this.props;

        if (triggerControl) {
            var { triggerControlId, triggerControlName, blindTime, location, triggerType, pointNo, pointName, triggerThreshold, contractPower, isInvalid } = triggerControl;
            var triggerTypes = this.getUseableTriggerTypes();
            var unit = triggerType && triggerType.unit ? triggerType.unit : '';
        }
        const { validate, showModal } = this.state;

        return (
            <GarmitBox title="デマンド/発電量制御設定" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="制御ID" columnCount={2} >
                            <LabelForm value={triggerControlId>0?triggerControlId:''} />
                        </InputForm.Col>
                        <InputForm.Col label="名称" columnCount={2} isRequired={true} >
                            <TextForm value={triggerControlName} 
                                      validationState={validate.triggerControlName.state}
                                      helpText={validate.triggerControlName.helpText}
                                      onChange={(value) => this.onChange('triggerControlName', value, validateTriggerControlName(value))} 
                                      maxlength={MAXLENGTH_TRIGGER_CONTROL_NAME}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ロケーション" columnCount={1} isRequired={true} >
                            <LocationForm 
                                multiple={false}
                                locationList={locations}
                                selectedLocation={location}
                                onChange={(value) => this.onChangeLocation(value, validateLocation(value))}
                                validationState={validate.location.state}
                                helpText={validate.location.helpText}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="不感時間" columnCount={2} isRequired={true} >
                            <TextForm value={blindTime} 
                                        validationState={validate.blindTime.state}
                                        helpText={validate.blindTime.helpText}
                                        onChange={(value) => this.onChange('blindTime', value, validateBlindTime(value))} 
                                        unit="分"
                                />
                        </InputForm.Col>
                        <InputForm.Col label="トリガー" columnCount={2} isRequired={true} >
                            <SelectForm
                                isReadOnly={location?false:true}
                                isRequired
                                value={triggerType&&triggerType.triggerId}
                                options={triggerTypes&&triggerTypes.map((type) => { return { value: type.triggerId, name: type.triggerName } })}
                                onChange={(value) => this.onChangeTrigger(value, validateTriggerType(value))}
                                validationState={validate.triggerType.state}
                                helpText={validate.triggerType.helpText}
                            />
                            {thresholds&&thresholds.length>0&& 
                                <SelectForm
                                    label="SOC制御対象ポイント"
                                    isReadOnly={location?false:true}
                                    isRequired
                                    value={pointNo}
                                    options={thresholds.map((trigger) => { return { value: trigger.pointNo, name: trigger.pointName } })}
                                    onChange={(value) => this.changePoint('point', value, validatePoint(value))} 
                                    validationState={validate.point.state}
                                    helpText={validate.point.helpText}
                                />
                            }
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="契約電力" columnCount={2} >
                            <LabelForm value={contractPower? (contractPower.toFixed()+'kW') :''} />
                        </InputForm.Col>
                        <InputForm.Col label="閾値" columnCount={2} >
                            <LabelForm 
                                value={(triggerThreshold || triggerThreshold === 0) ?(triggerThreshold+unit):''} 
                                addonButton={[{
                                    key: 'thresholdEdit',
                                    iconId: 'category-setting',
                                    isCircle: true,
                                    tooltipLabel: '閾値編集',
                                    onClick: () => this.showDemandSettingModal()
                                }]}                                
                                isReadOnly={!(triggerTypes&&triggerTypes.length>0)}                 
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <ControlPatternRow 
                        isReadOnly={location&&triggerType?false:true}
                        locations={controlLocations}
                        controls={controlOperations}
                        controlOperations={triggerControlOperations}
                        maxCount={MAXCOUNT_CONTROL_OPERATION}
                        onChange={(operations, isError) => this.onChangeOperations(operations, isError)}
                    />
                    <InputForm.Row>
                        <InputForm.Col label="実行する" columnCount={1} isRequired={true} >
                            <CheckboxSwitch text={!isInvalid?"ON":"OFF"} 
                                            checked={!isInvalid} 
                                            onChange={(checked) => this.onChange('isInvalid', !checked)}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                </InputForm>
                <DemandSettingModal 
                    show={showModal} 
                    triggerTypes={this.props.triggerTypes}
                    demandSet={demandSet}
                    selectedTriggerType={triggerType}
                    selectedPointNo={pointNo}
                    onSave={(demandSet) => this.handleSaveDemandSet(demandSet)}
                    onCancel={() => this.hideDemandSettingModal()} 
                />
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
            this.props.onChange(key, value, this.invalid(validateResult));
        }
    }

    /**
     * 実行する操作一覧の変更イベント
     * @param {*} value 
     * @param {*} isError 
     */
    onChangeOperations(value, isError) {
        if (this.props.onChangeOperations) {
            this.props.onChangeOperations(value, isError);
        }
    }

    /**
     * ロケーション変更イベントを発生させる
     * @param {object} value 変更後のロケーション情報
     * @param {object} validate 検証結果
     */
    onChangeLocation(value, validate) {
        const { location } = this.props.triggerControl
        if (location && value.locationId === location.locationId) {
            return;     //ロケーションが変更されなかった場合は変更イベントを発生させない
        }
        const key = 'location';
        var validateResult = this.setValidate(validate, key);
        validateResult = this.setValidate(successResult, 'triggerType', validateResult);
        if (this.props.onChangeLocation) {     
            this.props.onChangeLocation(key, _.cloneDeep(value), this.invalid(validateResult));
        }
        this.onChangeOperations([], false);          //実行する動作をクリア        
    }

    /**
     * トリガーの変更イベント
     * @param {object} value 変更後のトリガーID
     * @param {object} validate 検証結果
     */
    onChangeTrigger(value, validate) {
        const { triggerTypes } = this.props
        const { location } = this.props.triggerControl;  
        const key = 'triggerType';
        const validateResult = this.setValidate(validate, key);
        const triggerType = triggerTypes ? triggerTypes.find((type) => type.triggerId === convertNumber(value)) : null;   
        if (triggerType && this.props.onChangeTrigger) {
            this.props.onChangeTrigger(key, triggerType, location, this.invalid(validateResult));
            this.onChangeOperations([], false);          //実行する動作をクリア   
        }
    }

    /**
     * ポイント変更
     * @param {string} key キー文字列
     * @param {string} pointNo ポイント番号（文字列）
     * @param {object} validate 検証結果
     */
    changePoint(key, pointNo, validate) {
        const { thresholds } = this.props;
        const point = thresholds ? thresholds.find((th) => th.pointNo === convertNumber(pointNo)) : null; 
        const validateResult = this.setValidate(validate, key);
        if (this.props.onChangePoint) {
            const { triggerType } = this.props.triggerControl;    
            this.props.onChangePoint(key, _.cloneDeep(point), triggerType && triggerType.triggerId, this.invalid(validateResult) )
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
                validate[key].state &&
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
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @param {object} beforeValidate 変更前の検証結果（指定がない時はstateから変更）
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, key, beforeValidate) {
        var validate = beforeValidate ? Object.assign({}, beforeValidate) : Object.assign({}, this.state.validate);
        if (validate.hasOwnProperty(key) && targetValidate) {
            validate[key] = targetValidate;
            this.setState({validate:validate});
        }        
        return validate;
    }

    //#endregion

    //#region その他

    /**
     * 使用可能なトリガー種別を取得する
     */
    getUseableTriggerTypes() {
        const { triggerTypes, demandSet } = this.props;
        if (demandSet && demandSet.triggerThresholds && demandSet.triggerThresholds.length > 0) {
            return triggerTypes.filter((type) => 
                        demandSet.triggerThresholds.some((th) => th.triggerType.triggerId === type.triggerId) 
                        ||
                        type.triggerId === TRIGGER_TYPE_ALARM_POWER_NONE        //警報電力超過なしを含む
                    );
        } else {
            return [];
        }
    }

    //#endregion
    
    //#region トリガーしきい値編集関係

    /**
     * デマンド設定保存イベント
     * @param {object} demandSet 変更後のデマンド設定
     */
    handleSaveDemandSet(demandSet) {
        if (this.props.onSaveDemandSet) {
            //デマンド設定の保存が成功したら、モーダルを閉じる
            this.props.onSaveDemandSet(demandSet, () => this.hideDemandSettingModal());
        }
    }

    /**
     * トリガーしきい値編集モーダルを表示する
     */
    showDemandSettingModal() {
        this.setState({ showModal: true });
    }

    /**
     * トリガーしきい値編集モーダルを閉じる
     */
    hideDemandSettingModal() {
        this.setState({ showModal : false });
    }

    //#endregion
}

TriggerControlBox.propsTypes = {
    locations: PropTypes.array,
    triggerControl: PropTypes.shape({
        triggerControlId: PropTypes.number,
        triggerControlName: PropTypes.string,
        blindTime: PropTypes.number,
        location: PropTypes.object,
        triggerType: PropTypes.number,
        pointNo: PropTypes.number,
        pointName: PropTypes.string,
        triggerThreshold: PropTypes.number,
        contractPower: PropTypes.number,
        isInvalid: PropTypes.bool
    }),
    triggerControlOperations:PropTypes.array,
    triggerTypes: PropTypes.array,
    demandSet: PropTypes.object,
    thresholds: PropTypes.array,
    controlOperations:PropTypes.array,
    controlLocations:PropTypes.array,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func,
    onChangeLocation: PropTypes.func,
    onChangeTrigger: PropTypes.func,
    onChangeOperations: PropTypes.func,
    onSaveDemandSet: PropTypes.func
}

/**
 * 制御行
 */
const ControlPatternRow = ({ locations, controls, controlOperations, maxCount, isReadOnly, onChange: handleChanged }) => {
    return (
        <InputFormSingleRow label="実行する動作" isRequired={false}>
            <ControlOperationsEditForm 
                isReadOnly={isReadOnly}
                locations={locations}
                controls={controls}
                controlOperations={controlOperations}
                maxCount={maxCount}
                onChange={handleChanged}
            />
        </InputFormSingleRow>
    );
}

/**
* 単一カラム入力フォーム行
*/
const InputFormSingleRow = ({ label, isRequired, children}) => {
    return (
        <InputForm.Row>
            <InputForm.Col
                label={label}
                columnCount={1}
                isRequired={isRequired}
            >
                {children}
            </InputForm.Col>
        </InputForm.Row>
    );
}