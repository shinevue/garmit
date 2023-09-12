/**
 * @license Copyright 2020 DENSO
 * 
 * ProjectBulkBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import GarmitBox from 'Assets/GarmitBox';

import { successResult, VALIDATE_STATE } from 'inputCheck';
import { MAXLENGTH_USER_NAME, MAXLENGTH_CHARGE_NAME } from 'projectUtility';
import { validateUserName, validateChargeName } from 'projectUtility';


const KEY_USER_NAME = 'userName';
const KEY_CHARGE_NAME = 'chargeName';

/**
 * 案件一括編集ボックス
 * @param {array} editKeys 編集対象キー
 * @param {object} project 案件概要情報
 * @param {function} onChange 変更時に呼び出す
 */
export default class ProjectBulkBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            validate: {
                userName: { state: null, helpText: null },
                chargeName: { state: null, helpText: null }
            }
        };
    }

    /**
     * render
     */
    render() {
        const { editKeys, project, isLoading } = this.props
        if (project) {
            var { userName, chargeName } = project;
        }
        const { validate } = this.state;
        var checked = {
            userName: editKeys.indexOf(KEY_USER_NAME)>=0,
            chargeName: editKeys.indexOf(KEY_CHARGE_NAME)>=0,
        }

        return (
            <GarmitBox title="案件概要" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col 
                            label="ユーザー名" 
                            columnCount={2}
                            checkbox
                            checked={checked[KEY_USER_NAME]}
                            onCheckChange={(checked) => this.changeChecked(KEY_USER_NAME, checked, validateUserName(userName))}
                        >
                            <TextForm 
                                value={userName} 
                                isReadOnly={!checked[KEY_USER_NAME]}
                                validationState={validate.userName.state}
                                helpText={validate.userName.helpText}
                                onChange={(value) => this.changeValue(KEY_USER_NAME, value, validateUserName(value))} 
                                maxlength={MAXLENGTH_USER_NAME}
                            />
                        </InputForm.Col>
                        <InputForm.Col 
                            label="担当者" 
                            columnCount={2} 
                            checkbox
                            checked={checked[KEY_CHARGE_NAME]}
                            onCheckChange={(checked) => this.changeChecked(KEY_CHARGE_NAME, checked, validateChargeName(chargeName))}
                        >
                            <TextForm 
                                value={chargeName} 
                                isReadOnly={!checked[KEY_CHARGE_NAME]}
                                validationState={validate.chargeName.state}
                                helpText={validate.chargeName.helpText}
                                onChange={(value) => this.changeValue(KEY_CHARGE_NAME, value, validateChargeName(value))}                                 
                                maxlength={MAXLENGTH_CHARGE_NAME}
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
     * @param {string} key 対象キー
     * @param {boolean} checked チェック状態
     * @param {object} validate 検証結果
     */
    changeChecked(key, checked, validate) {
        const editKeys = this.changeEditKeys(key, checked, this.props.editKeys);        
        const validateResult = this.setValidate(validate, key, editKeys);
        this.onChange(editKeys, this.props.project, validateResult);
    }

    /**
     * 値を変更する
     * @param {string} key 対象キー
     * @param {string} value 変更後の値
     * @param {object} validate 検証結果
     */
    changeValue(key, value, validate) {
        const { editKeys, project } = this.props;
        let update = _.cloneDeep(project);
        _.set(update, key, value);
        const validateResult = this.setValidate(validate, key, editKeys);
        this.onChange(editKeys, update, validateResult);
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
}

ProjectBulkBox.propsTypes = {
    editKeys: PropTypes.array,
    project: PropTypes.shape({
        userName: PropTypes.string,
        chargeName: PropTypes.string
    }),
    onChange: PropTypes.func
}