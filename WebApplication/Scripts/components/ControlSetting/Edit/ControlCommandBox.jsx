/**
 * @license Copyright 2019 DENSO
 * 
 * ControlCommandForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import PointSelectModal from 'Assets/Modal/PointSelectModal'
import GarmitBox from 'Assets/GarmitBox'

import { convertNumber } from 'numberUtility';
import { successResult, VALIDATE_STATE } from 'inputCheck';
import { PULSE_SET, PULSE_SET_OPTIONS, OUTPUT_VALUE_OPTIONS, MAXLENGTH_COMMAND_NAME, MAXNUMBER_PALSE_WIDTH } from 'controlSettingUtility';
import { validatecontrolCmdName, validatePoint, validatePulseWidth } from 'controlSettingUtility';
import { DATAGATE_PROTOCOL_TYPE, SENDCOMMAND_SEND_MODE, SENDCOMMAND_SEND_MODE_OPTIONS, SENDCOMMAND_VALUE_TYPE_OPTIONS, EXCLUDED_SET_VALUE_TYPES } from 'constant';
import { createLocationDisplayString } from 'locationUtility';

const SNMP_PROTOCOL_TYPES = [
    DATAGATE_PROTOCOL_TYPE.snmpv1,
    DATAGATE_PROTOCOL_TYPE.snmpv2
];

/**
 * 個別制御編集フォーム
 * @param {object} controlCommand 制御コマンド情報
 * @param {function} onChange 個別制御が変更された時に呼び出す
 */
