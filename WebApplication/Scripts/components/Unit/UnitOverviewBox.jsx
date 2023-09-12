/**
 * @license Copyright 2017 DENSO
 * 
 * UnitOverviewBox Reactコンポーネント
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
import ColorForm from 'Common/Form/ColorForm';
import ImageForm from 'Assets/Form/ImageForm';
import StatusSelectForm from 'Assets/Form/StatusSelectForm';

import { validateText, validateSelect, validateInteger, validateReal, validateTextArea, VALIDATE_STATE, successResult, errorResult } from 'inputCheck';
import { changeNumbarFormat, convertNumber } from 'numberUtility';
import { hasUnit, MAXLENGTH_UNIT } from 'assetUtility';
import { getDuplicateDispSettings, getMinPositionDispSetting, validateUnitSize } from 'unitMountCheck';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

/**
 * ユニット概要コンポーネントを定義します。
 * @param {object} unit ユニット情報
 * @param {object} unitDispSetting ラック搭載図のユニット表示設定グループ
 * @param {array} mountDispSettings ラックに搭載中のユニット表示設定グループリスト
 * @param {array} unitStatuses ユニットステータスリスト
 * @param {array} unitTypes ユニット種別リスト
 * @param {array} unitImages ユニット画像リスト
 * @param {array} rackPowers ラック電源リスト
 * @param {object} rackSize ラックサイズ（height: 高さ、width：幅）
 * @param {number} level 権限レベル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isApplyTemplate テンプレート適用中かどうか
 * @param {function} onChange ユニット概要が変更されたときに呼び出す
 * @param {function} onSelectTemplate テンプレートを選択したときに呼び出す
 */
export default class UnitOverviewBox extends Component {
    
