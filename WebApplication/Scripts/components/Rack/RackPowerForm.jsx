/**
 * @license Copyright 2017 DENSO
 * 
 * RackPowerForm Reactコンポーネント。
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Row, Col } from 'react-bootstrap';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextareaForm from 'Common/Form/TextareaForm';
import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';

import BreakerSelectModal from 'Assets/Modal/BreakerSelectModal';

import OutletPanel from './OutletPanel';

import { validateText, validateSelect, validateInteger, validateReal, validateTextArea, VALIDATE_STATE } from 'inputCheck';
import { convertNumber } from 'numberUtility';
import { MAXLENGTH_RACKPS, hasBrekerPoints } from 'assetUtility';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

/**
 * ラック電源情報（1つ分）の入力フォームコンポーネントを定義します。
 * 項目を変更すると、ラック電源の全てのデータがonChange()で返ります
 * @param {string} rackId ラックID
 * @param {object} power ラック電源
 * @param {array} connectors 電源コネクタリスト
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 権限レベル
 * @param {object} lookUp 検索条件指定用のルックアップ
 * @param {function} onChange ラック電源情報が変更されたときに呼び出します。ラック電源情報をすべて返却する。
 */
export default class RackPowerForm extends Component {
    
    /**
     * 検証結果（初期値）
     */
    static get INITIAL_VALIDATE() {
        return {
            name: { state: null }, 
            inletType: { state: null }, 
            outletCount: { state: null }, 
            ratedCurrent: { state: null }, 
            ratedVoltage: { state: null }, 
            breaker: { state: null },
            errorThreshold: { state: null }, 
            alarmThreshold : { state: null }, 
            outlets: { state: null },
            comment: { state: null }
        }
    } 

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { isReadOnly, power } = props;
        this.state = {
            showModal: false,
            validate: isReadOnly ? Object.assign({}, RackPowerForm.INITIAL_VALIDATE) : this.initalValidate(power)
        };
    }

    /********************************************
     * Reactライフサイクルメソッド
     ********************************************/

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { rackId, power, isReadOnly, isEditableComment } = nextProps;
        if (rackId != this.props.rackId || (isReadOnly && isReadOnly != this.props.isReadOnly)) {
            this.setState({
                validate: Object.assign({}, RackPowerForm.INITIAL_VALIDATE)
            });
        } else if (!isReadOnly && 
                   (isReadOnly != this.props.isReadOnly || this.isChangedPower(this.props.power, power))) {
            this.setState({
                validate: this.initalValidate(power)
            });
        }
    }

    /**
     * 電源を変更したかどうか
     * @param {object} prvPower 変更前の電源情報
     * @param {object} nextPower 変更後の電源情報
     */
    isChangedPower(prvPower, nextPower){
        const prvPsNo = prvPower ? prvPower.psNo : null;
        const nextPsNo = nextPower ? nextPower.psNo : null;
        return prvPsNo !== nextPsNo;
    }

    /**
     * render
     */
    render() {
        const { power, isReadOnly, connectors, lookUp, level } = this.props;
        const { psNo, name, inletType, outletCount, ratedCurrent, ratedVoltage, comment, useBreakerThreshold, errorThreshold, alarmThreshold , breaker, outlets } = (power ? power : {});
        const { showModal, validate } = this.state;
        
        const connectorSelectList = connectors ? connectors.map((item) => ({ name: item.connectorName, value: item.connectorNo })) : [];
        const breakerName = breaker ? (breaker.egroup ? breaker.egroup.egroupName : '' ) + ' > ' + breaker.breakerName : null;
        
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);
        const readOnly_Comment = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.normal);

        return (
            <div>
                <InputForm.Row>
                    <InputForm.Col label="電源名称" columnCount={1} isRequired={!isReadOnly} >
                        <TextForm value={name} 
                                  onChange={(value) => this.changeValue(value, this.validateName(value), 'name')} 
                                  isReadOnly={readOnly} 
                                  validationState={validate.name.state}
                                  helpText={validate.name.helpText}
                                  placeholder={isReadOnly&&'(なし)'}
                                  maxlength={MAXLENGTH_RACKPS.name}
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="インレット形状" columnCount={2} isRequired={!isReadOnly} >
                        <SelectForm value={inletType&&inletType.connectorNo} 
                                    options={connectorSelectList} 
                                    validationState={validate.inletType.state}
                                    helpText={validate.inletType.helpText}
                                    onChange={(value) => this.inletTypeChanged(value)} 
                                    isReadOnly={readOnly} 
                        />
                    </InputForm.Col>
                    <InputForm.Col label="アウトレット数" columnCount={2} isRequired={!isReadOnly} >
                        <TextForm value={outletCount} 
                                  onChange={(value) => this.changeValue(value, this.validateOutletCount(value, outlets), 'outletCount')} 
                                  isReadOnly={readOnly} 
                                  validationState={validate.outletCount.state}
                                  helpText={validate.outletCount.helpText}
                                  placeholder={isReadOnly&&'(なし)'} 
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="定格電流値" columnCount={2} isRequired={!isReadOnly} >
                        <TextForm value={ratedCurrent} 
                                  unit="A" 
                                  onChange={(value) => this.changeValue(value, this.validateRatedCurrent(value, breaker), 'ratedCurrent')} 
                                  isReadOnly={readOnly} 
                                  validationState={validate.ratedCurrent.state}
                                  helpText={validate.ratedCurrent.helpText}
                                  placeholder={isReadOnly&&'(なし)'} 
                        />
                    </InputForm.Col>
                    <InputForm.Col label="定格電圧値" columnCount={2} isRequired={!isReadOnly} >
                        <TextForm value={ratedVoltage} 
                                  unit="V" 
                                  onChange={(value) => this.changeValue(value, this.validateRatedVoltage(value, breaker), 'ratedVoltage')}
                                  isReadOnly={readOnly} 
                                  validationState={validate.ratedVoltage.state}
                                  helpText={validate.ratedVoltage.helpText}
                                  placeholder={isReadOnly&&'(なし)'} 
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="ブレーカー割り当て" columnCount={1} >
                        <LabelForm value={breakerName ? ('該当ブレーカ－：' + breakerName) : '(なし)' }
                                    isReadOnly={readOnly} 
                                    addonButton={ !readOnly && 
                                        [{key:1, iconId:'link', label:'選択', onClick: () => this.changeBreakerModalState()},
                                        {key:2, iconId:'unlink', label: '解除', onClick: () => this.clearBreaker()}]} 
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="閾値" columnCount={1} isRequired={!isReadOnly} >
                        <Checkbox checked={useBreakerThreshold} 
                                  onChange={() => this.useBreakerThresholdChanged()} 
                                  disabled={readOnly||!breaker||!breaker.hasPoints} 
                                  >ブレーカーの閾値を使用
                        </Checkbox>                            
                        <Row>
                            <Col sm={6}>
                                <TextForm label="上限異常" 
                                          value={errorThreshold} 
                                          unit="kVA" 
                                          validationState={!useBreakerThreshold? validate.errorThreshold.state: null}
                                          helpText={!useBreakerThreshold ? validate.errorThreshold.helpText : null}
                                          onChange={(value) => this.changeValue(value, this.validateThreshold(value, useBreakerThreshold), 'errorThreshold')} 
                                          isReadOnly={readOnly||useBreakerThreshold} 
                                          placeholder={isReadOnly&&'(なし)'} 
                                />
                            </Col>
                            <Col sm={6}>
                                <TextForm label="上限注意" 
                                          value={alarmThreshold} 
                                          unit="kVA" 
                                          validationState={!useBreakerThreshold? validate.alarmThreshold.state: null}
                                          helpText={!useBreakerThreshold ? validate.alarmThreshold.helpText : null}
                                          onChange={(value) => this.changeValue(value, this.validateThreshold(value, useBreakerThreshold), 'alarmThreshold')} 
                                          isReadOnly={readOnly||useBreakerThreshold} 
                                          placeholder={isReadOnly&&'(なし)'} 
                                />
                            </Col>
                        </Row>
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="アウトレット" columnCount={1} >
                        <OutletPanel isReadOnly={readOnly} 
                                     outlets={outlets}
                                     connectors={connectors}
                                     lookUp={lookUp}
                                     outletCount={outletCount}
                                     onChange={(outlets, isError) => this.handleOutletsChanged(outlets, isError)}
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="コメント" columnCount={1} >
                        <TextareaForm value={comment} 
                                      validationState={validate.comment.state}
                                      helpText={validate.comment.helpText}
                                      placeholder={isReadOnly&&'(なし)'} 
                                      onChange={(value) => this.changeValue(value, this.validateComment(value), 'comment')} 
                                      isReadOnly={readOnly_Comment} 
                                      maxlength={MAXLENGTH_RACKPS.comment}
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <BreakerSelectModal showModal={showModal} 
                                    lookUp={lookUp}
                                    onSelect={(breaker) => this.selectBreaker(breaker)} 
                                    onCancel={() => this.changeBreakerModalState()} />
            </div>
        );
    }
    
    /********************************************
     * イベント関数
     ********************************************/

    /**
     * インレット形状変更イベント
     * @param {*} v 変更後の値
     */
    inletTypeChanged(value){
        const { connectors } = this.props;
        let targetType = connectors.find((connector) => connector.connectorNo === convertNumber(value));
        this.changeValue(targetType, validateSelect(value), 'inletType');
    }

    /**
     * ブレーカーの閾値を使用チェックボックスの変更イベント
     */
    useBreakerThresholdChanged(){
        let power = Object.assign({}, this.props.power);
        power.useBreakerThreshold = !power.useBreakerThreshold;
        if (power.useBreakerThreshold) {
            power.alarmThreshold = null;
            power.errorThreshold = null;
        }
        this.onChange(power, this.setThresholdValidate(power.errorThreshold, power.alarmThreshold, power.useBreakerThreshold));
    }

    /**
     * ブレーカー割り当てモーダル表示ステータスを変更
     */
    changeBreakerModalState(){
        var obj =  Object.assign({}, this.state);
        obj.showModal = !obj.showModal;
        this.setState(obj);
    }

    /**
     * ブレーカーを変更する
     * @param {object} breaker 選択したブレーカー
     */
    selectBreaker(breaker){
        let power = Object.assign({}, this.props.power);
        power.breaker = {
            systemId: breaker.systemId,
            egroup: {
                systemId: breaker.egroup.systemId,
                egroupId: breaker.egroup.egroupId,
                egroupName: breaker.egroup.egroupName
            },
            breakerNo: breaker.breakerNo,
            breakerName: breaker.breakerName,
            ratedCurrent: breaker.ratedCurrent,
            ratedVoltage: breaker.ratedVoltage,
            hasPoints: hasBrekerPoints(breaker)
        };

        if (!power.breaker.hasPoints) {
            power.useBreakerThreshold = false;             //ブレーカーの閾値使用をオフにする
        }

        this.changeBreakerModalState();
        this.onChange(power, this.setBreakerValidate(power));
    }

    /**
     * ブレーカーをクリアする
     */
    clearBreaker(){
        let power = Object.assign({}, this.props.power);
        power.breaker = null;
        if (power.useBreakerThreshold) {
            power.useBreakerThreshold = false;             //ブレーカーの閾値使用をオフにする
            power.alarmThreshold = '';
            power.errorThreshold = '';
        }
        this.onChange(power, this.setBreakerValidate(power));
    }

    /**
     * 電源ポートの変更イベント
     * @param {array} outlets アウトレット情報一覧
     * @param {boolean} isError エラーかどうか
     */
    handleOutletsChanged(outlets, isError) {
        let power = Object.assign({}, this.props.power);
        power.outlets = outlets.concat();

        //入力検証
        var validate = Object.assign({}, this.state.validate);
        validate.outlets = isError ? { state: VALIDATE_STATE.error } : { state: VALIDATE_STATE.success };
        validate.outletCount = this.validateOutletCount(power.outletCount, power.outlets);
        this.setState({validate: validate});

        this.onChange(power, validate);
    }

    /********************************************
     * 入力変更用関数
     ********************************************/

    /**
     * 電源情報の値を変更する
     * @param {any} value 変更後の値
     * @param {object} targetValidate 検証結果
     * @param {string} key 変更値のオブジェクトキー
     */
    changeValue(value, targetValidate, key) {
        let power = Object.assign({}, this.props.power);
        if (power[key] && typeof power[key] === 'object') {
            power[key] = Object.assign({}, value);
        } else {
            power[key] = value;
        }

        let validate = this.setValidate(targetValidate, key);

        this.onChange(power, validate);
    }

    /**
     * 入力変更イベントを発生させる
     * @param {object} rack 変更後の電源情報
     * @param {object} validate 入力検証結果
     */
    onChange(power, validate){
        if (this.props.onChange) {
            this.props.onChange(power, this.invalid(validate));
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
     * 入力検証結果のセット
     ********************************************/

    /**
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @return { state:'', helpText:'' }　検証結果
     */
    setValidate(targetValidate, key) {        
        var validate = Object.assign({}, this.state.validate);
        validate[key] = targetValidate;
        this.setState({validate:validate});
        return validate;
    }

    /**
     * 閾値の入力検証をセットする
     * @param {number|string} errorThreshold 上限異常
     * @param {number|string} alarmThreshold 上限注意
     * @param {boolean} useBreakerThreshold ブレーカーの閾値を使用するかどうか
     * @return { state:'', helpText:'' }　検証結果
     */
    setThresholdValidate(errorThreshold, alarmThreshold, useBreakerThreshold) {
        var validate = Object.assign({}, this.state.validate);
        validate.errorThreshold = this.validateThreshold(errorThreshold, useBreakerThreshold);
        validate.alarmThreshold = this.validateThreshold(alarmThreshold, useBreakerThreshold);
        this.setState({validate:validate});
        return validate;
    }

    /**
     * ブレーカー変更時の入力検証をセットする
     * @param {object} power 更新後のラック電源情報
     * @return { state:'', helpText:'' }　検証結果
     */
    setBreakerValidate(power){
        const { errorThreshold, alarmThreshold, useBreakerThreshold, breaker, ratedCurrent, ratedVoltage } = power;
        var validate = Object.assign({}, this.state.validate);
        validate.errorThreshold = this.validateThreshold(errorThreshold, useBreakerThreshold);
        validate.alarmThreshold = this.validateThreshold(alarmThreshold, useBreakerThreshold);
        validate.ratedCurrent = this.validateRatedCurrent(ratedCurrent, breaker);
        validate.ratedVoltage = this.validateRatedVoltage(ratedVoltage, breaker);
        this.setState({validate:validate});
        return validate;
    }

    /********************************************
     * 入力検証
     ********************************************/

    /**
     * 電源名称の入力検証を行う
     * @param {string} name 対象の値
     * @return { state:'', helpText:'' }　検証結果
     */
    validateName(name) {
        return validateText(name, MAXLENGTH_RACKPS.name);
    }

    /**
     * アウトレット数の入力検証を行う
     * @param {string|number} outletCount 対象の値
     * @return { state:'', helpText:'' }　検証結果
     */
    validateOutletCount(outletCount, outlets) {
        var validate = validateInteger(outletCount, 0, 100);

        //登録中のアウトレット数エラー
        if (validate.state === VALIDATE_STATE.success && 
            outlets && outlets.length > convertNumber(outletCount)){
            validate = {
                state: VALIDATE_STATE.error,
                helpText: '登録中のアウトレット数よりも小さくなっています。登録中のアウトレット数以上にするか、アウトレットを減らしてください。'
            };
        }

        return validate;
    }

    /**
     * 定格電流の入力検証を行う
     * @param {number|string} ratedCurrent 対象の値
     * @param {object} breaker ブレーカー
     * @return { state:'', helpText:'' }　検証結果
     */
    validateRatedCurrent(ratedCurrent, breaker) {
        var validate = validateInteger(ratedCurrent, 0, 10000);

        //ブレーカーの定格電流と一致しているか確認
        if (validate.state === VALIDATE_STATE.success && 
            breaker && 
            breaker.ratedCurrent !== null && 
            breaker.ratedCurrent !== undefined &&
            breaker.ratedCurrent < convertNumber(ratedCurrent)){
            validate = {
                state: VALIDATE_STATE.error,
                helpText: 'ブレーカーの定格電流を超えています。「' + breaker.ratedCurrent + 'A」以下に設定してください。'
            };
        }

        return validate;
    }

    /**
     * 定格電圧の入力検証を行う
     * @param {number|string} ratedVoltage 対象の値
     * @param {object} breaker ブレーカー
     * @return { state:'', helpText:'' }　検証結果
     */
    validateRatedVoltage(ratedVoltage, breaker) {
        var validate = validateInteger(ratedVoltage, 0, 10000);

        //ブレーカーの定格電圧と一致しているか確認
        if (validate.state === VALIDATE_STATE.success && 
            breaker && 
            breaker.ratedVoltage !== null &&
            breaker.ratedVoltage !== undefined &&
            breaker.ratedVoltage !== convertNumber(ratedVoltage)){
            validate = {
                state: VALIDATE_STATE.error,
                helpText: 'ブレーカーの定格電圧と一致していません。\nブレーカーの定格電圧は「' + breaker.ratedVoltage + 'V」です'
            };
        }

        return validate;
    }

    /**
     * 閾値の入力検証を行う
     * @param {number|string} threshold 閾値
     * @param {boolean} useBreakerThreshold ブレーカーの閾値を使用するかどうか
     * @return { state:'', helpText:'' }　検証結果
     */
    validateThreshold(threshold, useBreakerThreshold) {
        var validate = { state: VALIDATE_STATE.success };
        if (!useBreakerThreshold) {
            validate = validateReal(threshold, 0, 100000, false, 3);
        }
        return validate;
    }

    /**
     * コメントの入力検証を行う
     * @param {string} comment 対象の値
     * @return { state:'', helpText:'' }　検証結果
     */
    validateComment(comment) {
        return validateTextArea(comment, MAXLENGTH_RACKPS.comment, true);
    }

    /**
     * 検証結果の初期化
     * @param {object} power 電源情報
     * @returns {object} 検証結果
     */
    initalValidate(power){
        return {
            name: this.validateName(power&&power.name), 
            inletType: validateSelect(power&&power.inletType&&power.inletType.connectorNo), 
            outletCount: this.validateOutletCount(power&&power.outletCount, power&&power.outlets), 
            ratedCurrent: this.validateRatedCurrent(power&&power.ratedCurrent, power&&power.breaker), 
            ratedVoltage: this.validateRatedVoltage(power&&power.ratedVoltage, power&&power.breaker), 
            errorThreshold: this.validateThreshold(power&&power.errorThreshold, power.useBreakerThreshold), 
            alarmThreshold: this.validateThreshold(power&&power.alarmThreshold, power.useBreakerThreshold), 
            outlets: { state: VALIDATE_STATE.success },
            comment: this.validateComment(power&&power.comment)
        };
    }

}

RackPowerForm.propTypes = {
    rackId: PropTypes.string,
    power: PropTypes.shape({        
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
        useBreakerThreshold: PropTypes.bool,
        errorThreshold: PropTypes.number,
        alarmThreshold: PropTypes.number
    }),
    connectors: PropTypes.arrayOf(PropTypes.shape({
        connectorNo: PropTypes.number.isRequired,
        connectorName: PropTypes.string.isRequired
    })),
    lookUp: PropTypes.object,
    level: PropTypes.number,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func
}