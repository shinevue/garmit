/**
 * @license Copyright 2017 DENSO
 * 
 * DsettingGroupForm Reactコンポーネント
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import ColorForm from 'Common/Form/ColorForm';
import ImageForm from 'Assets/Form/ImageForm';

import { validateText, validateReal, VALIDATE_STATE, successResult } from 'inputCheck';
import { MAXLENGTH_UNIT } from 'assetUtility';

/**
 * 表示設定の独自設定フォームコンポーネント
 * @param {object} frontDispData 前面の表示データ
 * @param {object} rearDispData 背面の表示データ
 * @param {array} unitImages ユニット画像一覧
 * @param {function} onChange 値が変更されたら呼び出す
 */
export default class DsettingGroupForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { frontDispData, rearDispData } = props;
        this.state = { 
            validate: {
                frontDispName: this.validateName(frontDispData&&frontDispData.dispName),
                rearDispName: this.validateName(rearDispData&&rearDispData.dispName),
                fontSize: this.validateFontSize(frontDispData&&frontDispData.fontSize)
            } 
        };
    }

    /**
     * render
     */
    render() {
        const { frontDispData, rearDispData, unitImages } = this.props;
        const { validate } = this.state;
        return (
            <InputForm>
                <InputForm.Row>
                    <InputForm.Col label="名称（前面）" columnCount={2} isRequired={true} >
                        <TextForm value={frontDispData.dispName} 
                                  validationState={validate.frontDispName.state}
                                  helpText={validate.frontDispName.helpText}
                                  onChange={(value) => this.changeValue(value, this.validateName(value), 'dispName', 'frontDispName', true)} 
                                  placeholder="名称（前面）" 
                                  maxlength={MAXLENGTH_UNIT.name}
                        />
                    </InputForm.Col>
                    <InputForm.Col label="名称（背面）" columnCount={2} isRequired={true} >
                        <TextForm value={rearDispData.dispName} 
                                  validationState={validate.rearDispName.state}
                                  helpText={validate.rearDispName.helpText}
                                  onChange={(value) => this.changeValue(value, this.validateName(value), 'dispName', 'rearDispName', false)} 
                                  placeholder="名称（背面）" 
                                  maxlength={MAXLENGTH_UNIT.name}
                        />          
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="文字色" columnCount={2} isRequired={true} >
                        <ColorForm color={frontDispData.textColor} 
                                   onChange={(value) => this.changeValueBoth(value, successResult, 'textColor')} 
                        />
                    </InputForm.Col>                            
                    <InputForm.Col label="背景色" columnCount={2} isRequired={true} >
                        <ColorForm color={frontDispData.backColor} 
                                   onChange={(value) => this.changeValueBoth(value, successResult, 'backColor')} 
                        />
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>     
                    <InputForm.Col label="フォントサイズ" columnCount={2} isRequired={true} >
                        <TextForm value={frontDispData.fontSize} 
                                  unit="px" 
                                  validationState={validate.fontSize.state}
                                  helpText={validate.fontSize.helpText}
                                  onChange={(value) => this.changeValueBoth(value, this.validateFontSize(value), 'fontSize', 'fontSize')} 
                                  placeholder="フォントサイズ" 
                        />
                    </InputForm.Col>                     
                    <InputForm.Col columnCount={2} >
                    </InputForm.Col>
                </InputForm.Row>
                <InputForm.Row>
                    <InputForm.Col label="画像（前面）" columnCount={2} >
                        <ImageForm image={frontDispData.unitImage}
                                   unitImages={unitImages}
                                   onChange={(value) => this.changeValue(value, successResult, 'unitImage', 'frontUnitImage', true)} 
                        />
                    </InputForm.Col>
                    <InputForm.Col label="画像（背面）" columnCount={2} >
                        <ImageForm image={rearDispData.unitImage}
                                   unitImages={unitImages}
                                   onChange={(value) => this.changeValue(value, successResult, 'unitImage', 'rearUnitImage', false)}  
                        />
                    </InputForm.Col>
                </InputForm.Row>
            </InputForm>
        );
    }

    /********************************************
     * 入力変更時のイベント発生
     ********************************************/
    
    /**
     * 表示設定情報を変更する
     * @param {any} value 変更後の値
     * @param {object} targetValidate 検証結果
     * @param {string} key 変更値のオブジェクトキー
     * @param {string} validateKey 検証用のキー
     * @param {boolean} isFront 前面かどうか
     */
    changeValue(value, targetValidate, key, validateKey, isFront) {
        var frontDispData = Object.assign({}, this.props.frontDispData);
        var rearDispData = Object.assign({}, this.props.rearDispData);
        var dispData = isFront ? frontDispData : rearDispData;
        if (typeof dispData[key] === 'object') {
            dispData[key] = value && Object.assign({}, value);
        } else {
            dispData[key] = value;
        }

        if (!validateKey) {
            validateKey = key;
        }
        let validate = this.setValidate(targetValidate, validateKey);

        this.onChange(frontDispData, rearDispData, validate);
    }

    /**
     * 表示設定情報（両面にわたるもの）を変更する
     * @param {any} value 変更後の値
     * @param {object} targetValidate 検証結果
     * @param {string} key 変更値のオブジェクトキー
     * @param {string} validateKey 検証用のキー
     */
    changeValueBoth(value, targetValidate, key, validateKey) {
        let frontDispData = Object.assign({}, this.props.frontDispData);
        let rearDispData = Object.assign({}, this.props.rearDispData);
        if (typeof frontDispData[key] === 'object' && typeof rearDispData[key] === 'object') {
            frontDispData[key] = value && Object.assign({}, value);
            rearDispData[key] = value && Object.assign({}, value);
        } else {
            frontDispData[key] = value;
            rearDispData[key] = value;
        }

        if (!validateKey) {
            validateKey = key;
        }
        let validate = this.setValidate(targetValidate, validateKey);

        this.onChange(frontDispData, rearDispData, validate);
    }

    /********************************************
     * 入力変更時のイベント発生
     ********************************************/

    /**
     * 入力変更イベントを発生させる
     * @param {object} frontDispData 変更後の前面表示データ
     * @param {object} rearDispData 変更後の背面表示データ
     * @param {object} validate 入力検証結果
     */
    onChange(frontDispData, rearDispData, validate){
        if (this.props.onChange) {
            this.props.onChange(frontDispData, rearDispData, this.invalid(validate));
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
     * 入力検証
     ********************************************/

    /**
     * 名称の入力検証
     * @param {string} name 名称
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateName(name) {
        return validateText(name, MAXLENGTH_UNIT.name, false);
    }

    /**
     * フォントサイズの入力検証
     * @param {number|string} fontSize フォントサイズ
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateFontSize(fontSize) {
        return validateReal(fontSize, 6, 72, false, 1);
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



}

DsettingGroupForm.propTypes = {
    dispSetId: PropTypes.string.isRequired,
    frontDispData: PropTypes.shape({             //前面の表示設定
        dispName: PropTypes.string.isRequired,
        fontSize: PropTypes.number.isRequired,
        textColor: PropTypes.string.isRequired,
        backColor: PropTypes.string.isRequired,
        unitImage: PropTypes.shape({
            url: PropTypes.string.isRequired
        })
    }),
    rearDispData: PropTypes.shape({              //背面の表示設定
        dispName: PropTypes.string.isRequired,
        fontSize: PropTypes.number.isRequired,
        textColor: PropTypes.string.isRequired,
        backColor: PropTypes.string.isRequired,
        unitImage: PropTypes.shape({
            url: PropTypes.string.isRequired
        })
    }),
    unitImages: PropTypes.arrayOf(PropTypes.shape({
        imageId: PropTypes.string.isRequired,
        type: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        FileName: PropTypes.string.isRequired,
        rearFlg: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired
    })),
    onChange: PropTypes.func
}