    /**
     * 検証結果（初期値）
     */
    static get INITIAL_VALIDATE() {
        return {
            unitNo: { state: null, helpText: null },
            type: { state: null, helpText: null },
            status: { state: null, helpText: null },
            name: { state: null, helpText: null },
            fontSize: { state: null, helpText: null },
            position: { state: null, helpText: null },
            size: { state: null, helpText: null },
            weight: { state: null, helpText: null },
            ratedPower: { state: null, helpText: null },
            rackPower: { state: null, helpText: null },
            comment: { state: null, helpText: null }
        };
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            validate: UnitOverviewBox.INITIAL_VALIDATE,
            isRackPower: false,
            isMerge: false,
            isMove: false,
            beforeDispSetting: null
        };
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
        const { unit, unitDispSetting, isReadOnly, isApplyTemplate } = nextProps;
        if (isReadOnly) {
            //isReadOnly===tureの場合は、リセットする
            this.setState({
                validate: UnitOverviewBox.INITIAL_VALIDATE,
                isRackPower: unit&&unit.rackPower ? true : false,
                isMerge: false,
                isMove: false,
                beforeDispSetting: null
            });
        } else if(isReadOnly !== this.props.isReadOnly || isApplyTemplate) {
            const validate = this.validateAllItems(unit, unitDispSetting);
            if (!isApplyTemplate) {
                //編集中に切り替わったとき
                this.setState({
                    validate: validate,
                    isRackPower: unit&&unit.rackPower ? true : false,
                    isMerge: false,
                    isMove: false,
                    beforeDispSetting: JSON.parse(JSON.stringify(unitDispSetting))
                });
            } else {
                this.changeMountValue(unit, validate);
            }
        }
    }

    /**
     * render
     */
    render() {
        const { unit, unitDispSetting, unitStatuses, unitTypes, unitImages, rackPowers, isReadOnly, isLoading, level } = this.props;
        const { unitId, unitNo, name, position, size, type, status } = unit;
        const { fontSize, textColor, backColor, frontUnitImage, rearUnitImage } = unit;
        const { weight, ratedPower, rackPower, comment } = unit;
        const { validate, isRackPower, isMerge, isMove } = this.state;
        const typeSelectList = unitTypes ? unitTypes.map((type) => ({ name: type.name, value: type.typeId })) : [];
        const hasRackPowers = this.hasRackPowers(rackPowers);
        
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        const readOnly_Comment = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.normal);

        return (
            <Box boxStyle="default" isLoading={isLoading} >
                <Box.Header>
                    <Box.Title>ユニット概要 （*は必須項目）</Box.Title>
                </Box.Header >
                <Box.Body>
                    {!readOnly && 
                        <Clearfix className="mb-05">
                            <Button className="pull-right" iconId="template" bsStyle="primary" bsSize="small" onClick={()=>this.handleSelectTemplate()} >テンプレート選択</Button>
                        </Clearfix>
                    }
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="ユニットNo" columnCount={2} isRequired={!isReadOnly} >
                                {isMerge||isMove?
                                    <LabelForm value={this.unitNoMeassage(isMerge)} />
                                :
                                    <TextForm value={isReadOnly&&!unitNo?'(なし)':unitNo} 
                                              isReadOnly={readOnly} 
                                              validationState={validate.unitNo.state}
                                              helpText={validate.unitNo.helpText}
                                              onChange={(value) => this.changeValue(value, this.validateUnitNo(value, unitDispSetting), 'unitNo')}
                                    />
                                }
                            </InputForm.Col>
                            <InputForm.Col label="ユニットID" columnCount={2} >
                                <LabelForm value={unitId?unitId:'(なし)'} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ユニット種別" columnCount={2} isRequired={!isReadOnly} >
                                <SelectForm value={type&&type.typeId} 
                                            options={typeSelectList} 
                                            validationState={validate.type.state}
                                            helpText={validate.type.helpText}
                                            onChange={(value) => this.typeChanged(value)} 
                                            isReadOnly={readOnly} 
                                />           
                            </InputForm.Col>
                            <InputForm.Col label="ステータス" columnCount={2} isRequired={!isReadOnly} >
                                <StatusSelectForm  value={status} 
                                                   statusList={unitStatuses} 
                                                   validationState={validate.status.state}
                                                   helpText={validate.status.helpText}
                                                   onChange={(value) => this.changeValue(value, validateSelect(value.statusId), 'status')} 
                                                   isReadOnly={readOnly} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="名称" columnCount={1} isRequired={!isReadOnly} >
                                <TextForm value={name} 
                                          validationState={validate.name.state}
                                          helpText={validate.name.helpText}
                                          onChange={(value) => this.changeValue(value, this.validateName(value), 'name')} 
                                          isReadOnly={readOnly} 
                                          placeholder={isReadOnly&&"(なし)"}
                                          maxlength={MAXLENGTH_UNIT.name}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="文字色" columnCount={2} isRequired={!isReadOnly} >
                                <ColorForm color={textColor} 
                                           isReadOnly={readOnly} 
                                           onChange={(value) => this.changeValue(value, successResult, 'textColor')}
                                />
                            </InputForm.Col>                            
                            <InputForm.Col label="背景色" columnCount={2} isRequired={!isReadOnly} >
                                <ColorForm color={backColor} 
                                           isReadOnly={readOnly} 
                                           onChange={(value) => this.changeValue(value, successResult, 'backColor')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>     
                            <InputForm.Col label="フォントサイズ" columnCount={2} isRequired={!isReadOnly} >
                                <TextForm value={isReadOnly? changeNumbarFormat(fontSize, 1) : fontSize}
                                          unit="px" 
                                          validationState={validate.fontSize.state}
                                          helpText={validate.fontSize.helpText}
                                          onChange={(value) => this.changeValue(value, this.validateFontSize(value), 'fontSize')} 
                                          isReadOnly={readOnly}
                                />
                            </InputForm.Col>                     
                            <InputForm.Col columnCount={2} >
                                {/* 空のセル */}
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="画像（前面）" columnCount={2} >
                                <ImageForm image={frontUnitImage} 
                                           unitImages={unitImages}
                                           isReadOnly={readOnly}
                                           onChange={(image) => this.changeValue(image, null, 'frontUnitImage')}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="画像（背面）" columnCount={2} >
                                <ImageForm image={rearUnitImage} 
                                           unitImages={unitImages}
                                           isReadOnly={readOnly}
                                           onChange={(image) => this.changeValue(image, null, 'rearUnitImage')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="搭載位置" columnCount={2} isRequired={!isReadOnly} >
                                <Text2DForm value={{row: position&&position.y, col: position&&position.x}} 
                                            rowUnit="U"
                                            validationState={validate.position.state}
                                            helpText={validate.position.helpText}
                                            onChange={(value) => this.mountValueChanged({ x: value.col, y: value.row }, size)}
                                            isReadOnly={readOnly} 
                                />
                            </InputForm.Col>
                            <InputForm.Col label="占有ユニット数" columnCount={2} isRequired={!isReadOnly} >
                                <Text2DForm value={{row: size&&size.height, col: size&&size.width}} 
                                            rowUnit="U"
                                            validationState={validate.size.state}
                                            helpText={validate.size.helpText}
                                            onChange={(value) => this.mountValueChanged(position, { width: value.col, height: value.row })}
                                            isReadOnly={readOnly} 
                                />
                        </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="重量" columnCount={2} isRequired={!isReadOnly} >
                                <TextForm value={isReadOnly? changeNumbarFormat(weight, 1) : weight}
                                          unit="kg" 
                                          validationState={validate.weight.state}
                                          helpText={validate.weight.helpText}
                                          onChange={(value) => this.changeValue(value, this.validateWeight(value), 'weight')} 
                                          isReadOnly={readOnly} 
                                />
                            </InputForm.Col>
                            <InputForm.Col label="定格電力" columnCount={2} isRequired={!isReadOnly} >
                                <TextForm value={ratedPower} 
                                          unit="W" 
                                          validationState={validate.ratedPower.state}
                                          helpText={validate.ratedPower.helpText}
                                          onChange={(value) => this.changeValue(value, this.validateRatedPower(value), 'ratedPower')} 
                                          isReadOnly={readOnly} 
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                        <InputForm.Col label="ラック電源" columnCount={1} >
                                {hasRackPowers&&
                                    <Checkbox style={{marginBottom: "5px"}} 
                                            checked={isRackPower} 
                                            onChange={() => this.isRackPowerChanged()} 
                                            disabled={readOnly || (!rackPowers || rackPowers.length <= 0) } >
                                                ラック電源とする
                                    </Checkbox>
                                }
                                {hasRackPowers ?
                                    <SelectForm value={rackPower&&rackPower.psNo}
                                                validationState={validate.rackPower.state}
                                                helpText={validate.rackPower.helpText}
                                                options={rackPowers&&
                                                        rackPowers.map((i) => { return {value: i.psNo, name: i.psNo + ":" + i.name}})
                                                } 
                                                onChange={(value) => this.rackPowerChanged(value)} 
                                                isReadOnly={readOnly?true:!isRackPower} 
                                />
                                :
                                    <LabelForm value="ラック電源がありません" />
                                }       
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="コメント" columnCount={1} >
                                <TextareaForm value={comment} 
                                              validationState={validate.comment.state}
                                              helpText={validate.comment.helpText}
                                              onChange={(value) => this.changeValue(value, this.validateComment(value), 'comment')} 
                                              isReadOnly={readOnly_Comment} 
                                              placeholder={isReadOnly&&"(なし)"}
                                              maxlength={MAXLENGTH_UNIT.comment}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ユニット種別変更イベント
     * @param {string|number} value 変更後の種別ID
     */
    typeChanged(value){
        const { unit, unitTypes } = this.props;
        if (hasUnit(unit)&&unit.type&&
            !confirm('ユニット種別を変更します。よろしいですか？')) {
            return;
        }
        let targetType = unitTypes.find((type) => type.typeId === convertNumber(value));
        this.changeValue(targetType, validateSelect(value), 'type');    
    }

    /**
     * 搭載情報（搭載位置・占有ユニット数）の変更イベント
     * @param {object} position ユニットの搭載位置 ({ x: '', y: '' })
     * @param {object} size ユニットの占有ユニット数 ({ height: '', width: '' })
     */
    mountValueChanged(position, size) {
        let unit = Object.assign({}, this.props.unit);
        unit.position = Object.assign({}, position);
        unit.size = Object.assign({}, size);

        var validate = Object.assign({}, this.state.validate);
        validate.position = this.validatePosition(position);
        validate.size = this.validateSize(size);

        this.changeMountValue(unit, validate);
    }

    /**
     * 「ラック電源とする」チェックボックスの変更イベント
     */
    isRackPowerChanged(){
        var obj =  Object.assign({}, this.state);
        obj.isRackPower = !this.state.isRackPower;
        
        var unit = Object.assign({}, this.props.unit);
        if (!obj.isRackPower) {
            unit.rackPower = null;
        }

        obj.validate.rackPower = this.validateRackPower(unit.rackPower, obj.isRackPower);

        this.onChange(unit, obj.validate);
        this.setState(obj);
    }

    /**
     * ラック電源変更
     * @param {*} value 
     */
    rackPowerChanged(value){
        const { rackPowers } = this.props;
        let targetPower = rackPowers.find((power) => power.psNo === convertNumber(value));
        this.changeValue(targetPower, this.validateRackPower(targetPower, this.state.isRackPower), 'rackPower');

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
     * ユニット番号の入力検証を行う
     * @param {string|number} unitNo ユニット番号
     * @param {object} unitDispSetting 表示設定グループ
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateUnitNo(unitNo, unitDispSetting) {
        var validate = validateInteger(unitNo, 1, 20, false);       //通常の入力検証

        //ユニット番号重複チェック
        if (validate.state === VALIDATE_STATE.success) {
            const { units } = unitDispSetting;
            const { unitId } = this.props.unit;
            if (units.some((unit) => (unit.unitId !== unitId && unit.unitNo === convertNumber(unitNo)))) {
                validate = errorResult('他のユニットとユニット番号が重複しています。');
            }
        }

        return validate;
    }

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
     * ユニットの搭載位置の入力検証
     * @param {object} position ユニットの搭載位置 ({ x: '', y: '' })
     * @param {object} rackSize ラックサイズ({height: 高さ、width：幅}) 
     * @returns { state:'', helpText:'' }　検証結果
     */
    validatePosition(position) {
        const { rackSize } = this.props;
        var validate;
        
        //行のチェック
        validate = validateInteger(position.y, 1, rackSize.height);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('U数：' + validate.helpText);
            return validate;
        }

        //列のチェック
        validate = validateInteger(position.x, 1, rackSize.width);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('列：' + validate.helpText);
            return validate;
        }
        
        return validate;
    }

    /**
     * ユニットの占有ユニット数の入力検証
     * @param {object} size ユニットの占有ユニット数 ({ height: '', width: '' })
     * @param {object} rackSize ラックサイズ({height: 高さ、width：幅}) 
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateSize(size) {
        const { rackSize } = this.props;
        var validate;

        //高さのチェック
        validate = validateInteger(size.height, 1, rackSize.height);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('U数：' + validate.helpText);
            return validate;
        }

        //幅のチェック
        validate = validateInteger(size.width, 1, rackSize.width);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('列：' + validate.helpText);
            return validate;
        }
        
        return validate;
    }

    /**
     * 表示設定グループの入力検証
     * @param {object} unitDispSetting 変更後の表示設定グループ
     * @param {object} unit 変更対象のユニット
     */
    validateDispSetting(unitDispSetting, unit) {
        const { beforeDispSetting } = this.state;
        if (unitDispSetting && 
            unitDispSetting.dispSetId !== beforeDispSetting.dispSetId &&
            beforeDispSetting.units.length > 1
            ) {
            if (unit.frontFlg || unit.rearFlg) {
                return errorResult('表示設定で前面ユニットもしくは背面ユニットに設定されているため、搭載位置を変更することができません。');
            }
        }
        return successResult;
    }

    /**
     * 重量の入力検証
     * @param {number|string} weight 重量
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateWeight(weight) {
        return validateReal(weight, 0, 1000, false, 1);
    }

    /**
     * 定格電力の入力検証
     * @param {number|string} ratedPower 定格電力
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateRatedPower(ratedPower) {
        return validateInteger(ratedPower, 0, 10000, false);
    }

    /**
     * ラック電源の入力検証
     * @param {object} rackPower ラック電源
     * @param {boolean} isRackPower ラック電源とするかどうか
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateRackPower(rackPower, isRackPower) {
        const { unitId, unitPowers } = this.props.unit;
        var validate = successResult;
        if (rackPower && rackPower.psNo) {
            if (rackPower.unitId && rackPower.unitId !== unitId) {
                validate = errorResult('ユニットがすでに登録されています。他のラック電源を選択してください。');
            }

            if (validate.state === VALIDATE_STATE.success &&
                unitPowers.some((unitPower) => unitPower.rackPower.psNo === rackPower.psNo)) {
                validate = errorResult('電源設定で使用しています。他のラック電源を選択してください。');
            }
        } else {
            if (isRackPower) {
                validate = errorResult('ラック電源を選択してください。');
            }
        }
        return validate;
    }

    /**
     * コメントの入力検証
     * @param {string} comment コメント
     */
    validateComment(comment) {
        return validateTextArea(comment, MAXLENGTH_UNIT.comment, true);
    }

    /**
     * 全項目の入力検証
     * @param {object} unit ユニット情報
     * @returns {object} 検証結果 
     */
    validateAllItems(unit, unitDispSetting) {
        const { unitNo, type, status, name, fontSize, position, size, weight, ratedPower, rackPower, comment } = unit;
        return {
            unitNo: this.validateUnitNo(unitNo, unitDispSetting),
            type: validateSelect(type ? type.typeId : -1),
            status: validateSelect(status ? status.statusId : -1),
            name: this.validateName(name),
            fontSize: this.validateFontSize(fontSize),
            position: this.validatePosition(position),
            size: this.validateSize(size),
            weight: this.validateWeight(weight),
            ratedPower: this.validateRatedPower(ratedPower),
            rackPower: this.validateRackPower(rackPower),
            comment: this.validateComment(comment)
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
        //ユニット情報をセット
        let unit = Object.assign({}, this.props.unit);
        if (typeof unit[key] === 'object') {
            unit[key] = value && Object.assign({}, value);
        } else {
            unit[key] = value;
        }

        let validate = this.setValidate(targetValidate, key);

        this.onChange(unit, validate);
    }

    /**
     * 搭載情報の値を検証し、変更する
     * @param {object} unit ユニット情報
     * @param {objecgt} validate 検証結果 
     */
    changeMountValue(unit, validate) {
        var duplicateDispSettings = [];
        var dispSetting = null;
        const { beforeDispSetting } = this.state;

        //重複している表示設定グループと更新する表示設定グループの取得と検証
        if (validate.position.state === VALIDATE_STATE.success && validate.size.state === VALIDATE_STATE.success) {
                unit.position = this.convertPositionNumber(unit.position);
                unit.size = this.convertSizeNumber(unit.size);

                duplicateDispSettings = getDuplicateDispSettings(unit.position, unit.size, this.props.mountDispSettings);
                dispSetting = getMinPositionDispSetting(duplicateDispSettings);
                if (!dispSetting) {
                    dispSetting = { dispSetId: '', units: [] };     //空の表示設定グループを設定
                }

                //搭載情報の検証
                validate.size = validateUnitSize(unit.size, unit.position, this.props.rackSize);
                validate.position = this.validateDispSetting(dispSetting, unit);                    
                if (duplicateDispSettings.length <= 1 && beforeDispSetting.dispSetId === dispSetting.dispSetId) {          
                    validate.unitNo = this.validateUnitNo(unit.unitNo, dispSetting);             //表示設定グループが同じときのみ
                } else {
                    validate.unitNo = successResult;
                }
        }

        this.setState({
            validate: validate,
            isMerge: duplicateDispSettings.length > 1, 
            isMove: dispSetting ? beforeDispSetting.dispSetId !== dispSetting.dispSetId : false
        });

        this.onChange(unit, validate, dispSetting, duplicateDispSettings);
    }

    /**
     * 入力変更イベントを発生させる
     * @param {object} unit 変更後のユニット情報
     * @param {object} validate 入力検証結果
     */
    onChange(unit, validate, dispSetting, margingDispSettings){
        if (this.props.onChange) {
            this.props.onChange(unit, this.invalid(validate), dispSetting, margingDispSettings);
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
     * ラック電源リストがあるかどうか
     * @param {array} powers ラック電源リスト
     * @returns {boolean} ラック電源があるかどうか
     */
    hasRackPowers(powers) {
        if (powers && powers.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * 搭載位置を数値に変更する
     * @param {object} position 搭載位置（文字列が含まれている可能性あり） 
     */
    convertPositionNumber(position) {
        return {
            x: convertNumber(position.x),
            y: convertNumber(position.y)
        };
    }

    /**
     * 占有ユニット数を数値に変更する
     * @param {object} size 占有ユニット数（文字列が含まれている可能性あり） 
     */
    convertSizeNumber(size) {
        return {
            height: convertNumber(size.height),
            width: convertNumber(size.width)
        };
    }

    /**
     * ユニット番号のメッセージ
     * @param {boolean} isMerge ユニットをマージするかどうか
     */
    unitNoMeassage(isMerge) {
        const { beforeDispSetting } = this.state;
        if (isMerge) {
            return "(複数の表示設定が統合されるため、自動割付されます)";
        }

        if (beforeDispSetting.dispSetId) {
            return "(ユニットが移動するため、自動割付されます)";
        } else {
            return "(既存の表示設定に統合されるため、自動割付されます)";
        }
    }
}

UnitOverviewBox.propTypes = {
    unit: PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        size: PropTypes.shape({
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired
        }).isRequired,
        type: PropTypes.shape({
            typeId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        }),
        status: PropTypes.shape({
            statusId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired
        }),
        weight: PropTypes.number.isRequired,
        portCount: PropTypes.number.isRequired,
        ratedPower: PropTypes.number.isRequired,
        rackPower: PropTypes.shape({
            rackId: PropTypes.string.isRequired,
            psNo: PropTypes.number.isRequired,
            name: PropTypes.string
        }),
        comment: PropTypes.string,
        fontSize: PropTypes.number.isRequired,
        textColor: PropTypes.string.isRequired,
        backColor: PropTypes.string.isRequired,
        frontUnitImage: PropTypes.shape({
            imageId: PropTypes.string.isRequired,
            type: PropTypes.object.isRequired,
            name: PropTypes.string.isRequired,
            FileName: PropTypes.string.isRequired,
            rearFlg: PropTypes.bool.isRequired,
            url: PropTypes.string.isRequired
        }),
        rearUnitImage: PropTypes.shape({
            imageId: PropTypes.string.isRequired,
            type: PropTypes.object.isRequired,
            name: PropTypes.string.isRequired,
            FileName: PropTypes.string.isRequired,
            rearFlg: PropTypes.bool.isRequired,
            url: PropTypes.string.isRequired
        })
    }),
    unitDispSetting: PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
        dispSetId: PropTypes.string.isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        size: PropTypes.shape({
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired
        }).isRequired
    }),
    mountDispSettings: PropTypes.arrayOf(PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
        dispSetId: PropTypes.string.isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        size: PropTypes.shape({
            height: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired
        }).isRequired
    })),
    unitStatuses: PropTypes.arrayOf(PropTypes.shape({
        statusId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
    })),
    unitTypes: PropTypes.arrayOf(PropTypes.shape({
        typeId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    })),
    unitImages: PropTypes.arrayOf(PropTypes.shape({
        imageId: PropTypes.string.isRequired,
        type: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        FileName: PropTypes.string.isRequired,
        rearFlg: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired
    })),
    rackPowers: PropTypes.arrayOf(PropTypes.shape({
        rackId: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        name: PropTypes.string
    })),
    rackSize: PropTypes.shape({
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired
    }),
    level: PropTypes.number,
    isReadOnly: PropTypes.bool,
    isLoading: PropTypes.bool,
    isApplyTemplate: PropTypes.bool,
    onChange: PropTypes.func,
    onSelectTemplate: PropTypes.func
}