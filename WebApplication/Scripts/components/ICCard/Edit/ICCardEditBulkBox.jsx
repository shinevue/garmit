/**
 * @license Copyright 2021 DENSO
 * 
 * ICCardEditBulkBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import GarmitBox from 'Assets/GarmitBox';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import { validateCardName, validateValidStartDate, validateValidEndtDate } from 'iccardUtility';
import { MAXLENGTH_CARD_NAME } from 'iccardUtility';
import { VALID_DATE_FORMAT } from 'iccardUtility';
import { KEY_ICCARD_CARD_NAME,  KEY_ICCARD_VALID_DATE, KEY_ICCARD_IS_INVALID } from 'iccardUtility';
import { successResult, VALIDATE_STATE } from 'inputCheck';


/**
 * ICカード編集ボックス（一括）
 * @param {array} editKeys 編集対象キー
 * @param {object} icCardEntity ICカード基本情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange 変更時に呼び出す 
 */
export default class ICCardEditBulkBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            validate: {
                cardName: { state: null, helpText: null },
                validStartDate: { state: null, helpText: null },
                validEndDate: { state: null, helpText: null },
                isInvalid: { state: null, helpText: null }
            }
        };
    }

    /**
     * render
     */
    render() {
        const { editKeys, icCardEntity, isLoading } = this.props;
        if (icCardEntity) {
            var { cardName, validStartDate, validEndDate, isInvalid } = icCardEntity;
        }
        const { validate } = this.state;
        var checked = {
            cardName: editKeys.indexOf(KEY_ICCARD_CARD_NAME)>=0,
            validDate: editKeys.indexOf(KEY_ICCARD_VALID_DATE)>=0,
            isInvalid: editKeys.indexOf(KEY_ICCARD_IS_INVALID)>=0
        }
        return (
            <GarmitBox title="ICカード情報" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col 
                            label="カード名称" 
                            columnCount={1}
                            checkbox
                            checked={checked[KEY_ICCARD_CARD_NAME]}
                            onCheckChange={(checked) => this.changeChecked(KEY_ICCARD_CARD_NAME, checked, validateCardName(cardName))}
                        >
                            <TextForm 
                                value={cardName} 
                                isReadOnly={!checked[KEY_ICCARD_CARD_NAME]}
                                validationState={validate.cardName.state}
                                helpText={validate.cardName.helpText}
                                onChange={(value) => this.changeValue(KEY_ICCARD_CARD_NAME, value, validateCardName(value))} 
                                maxlength={MAXLENGTH_CARD_NAME}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col 
                            label="有効期間" 
                            columnCount={1} 
                            checkbox 
                            checked={checked[KEY_ICCARD_VALID_DATE]}
                            onCheckChange={(checked) => this.changeCheckedValidDate(checked)}
                        >
                            <DateTimeSpanForm
                                isReadOnly={!checked[KEY_ICCARD_VALID_DATE]}
                                timePicker={true}
                                format={VALID_DATE_FORMAT}
                                from={validStartDate}
                                validationFrom={validate.validStartDate}
                                to={validEndDate}
                                validationTo={validate.validEndDate}
                                onChange={(start, end) => this.onChangeValidDate(start, end)}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col 
                            label="有効にする" 
                            columnCount={1} 
                            checkbox 
                            checked={checked[KEY_ICCARD_IS_INVALID]}
                            onCheckChange={(checked) => this.changeChecked(KEY_ICCARD_IS_INVALID, checked, successResult)}
                        >
                            <CheckboxSwitch text={!isInvalid?'ON':'OFF'} 
                                            checked={!isInvalid}
                                            disabled={!checked[KEY_ICCARD_IS_INVALID]}
                                            onChange={(checked) => this.changeValue(KEY_ICCARD_IS_INVALID, !checked, successResult)} 
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
        this.onChange(editKeys, this.props.icCardEntity, validateResult);
    }
    
    /**
     * 有効期間のチェック状態を変更する
     * @param {boolean} checked チェック状態
     */
    changeCheckedValidDate(checked) {
        const editKeys = this.changeEditKeys(KEY_ICCARD_VALID_DATE, checked, this.props.editKeys); 
        const validateResult = this.setValidateValidDate(this.props.icCardEntity.validStartDate, this.props.icCardEntity.validEndDate, editKeys);
        this.onChange(editKeys, this.props.icCardEntity, validateResult);
    }

    /**
     * 値を変更する
     * @param {string} key 対象キー
     * @param {string} value 変更後の値
     * @param {object} validate 検証結果
     */
    changeValue(key, value, validate) {
        const { editKeys, icCardEntity } = this.props;
        let update = _.cloneDeep(icCardEntity);
        _.set(update, key, value);
        const validateResult = this.setValidate(validate, key, editKeys);
        this.onChange(editKeys, update, validateResult);
    }

    /**
     * 有効期間を変更する
     * @param {any} start 開始日時
     * @param {any} end 終了日時
     */
     onChangeValidDate(start, end) {
        const { editKeys, icCardEntity } = this.props;
        let update = _.cloneDeep(icCardEntity);
        update.validStartDate = start;
        update.validEndDate = end;
        const validateResult = this.setValidateValidDate(start, end, editKeys);
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
            if ((validate.hasOwnProperty(key) && keys.indexOf(key)>=0 ||                 //チェックされているもののみに絞り込む
                ((key === 'validStartDate' || key === 'validEndDate') && keys.indexOf(KEY_ICCARD_VALID_DATE)>=0))
                && validate[key].state !== VALIDATE_STATE.success) {
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
            } else if (!((key === 'validStartDate' || key === 'validEndDate') && editKeys.indexOf(KEY_ICCARD_VALID_DATE)>=0)) {
                validate[key] = { state: null, helpText: null };        
            }
        }
        this.setState({validate:validate});
        return validate;
    }

    /**
     * 有効期間の検証結果を取得する
     * @param {any} start 開始日時
     * @param {any} end 終了日時
     * @param {array} editKeys　編集対象キーリスト
     * @param {object} beforeValidate 変更前の検証結果（指定がない時はstateから変更）
     * @returns 
     */
    setValidateValidDate(start, end, editKeys, beforeValidate) {
        var validate = beforeValidate ? Object.assign({}, beforeValidate) : Object.assign({}, this.state.validate);
        const checked = editKeys.indexOf(KEY_ICCARD_VALID_DATE)>=0;
        validate.validStartDate = checked ? validateValidStartDate(start) : { state: null, helpText: null };
        validate.validEndDate = checked ? validateValidEndtDate(start, end) : { state: null, helpText: null };
        this.setState({validate: validate});
        return validate;
    }

    //#endregion
}