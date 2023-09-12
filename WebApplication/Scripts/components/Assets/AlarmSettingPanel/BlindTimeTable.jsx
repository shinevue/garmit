/**
 * Copyright 2017 DENSO Solutions
 * 
 * 不感時間テーブル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AlarmInfoTable from 'Assets/AlarmSettingPanel/AlarmInfoTable.jsx';
import { validateInteger } from 'inputCheck';

export default class BlindTimeTable extends Component {
    constructor(props) {
        super(props);
        const editInfo = this.addValidationInfo(_.cloneDeep(this.props.alarmInfo))
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
            const editInfo = this.addValidationInfo(_.cloneDeep(nextProps.alarmInfo));
            this.setState({ editInfo: editInfo, canSave: _.every(editInfo, { 'validationInfo': { 'state': 'success' } }) });
        }
    }

    /**
    * 入力内容変更イベント
    */
    handleChangeInput(id, value) {
        //値更新
        let update = _.cloneDeep(this.state.editInfo);
        const changeIndex = _.findIndex(update, { 'id': id });
        update[changeIndex].value = value
        update[changeIndex].validationInfo = this.validateNumber(value);    //入力チェック

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
        const { alarmInfo, editMode, isLoading } = this.props;
        const { editInfo } = this.state;
        return (
            <AlarmInfoTable
                title="不感時間(秒)"
                numberType="integer"
                alarmInfo={editInfo}
                editMode={editMode}
                isLoading={isLoading}
                onChange={(id, value) => this.handleChangeInput(id, value)}
            />
        );
    }

    //#region 入力チェック
    /**
    * アラーム情報すべての入力チェック情報を追加する
    */
    addValidationInfo(alarmInfo) {
        alarmInfo.map((info) => {
            info.validationInfo = this.validateNumber(info.value);
        })
        return alarmInfo;
    }

    /**
     * フォーマット入力チェックを行う
     * @param {string} format　数値のフォーマット
     * @param {string} inputNumber　入力された数値
     */
    validateNumber(inputNumber) {
        return validateInteger(inputNumber, 0, 2147483647, true);
    }
    //#endregion
}

BlindTimeTable.propTypes = {
    pointNo: PropTypes.number,  //ポイント番号
    alarmInfo: PropTypes.arrayOf(    //閾値情報
        PropTypes.shape({
            id: PropTypes.oneOf(        //ID（プロパティ名）
                ['upperError', 'upperAlarm', 'lowerAlarm', 'lowerError']
            ),
            name: PropTypes.string,     //名称
            value: PropTypes.number,    //値
            isError: PropTypes.bool      //異常かどうか（背景色判定に使用）
        })
    ),
    editMode: PropTypes.bool,   //編集モードかどうか
    isLoading: PropTypes.bool,   //ロード中かどうか
    onChangeAcceptable: PropTypes.func   //保存可能状態変更イベント関数
};