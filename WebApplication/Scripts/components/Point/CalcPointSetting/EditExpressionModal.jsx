
/**
 * Copyright 2017 DENSO Solutions
 * 
 * 演算式編集モーダル Reactコンポーネント
 *  
 */

'use strict';

import React, { Component } from 'react';
import { sendData, EnumHttpMethod } from 'http-request';

//演算式登録モーダル用
import { Modal } from 'react-bootstrap';
import { SUM_TYPE, CALC_TYPE, CALC_TARGET_TYPE, OPERATION, OPERAND_TYPE } from 'expressionUtility';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';
import { AddCircleButton, DeleteCircleButton, AddButton } from 'Assets/GarmitButton';
import { EditExpressionBox, EditOperantForm } from 'Point/CalcPointSetting/EditExpressionBox';
import DisplayExpressionBox from 'Point/CalcPointSetting/DisplayExpressionBox';
import AddCalcTargetModal from 'Point/calcPointSetting/AddCalcTargetModal';
import CalcSettingModal from 'Point/calcPointSetting/CalcSettingModal';
import { MAX_POINT_NUM } from 'expressionUtility';

const MAX_PARAMETER_NUM = 10;

/**
 * 演算式編集モーダル
 */
export default class EditExpressionModal extends Component {

    //#region コンストラクタ
    constructor(props) {
        super(props);        
        const calcPointSet = _.get(props, "calcPointSet");
        const omitCalcPointSet = this.omitCalcPointSet(_.cloneDeep(calcPointSet));
        this.state = {
            registerType: CALC_TARGET_TYPE.expression, //登録対象種別(デフォルト値は演算式)
            calcPointSet: $.extend(true, [], props.calcPointSet),    //演算式情報
            //演算項選択モーダル関連
            showOperandModal: false,    //モーダル表示
            showSettingModal:false,
            editingParamNo: null,            //編集中演算項
            maxNumber:1,
            isLoading: false,
            messageModalInfo: null,       //メッセージモーダル情報
            disableAddButton: calcPointSet && calcPointSet.length >= MAX_PARAMETER_NUM,
            addableNumber:null  //追加可能演算対象ポイント数（演算対象ポイント追加時に設定する）
        }
    }
    //#endregion

    //#region ライフサイクル関数
    /**
     * 新しいpropsを受け取ると実行される
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.show && !this.props.show) {
            //モーダル表示
            if (_.size(nextProps.calcPointSet) <= 0) { //演算ポイント情報が設定されていない場合
                this.setState({ calcPointSet: this.addOperandBox()});
            }
            else if (_.get(nextProps, "calcPointSet") !== _.get(this.state, "calcPointSet")) {
                const calcPointSet = _.cloneDeep(_.get(nextProps, "calcPointSet"));

                //新たな編集対象情報を受け取ったとき
                const leadType = _.get(calcPointSet, '[0].calcDetails[0].valueType');
                const registerType = leadType === OPERAND_TYPE.alarm || leadType === OPERAND_TYPE.error ? CALC_TARGET_TYPE.groupAlarm : CALC_TARGET_TYPE.expression;
                if (registerType === CALC_TARGET_TYPE.groupAlarm) { //sumTypeを変更
                    calcPointSet.map((info) => {
                        info.sumType = _.get(info, 'calcDetails[0].valueType', OPERAND_TYPE.alarm);
                    })
                }
                this.setState({ calcPointSet: calcPointSet, registerType: registerType});
            }
        }
        if (this.props.calcPointSet !== nextProps.calcPointSet) {
            this.setState({ disableAddButton: nextProps.calcPointSet && nextProps.calcPointSet.length >= MAX_PARAMETER_NUM });
        }
    }
    //#endregion

    //#region イベントハンドラ
    //#region ボタン押下イベント
    /**
     * ボタン押下イベント
     * @param {int} type ボタン種別
     * @param {obj} data データ
     */
    handleClick(type, data) {
        switch (type) {
            case OPERATION.save:
                this.saveCalcInfo();
                break;
            case OPERATION.cancel:
                this.closeModal();
                break;
            default: break;
        }
    }

    /**
     * モーダル表示ボタン押下イベント
     * @param {int} type モーダル種別
     * @param {int} paramNo　対象パラメータ番号
     */
    handleOpenModal(type, paramNo) {
        if (type === OPERATION.edit) {
            this.setState({ showSettingModal: true, editingParamNo: paramNo });
        }
        else if (type === OPERATION.add) {
            this.showAddOperandModal(paramNo);
        }
    }

