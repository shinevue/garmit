/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSettingEdit画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Actions from './actions.js';
import { closeModal, confirmSave } from 'ModalState/actions.js';

import Content from 'Common/Layout/Content';
import ControlCommandBox from 'ControlSetting/Edit/ControlCommandBox';
import ControlCommandBulkBox from 'ControlSetting/Edit/ControlCommandBulkBox';
import TriggerControlBox from 'ControlSetting/Edit/TriggerControlBox';
import TriggerControlBulkBox from 'ControlSetting/Edit/TriggerControlBulkBox';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { CONTROL_MODE } from 'constant';
import { getChildrenLocationList } from 'controlSettingUtility';

/**
 * ControlSettingEdit画面のコンポーネント
 */
class ControlSettingEditPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }
   
    /**
     * render
     */
    render() {
        const { editMode, controlOperations, controlLocations, triggerTypes, demandSet, thresholds, invalid, isLoading } = this.props;
        const { editControlCommands, editTriggerControls, editTriggerControlOperations } = this.props;
        const { editBulkKeys, bulkControlCommand, bulkTriggerControl } = this.props;
        const { modalState, waitingInfo } = this.props;
        const { locations } = this.props.searchCondition.lookUp;
        
        return (
            <Content>
                <SaveCancelButton 
                    canSave={this.canSave(editMode, invalid)} 
                    onClickSave={() => this.showSaveConfirmModel()}  
                    onClickCancel={() => this.handleCancelClick()} 
                />
                {editMode === CONTROL_MODE.command&&editControlCommands&&(
                    editControlCommands.length > 1 ?
                        <ControlCommandBulkBox 
                            editKeys={editBulkKeys} 
                            controlCommand={bulkControlCommand}
                            beforePulseSetList={editControlCommands.map((command) =>{ return { id: command.controlCmdId, pulseSet: command.pulseSet }})}
                            isLoading={isLoading}
                            onChange={(keys, value, isError) => this.props.changeBulkControlCommand(keys, value, isError)}
                        />
                    :
                        <ControlCommandBox 
                            controlCommand={editControlCommands[0]}
                            isLoading={isLoading}
                            onChange={(key, value, isError) => this.props.changeEditControlCommands(key, value, isError)}
                        />   
                )}
                {editMode === CONTROL_MODE.trigger&&editTriggerControls&&(
                    editTriggerControls.length > 1 ?
                        <TriggerControlBulkBox
                            editKeys={editBulkKeys} 
                            triggerControl={bulkTriggerControl}
                            isLoading={isLoading}
                            onChange={(keys, value, isError) => this.props.changeBulkTriggerControl(keys, value, isError)}
                            onChangeTrigger={(keys, value, isError) => this.changeBulkTrriger(keys, value, isError)}
                        />
                    :
                        <TriggerControlBox 
                            triggerTypes={triggerTypes}
                            demandSet={demandSet}
                            thresholds={thresholds}
                            locations={locations} 
                            triggerControl={editTriggerControls[0]}
                            triggerControlOperations={editTriggerControlOperations}
                            controlOperations={controlOperations}
                            controlLocations={controlLocations}
                            isLoading={isLoading}
                            onChange={(key, value, isError) => this.props.changeEditTriggerControls(key, value, isError)}
                            onChangeOperations={(value, isError) => this.props.changeEditTriggerControlOperations(value, isError)}   
                            onChangeLocation={(key, value, isError) => this.changeLocation(key, value, isError)}          
                            onChangeTrigger={(key, value, locationId, isError) => this.changeTrriger(key, value, locationId, isError)}
                            onChangePoint={(key, value, triggerId, isError) => this.chnageTriggerPoint(key, value, triggerId, isError)}
                            onSaveDemandSet={(demandSet, callback) => this.saveDemandSet(demandSet, callback)}
                        />
                )}
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onOK={() => this.handleOK()}
                              onCancel={() => this.handleCloseModal()}>
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />            
            </Content>
        );
    }    

    //#region モーダル関係

    /**
     * 保存確認モーダルを表示する
     */
    showSaveConfirmModel() {
        this.props.confirmSave({ targetName: '編集内容', okOperation: 'save'});
    }

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK() {
        this.props.closeModal();
        if (this.props.editMode === CONTROL_MODE.command) {
            this.props.requestSaveControlCommands();
        } else {
            this.props.requestSaveTriggerControls();
        }
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal() {
        if (this.props.modalState.okOperation === "transition") {
            this.props.clearEditInfo();
            this.transitionScreen();         //保存に成功した場合、画面移動
        }
        this.props.closeModal();
    }

    //#endregion

    //#region トリガー制御編集関連

    /**
     * ロケーション変更
     * @param {string} key キー
     * @param {object} location 変更後のロケーション
     * @param {boolean} isError エラーかどうか
     */
    changeLocation(key, location, isError) {
        this.props.changeEditTriggerControls(key, location, isError);

        const locations = location ? getChildrenLocationList(this.props.searchCondition.lookUp.locations, location.locationId) : [];
        this.props.requestChnageLocation(location, locations);
    }

    /**
     * トリガー変更
     * @param {string} key キー
     * @param {object} triggerType 変更後のトリガー種別
     * @param {object} location ロケーション情報
     * @param {boolean} isError エラーかどうか
     */
    changeTrriger(key, triggerType, location, isError){
        this.props.changeEditTriggerControls(key, triggerType, isError);
        const locations = location ? getChildrenLocationList(this.props.searchCondition.lookUp.locations, location.locationId) : [];
        this.props.requestChangeTriggerType(triggerType.triggerId, locations);
    }

    /**
     * 一括編集のトリガー種別変更
     * @param {*} keys 編集対象キーリスト
     * @param {*} value 変更後のトリガー閾値
     * @param {*} isError エラーかどうか
     */
    changeBulkTrriger(keys, value, isError) {
        this.props.changeBulkTriggerControl(keys, value, isError);
        this.props.requestChangeTriggerType(value.triggerType.triggerId, null, true);
    }

    /**
     * トリガーポイント変更
     * @param {*} key 
     * @param {*} point 
     * @param {*} triggerId 
     * @param {*} isError 
     */
    chnageTriggerPoint(key, point, triggerId, isError) {
        this.props.changeEditTriggerControls(key, point, isError);
        this.props.requestChangeTriggerPoint(triggerId, point&&point.pointNo);
    }

    //#endregion

    //#region デマンド設定保存

    /**
     * デマンド設定を保存する
     * @param {object} demandSet デマンド設定
     * @param {function} callback コールバック関数
     */
    saveDemandSet(demandSet, callback) {
        this.props.requestSaveDemandSet(demandSet, callback);
    }

    //#endregion

    //#region 共通

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancelClick() {
        this.props.clearEditInfo();
        if (this.props.isChangeDemandSet) {
            this.props.searchCondition && this.props.searchCondition.conditions && this.props.requestGetTriggerControlList();
            this.props.changeIsChangeDemandSet(false);
        }
        this.transitionScreen();
    }

    /**
     * 画面遷移
     */
    transitionScreen() {
        browserHistory.push({ pathname: '/Maintenance/ControlSetting' });
    }

    /**
     * 保存が無効かどうか
     * @param {*} mode モード
     * @param {*} invalid 無効状態
     */
    canSave(mode, invalid) {
        if (mode === CONTROL_MODE.command) {
            return !invalid.controlCommnand;
        } else {
            return !(invalid.triggerControl || invalid.triggerControlOperations);
        }
    }

    //#endregion


}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        modalState: state.modalState,
        searchCondition: state.searchCondition,
        editMode: state.editMode,
        editControlCommands: state.editControlCommands,
        editTriggerControls: state.editTriggerControls,
        editTriggerControlOperations: state.editTriggerControlOperations,
        editBulkKeys: state.editBulkKeys,
        bulkControlCommand: state.bulkControlCommand,
        bulkTriggerControl: state.bulkTriggerControl,
        controlOperations: state.controlOperations,
        controlLocations: state.controlLocations,
        demandSet: state.demandSet,
        thresholds: state.thresholds,
        triggerTypes: state.triggerTypes,
        invalid: state.invalid,
        isChangeDemandSet: state.isChangeDemandSet
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        closeModal: () => dispatch(closeModal()),
        confirmSave:(data) => dispatch(confirmSave(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ControlSettingEditPanel);

/**
 * 保存キャンセルボタン
 */
const SaveCancelButton = ({canSave, disabled, onClickSave:handleClickSave, onClickCancel:handleClickCancel }) => {
    return (
        <div className="flex-center-right mb-05">
            <SaveButton
                disabled={!canSave || disabled}
                className="mr-05"
                onClick={handleClickSave}
            />
            <CancelButton
                disabled={disabled}
                onClick={handleClickCancel}
            />
        </div>
    );
}