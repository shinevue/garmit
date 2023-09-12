/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkSettingBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';

import InputForm from 'Common/Form/InputForm';
import TextareaForm from 'Common/Form/TextareaForm';
import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';
import Loading from 'Common/Widget/Loading';

import { validateText, validateSelect, validateTextArea, VALIDATE_STATE } from 'inputCheck';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { convertNumber } from 'numberUtility';
import { MAXLENGTH_NETWORK } from 'assetUtility';

/**
 * ネットワーク設定ボックス
 * @param {object} network ネットワーク設定情報
 * @param {array} cableTypes ケーブル種別リスト
 * @param {number} level 権限レベル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange ネットワーク設定情報が変更されたときに呼び出す。
 */
export default class NetworkSettingBox extends Component {
    
    /**
     * 検証結果（初期値）
     */
    static get INITIAL_VALIDATE() {
        return {
            name: { state: null, helpText: null },
            cableType: { state: null, helpText: null },
            cableStandard: { state: null, helpText: null },
            speed: { state: null, helpText: null },
            bandWidth: { state: null, helpText: null },
            comment: { state: null, helpText: null }
        };
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        if (props.isReadOnly) {
            this.state = {
                validate: NetworkSettingBox.INITIAL_VALIDATE,
            };
        } else {    
            this.state = {
                validate: this.validateAllItems(props.network)
            }
        }
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { network, isReadOnly } = nextProps;
        if (isReadOnly) {
            this.setState({
                validate: NetworkSettingBox.INITIAL_VALIDATE,
            });
        } else if (isReadOnly !== this.props.isReadOnly || (this.props.network === null && network)) {
            //編集に切り替わったときのみ
            this.setState({
                validate: this.validateAllItems(network)
            });
        } else if (!isReadOnly && network && (network.name === '' || !network.cableType)) {
            this.setState({
                validate: Object.assign(this.state.validate, {
                    name: this.validateName(network.name),
                    cableType: this.validateCableType(network.cableType ? network.cableType.cableId : -1)
                })
            })
        }
    }

