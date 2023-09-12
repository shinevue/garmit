/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイントアラーム情報設定パネル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, HelpBlock, Table, Panel } from 'react-bootstrap';

import ThresholdTable from 'Assets/AlarmSettingPanel/ThresholdTable.jsx';
import BlindTimeTable from 'Assets/AlarmSettingPanel/BlindTimeTable.jsx';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import { CancelButton, SaveButton, EditButton } from 'Assets/GarmitButton';

import { hasValue } from 'thresholdUtility';

//ボタン種別
const BUTTON_TYPE = {
    edit: 0,
    save:1,
    cancel: 2,
    update:3
}

/**
 * ポイントアラーム情報設定パネル
 * <AlarmInfoPanel />
 * @param {object} alarmInfo　アラーム設定情報
 * @param {bool} isEditMode 編集モードかどうか
 */
export default class AlarmInfoPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alarmInfo: this.generateAlarmInfoObject(this.props.pointInfo),
            canSave: null   //編集内容を保存できるかどうか
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
    * コンポーネントをアップデートするかどうか
    */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.canSave !== nextState.canSave
            || this.props.isEditMode !== nextProps.isEditMode) {
            //モード変更時・保存ボタン状態変更時
            return true;
        }

        //更新ボタン押下によるアップデート
        if (this.state.alarmInfo !== nextState.alarmInfo) {
            return true;
        }

        //ロード状態変更時
        if (this.props.isLoading !== nextProps.isLoading) {
            return true;
        }
    }

    /**
    * 新たなPropsを受け取ったときに実行
    */
    componentWillReceiveProps(nextProps) {
        if (this.props.pointInfo !== nextProps.pointInfo) {
            this.setState({ alarmInfo: this.generateAlarmInfoObject(nextProps.pointInfo) });
        }
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * ボタン押下イベント
     */
    handleClick(type) {
        switch (type) {
            case BUTTON_TYPE.save:
                if (this.props.onClickSave) {
                    //2つのテーブルの編集内容をマージしたものを渡す
                    this.props.onClickSave(this.margeEditInfo());
                }
                break;
            case BUTTON_TYPE.cancel:
                this.changeEditMode(false);
                break;
            case BUTTON_TYPE.edit:
                this.changeEditMode(true);
                break;
            case BUTTON_TYPE.update:
                if (this.props.onClickUpdate) {
                    this.props.onClickUpdate();
                }
                break;
            default: break;
        }
    }

    /**
     * 閾値テーブル保存可能状態変更イベントハンドラ
     * @param {bool} update　変更された保存可能状態
     * @param {bool} another 変更されたテーブルではないテーブルの保存可能状態
     */
    handleChangeAcceptable(update, another) {
        if (update && another) {
            //どちらも保存可能な場合のみ保存ボタン押下可能
            this.setState({ canSave: true });
        }
        else {
            this.setState({ canSave: false });
        }
    }

    /**
     * render
     */
    render() {
        const { pointInfo, isEditMode, isLoading, isReadOnly } = this.props;
        const { alarmInfo, editInfo, canSave } = this.state;
        return (
            <Panel header={<PanelHeader isEditMode={isEditMode} disabled={isLoading} isReadOnly={isReadOnly} canSave={canSave} onClick={(type) => this.handleClick(type)} />}>
                <Row>
                    <Col xs={6}>
                        <ThresholdTable
                            ref="thresholdTable"
                            unit={pointInfo.unit}
                            format={pointInfo.format}
                            alarmInfo={alarmInfo.thresholdAlarmInfo}
                            editMode={isEditMode}
                            isLoading={isLoading}
                            onChangeAcceptable={(update) => this.handleChangeAcceptable(update, this.refs.blindTimeTable.state.canSave)}
                        />
                        
                    </Col>
                    <Col xs={6}>
                        <BlindTimeTable
                            ref="blindTimeTable"
                            alarmInfo={alarmInfo.blindTimeAlarmInfo}
                            editMode={isEditMode}
                            isLoading={isLoading}
                            onChangeAcceptable={(update) => this.handleChangeAcceptable(update, this.refs.thresholdTable.state.canSave)}
                        />
                    </Col>
                </Row>
                {isEditMode && <span>閾値は 上限異常>上限注意>下限注意>下限異常 となるよう入力してください</span>}
            </Panel>
        );
    }

    //#region その他関数
    /**
     * 閾値テーブルと不感時間テーブルの編集内容をマージする
     */
    margeEditInfo() {
        let thresholdInfo = _.cloneDeep(this.refs.thresholdTable.state.editInfo);
        let blindTimeInfo = _.cloneDeep(this.refs.blindTimeTable.state.editInfo);
        
        thresholdInfo = this.convertToKeyValue(thresholdInfo);
        blindTimeInfo = this.convertToKeyValue(blindTimeInfo);

        return _.merge(thresholdInfo, blindTimeInfo);
    }

    /**
     * idをkey、valueをvalueとするオブジェクトに変換する
     */
    convertToKeyValue(alarmInfo) {
        return _
            .chain(alarmInfo)
            .mapKeys(((value, key) => {
                return value.id;
            }))
            .mapValues((obj) => { return hasValue(obj.value)? Number(obj.value):null })
            .value();
    }

    /**
     * 編集モード変更
     * @param {bool} isEditMode 編集モードかどうか
     */
    changeEditMode(isEditMode) {
        if (isEditMode) {
            //編集モードになった場合canSaveの初期設定
            if (this.refs.thresholdTable.state.canSave && this.refs.blindTimeTable.state.canSave) {
                this.setState({ canSave: true });
            }
            else {
                this.setState({ canSave: false });
            }
        }

        if (this.props.onChangeMode) {
            this.props.onChangeMode(isEditMode);
        }
    }

    /**
     * アラーム情報オブジェクトを作成するする
     * @param {object} pointInfo ポイント情報
     */
    generateAlarmInfoObject(pointInfo) {
        return {
            thresholdAlarmInfo: this.generateThresholdInfo(pointInfo),
            blindTimeAlarmInfo: this.generateBlindTimeInfo(pointInfo)
        };
    }

    /**
     * 閾値アラーム情報を生成する
     * @param {object} pointInfo ポイント情報
     */
    generateThresholdInfo(pointInfo) {
        return [
            {
                id:"upperError",
                name:"上限異常",
                value: pointInfo.upperError,
                isError: true
            },
            {
                id: "upperAlarm",
                name: "上限注意",
                value: pointInfo.upperAlarm,
                isError: false
            },
            {
                id: "lowerAlarm",
                name: "下限注意",
                value: pointInfo.lowerAlarm,
                isError: false
            },
            {
                id: "lowerError",
                name: "下限異常",
                value: pointInfo.lowerError,
                isError: true
            }
        ];
    }

    /**
     * 不感時間アラーム情報を生成する
     * @param {object} pointInfo ポイント情報
     */
    generateBlindTimeInfo(pointInfo) {
        return [
            {
                id: "errorOccurBlindTime",
                name: "異常発生",
                value: pointInfo.errorOccurBlindTime,
                isError: true
            },
            {
                id: "alarmOccurBlindTime",
                name: "注意発生",
                value: pointInfo.alarmOccurBlindTime,
                isError: false
            },
            {
                id: "alarmRecoverBlindTime",
                name: "注意復旧",
                value: pointInfo.alarmRecoverBlindTime,
                isError: false
            },
            {
                id: "errorRecoverBlindTime",
                name: "異常復旧",
                value: pointInfo.errorRecoverBlindTime,
                isError: true
            }
        ];
    }
    //#endregion
}

