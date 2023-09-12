/**
 * Copyright 2017 DENSO Solutions
 * 
 * 閾値テーブル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AlarmInfoTable from 'Assets/AlarmSettingPanel/AlarmInfoTable.jsx';
import { validateRealFormat } from 'inputCheck';

export default class ThresholdTable extends Component {
    constructor(props) {
        super(props);
        const editInfo = this.props.alarmInfo && this.addValidationInfo(_.cloneDeep(this.props.alarmInfo), this.props.format)
        this.state = {
            editInfo: editInfo,
            canSave: _.every(editInfo, { 'validationInfo': { 'state': 'success' } }),
        };
    }

    /**
    * 新たなPropsを受け取ったときに実行
    */
    componentWillReceiveProps(nextProps) {
        if (this.props.alarmInfo !== nextProps.alarmInfo || this.props.editMode !== nextProps.editMode) {
            //編集対象ポイント変更時
            const editInfo = this.addValidationInfo(_.cloneDeep(nextProps.alarmInfo), nextProps.format)
            this.setState({ editInfo: editInfo, canSave: _.every(editInfo, { 'validationInfo': { 'state': 'success' } }) });
        }
    }

    /**
    * 入力内容変更イベント
    */
    handleChangeInput(id, value, format) {
        //値更新
        let update = _.cloneDeep(this.state.editInfo);
        const changeIndex = _.findIndex(update, { 'id': id });
        update[changeIndex].value = value;
        update = this.validateInput(update, value, changeIndex, format);    //入力チェック
        this.setState({ editInfo: update });

        //保存可能状態変更
        const canSave = _.every(update, { 'validationInfo': { 'state': 'success' } });
        if (this.state.canSave !== canSave) {
            this.setState({ canSave: canSave });
            //保存可能状態が変更された場合は親に変更を伝える
            if (this.props.onChangeAcceptable) {
                this.props.onChangeAcceptable(canSave);
            }
        }
    }

    /**
     * render
     */
    render() {
        const { unit, format, editMode, isLoading } = this.props;
        const { editInfo } = this.state;
        return (
            <AlarmInfoTable
                title={unit ? "閾値(" + unit + ")" : "閾値"}
                numberType="real"
                format={format}
                alarmInfo={editInfo}
                editMode={editMode}
                isLoading={isLoading}
                onChange={(id, value) => this.handleChangeInput(id, value, format)}
            />
        );
    }

    //#region 入力チェック
    /**
    * アラーム情報すべての入力チェック情報を追加する
    */
    addValidationInfo(alarmInfo, format) {
        let withValidation = _.cloneDeep(alarmInfo);
        alarmInfo.map((info, index) => {
            withValidation = this.validateInput(withValidation, info.value, index, format);
        })
        return withValidation;
    }

    /**
    * 入力チェックを行う
    */
    validateInput(editInfo, inputValue, changeIndex, format) {
        //変更された値のフォーマットチェック
        const formatValidation = this.validateFormat(inputValue, format);
        editInfo[changeIndex].validationInfo = formatValidation;

        //空白を削除した入力値の配列を作成
        const inputValueArray = this.getCompactInputValue(editInfo);        

        //入力値の値が正しい順序(上限異常>上限注意>下限注意>下限異常)になっているかどうか判定
        const isValidOrder = this.isValidOrder(inputValueArray);

        //validationState変更
        editInfo.forEach((info, index) => {
            if (!_.get(editInfo[index], "validationInfo.helpText")) {
                if (info.value === "") {
                    editInfo[index].validationInfo = { state: "success" };
                }
                else {
                    editInfo[index].validationInfo = { state: isValidOrder ? "success" : "error" };
                }
            }
        })
        return editInfo;  
    }

    /**
     * フォーマット入力チェックを行う
     * @param {string} format　数値のフォーマット
     * @param {string} inputValue　入力された数値
     */
    validateFormat(inputValue, format) {
        return validateRealFormat(inputValue, -999999, 999999, true, format);
    }

    /**
    * 空白を削除した入力値の配列を取得する
    */
    getCompactInputValue(editInfo) {
        let inputValueArray = [];
        editInfo.forEach((info) => {
            if (info.value !== "" && info.value !== null && info.value !== undefined) {
                inputValueArray.push(info.value);
            }
        });
        return inputValueArray;
    }

    /**
    * 入力値の値が正しい順序(上限異常>上限注意>下限注意>下限異常)になっているかどうか
    */
    isValidOrder(inputValueArray) {
        let isValidOrder = true;
        inputValueArray.forEach((val, index) => {
            if (Number(val) <= Number(inputValueArray[index + 1])) {
                isValidOrder = false;
            }
        })
        return isValidOrder;
    }

    //#endregion
}
ThresholdTable.propTypes = {
    pointNo: PropTypes.number,  //ポイント番号
    unit: PropTypes.string,     //単位
    format: PropTypes.string,   //フォーマット
    alarmInfo: PropTypes.arrayOf(    //閾値情報
        PropTypes.shape({
            id: PropTypes.oneOf(        //ID（プロパティ名）
                ['upperError', 'upperAlarm', 'lowerAlarm', 'lowerError']
            ),                          
            name: PropTypes.string,     //名称
            value: PropTypes.number,    //値
            isError:PropTypes.bool      //異常かどうか（背景色判定に使用）
        })
    ),
    editMode: PropTypes.bool,   //編集モードかどうか
    isLoading:PropTypes.bool,   //ロード中かどうか
    onChangeAcceptable:PropTypes.func   //保存可能状態変更イベント関数
};