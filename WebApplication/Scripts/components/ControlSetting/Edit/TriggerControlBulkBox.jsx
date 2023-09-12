/**
 * @license Copyright 2019 DENSO
 *
 * TriggerControlBulkForm Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import GarmitBox from 'Assets/GarmitBox';

import { successResult, VALIDATE_STATE } from 'inputCheck';
import { validateBlindTime } from 'controlSettingUtility';

const KEY_BLIND_TIME = 'blindTime';

/**
 * トリガー制御一括編集編集ボックス
 * @param {array} editKeys 編集対象キ
 * @param {object} triggerControl トリガー制御情報
 * @param {function} onChange 変更時に呼び出す
 * @param {function} onChangeTrigger 実行制御一覧の変更時に呼び出す
 */
export default class TriggerControlBulkBox extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            validate: {
                blindTime: { state: null, helpText: null }
            }
        };
    }

    /**
     * render
     */
    render() {
        const { editKeys, triggerControl, isLoading } = this.props;
        const { validate } = this.state;
        const blindTime = triggerControl && triggerControl.blindTime;
        const checked = {
            blindTime: editKeys.indexOf(KEY_BLIND_TIME)>=0,
        }
        return (
            <GarmitBox title="デマンド/発電量制御設定" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col
                            label="不感時間"
                            columnCount={1}
                            checkbox
                            checked={checked[KEY_BLIND_TIME]}
                            onCheckChange={(checked) => this.changeChecked(KEY_BLIND_TIME ,checked, validateBlindTime(blindTime))}
                        >
                            <TextForm
                                isReadOnly={!checked[KEY_BLIND_TIME]}
                                value={blindTime}
                                validationState={validate.blindTime.state}
                                helpText={validate.blindTime.helpText}
                                onChange={(value) => this.changeValue(KEY_BLIND_TIME, value, validateBlindTime(value))}
                                unit="分"
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
        const validateResult = this.setValidate(validate, key, editKeys, () => {
            this.onChange(editKeys, this.props.triggerControl, validateResult);
        });
    }

    /**
     * 値を変更する
     * @param {*} key 対象キー
     * @param {*} value 変更後の値
     * @param {*} validate 検証結果
     */
    changeValue(key, value, validate) {
        const { editKeys, triggerControl } = this.props;
        let update = _.cloneDeep(triggerControl);
        _.set(update, key, value);
        const validateResult = this.setValidate(validate, key, editKeys, () => {
            this.onChange(editKeys, update, validateResult);
        });
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
     * @param {function} callback
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, targetKey, editKeys, callback) {
        var validate = Object.assign({}, this.state.validate);
        for (const key in validate) {
            if (editKeys.indexOf(key)>=0) {
                if (key === targetKey) {
                    validate[key] = targetValidate || successResult;
                }
            } else {
                validate[key] = { state: null, helpText: null };
            }
        }
        this.setState({validate:validate}, () => {
            callback&&callback()
        });
        return validate;
    }

    //#endregion


    //#region その他

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

TriggerControlBulkBox.propsTypes = {
    editKeys: PropTypes.array,
    triggerControl: PropTypes.shape({
        blindTime: PropTypes.number,
        triggerType: PropTypes.number,
        point: PropTypes.shape({
            pointNo: PropTypes.number,
            pointName: PropTypes.string
        })
    }),
    onChange: PropTypes.func,
    onChangeTrigger: PropTypes.func
}