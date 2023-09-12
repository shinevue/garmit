/**
 * @license Copyright 2020 DENSO
 * 
 * PatchCableBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextareaForm from 'Common/Form/TextareaForm';
import GarmitBox from 'Assets/GarmitBox';

import { VALIDATE_STATE } from 'inputCheck';
import { MAXLENGTH_MEMO, validateMemo, makePatchCableName, makeLineIdsName } from 'lineUtility';

/**
 * IDF線番情報ボックス
 * @param {object} patchCableData 案件情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange IDF線番情報変更時に呼び出す
 */
export default class PatchCableBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { patchCableData } = props;
        this.state = {
            validate: {
                memo: patchCableData ? validateMemo(patchCableData.memo) : { state: null, helpText: null }
            }
        };
    }

    //#region React ライフサイクルメソッド

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeId = this.props.patchCableData && this.props.patchCableData.patchboardId;
        const beforeNo = this.props.patchCableData && this.props.patchCableData.cableNo;
        const nextPatchCable = nextProps.patchCableData;
        const nextId = nextPatchCable && nextPatchCable.patchboardId;
        const nextNo = nextPatchCable && nextPatchCable.cableNo;
        if ((!beforeId && nextId && !beforeNo && nextNo) || (beforeId !== nextId)|| (beforeNo !== nextNo) ){
            this.setState({
                validate: {
                    memo: nextPatchCable ? validateMemo(nextPatchCable.memo) : { state: null, helpText: null }
                }
            });
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { patchCableData, isLoading } = this.props;
        if (patchCableData) {
            var { patchboardName, cableNo, inConnect, relConnects, lineId1, lineId2, lineId3, lineName ,lineType, wiringType, comSpeed, userName, chargeName, locationName, projectNo, openDate, closeDate, memo } = patchCableData;
        }
        const { validate } = this.state;
        return (
            <GarmitBox title="IDF線番情報" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="IDF線番" columnCount={1} >
                                <LabelForm value={makePatchCableName(patchboardName, cableNo)} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="局入線番" columnCount={2} >
                                <LabelForm value={inConnect} />
                            </InputForm.Col>
                            <InputForm.Col label="中継線番" columnCount={2} >
                                <LabelForm value={this.makeRelConnectsName(relConnects)} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="回線ID" columnCount={2}  >
                                <LabelForm value={makeLineIdsName( { lineId1, lineId2, lineId3 })} />
                            </InputForm.Col>
                            <InputForm.Col label="回線種別" columnCount={2}  >
                                <LabelForm value={lineType} />
                            </InputForm.Col>                        
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ワイヤ" columnCount={2}  >
                                <LabelForm value={wiringType} />
                            </InputForm.Col>
                            <InputForm.Col label="通信速度" columnCount={2} >
                                <LabelForm value={comSpeed?comSpeed + 'bps':''} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="回線名" columnCount={2}  >
                                <LabelForm value={lineName} />
                            </InputForm.Col>    
                            <InputForm.Col label="ロケーション" columnCount={2} >       
                                <LabelForm value={locationName} />                         
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ユーザー名" columnCount={2}  >
                                <LabelForm value={userName} />
                            </InputForm.Col>
                            <InputForm.Col label="担当者" columnCount={2} >
                                <LabelForm value={chargeName} />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="工事番号" columnCount={3} >
                                <LabelForm value={projectNo} />
                            </InputForm.Col>
                            <InputForm.Col label="開通年月日" columnCount={3} >
                                <LabelForm value={openDate} />
                            </InputForm.Col>
                            <InputForm.Col label="廃止年月日" columnCount={3} >
                                <LabelForm value={closeDate} />
                            </InputForm.Col>
                        </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="備考" columnCount={1} >
                            <TextareaForm 
                                value={memo} 
                                validationState={validate.memo.state}
                                helpText={validate.memo.helpText}
                                onChange={(value) => this.onChange('memo', value, validateMemo(value))}
                                maxlength={MAXLENGTH_MEMO}
                                showTextLength
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

    //#endregion


    //#region その他

    /**
     * 中継線番名称を作成する
     * @param {array} relConnects 中継線番一覧
     */
    makeRelConnectsName(relConnects) {
        var name = '';
        if (relConnects && relConnects.length > 0) {
            relConnects.forEach((connect, index) => {
                name += '(' + (index + 1) + ') ' + connect;
                if (relConnects.length > index + 1) {
                    name += ' - ';
                }
            })
        }
        return name;
    }
    
    //#endregion
}

PatchCableBox.propsTypes = {
    patchCableData: PropTypes.object,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func
}