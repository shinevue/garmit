/**
 * @license Copyright 2021 DENSO
 * 
 * ICTerminalEditBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelFrom from 'Common/Form/LabelForm';
import LocationForm from 'Assets/Condition/LocationForm';
import TextareaForm from 'Common/Form/TextareaForm';

import { validateTermName, validateMemo, validateAllowLocations } from 'icTerminalUtility';
import { MAXLENGTH_TERM_NAME, MAXLENGTH_MEMO } from 'icTerminalUtility';
import { KEY_ICTERMINAL_TERM_NAME, KEY_ICTERMINAL_MEMO, KEY_ICTERMINAL_ALLOW_LOCATIONS } from 'icTerminalUtility';

import { VALIDATE_STATE } from 'inputCheck';

/**
 * ラック施開錠端末編集ボックスコンポート
 * @param {object} icTerminalEntity ラック施開錠端末基本情報
 * @param {array} allowLocations 操作可能ラック一覧
 * @param {array} locations ロケーション一覧（ロケーションツリー用）
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onChange ラック施開錠端末情報の変更時に呼び出す
 */
export default class ICTerminalEditBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { icTerminalEntity, allowLocations, isReadOnly } = props;
        this.state = {
            validate: {
                termName: !isReadOnly ? validateTermName(icTerminalEntity.termName) : { state: null, helpText: null },
                memo: !isReadOnly ? validateMemo(icTerminalEntity.memo) : { state: null, helpText: null },
                allowLocations: !isReadOnly ? validateAllowLocations(allowLocations) : { state: null, helpText: null }
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeNo = this.props.icTerminalEntity && this.props.icTerminalEntity.termNo;
        const nextICTerminalEntity = nextProps.icTerminalEntity;
        const nextAllowLocations = nextProps.allowLocations;
        const nextReadOnly = nextProps.isReadOnly;
        const nextNo = nextICTerminalEntity && nextICTerminalEntity.termNo;
        if ((!beforeNo && nextNo) || (beforeNo !== nextNo)){
            this.setState({
                validate: {
                    termName: nextICTerminalEntity && !nextReadOnly ? validateTermName(nextICTerminalEntity.termName) : { state: null, helpText: null },
                    memo: nextICTerminalEntity && !nextReadOnly ? validateMemo(nextICTerminalEntity.memo) : { state: null, helpText: null },
                    allowLocations: nextAllowLocations && !nextReadOnly ? validateAllowLocations(nextAllowLocations) : { state: null, helpText: null }
                }
            });
        }
    }

    /**
     * render
     */
    render() {
        const { icTerminalEntity, allowLocations, locations, isLoading, isReadOnly } = this.props;
        if (icTerminalEntity) {
            var { termNo, termName, memo } = icTerminalEntity;
        }
        const { validate } = this.state;
        return (
            <GarmitBox title="ラック施開錠端末情報" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="端末名称" columnCount={2} isRequired >
                            <TextForm 
                                value={termName} 
                                isReadOnly={isReadOnly}
                                validationState={validate.termName.state}
                                helpText={validate.termName.helpText}
                                onChange={(value) => this.onChange(KEY_ICTERMINAL_TERM_NAME, value, validateTermName(value))} 
                                maxlength={MAXLENGTH_TERM_NAME}
                            />
                        </InputForm.Col>
                        <InputForm.Col label='端末番号' columnCount={2} >
                            <LabelFrom value={termNo&&termNo > 0 ? termNo : ''} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="操作可能ロケーション" columnCount={1} isRequired>
                            <LocationForm
                                multiple
                                disabled={isReadOnly}
                                locationList={locations}
                                checkedLocations={allowLocations || []}
                                separateCheckMode={false}
                                onChange={(value) => this.onChange(KEY_ICTERMINAL_ALLOW_LOCATIONS, value, validateAllowLocations(value))}
                                validationState={validate.allowLocations.state}
                                helpText={validate.allowLocations.helpText}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="メモ" columnCount={1} >
                            <TextareaForm 
                                value={memo} 
                                validationState={validate.memo.state}
                                helpText={validate.memo.helpText}
                                isReadOnly={isReadOnly}
                                onChange={(value) => this.onChange(KEY_ICTERMINAL_MEMO, value, validateMemo(value))}
                                maxlength={MAXLENGTH_MEMO}
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
        if (this.props.onChange) {
            this.props.onChange(key, value, this.invalid(validateResult));
        }
    }

    //#endregion
    
    //#region 入力検証

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
            this.setState({validate: validate});
        }        
        return validate;
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
                validate[key].state !== VALIDATE_STATE.success && validate[key].state !== null) {
                    invalid = true;
                    break; 
            }
        }
        return invalid;
    }

    //#endregion
}