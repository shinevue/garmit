/**
 * @license Copyright 2017 DENSO
 * 
 * UnitPowerEditModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { validateText, validateSelect, validateInteger, validateReal, validateTextArea, VALIDATE_STATE, errorResult } from 'inputCheck';
import { changeNumbarFormat, convertNumber } from 'numberUtility';
import { compareAscending } from 'sortCompare';

/**
 * 電源設定モーダルコンポーネントを定義します。
 * @param {object} power ユニット電源
 * @param {array} rackPowers ラック電源リスト
 * @param {array} excludedRackPower 除外するラック電源
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {function} onApply 適用したときに呼び出す
 * @param {function} onCancel 適用をキャンセルしたときに呼び出す
 */
export default class UnitPowerEditModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            power: null,
            validate: this.initalValidate(null),
            beforePower: null
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.showModal) {
            const { power } = nextProps;
            this.setState({
                power: power && JSON.parse(JSON.stringify(power)),
                validate: this.initalValidate(power),
                beforePower: power && JSON.parse(JSON.stringify(power))
            });
        }
    }

    /**
     * render
     */
    render() {
        const { showModal, rackPowers } = this.props;
        const { power, validate } = this.state;
        const rackPower = power&&power.rackPower&&rackPowers ? rackPowers.find((item) => item.psNo === power.rackPower.psNo) : null;
        const enableOutlets = this.getEnableOutlets(rackPower);
        return (
            <Modal bsSize="large" show={showModal} backdrop="static" onHide={() => this.onCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>電源設定</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="ラック電源" columnCount={1} isRequired={true} >
                                <SelectForm value={rackPower&&rackPower.psNo} 
                                            options={rackPowers&&
                                                rackPowers.map((rackPower) => {
                                                    return { 
                                                        value: rackPower.psNo, 
                                                        name: rackPower.psNo + '：' + rackPower.name + '(' + rackPower.ratedVoltage   + 'V' + rackPower.ratedCurrent + 'A)' 
                                                    };
                                                })
                                            }
                                            validationState={validate.rackPower.state}
                                            helpText={validate.rackPower.helpText}          
                                            onChange={(value) => this.rackPowerChanged(value)}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="アウトレット数" columnCount={2} >
                                <LabelForm value={rackPower ? rackPower.outletCount + '(空き：' + this.calcEmptyOutletCount(rackPower) + ')' : '(なし)'} />
                            </InputForm.Col>
                            <InputForm.Col label="アウトレット番号" columnCount={2} isRequired={true} >
                                <SelectForm value={power&&power.outlet&&power.outlet.outletNo} 
                                            options={enableOutlets&&
                                                enableOutlets.map((outlet) => {return { value: outlet.outletNo, name: outlet.outletNo }})
                                            } 
                                            validationState={validate.outlet.state}
                                            helpText={validate.outlet.helpText}
                                            onChange={(v) => this.portNoChanged(v)}/>
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="消費電力" columnCount={2} isRequired={true} >
                                <TextForm value={power && power.power} 
                                        unit="W" 
                                        validationState={validate.power.state}
                                        helpText={validate.power.helpText}
                                        onChange={(value) => this.setStateValue(value, this.validatePower(value), 'power')} 
                                />
                            </InputForm.Col>
                            <InputForm.Col label="補正値" columnCount={2} isRequired={true} >
                                <TextForm value={power && power.useConf} 
                                        validationState={validate.useConf.state}
                                        helpText={validate.useConf.helpText} 
                                        onChange={(value) => this.setStateValue(value, this.validateUseConf(value), 'useConf')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="電力値(kVA)" columnCount={1} >
                                <LabelForm value={this.makePowerkVA(power&&power.power, power&&power.useConf)} />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" disabled={this.invalid(validate)} onClick={() => this.onApply(power)}>
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button iconId="uncheck" bsStyle="lightgray" onClick={() => this.onCancel()}>キャンセル</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    
    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ラック電源変更イベント
     * @param {string} psNo 
     */
    rackPowerChanged(psNo){
        const { rackPowers } = this.props;
        const power = rackPowers.find((item) => item.psNo ===  convertNumber(psNo));
        
        var obj = Object.assign({}, this.state);
        if (power) {
            if (obj.power.rackPower && 
                obj.power.rackPower.psNo !== power.psNo) {
                obj.power.outlet = null;
            }
            obj.power.rackPower = JSON.parse(JSON.stringify(power));
        } else {
            obj.power.rackPower = null;
            obj.power.outlet = null;
        }
        obj.validate.rackPower = this.validateRackPower(power);
        obj.validate.outlet = validateSelect(obj.power.outlet&&obj.power.outlet.outletNo);
        this.setState(obj);
    }

    /**
     * アウトレット番号変更イベント
     * @param {string|number} portNo 
     */
    portNoChanged(portNo){
        var { rackPowers } = this.props;
        var { outlets } = this.state.power.rackPower;
        if (!outlets || outlets.length < 0){
            outlets = rackPowers ? rackPowers.find((item) => item.psNo === convertNumber(this.state.power.rackPower.psNo)).outlets : [];        
        }
        const outlet = outlets.find((item) => item.outletNo === convertNumber(portNo));
        this.setStateValue(outlet, validateSelect(portNo), 'outlet');
    }

    /********************************************
     * イベント呼び出し
     ********************************************/

    /**
     * 適用イベントを呼び出す
     * @param {object} power 適用する電源
     */
    onApply(power) {
        if (this.props.onApply) {
            this.props.onApply(power);
        }
    }

    /**
     * キャンセルイベントを呼び出す
     */
    onCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
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

    /********************************************
     * stateの変更
     ********************************************/

    /**
     * 検証結果をセットする
     * @param {*} value 更新する値
     * @param {object} validate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @return { state:'', helpText:'' }　検証結果
     */
    setStateValue(value, validate, key) {        
        var obj = Object.assign({}, this.state);

        if (typeof obj.power[key] === 'object') {
            obj.power[key] = value ? JSON.parse(JSON.stringify(value)) : null;
        } else {
            obj.power[key] = value;
        }

        obj.validate[key] = validate;

        this.setState(obj);
    }

    /********************************************
     * 入力検証
     ********************************************/

    /**
     * ラック電源の入力検証を行う
     * @param {object} rackPower 対象のラック電源
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateRackPower(rackPower) {
        var validate = validateSelect(rackPower&&rackPower.psNo);
        const { excludedRackPower } = this.props;

        //ラック電源が自分自身か？
        if (validate.state === VALIDATE_STATE.success &&
            excludedRackPower && (rackPower.psNo === excludedRackPower.psNo)) {
                validate = errorResult('自分自身が選択されています。他のラック電源を選択してください。');
        }

        return validate;
    }
     
    /**
     * 消費電力の入力検証を行う
     * @param {string|number} power 対象の値
     * @returns { state:'', helpText:'' }　検証結果
     */
    validatePower(power) {
        return validateInteger(power, 0, 10000);
    }

    /**
     * 補正値の入力検証を行う
     * @param {string|number} useConf 対象の値
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateUseConf(useConf) {
        return validateReal(useConf, 0, 1, false, 5);
    }

    /**
     * 検証結果の初期化
     * @param {object} power ユニット電源情報
     * @returns {object} 検証結果
     */
    initalValidate(power){
        return {
            rackPower: this.validateRackPower(power&&power.rackPower),
            outlet: validateSelect(power&&power.outlet&&power.outlet.outletNo), 
            power: this.validatePower(power&&power.power), 
            useConf: this.validateUseConf(power&&power.useConf)
        };
    }

    /********************************************
     * その他関数
     ********************************************/
    
    /**
     * 消費電力(kVA)を計算して作成する
     * @param {string|value} power 消費電力
     * @param {string|value} useCoef 補正値
     */
    makePowerkVA(power, useCoef){
        const { validate } = this.state;
        var powerKVA = '(Error)';
        if ((power !== null && useCoef !== null) &&
            (validate.power.state === VALIDATE_STATE.success && validate.useConf.state === VALIDATE_STATE.success)) {
            powerKVA = (convertNumber(power) * convertNumber(useCoef)  * 0.001).toFixed(3) + ' kVA';
        }
        return powerKVA;
    }
    
    /**
     * 空アウトレット数を計算する
     * @param {object} rackPower ラック電源
     * @returns {number} 空アウトレット数
     */
    calcEmptyOutletCount(rackPower) {
        const useOutlets = rackPower ? rackPower.outlets.filter((outlet) => outlet.inUse) : [];        
        return rackPower.outletCount - useOutlets.length;
    }

    /**
     * 有効なアウトレット番号リストを取得する
     * @param {object} rackPower ラック電源
     * @returns {array} 有効なアウトレット番号リスト
     */
    getEnableOutlets(rackPower){
        const { beforePower } = this.state;
        const outlets = rackPower ? rackPower.outlets : [];
        var enableOutlets = [];
        if (outlets && outlets.length>0) {
            enableOutlets = outlets.filter((outlet) => !outlet.inUse);
            if (beforePower&&beforePower.rackPower&&beforePower.rackPower.psNo === rackPower.psNo) {
                enableOutlets.push(outlets.find((outlet) => outlet.outletNo === beforePower.outlet.outletNo));
            }
            enableOutlets = enableOutlets.sort((current, next) => compareAscending(current.outletNo, next.outletNo));
        }
        return enableOutlets;
    }
}

UnitPowerEditModal.propTypes = {
    power: PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitPsNo: PropTypes.string.isRequired,
        outlet: PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
        }),
        power: PropTypes.number.isRequired,
        useConf: PropTypes.number.isRequired,
        rackPower: PropTypes.shape({
            psNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    }).isRequired,
    rackPowers: PropTypes.arrayOf(PropTypes.shape({        
        rackId: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        name: PropTypes.string,
        inletType: PropTypes.shape({
            connectorNo: PropTypes.number.isRequired,
            connectorName: PropTypes.string.isRequired
        }),
        outletCount: PropTypes.number,
        outlets: PropTypes.arrayOf(PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
            outletType: PropTypes.shape({
                connectorNo: PropTypes.number.isRequired,
                connectorName: PropTypes.string.isRequired
            }),
            point: PropTypes.object
        })),
        comment: PropTypes.string,
        ratedCurrent: PropTypes.number,
        ratedVoltage: PropTypes.number,
        breaker: PropTypes.shape({
            BreakerNo: PropTypes.number.isRequired,
            BreakerName: PropTypes.string.isRequired,
            RatedCurrent: PropTypes.number.isRequired,
            RatedVoltage: PropTypes.number.isRequired
        }),
        useRackPowerThreshold: PropTypes.bool,
        errorThreshold: PropTypes.number,
        alarmThreshold: PropTypes.number
    })),
    excludedRackPower: PropTypes.shape({        
        rackId: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        name: PropTypes.string,
        inletType: PropTypes.shape({
            connectorNo: PropTypes.number.isRequired,
            connectorName: PropTypes.string.isRequired
        }),
        outletCount: PropTypes.number,
        outlets: PropTypes.arrayOf(PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
            outletType: PropTypes.shape({
                connectorNo: PropTypes.number.isRequired,
                connectorName: PropTypes.string.isRequired
            }),
            point: PropTypes.object
        })),
        comment: PropTypes.string,
        ratedCurrent: PropTypes.number,
        ratedVoltage: PropTypes.number,
        breaker: PropTypes.shape({
            BreakerNo: PropTypes.number.isRequired,
            BreakerName: PropTypes.string.isRequired,
            RatedCurrent: PropTypes.number.isRequired,
            RatedVoltage: PropTypes.number.isRequired
        }),
        useRackPowerThreshold: PropTypes.bool,
        errorThreshold: PropTypes.number,
        alarmThreshold: PropTypes.number
    }),
    showModal:PropTypes.bool,
    onApply: PropTypes.func,
    onCancel: PropTypes.func
}