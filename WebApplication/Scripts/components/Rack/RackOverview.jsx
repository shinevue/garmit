/**
 * @license Copyright 2018 DENSO
 * 
 * ラック概要コンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Clearfix } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextareaForm from 'Common/Form/TextareaForm';
import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';
import Text2DForm from 'Common/Form/Text2DForm';
import StatusSelectForm from 'Assets/Form/StatusSelectForm';

import RackPowerGraphList from './RackPowerGraphList';
import LoadGraphList from './LoadGraphList';

import { validateSelect, validateInteger, validateReal, validateTextArea, VALIDATE_STATE, successResult } from 'inputCheck';
import { rackColumnCheck, rackRowCheck } from 'unitMountCheck';
import { changeNumbarFormat, convertNumber } from 'numberUtility';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { MAXLENGTH_RACK } from 'assetUtility';

/**
 * ラック概要コンポーネント
 * 項目を変更すると、ラック概要全てのデータがonChange()で返ります
 * @param {object} rack ラック情報
 * @param {array} rackPowerBarGraphList ラック電源グラフ設定リスト
 * @param {array} rackStatuses ラックステータス一覧
 * @param {array} rackTypes ラック種別一覧
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 権限レベル
 * @param {boolean} isApplyTemplate テンプレート適用中かどうか
 * @param {function} onChange ラック概要が変更されたときに呼び出す
 * @param {function} onSelectTemplate テンプレート選択ボタン押下時に呼び出す
 */