AlarmInfoPanel.propTypes = {
    pointInfo: PropTypes.shape({
        upperError: PropTypes.Number,
        upperAlarm: PropTypes.Number,
        lowerAlarm: PropTypes.Number,
        lowerError: PropTypes.Number,
        errorOccurBlindTime: PropTypes.Number,
        alarmOccurBlindTime: PropTypes.Number,
        alarmRecoverBlindTime: PropTypes.Number,
        errorRecoverBlindTime: PropTypes.Number
    }),
    isEditMode: PropTypes.bool,
    isLoading: PropTypes.bool,
    onChangeMode: PropTypes.func,
    onClickSave: PropTypes.func
};

//#region SFC
/**
* パネルヘッダー
*/
const PanelHeader = (props) => {
    const { isEditMode, canSave, disabled, isReadOnly, onClick: handleClick } = props;
    return (
        <div className="flex-center-end">
            <div>{isReadOnly || !isEditMode ? "アラーム設定": "アラーム設定編集"}</div>
            <div>
                {isReadOnly ? <div />
                    :
                    isEditMode ?
                        <EditModeButton canSave={canSave} disabled={disabled} onClick={(type) => handleClick(type)} />
                        :
                        <DispModeButton disabled={disabled} onClick={(type) => handleClick(type)} />                    
                }
            </div>
        </div>
    );
}

/**
* 表示モードボタン
*/
const DispModeButton = ({ disabled, onClick: handleClick }) => (
    <div>
        <Button
            className="mr-05"
            bsStyle="default"
            disabled={disabled}
            onClick={() => handleClick(BUTTON_TYPE.update)}>
            <i className="fal fa-sync" />
        </Button>
        <EditButton disabled={disabled} onClick={() => handleClick(BUTTON_TYPE.edit)} />
    </div>
);

/**
* 編集モードボタン
*/
const EditModeButton = ({ canSave, disabled, onClick: handleClick})=> (
    <div>
        <SaveButton className="mr-05" disabled={!canSave || disabled} onClick={() => handleClick(BUTTON_TYPE.save)} />
        <CancelButton disabled={disabled} onClick={() => handleClick(BUTTON_TYPE.cancel)} />
    </div>
);
//#endregion