    /**
     * render
     */
    render() {
        const { className, network, cableTypes, level, isReadOnly, isLoading } = this.props;
        const { validate } = this.state;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        return (
            <Panel className={className} header="ネットワーク設定">
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="名称" columnCount={1} isRequired={true} >
                            <TextForm value={network&&network.name} 
                                      onChange={(value) => this.changeValue(value, this.validateName(value), 'name')} 
                                      isReadOnly={readOnly} 
                                      validationState={validate.name.state}
                                      helpText={validate.name.helpText}
                                      maxlength={MAXLENGTH_NETWORK.name}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ケーブル種別" columnCount={1} isRequired={true} >
                            <SelectForm value={network&&network.cableType&&network.cableType.cableId} 
                                        options={cableTypes.map((i) => { return { value: i.cableId, name: i.name}})} 
                                        onChange={(value) => this.cableTypeChanged(value)} 
                                        isReadOnly={readOnly} 
                                        validationState={validate.cableType.state}
                                        helpText={validate.cableType.helpText}
                            />           
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ケーブル規格" columnCount={1} >
                            <TextForm value={network&&network.cableStandard} 
                                      onChange={(value) => this.changeValue(value, this.validateCableStandard(value), 'cableStandard')} 
                                      isReadOnly={readOnly} 
                                      validationState={validate.cableStandard.state}
                                      helpText={validate.cableStandard.helpText}
                                      maxlength={MAXLENGTH_NETWORK.cableStandard}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="通信速度" columnCount={1} >
                            <TextForm value={network&&network.speed} 
                                      onChange={(value) => this.changeValue(value, this.validateSpeed(value), 'speed')} 
                                      isReadOnly={readOnly} 
                                      validationState={validate.speed.state}
                                      helpText={validate.speed.helpText}
                                      maxlength={MAXLENGTH_NETWORK.speed}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="帯域幅" columnCount={1} >
                            <TextForm value={network&&network.bandWidth} 
                                      onChange={(value) => this.changeValue(value, this.validateBandWidth(value), 'bandWidth')}
                                      isReadOnly={readOnly} 
                                      validationState={validate.bandWidth.state}
                                      helpText={validate.bandWidth.helpText}
                                      maxlength={MAXLENGTH_NETWORK.bandWidth}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="備考" columnCount={1} >
                            <TextareaForm value={network&&network.comment} 
                                          onChange={(value) => this.changeValue(value, this.validateComment(value), 'comment')}
                                          isReadOnly={isReadOnly} 
                                          validationState={validate.comment.state}
                                          helpText={validate.comment.helpText}
                                          maxlength={MAXLENGTH_NETWORK.comment}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                </InputForm>
                <Loading isLoading={isLoading} />
            </Panel>
        );
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ケーブル種別変更イベント
     * @param {string|number} cableId 変更後のケーブル種別ID
     */
    cableTypeChanged(cableId){
        let targetType = this.props.cableTypes.find((type) => type.cableId === convertNumber(cableId));
        this.changeValue(targetType, this.validateCableType(cableId), 'cableType');
    }
    
    /********************************************
     * 入力変更時のイベント発生
     ********************************************/
    
    /**
     * ユニット情報の値を変更する
     * @param {any} value 変更後の値
     * @param {object} targetValidate 検証結果
     * @param {string} key 変更値のオブジェクトキー
     */
    changeValue(value, targetValidate, key) {
        let network = Object.assign({}, this.props.network);
        network = network ? network : {};
        if (key === 'cableType') {
            network[key] = Object.assign({}, value);
        } else {
            network[key] = value;
        }

        let validate = this.setValidate(targetValidate, key);
        this.onChange(network, validate);
    }

    /**
     * 入力変更イベントを発生させる
     * @param {object} network 変更後のネットワーク情報
     * @param {object} validate 入力検証結果
     */
    onChange(network, validate){
        if (this.props.onChange) {
            this.props.onChange(network, this.invalid(validate));
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
        return validateText(name, MAXLENGTH_NETWORK.name, false);
    }

    /**
     * ケーブル種別の入力検証
     * @param {string|number} cableId ケーブル種別ID
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateCableType(cableId) {
        return validateSelect(cableId);
    }

    /**
     * ケーブル規格の入力検証
     * @param {string} cableStandard ケーブル規格
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateCableStandard(cableStandard) {
        return validateText(cableStandard, MAXLENGTH_NETWORK.cableStandard, true); 
    }

    /**
     * 通信速度の入力検証
     * @param {string} speed 通信速度
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateSpeed(speed) {
        return validateText(speed, MAXLENGTH_NETWORK.speed, true);
    }

    /**
     * 帯域幅の入力検証
     * @param {string} bandWidth 帯域幅
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateBandWidth(bandWidth) {
        return validateText(bandWidth, MAXLENGTH_NETWORK.bandWidth, true);
    }

    /**
     * 備考の入力検証
     * @param {string} comment コメント
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateComment(comment) {
        return validateTextArea(comment, MAXLENGTH_NETWORK.comment, true);
    }

    /**
     * 全項目の入力検証
     * @param {object} network ネットワーク設定情報
     * @returns {object} 検証結果 
     */
    validateAllItems(network) {
        return {
            name: this.validateName(network && network.name),
            cableType: this.validateCableType(network && network.cableType ? network.cableType.cableId : -1),
            cableStandard: this.validateCableStandard(network && network.cableStandard),
            speed: this.validateSpeed(network && network.speed),
            bandWidth: this.validateBandWidth(network && network.bandWidth),
            comment: this.validateComment(network && network.comment)
        };
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

NetworkSettingBox.propTypes = {
    network: PropTypes.shape({
        networkId: PropTypes.number.isRequired,
        name: PropTypes.string,
        cableType: PropTypes.shape({
            cableId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        cableStandard: PropTypes.string,
        speed: PropTypes.string,
        bandWidth: PropTypes.string,
        comment: PropTypes.string
    }),
    cableTypes: PropTypes.arrayOf(PropTypes.shape({
        cableId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    })),
    level: PropTypes.number,
    isReadOnly: PropTypes.bool,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func    
}