export default class RackOverview extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            validate: {
                size: { state: null, helpText: null },
                type: { state: null, helpText: null },
                status: { state: null, helpText: null },
                weight: { state: null, helpText: null },
                load: { state: null, helpText: null },
                comment: { state: null, helpText: null }
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
        const { rack, isReadOnly, isApplyTemplate } = nextProps;
        if (isReadOnly) {
            //isReadOnly===tureの場合は、リセットする
            this.setState({
                validate: {
                    size: { state: null, helpText: null },
                    type: { state: null, helpText: null },
                    status: { state: null, helpText: null },
                    weight: { state: null, helpText: null },
                    load: { state: null, helpText: null },
                    comment: { state: null, helpText: null }
                }
            });
        } else if(isReadOnly !== this.props.isReadOnly || isApplyTemplate) {
            //編集中に切り替わったときのみ
            const validateWeight = this.validateWeight(rack.weight, rack.load, successResult);
            const validateLoad = this.validateLoad(rack.load, rack.weight, validateWeight);
            const validate = {
                size: this.validateSize(rack.row, rack.col),
                type: validateSelect(rack.type ? rack.type.typeId : -1),
                status: validateSelect(rack.status ? rack.status.statusId: -1),
                weight: validateWeight, 
                load: validateLoad,
                comment: validateTextArea(rack.comment, MAXLENGTH_RACK.comment, true)
            };
            this.setState({
                validate: validate
            });
            
            if (isApplyTemplate) {
                this.onChange(rack, validate);
            }
        }
    }

    /**
     * render
     */
    render() {
        const { rack, rackStatuses, rackTypes, rackPowerBarGraphList, isReadOnly, isLoading, level } = this.props;
        const { rackId, rackName, row, col, type, status, load, weight, loadGraphAddWeight, comment, loadBarGraphSet } = rack;
        const { validate } = this.state;
        const typeSelectList = rackTypes ? rackTypes.map((item) => ({ name: item.name, value: item.typeId })) : [];
        const realLoad = this.getRealLoadText(load, weight, loadGraphAddWeight, validate);

        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        const readOnly_Comment = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.normal);

        return (
            <Box boxStyle="default" isCollapsible={true} isLoading={isLoading.rack} >
                <Box.Header>
                    <Box.Title>ラック概要 （*は必須項目）</Box.Title>
                </Box.Header >
                <Box.Body>
                    {!readOnly && 
                        <Clearfix className="mb-05">
                            <Button className="pull-right" iconId="template" bsStyle="primary" bsSize="small" onClick={()=>this.handleSelectTemplate()} >テンプレート選択</Button>
                        </Clearfix>
                    }
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="ラックID" columnCount={1} >
                                <LabelForm value={rackId?rackId:'(なし)'} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ラック名称" columnCount={1} >
                                <LabelForm value={rackName?rackName:'(なし)'} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ユニット数" columnCount={1} isRequired={!isReadOnly} >
                                <Text2DForm value={{row: row, col: col}}
                                            validationState={validate.size.state}
                                            helpText={validate.size.helpText}
                                            onChange={(v) => this.sizeChanged(v)} 
                                            isReadOnly={readOnly} 
                                            rowUnit="U"
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ラック種別" columnCount={2} isRequired={!isReadOnly} >
                                <SelectForm value={type&&type.typeId} 
                                            options={typeSelectList} 
                                            validationState={validate.type.state}
                                            helpText={validate.type.helpText}
                                            onChange={(v) => this.typeChanged(v)} 
                                            isReadOnly={readOnly} 
                                />           
                            </InputForm.Col>
                            <InputForm.Col label="ラックステータス" columnCount={2} isRequired={!isReadOnly} >
                                <StatusSelectForm  value={status} 
                                                   statusList={rackStatuses} 
                                                   validationState={validate.status.state}
                                                   helpText={validate.status.helpText}
                                                   onChange={(v) => this.statusChanged(v)} 
                                                   isReadOnly={readOnly} 
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ラック重量" columnCount={2} isRequired={!isReadOnly} >
                                <TextForm value={isReadOnly? changeNumbarFormat(weight, 1) : weight} 
                                          unit="kg" 
                                          validationState={validate.weight.state}
                                          helpText={validate.weight.helpText}
                                          onChange={(v) => this.weightChanged(v)} 
                                          isReadOnly={readOnly} 
                                          />
                            </InputForm.Col>
                            <InputForm.Col label="耐荷重" columnCount={2} isRequired={!isReadOnly} >
                                <TextForm value={isReadOnly? changeNumbarFormat(load, 1) : load} 
                                          unit="kg" 
                                          validationState={validate.load.state}
                                          helpText={validate.load.helpText}
                                          onChange={(v) => this.loadChanged(v)} 
                                          isReadOnly={readOnly} 
                                />
                                <Checkbox checked={loadGraphAddWeight} onChange={() => this.includeWeightChanged()} disabled={readOnly} >{"ラック重量を含める" + realLoad}</Checkbox>
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="コメント" columnCount={1} >
                                <TextareaForm value={comment} 
                                              validationState={validate.comment.state}
                                              helpText={validate.comment.helpText}
                                              placeholder={isReadOnly&&'(なし)'} 
                                              onChange={(v) => this.commentChanged(v)} 
                                              isReadOnly={readOnly_Comment} 
                                              maxlength={MAXLENGTH_RACK.comment}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    <LoadGraphList {...loadBarGraphSet} />
                    <RackPowerGraphList rackPowerBarGraphList={rackPowerBarGraphList} isReadOnly={!isReadOnly || isLoading.powerBar}/>
                </Box.Body>
            </Box>
        );
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ユニット数変更イベント
     * @param {object} value 変更後のユニット数（{ row: '', col: ''})
     */
    sizeChanged(value){
        let rack = this.setRackDataKeyValue(value);
        let validate = this.setValidate(this.validateSize(value.row, value.col), 'size');
        this.onChange(rack, validate);
    }

    /**
     * ラック種別変更イベント
     * @param {number} value 変更後の種別ID
     */
    typeChanged(value){
        const { rackTypes } = this.props;
        let targetType = rackTypes.find((type) => type.typeId === convertNumber(value));
        this.changeValue(targetType, validateSelect(value), 'type');
    }
    
    /**
     * ラックステータス変更イベント
     * @param {number} value 変更後のステータスID
     */
    statusChanged(value){
        this.changeValue(value, validateSelect(value.statusId), 'status');
    }

    /**
     * 耐荷重変更イベント
     * @param {string} value 変更後の耐荷重文字列
     */
    loadChanged(value){
        this.changeWeightOrLoad(value, 'load');
    }
    
    /**
     * 「ラック重量を含める」チェックボックスのチェック変更イベント
     */
    includeWeightChanged(){
        const rack =  Object.assign({}, this.props.rack, {
            loadGraphAddWeight: !this.props.rack.loadGraphAddWeight
        });
        this.onChange(rack, this.state.validate);
    }

    /**
     * ラック重量変更イベント
     * @param {string} value 変更後のラック重量文字列
     */
    weightChanged(value){
        this.changeWeightOrLoad(value, 'weight');
    }

    /**
     * コメント変更イベント
     * @param {string} value 変更後のコメント
     */
    commentChanged(value) {
        this.changeValue(value, validateTextArea(value, MAXLENGTH_RACK.comment, true), 'comment');
    }
    
    /**
     * テンプレート選択ボタン押下イベント
     */
    handleSelectTemplate() {
        if (this.props.onSelectTemplate) {
            this.props.onSelectTemplate();
        }
    }

    /********************************************
     * 入力検証
     ********************************************/

     /**
      * ラックサイズの検証
     * @param {number|string} rowText 行の文字列
     * @param {number|string} colText 列の文字列
     * @return { state:'', helpText:'' }　検証結果
      */
     validateSize(rowText, colText) {
         const { unitDispSettings } = this.props.rack;

        //行のチェック
        var validateRow = validateInteger(rowText, 1, 60, false);
        if (validateRow.state !== VALIDATE_STATE.success) {
            validateRow.helpText = 'Uは' + validateRow.helpText;
            return validateRow;
        }

        //列のチェック
        var validateCol = validateInteger(colText, 1, 60, false);
        if (validateCol.state !== VALIDATE_STATE.success) {
            validateCol.helpText = '列は' + validateCol.helpText;
            return validateCol;
        }

        //行の超過
        if (!rackRowCheck(unitDispSettings, rowText)) {
            return {
                state: VALIDATE_STATE.error,
                helpText: 'Uが搭載中ユニットの位置よりも小さい値になっています'
            };
        }

        //列の超過
        if (!rackColumnCheck(unitDispSettings, colText)) {
            return {
                state: VALIDATE_STATE.error,
                helpText: '列が搭載中ユニットの位置よりも小さい値になっています'
            };
        }

        return {
            state: VALIDATE_STATE.success,
            helpText: ''
        }
     }
    
    /**
     * 耐荷重の入力検証
     * @param {number|string} loadText 耐荷重の文字列
     * @param {number|string} weight ラック自重（未指定の場合はpropsのものを使用）
     * @param {object} validateStateWeight ラック自重の検証結果（未指定の場合はstateのものを使用）
     * @return { state:'', helpText:'' }　検証結果
     */
    validateLoad(loadText, weight, validateStateWeight) {
        //通常の入力チェック
        var validate = validateReal(loadText, 0, 10000, false, 1);
        if (!validateStateWeight) {
            validateStateWeight = this.state.validate.weight.state;
        }

        if (!(validateStateWeight === VALIDATE_STATE.success &&
            validate.state === VALIDATE_STATE.success)) {
            return validate;
        }

        //ラック重量との比較
        if (!weight) {
            weight = this.props.rack.weight;
        }
        if (this.isHeavierWeight(loadText, weight)) {
            return {
                state: VALIDATE_STATE.error,
                helpText: 'ラック重量よりも小さい値が入力されています'
            };
        }

        return validate;
    }

    /**
     * ラック重量の入力検証
     * @param {number|string} weightText ラック重量の文字列
     * @param {number|string} load 耐荷重（未指定の場合はpropsのものを使用）
     * @param {object} validateStateLoad 耐荷重の検証結果（未指定の場合はstateのものを使用）
     * @return { state:'', helpText:'' }　検証結果
     */
    validateWeight(weightText, load, validateStateLoad) {
        //通常の入力チェック
        var validate = validateReal(weightText, 0, 10000, false, 1);
        if (!validateStateLoad) {
            validateStateLoad = this.state.validate.load.state;
        }

        if (!(validateStateLoad === VALIDATE_STATE.success &&
            validate.state === VALIDATE_STATE.success)) {
            return validate;
        }

        //耐荷重との比較
        if (!load) {
            load = this.props.rack.load;
        }
        if (this.isHeavierWeight(load, weightText)) {
            return {
                state: VALIDATE_STATE.error,
                helpText: '耐荷重よりも大きな値が入力されています'
            };
        }

        return validate;
    }

    /**
     * 耐荷重よりもラック重量の方が重いかどうか
     * @param {number|string} loadText 耐荷重の文字列
     * @param {number|string} weightText ラック重量の文字列
     * @return { state:'', helpText:'' }　検証結果
     */
    isHeavierWeight(loadText, weightText) {
        const load = convertNumber(loadText);
        const weight = convertNumber(weightText);
        return (load - weight < 0)
    }

    /********************************************
     * 入力変更時のイベント発生
     ********************************************/

    /**
     * ラック情報の値を変更する
     * @param {any} value 変更後の値
     * @param {object} targetValidate 検証結果
     * @param {string} key 変更値のオブジェクトキー
     */
    changeValue(value, targetValidate, key) {
        //ラック情報をセット
        let rack = Object.assign({}, this.props.rack);
        if (key !== 'comment' && typeof rack[key] === 'object') {
            rack[key] = Object.assign({}, value);
        } else {
            rack[key] = value;
        }

        let validate = this.setValidate(targetValidate, key);

        this.onChange(rack, validate);
    }

    /**
     * ラック重量もしくは耐荷重の値を変更する
     * @param {any} value 変更後の値
     * @param {string} key 変更値のオブジェクトキー
     */
    changeWeightOrLoad(value, key) {
        //ラック情報をセット
        let rack = Object.assign({}, this.props.rack);
        rack[key] = value;

        var validate = Object.assign({}, this.state.validate);
        validate.load = this.validateLoad(rack.load, rack.weight);
        validate.weight = this.validateWeight(rack.weight, rack.load, validate.load);
        this.setState({validate: validate});

        this.onChange(rack, validate);
    }

    /**
     * 入力変更イベントを発生させる
     * @param {object} rack 変更後のラック情報
     * @param {object} validate 入力検証結果
     */
    onChange(rack, validate){
        if (this.props.onChange) {
            this.props.onChange(rack, this.invalid(validate));
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
     * その他
     ********************************************/

    /**
     * 搭載可能な重量文字列を取得する
     * @param {number|string} load 耐荷重
     * @param {number|string} weight ラック重量
     * @param {boolean} loadGraphAddWeight 耐荷重にラック重量を含めるかどうか
     * @param {object} validate 入力検証結果
     * @returns {string} 搭載可能な重量文字列
     */
    getRealLoadText(load, weight, loadGraphAddWeight, validate){
        if (!loadGraphAddWeight) {
            return '';
        }

        if (validate.load.state !== VALIDATE_STATE.error &&
            validate.weight.state !== VALIDATE_STATE.error) {
                return (' （' + changeNumbarFormat((load - weight), 1) + 'kg）');
        }
        return ' (ERROR)';
    }

    /**
     * ラックデータをセットする
     * @param {object} keyValues セットするオブジェクト（連想配列）
     * @returns {object} 更新後のラックデータ
     */
    setRackDataKeyValue(keyValues) {
        var rack = Object.assign({}, this.props.rack);
        for (const key in keyValues) {
            if (keyValues.hasOwnProperty(key)) {
                rack[key] = keyValues[key];                
            }
        }
        return rack;
    }

    /**
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, key) {        
        var validate = Object.assign({}, this.state.validate);
        validate[key] = targetValidate;
        this.setState({validate:validate});
        return validate;
    }
}

RackOverview.propTypes = {
    rack: PropTypes.shape({
        systemId: PropTypes.number.isRequired,
        rackId: PropTypes.string.isRequired,
        rackName: PropTypes.string.isRequired,
        comment: PropTypes.string,
        row: PropTypes.number.isRequired,
        col: PropTypes.number.isRequired,
        load: PropTypes.number.isRequired,
        weight: PropTypes.number.isRequired,
        loadGraphAddWeight: PropTypes.bool,
        status: PropTypes.shape({
            statusId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired
        }),
        type: PropTypes.shape({
            typeId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            viewHeight: PropTypes.number.isRequired         //ラック搭載図の高さ。単位：100%。最大100%。
        }),
        loadBarGraphSet: PropTypes.shape({
            max: PropTypes.number.isRequired,
            maxNowValueString: PropTypes.string.isRequired,
            barGraphItems: PropTypes.arrayOf(PropTypes.shape({
                usage: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired,
                alarmName: PropTypes.string.isRequired
            }))
        }),
        unitDispSettings: PropTypes.arrayOf(PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
            dispSetId: PropTypes.string.isRequired,
            position: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }).isRequired,
            size: PropTypes.shape({
                height: PropTypes.number.isRequired,
                width: PropTypes.number.isRequired
            }).isRequired,
            status: PropTypes.shape({
                color: PropTypes.string.isRequired
            }).isRequired,
            units: PropTypes.arrayOf(PropTypes.shape({
                unitId: PropTypes.string.isRequired,
                unitNo: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                type: PropTypes.shape({
                    name: PropTypes.string.isRequired
                }),
                position: PropTypes.shape({
                    x: PropTypes.number.isRequired,
                    y: PropTypes.number.isRequired
                }).isRequired,
                size: PropTypes.shape({
                    height: PropTypes.number.isRequired,
                    width: PropTypes.number.isRequired
                }).isRequired,
                links: PropTypes.arrayOf(PropTypes.shape({
                    title: PropTypes.string.isRequired,
                    url: PropTypes.string.isRequired
                }))
            }))
        }))
    }),
    rackPowerBarGraphList: PropTypes.arrayOf(PropTypes.shape({
        powerName: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        rackId: PropTypes.number.isRequired,
        ratedPowerBarGraphSet: PropTypes.shape({
            max: PropTypes.number.isRequired,
            maxNowValueString: PropTypes.string.isRequired,
            barGraphItems: PropTypes.arrayOf(PropTypes.shape({
                usage: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired,
                alarmName: PropTypes.string.isRequired
            }))
        }),
        measuredPowerBarGraphSet: PropTypes.shape({
            max: PropTypes.number.isRequired,
            maxNowValueString: PropTypes.string.isRequired,
            barGraphItems: PropTypes.arrayOf(PropTypes.shape({
                usage: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired,
                alarmName: PropTypes.string.isRequired
            }))
        })
    })),
    rackStatuses: PropTypes.arrayOf(PropTypes.shape({
        statusId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
    })),
    rackTypes: PropTypes.arrayOf(PropTypes.shape({
        typeId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        viewHeight: PropTypes.number.isRequired         //ラック搭載図の高さ。単位：100%。最大100%。
    })),
    isReadOnly: PropTypes.bool,
    level: PropTypes.number,
    isLoading: PropTypes.bool,
    isApplyTemplate: PropTypes.bool,
    onChange: PropTypes.func,
    onSelectTemplate: PropTypes.func
}