    /**
     * 演算対象ポイント追加モーダル内のボタン押下イベント
     * @param {int} type ボタン種別
     * @param {obj} data データ
     */
    handleClickAddModal(type, data) {
        switch (type) {
            case OPERATION.cancel:  //モーダル閉じる
                this.hideAddOperandModal();
                break;
            default: break;
        }
    }

    /**
     * 演算設定モーダル内のボタン押下イベント
     * @param {int} type ボタン種別
     * @param {obj} data データ
     */
    handleClickSettingModal(type, data) {
        switch (type) {
            case OPERATION.apply:   
                let before = $.extend(true, [], this.state.calcPointSet);  //変更対象取得
                let update = _.pick(data, ['calcType', 'sumType', 'isCoef', 'isAbsolute', 'operandType']);
                this.hideCalcSettingModal();
                //モーダル表示用に換算値設定をcalcPointSetにも保存しておく
                update.isCoef = data.isCoef;
                //calcDetails設定変更
                let updateDetails = [];
                if (data.operandType === OPERAND_TYPE.constant) {   //固定値の場合は固定値を保存する
                    updateDetails = data.constValues.map((obj, index) => {
                        return { detailNo: index + 1, valueType: OPERAND_TYPE.constant, constValue: obj.value, isCoef: false }
                    });
                    update.calcDetails = updateDetails;
                }         
                else if (data.operandType === OPERAND_TYPE.point) {  //ポイントの場合は換算値設定を保存する
                    //変更前のParameter取得
                    let beforeParameter = _.find(before, { 'paramNo': this.state.editingParamNo });
                    //固定値を削除する
                    beforeParameter.calcDetails = _.filter(beforeParameter.calcDetails, { 'valueType': OPERAND_TYPE.point });
                    if (beforeParameter.calcDetails.length > 0){
                        updateDetails =  beforeParameter.calcDetails.map((obj, index) => {
                            obj.isCoef = data.isCoef;
                            return obj;
                        });
                    }                    
                    update.calcDetails = updateDetails;
                }
                this.setState({ calcPointSet: this.editOperandBox(before, this.state.editingParamNo, update) });
            case OPERATION.cancel:  //モーダル閉じる
                this.hideCalcSettingModal();
                break;
            default: break;
        }
    }

    /**
     * メッセージモーダルOKボタン押下イベント
     */
    handleClickOK() {
        const operation = this.state.messageModalInfo.operation;    //操作の種別を取得
        if (operation === OPERATION.delete) {   //削除の場合
            //削除用のイベントを発生させる
            this.handleChangeCalcPoint(this.state.messageModalInfo.data, operation);
        }
        this.setState({ messageModalInfo: {show:false} });  //メッセージモーダル情報クリア
    }
    //#endregion

    //#region　演算式情報編集
    /**
     * calcPointプロパティ変更イベント
     * @param {int} paramNo
     * @param {int} operation 操作（OPERATION.edit/add/delete）
     * @param {any} value 変更データ
     */
    handleChangeCalcPoint(paramNo, operation, value) {
        let update = $.extend(true, [], this.state.calcPointSet);  //変更対象取得
        switch (operation) {
            //操作毎に変更対象を編集
            case OPERATION.add:
                update = this.addOperandBox(update, null, paramNo);
                break;
            case OPERATION.edit:
                update = this.editOperandBox(update, paramNo, value);
                break;
            case OPERATION.delete:
                update = this.deleteOperandBox(update, paramNo);
                break;
            default: break;
        }
        this.setState({ calcPointSet: update, disableAddButton: update && update.length >= MAX_PARAMETER_NUM });    //編集内容保存
    }

    /**
     * calcDetailsプロパティ変更イベント
     * @param {int} paramNo
     * @param {int} detailNo   (編集、削除の場合のみ)
     * @param {int} operation 操作（OPERATION.edit/add/delete）
     * @param {any} value 変更データ(編集:calcDetail、追加:calcDetailの配列、削除:null)
     */
    handleChangeCalcDetails(paramNo, detailNo, operation, value) {
        let update = $.extend(true, [], this.state.calcPointSet);   //変更対象取得
        switch (operation) {
            //操作毎に変更対象を編集
            case OPERATION.add:
                //演算対象追加時（追加モーダルで適用ボタン押下）
                this.hideAddOperandModal(); //モーダル閉じる
                update=this.addCalcDetail(update, paramNo, value);
                break;
            case OPERATION.edit:
                update = this.editCalcDetail(update, paramNo, detailNo, value);
                break;
            case OPERATION.delete:
                update = this.deleteCalcDetail(update, paramNo, detailNo);
                break;
            default: break;
        }
        this.setState({ calcPointSet: update });    //編集内容保存
    }
    //#endregion
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { editingPointNo, show, isReadOnly, lookUp } = this.props;
        const { registerType, calcPointSet, showOperandModal, showSettingModal, editingParamNo, addStartNo, isCoef, isLoading, messageModalInfo, disableAddButton, addableNumber } = this.state;
        const canSave = _.every(calcPointSet, (parameter) => {
            return _.get(parameter.calcDetails, ["0", "detailNo"])
        })