export default class ControlCommandBox extends Component {
        
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { controlCommand } = props;
        this.state = {
            validate: {
                controlCmdName: controlCommand ? validatecontrolCmdName(controlCommand.controlCmdName) : { state: null, helpText: null },
                point: controlCommand ? validatePoint(controlCommand.pointNo) : { state: null, helpText: null },
                pulseSet: controlCommand ? successResult : { state: null, helpText: null },
                pulseWidth: controlCommand ? validatePulseWidth(controlCommand.pulseWidth, controlCommand.pulseSet) : { state: null, helpText: null },
                output: controlCommand ? successResult : { state: null, helpText: null },
                sendMode: controlCommand ? successResult : { state: null, helpText: null },
                valueType: controlCommand ? successResult : { state: null, helpText: null }
            },
            showPointSelectModal: false
        };
    }

    //#region React ライフサイクルメソッド
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeId = this.props.controlCommand && this.props.controlCommand.controlCmdId;
        const nextControlCommand = nextProps.controlCommand;
        const nextId = nextControlCommand && nextControlCommand.controlCmdId;
        if ((!beforeId && nextId) || (beforeId !== nextId)){
            this.setState({
                validate: {
                    controlCmdName: nextControlCommand ? validatecontrolCmdName(nextControlCommand.controlCmdName) : { state: null, helpText: null },
                    point: nextControlCommand ? validatePoint(nextControlCommand.pointNo) : { state: null, helpText: null },
                    pulseSet: nextControlCommand ? successResult : { state: null, helpText: null },
                    pulseWidth: nextControlCommand ? validatePulseWidth(nextControlCommand.pulseWidth, nextControlCommand.pulseSet) : { state: null, helpText: null },
                    output: nextControlCommand ? successResult : { state: null, helpText: null },
                    sendMode: nextControlCommand ? successResult : { state: null, helpText: null },
                    valueType: nextControlCommand ? successResult : { state: null, helpText: null }
                }
            })
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { controlCommand, isLoading } = this.props;
        if (controlCommand) {
            var { controlCmdId, controlCmdName, pointName, pulseSet, sendMode, valueType, pulseWidth, output, protocolType, pointLocations } = controlCommand;
        }
        const { showPointSelectModal, validate } = this.state;
        return (
            <GarmitBox title="個別制御設定" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="制御ID" columnCount={2} >
                            <LabelForm value={controlCmdId>0?controlCmdId:''} />
                        </InputForm.Col>
                        <InputForm.Col label="名称" columnCount={2} isRequired={true} >
                            <TextForm value={controlCmdName} 
                                      validationState={validate.controlCmdName.state}
                                      helpText={validate.controlCmdName.helpText}
                                      onChange={(value) => this.onChange('controlCmdName', value, validatecontrolCmdName(value))} 
                                      maxlength={MAXLENGTH_COMMAND_NAME}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ポイント" columnCount={1} isRequired={true} >
                            <LabelForm
                                value={pointName}
                                addonButton={[
                                    {
                                        key: 'select',
                                        iconId: 'link',
                                        isCircle: true,
                                        tooltipLabel: 'ポイント選択',
                                        onClick: () => this.setState({ showPointSelectModal: true })
                                    }
                                ]}
                                helpText={validate.point.helpText}
                                validationState={validate.point.state}
                                />
                                <PointSelectModal
                                    showModal={showPointSelectModal}
                                    onSubmit={(point) => this.hanldeSelectPoint(point)}
                                    onCancel={() => this.setState({ showPointSelectModal: false })}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ロケーション" columnCount={1} childrenClassName="scroll-y-auto" >
                            {pointLocations&&pointLocations.length>0?
                                pointLocations.map((location) => 
                                    <LabelForm value={createLocationDisplayString(location)} />
                                )
                            :
                            <LabelForm value="" />
                            }
                        </InputForm.Col>
                    </InputForm.Row>
                    {protocolType&&SNMP_PROTOCOL_TYPES.indexOf(protocolType)>=0&&
                        <InputForm.Row>
                            <InputForm.Col label="送信方法" columnCount={2} isRequired={true} >
                                <SelectForm
                                    isReadOnly={false}
                                    value={sendMode}
                                    isRequired
                                    options={SENDCOMMAND_SEND_MODE_OPTIONS}
                                    onChange={(value) => this.onChange('sendMode', convertNumber(value))} 
                                    validationState={validate.sendMode.state}
                                    helpText={validate.sendMode.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="送信タイプ" columnCount={2} isRequired={true} >
                                <SelectForm
                                    isReadOnly={false}
                                    value={valueType}
                                    isRequired
                                    options={this.getValueTypeOptions(sendMode)}
                                    onChange={(value) => this.onChange('valueType', convertNumber(value))} 
                                    validationState={validate.valueType.state}
                                    helpText={validate.valueType.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    }
                    <InputForm.Row>
                        <InputForm.Col label="パルス設定" columnCount={pulseSet===PULSE_SET.oneShot?2:1} isRequired={true} >
                            <SelectForm
                                isReadOnly={false}
                                value={pulseSet}
                                isRequired
                                options={PULSE_SET_OPTIONS}
                                onChange={(value) => this.onChange('pulseSet', convertNumber(value))} 
                                validationState={validate.pulseSet.state}
                                helpText={validate.pulseSet.helpText}
                            />
                        </InputForm.Col>
                        {pulseSet===PULSE_SET.oneShot &&
                            <InputForm.Col label="パルス幅" columnCount={2} isRequired={true} >
                                <TextForm 
                                    value={pulseWidth} 
                                    onChange={(value) => this.onChange('pulseWidth', value, validatePulseWidth(value, pulseSet))} 
                                    validationState={validate.pulseWidth.state}
                                    helpText={validate.pulseWidth.helpText}
                                    unit="秒"
                                />
                            </InputForm.Col>
                        }
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="出力値" columnCount={1} isRequired={true} >
                            <SelectForm
                                value={output}
                                options={OUTPUT_VALUE_OPTIONS}
                                isRequired
                                onChange={(value) => this.onChange('output', convertNumber(value))} 
                                validationState={validate.output.state}
                                helpText={validate.output.helpText}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                </InputForm>
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
        var validateResult = this.setValidate(validate, key);
        if (key === 'pulseSet' && this.props.controlCommand.pulseSet !== value) {
            validateResult = this.setValidate(successResult, 'pulseWidth', validateResult);
        }

        if (this.props.onChange) {
            this.props.onChange(key, value, this.invalid(validateResult));
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
     * ポイント選択イベント
     * @param {*} point ポイント情報
     */
    hanldeSelectPoint(point) {
        this.setState({ showPointSelectModal: false }, () => {
            this.onChange('point', point, validatePoint(point&&point.pointNo))
        });
    }

    /**
     * 送信タイプ選択肢取得
     * @param {number} sendMode 送信方法
     */
    getValueTypeOptions(sendMode) {
        return SENDCOMMAND_VALUE_TYPE_OPTIONS.filter((type) => {
            return !(sendMode === SENDCOMMAND_SEND_MODE.set && EXCLUDED_SET_VALUE_TYPES.indexOf(type.value) >= 0)
        });
    }
    
    //#endregion
}

ControlCommandBox.propsTypes = {
    controlCommand: PropTypes.shape({
        controlCmdId: PropTypes.number,
        controlCmdName: PropTypes.string,
        pointNo: PropTypes.number,
        pointName: PropTypes.string,
        pointLocations: PropTypes.locations,
        pulseSet: PropTypes.number,
        pulseWidth: PropTypes.number,
        output: PropTypes.number
    }),
    onChange: PropTypes.func
}