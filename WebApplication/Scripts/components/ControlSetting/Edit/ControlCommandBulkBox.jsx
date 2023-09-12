/**
 * @license Copyright 2019 DENSO
 * 
 * ControlCommandBulkForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import GarmitBox from 'Assets/GarmitBox'

import { convertNumber } from 'numberUtility';
import { successResult, VALIDATE_STATE } from 'inputCheck';
import { PULSE_SET, PULSE_SET_OPTIONS, OUTPUT_VALUE_OPTIONS } from 'controlSettingUtility';
import { validatePulseWidth } from 'controlSettingUtility';

const KEY_PULSE_SET = 'pulseSet';
const KEY_PULSE_WIDTH = 'pulseWidth';
const KEY_OUTPUT = 'output'

/**
 * 制御コマンド一括編集フォーム
 * @param {array} editKeys 編集対象キー
 * @param {object} controlCommand 制御コマンド情報
 * @param {function} onChange 変更時に呼び出す
 */
export default class ControlCommandBulkBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            validate: { 
                pulseSet: { state: null, helpText: null },
                pulseWidth: { state: null, helpText: null },
                output: { state: null, helpText: null }
            }
        };
    }
    
    /**
     * render
     */
    render() {
        const { editKeys, controlCommand, isLoading } = this.props
        if (controlCommand) {
            var { pulseSet, pulseWidth, output } = controlCommand;
        }
        const { validate } = this.state;
        var checked = {
            pulseSet: editKeys.indexOf(KEY_PULSE_SET)>=0,
            pulseWidth: editKeys.indexOf(KEY_PULSE_WIDTH)>=0,
            output: editKeys.indexOf(KEY_OUTPUT)>=0
        }
        const isRequiredPulseWidth = this.isRequiredPulseWidth(checked[KEY_PULSE_SET], pulseSet);
        const isDisplayPulseWidth = this.isDisplayPulseWidth(checked[KEY_PULSE_SET], pulseSet);

        return (
            <GarmitBox title="個別制御設定" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col 
                            label="パルス設定" 
                            columnCount={isDisplayPulseWidth?2:1} 
                            checkbox 
                            checked={checked[KEY_PULSE_SET]}
                            onCheckChange={(checked) => this.changeCheckedPulseSet(checked)}
                        >
                            <SelectForm
                                isReadOnly={!checked[KEY_PULSE_SET]}
                                value={pulseSet}
                                isRequired
                                options={PULSE_SET_OPTIONS}
                                onChange={(value) => this.changePulseSet(convertNumber(value))} 
                                validationState={validate.pulseSet.state}
                                helpText={validate.pulseSet.helpText}
                            />
                        </InputForm.Col>
                        {isDisplayPulseWidth&&
                            <InputForm.Col 
                                label="パルス幅" 
                                columnCount={2} 
                                isRequired={isRequiredPulseWidth}
                                checkbox={!isRequiredPulseWidth}
                                checked={checked[KEY_PULSE_WIDTH]}
                                onCheckChange={(checked) => this.changeChecked(KEY_PULSE_WIDTH, checked, validatePulseWidth(pulseWidth, pulseSet))}
                            >
                                <TextForm 
                                    isReadOnly={!checked[KEY_PULSE_WIDTH]}
                                    value={pulseWidth} 
                                    onChange={(value) => this.changeValue(KEY_PULSE_WIDTH, value, validatePulseWidth(value, pulseSet))} 
                                    validationState={validate.pulseWidth.state}
                                    helpText={validate.pulseWidth.helpText}
                                    unit="秒"
                                />
                            </InputForm.Col>
                        }
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col 
                            label="出力値" 
                            columnCount={1} 
                            checkbox 
                            checked={checked[KEY_OUTPUT]}
                            onCheckChange={(checked) => this.changeChecked(KEY_OUTPUT, checked)}
                        >
                            <SelectForm
                                isReadOnly={!checked[KEY_OUTPUT]}
                                value={output}
                                options={OUTPUT_VALUE_OPTIONS}
                                isRequired
                                onChange={(value) => this.changeValue(KEY_OUTPUT, convertNumber(value))} 
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
     * チェック状態を変更する
     * @param {*} key 対象キー
     * @param {*} checked チェック状態
     * @param {*} validate 検証結果
     */
    changeChecked(key, checked, validate) {
        const editKeys = this.changeEditKeys(key, checked, this.props.editKeys);        
        const validateResult = this.setValidate(validate, key, editKeys);
        this.onChange(editKeys, this.props.controlCommand, validateResult);
    }

    /**
     * 値を変更する
     * @param {*} key 対象キー
     * @param {*} value 変更後の値
     * @param {*} validate 検証結果
     */
    changeValue(key, value, validate) {
        const { editKeys, controlCommand } = this.props;
        let update = _.cloneDeep(controlCommand);
        _.set(update, key, value);
        const validateResult = this.setValidate(validate, key, editKeys);
        this.onChange(editKeys, update, validateResult);
    }

    /**
     * パルス設定のチェック状態変更
     * @param {*} checked チェック状態
     */
    changeCheckedPulseSet(checked) {
        const { editKeys, controlCommand } = this.props;
        const pulseWidthChecked = this.changePulseWidthCheckState(editKeys.indexOf(KEY_PULSE_WIDTH)>=0, checked, controlCommand.pulseSet);
        
        let keys = this.changeEditKeys(KEY_PULSE_SET, checked, editKeys);    
        keys = this.changeEditKeys(KEY_PULSE_WIDTH, pulseWidthChecked, keys);

        let validateResult = this.setValidate(null, KEY_PULSE_SET, keys);
        validateResult = this.setValidate(validatePulseWidth(controlCommand.pulseWidth), KEY_PULSE_WIDTH, keys, validateResult);
        this.onChange(keys, this.props.controlCommand, validateResult);
    }

    /**
     * パルス設定の値変更
     * @param {*} value 変更後の値
     */
    changePulseSet(value) {
        const { editKeys, controlCommand } = this.props;
        let update = _.cloneDeep(controlCommand);
        _.set(update, KEY_PULSE_SET, value);

        const pulseWidthChecked = this.changePulseWidthCheckState(editKeys.indexOf(KEY_PULSE_WIDTH)>=0, editKeys.indexOf(KEY_PULSE_SET)>=0, value);
        const keys = this.changeEditKeys(KEY_PULSE_WIDTH, pulseWidthChecked, editKeys);
        
        const validateResult = this.setValidate(validatePulseWidth(controlCommand.pulseWidth, value), KEY_PULSE_WIDTH, keys);
        this.onChange(keys, update, validateResult);
    }

    /**
     * 変更イベント発生
     * @param {*} keys 変更対象キー
     * @param {*} value 変更値
     * @param {object} validate 入力検証結果
     */
    onChange(keys, value, validate) {
        if (this.props.onChange) {
            this.props.onChange(keys, value, this.invalid(validate, keys));
        }
    }
    
    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate, keys) {
        if (keys.length === 0) {
            return true;
        }

        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) && 
                keys.indexOf(key)>=0 &&                 //チェックされているもののみに絞り込む
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
     * 検証結果を取得する
     * @param {object} targetValidate 更新する検証結果
     * @param {string} targetKey オブジェクトのキー
     * @param {array} editKeys　編集対象キーリスト
     * @param {object} beforeValidate 変更前の検証結果（指定がない時はstateから変更）
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, targetKey, editKeys, beforeValidate) {
        var validate = beforeValidate ? Object.assign({}, beforeValidate) : Object.assign({}, this.state.validate);
        for (const key in validate) {
            if (editKeys.indexOf(key)>=0) {
                if (key === targetKey) {
                    validate[key] = targetValidate || successResult;
                }
            } else {
                validate[key] = { state: null, helpText: null };        
            }
        }
        this.setState({validate:validate});
        return validate;
    }

    //#endregion

    //#region その他

    /**
     * パルス幅が必須かどうか
     * @param {boolean} pulseSetChecked パルス設定のチェック状態
     * @param {number} pulseSet パルス設定の値
     */
    isRequiredPulseWidth(pulseSetChecked, pulseSet) {
        const { beforePulseSetList } = this.props;
        if (!beforePulseSetList.every((pulse) => pulse.pulseSet === PULSE_SET.oneShot) &&
            pulseSetChecked && pulseSet === PULSE_SET.oneShot) {
            return true;
        }
        return false;
    }

    /**
     * パルス幅を表示するかどうか
     * @param {boolean} pulseSetChecked パルス設定のチェック状態
     * @param {number} pulseSet パルス設定の値
     */
    isDisplayPulseWidth(pulseSetChecked, pulseSet) {
        const { beforePulseSetList } = this.props;
        if (pulseSetChecked) {
            return pulseSet===PULSE_SET.oneShot;
        } else {
            return beforePulseSetList.every((pulse) => pulse.pulseSet === PULSE_SET.oneShot);
        }
    }
    /**
     * パルス幅のチェック状態を取得
     * @param {boolean} checked 元のチェック状態
     * @param {boolean} pulseSetChecked パルス設定のチェック状態
     * @param {number} pulseSet パルス設定の値
     */
    changePulseWidthCheckState(checked, pulseSetChecked, pulseSet) {
        const { beforePulseSetList } = this.props;
        if (!beforePulseSetList.every((pulse) => pulse.pulseSet === PULSE_SET.oneShot)) {
            if (pulseSetChecked && pulseSet === PULSE_SET.oneShot) {
                return true; 
            } else {
                return false;
            }
        } else {
            if (pulseSetChecked && pulseSet !== PULSE_SET.oneShot) {
                return false; 
            }
        }
        return checked;
    }

    /**
     * 編集対象のキーリストを変更する
     * @param {string} key 変更対象のキー文字列
     * @param {boolean} checked チェック状態
     * @param {array} editKeys 変更前のキーリスト
     */
    changeEditKeys(key, checked, editKeys) {
        let keys = editKeys.concat();
        if (checked) {
            editKeys.indexOf(key) < 0 && keys.push(key);
        } else {
            keys = keys.filter((fkey) => fkey !== key);
        }
        return keys;
    }

    //#endregion
}

ControlCommandBulkBox.propsTypes = {
    editKeys: PropTypes.array,
    controlCommand: PropTypes.shape({
        pulseSet: PropTypes.number,
        pulseWidth: PropTypes.number,
        output: PropTypes.number
    }),
    beforePulseSetList: PropTypes.arrayOf( PropTypes.shape({
        id: PropTypes.number,
        pulseSet: PropTypes.number
    })),
    onChange: PropTypes.func
}