        return (
            <MessageModal
                title="演算ポイント編集"
                show={show}
                bsSize="large"
                buttonStyle="save"
                disabled={isLoading || !canSave}
                className="calc-point-dialog"
                onCancel={() => this.handleClick(OPERATION.cancel)}
                onOK={() => this.handleClick(OPERATION.save)}
            >
                <TypeSelectSwitch
                    selectValue={registerType}
                    onChange={(value) => this.setState({ registerType: value, calcPointSet: this.addOperandBox(null, value) })}
                />
                <EditExpressionContents
                    disableAddButton={disableAddButton}
                    isLoading={isLoading}
                    registerType={registerType}
                    calcPointSet={calcPointSet}
                    onRemoveClick={(paramNo, detailNo, operation) => this.handleChangeCalcDetails(paramNo, detailNo, operation)}
                    onChangeCalcPoint={(paramNo, operation, value) => this.handleChangeCalcPoint(paramNo, operation, value)}
                    onOpenModal={(type, paramNo) => this.handleOpenModal(type, paramNo)}
                />
                <AddCalcTargetModal
                    editingPointNo={editingPointNo}
                    calcInfo={_.find(calcPointSet, { 'paramNo': editingParamNo })}
                    isGroupAlarm={registerType === CALC_TARGET_TYPE.groupAlarm}
                    addableNumber={addableNumber}
                    show={showOperandModal}
                    startNo={addStartNo}
                    isCoef={isCoef}
                    lookUp={lookUp}
                    onClick={(type, data) => this.handleClickAddModal(type, data)}
                    onChangeCalcDetails={(add) => this.handleChangeCalcDetails(editingParamNo, null, OPERATION.add, add)}
                />
                {editingParamNo &&
                    <CalcSettingModal
                        isLoading={isLoading}
                        isGroupAlarm={registerType === CALC_TARGET_TYPE.groupAlarm}
                        show={showSettingModal}
                        calcInfo={_.find(calcPointSet, { 'paramNo': editingParamNo })}
                        onClick={(type, data) => this.handleClickSettingModal(type, data)}
                        onChangeCalcPoint={(type, value) => this.handleChangeCalcPoint(editingParamNo, type, value)}
                    />
                }
                <MessageModal
                    {...messageModalInfo}
                    bsSize="small"
                    onCancel={() => this.setState({ messageModalInfo: { show: false } })}
                    onOK={() => this.handleClickOK()}
                />
            </MessageModal>
        )
    }
    //#endregion

    //#region その他関数

     /**
     * 画面で不要なポイント情報を削除する
     */
    omitCalcPointSet(calcPointSet) {
        return calcPointSet && calcPointSet.map((info) => {
            info.calcDetails && info.calcDetails.map((point) => {
                if (point.valueType === OPERAND_TYPE.point) {
                    point = _.pick(point, ['systemId', 'pointNo', 'pointName']);
                }
            })
        })
    }

    //#region 保存・キャンセル
    /**
     * 編集した演算式情報を保存する
     */
    saveCalcInfo() {
        if (this.props.onSave) {
            let saveData = this.state.calcPointSet;
            if (this.state.registerType === CALC_TARGET_TYPE.groupAlarm) {
                saveData.map((calcSet) => {
                    calcSet.calcDetails.map((detail) => {
                        detail.valueType = calcSet.sumType; //注意アラーム件数/異常アラーム件数設定
                    })
                })
            }
            this.props.onSave(saveData);
        }
    }

    /**
     * モーダルを閉じる
     */
    closeModal() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }
    //#endregion

    //#region　演算対象追加モーダル表示・非表示
    /**
    * 演算対象追加モーダル表示
    */
    showAddOperandModal(paramNo) {
        const paramIndex = this.getCalcPointIndex(this.state.calcPointSet, paramNo);
        const targetCalcDetails = this.state.calcPointSet[paramIndex].calcDetails;
        const maxNumber = targetCalcDetails.length;
        const pointNumber = _.size(targetCalcDetails);
        this.setState({ showOperandModal: true, editingParamNo: paramNo, addStartNo: maxNumber + 1, addableNumber: MAX_POINT_NUM - pointNumber });
    }

    /**
    * 演算対象追加モーダル非表示
    */
    hideAddOperandModal() {
        this.setState({ showOperandModal: false, editingParamNo: null, addStartNo: null, addableNumber:null });
    }
    //#endregion

    //#region 演算設定モーダル
    /**
    * 演算設定モーダル非表示
    */
    hideCalcSettingModal() {
        this.setState({ showSettingModal: false, editingParamNo: null });
    }
    //#endregion

    //#region パラメータ情報(calcPointSet)操作
    /**
    * パラメータ追加
    */
    addOperandBox(update, value, paramNo) {
        let type = this.state.registerType;
        if (value) {
            type = value;
        }
        const emptyBoxInfo = {
            paramNo:  paramNo >= 0? paramNo+1: update? update.length + 1 : 1 ,
            calcType: !update || update.length === 0 || paramNo===0 ? null:CALC_TYPE.plus.id,  //パラメータ1の場合はnull
            isAbsolute: false,
            isCoef: false,
            sumType: type === CALC_TARGET_TYPE.groupAlarm ? OPERAND_TYPE.alarm : SUM_TYPE.total,
            calcDetails: []
        };
        const beforeInsert = _.cloneDeep(update);
        update = [];
        if (!beforeInsert || paramNo===0) {    //パラメーターが登録されていない場合
            update.push(emptyBoxInfo);
        }
        if(beforeInsert) {
            beforeInsert.forEach((param) => {
                if (param.paramNo <= paramNo) {
                    update.push(param);     //挿入位置より前の場合はそのまま
                    if (param.paramNo === paramNo) {
                        update.push(emptyBoxInfo);  //挿入
                    }
                }
                else if (param.paramNo > paramNo) {
                    let reNumbering = param;    //挿入位置より後の場合はパラメータ番号を1つずらす
                    reNumbering.paramNo++;
                    if (paramNo === 0) {    //先頭に挿入された場合
                        reNumbering.calcType = CALC_TYPE.plus.id;
                    }
                    update.push(reNumbering);
                }
            })
        }
        return update;
    }

    /**
    * パラメータ情報編集
    */
    editOperandBox(edit, paramNo, value) {
        const editIndex = this.getCalcPointIndex(edit, paramNo);
        edit[editIndex] = { ...edit[editIndex], ...value };
        return edit;
    }

    /**
    * パラメータ削除
    */
    deleteOperandBox(edit, paramNo) {
        if (this.state.calcPointSet.length > 1) {
            const deleteIndex = edit.findIndex(operand => operand.paramNo === paramNo);
            edit.splice(deleteIndex, 1);
            for (var i = deleteIndex; edit.length > i; i++) {
                edit[i].paramNo--;    //削除パラメータ以降のパラメータ番号を-1する
            }
            edit[0].calcType = null;
        }
        else {
            edit = [{
                paramNo: 1,
                calcType: null,
                isAbsolute: false,
                isCoef: false,
                sumType: edit[0].sumType === CALC_TARGET_TYPE.groupAlarm ? OPERAND_TYPE.alarm : SUM_TYPE.total,
                calcDetails: []
            }];
        }
        return edit;
    }
    //#endregion

    //#region パラメータ詳細情報(calcDetail)操作
    /**
    * calcDetail追加
    * @param {array} edit   編集対象calcPointSet
    * @param {int} paramNo  calcDetailを追加するパラメータ番号
    * @param {obj} calcDetailsArray    追加するcalcDetailの配列
    */
    addCalcDetail(edit, paramNo, calcDetailsArray) {
        const addParamIndex = this.getCalcPointIndex(edit, paramNo);
        calcDetailsArray && calcDetailsArray.map((detail) => {
            detail.isCoef = edit[addParamIndex].isCoef == true; //換算値情報設定
            edit[addParamIndex].calcDetails.push(detail);
        })
        
        return edit;
    }

    /**
    * calcDetail編集
    * @param {array} edit   編集対象calcPointSet
    * @param {int} paramNo  編集するcalcDetailのパラメータ番号
    * @param {int} detailNo 編集するcalcDetailパラメータ詳細番号
    * @param {obj} value    編集後のするcalcDetail
    */
    editCalcDetail(edit, paramNo, detailNo, value) {
        const editParamIndex = this.getCalcPointIndex(edit, paramNo);
        const editDetailIndex = this.getCalcDetailIndex(edit, editParamIndex, detailNo);
        const beforeDetails = edit[editParamIndex].calcDetails[editDetailIndex];    //編集前パラメータ詳細情報取得
        edit[editParamIndex].calcDetails[editDetailIndex] = { ...beforeDetails, ...value }; //編集前情報に更新情報をマージ
        return edit;
    }

    /**
    * calcDetail削除
    * @param {array} edit   編集対象calcPointSet
    * @param {int} paramNo  削除するcalcDetailのパラメータ番号
    * @param {int} detailNo 削除するcalcDetailパラメータ詳細番号
    */
    deleteCalcDetail(edit, paramNo, detailNo) {
        const deleteParamIndex = this.getCalcPointIndex(edit, paramNo);
        const deleteDetailIndex = this.getCalcDetailIndex(edit, deleteParamIndex, detailNo);
        edit[deleteParamIndex].calcDetails.splice(deleteDetailIndex, 1);
        for (var i = deleteDetailIndex; edit[deleteParamIndex].calcDetails.length > i; i++) {
            edit[deleteParamIndex].calcDetails[i].detailNo--;    //削除詳細情報以降の詳細番号を-1する
        }
        if (edit[deleteParamIndex].operandType === OPERAND_TYPE.constant
            && edit[deleteParamIndex].calcDetails.length < 1) {    //固定値で値がすべて削除された場合パラメータごと削除する
            edit = this.deleteOperandBox(edit, paramNo);
        }
        return edit;
    }
    //#endregion

    //#region インデックス取得
    /**
    * calcPointからparamNoが一致するパラメータのインデックスを取得する
    */
    getCalcPointIndex(calcPoint, paramNo) {
        return calcPoint.findIndex(operand => operand.paramNo === paramNo);
    }

    /**
    * calcPointからdetailsNoが一致するパラメータ詳細情報のインデックスを取得する
    */
    getCalcDetailIndex(calcPoint, paramIndex, detailNo) {
        return calcPoint[paramIndex].calcDetails.findIndex(operand => operand.detailNo === detailNo);
    }
    //#endregion
    //#endregion
}

EditExpressionModal.propTypes = {
    editingPointNo: PropTypes.number,   //編集中ポイント番号
    calcPointSet:PropTypes.obj,     //編集中ポイント演算ポイント情報
    lookUp: PropTypes.obj,          //検索用ルックアップ情報
    show: PropTypes.bool,           //モーダルを表示するかどうか
    isReadOnly: PropTypes.bool,     //読み取り専用かどうか
    onSave: PropTypes.func,         //保存ボタン押下イベント関数
    onCancel: PropTypes.func,       //キャンセルボタン押下イベント関数
}

//#region SFC
/**
* 登録対象セレクトスイッチ
*/
const TypeSelectSwitch = (props) => {
    const swichValues = [
        { value: CALC_TARGET_TYPE.expression, text: "演算式" },
        { value: CALC_TARGET_TYPE.groupAlarm, text: "グループアラーム" }
    ];

    return (
        <div className="mb-1">
            <ToggleSwitch
                name="typeSelectSwitch"
                swichValues={swichValues}
                value={props.selectValue}
                defaultValue={CALC_TARGET_TYPE.expression}
                onChange={(value) => props.onChange && props.onChange(value)}
            />
        </div>
    ); 
}

/**
* 演算式登編集用コンテンツ
*/
const EditExpressionContents = (props) => {
    const { calcPointSet, registerType, isLoading, disableAddButton } = props;
    const { onRemoveClick: handleRemoveClick, onChangeCalcPoint: handleChangeCalcPoint, onOpenModal: handleOpenModal } = props;

    return (
        <div>
            {calcPointSet && calcPointSet.sort((a, b) => a.paramNo - b.paramNo).map((calcInfo, index) => {
                return (
                    <div className="flex-column">
                        {index === 0 &&
                            <div><AddButton disabled={disableAddButton} bsSize="xs" className="pull-right" onClick={() => handleChangeCalcPoint(0, OPERATION.add)} /></div>
                        }
                        <EditExpressionBox
                            isGroupAlarm={registerType === CALC_TARGET_TYPE.groupAlarm}
                            calcPointSet={calcInfo}
                            isLoading={isLoading}
                            onChangeCalcPoint={(paramNo, operation, value) => handleChangeCalcPoint(paramNo, operation, value)}
                            onRemoveClick={(detailNo) => handleRemoveClick(calcInfo.paramNo, detailNo, OPERATION.delete, null)}
                            onOpenModal={(type) => handleOpenModal(type, calcInfo.paramNo)}
                        />
                        <div><AddButton disabled={disableAddButton} bsSize="xs" className="pull-right" onClick={() => handleChangeCalcPoint(calcInfo.paramNo, OPERATION.add)} /></div>
                    </div>
                )
            })}
        </div>
    );
}
//#endregion