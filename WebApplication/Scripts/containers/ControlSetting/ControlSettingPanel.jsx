/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSetting画面
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
import { setAuthentication } from 'Authentication/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { closeModal, confirmDelete } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import { Grid, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import { RegisterButton } from 'Assets/GarmitButton';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MultiSelectForm from 'Common/Form/MultiSelectForm';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ControlSettingListBox from 'ControlSetting/List/ControlSettingListBox';

import { FUNCTION_ID_MAP, getAuthentication, readOnlyByLevel, LAVEL_TYPE } from 'authentication';
import { CONTROL_MODE, CONTROL_MODE_OPTIONS } from 'constant';
import { VALIDATE_STATE } from 'inputCheck';

//検索条件のターゲット
const SEARCH_TARGETS = ['locations', 'enterprises'];

const OK_OPERATION_DELETE = 'delete';

/**
 * ControlSetting画面のコンポーネント
 */
class ControlSettingPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const { lookUp } = this.props.searchCondition;
        const { authentication, triggerTypes, commandStatuses } = this.props;

        if (!(authentication&&authentication.level)) {
            this.loadAuthentication();
        }

        if (!lookUp || !(triggerTypes && triggerTypes.length > 0) || !commandStatuses) {
            this.props.requestInitInfo();
        }
    }

    /**
     * render
     */
    render() {
        const { editControlCondition, searchCondition, searchResult, controlCondition, commandStatuses } = this.props;
        const { modalState, waitingInfo, isLoading } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);
        return (
            <Content>
                <div className="flex-center-between mb-05" >
                    <ControlModeSwitch 
                        isReadOnly={loading}
                        mode={editControlCondition.mode} 
                        options={CONTROL_MODE_OPTIONS} 
                        onChange={this.handleModeChanged} />
                    {!readOnly&&
                        <RegisterButton disabled={isLoading} onClick={this.handleRegistClick} />
                    }
                </div>
                <SearchConditionBox
                    targets={SEARCH_TARGETS}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.changeConditon(condition)}
                    onSearchClick={(condition) => this.searchControlList(condition)}
                    onClear={() => this.clearCondition()}
                    searchButtonDisabled={editControlCondition.validateStatus.state !== VALIDATE_STATE.success}
                    isLoading={loading}
                >
                    {editControlCondition.mode === CONTROL_MODE.command&&                    
                        <Grid fluid>
                            <StatusMultiSelectForm 
                                isReadOnly={loading}
                                options={commandStatuses&&Object.keys(commandStatuses).map((key) => { return { value: key, name: commandStatuses[key] } })} 
                                statuses={editControlCondition.statuses}
                                validate={editControlCondition.validateStatus}
                                onChange={(value) => this.props.setStatusesCondition(value)}
                            />
                        </Grid>
                    }
                </SearchConditionBox>
                <ControlSettingListBox
                    controlMode={controlCondition.mode}
                    isLoading={loading}
                    isReadOnly={readOnly}
                    controlResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.updateResult(controlCondition.mode)}
                    onEdit={(ids) => this.handleEditClick(ids)}
                    onDelete={(ids) => this.handleDeletelick(ids)}
                    onExecuteCommand={(id) => this.props.requestExecuteCommand(id)}
                    onStopCommand={(id) => this.props.requestStopCommand(id)}
                />
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

    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.controlSettingMaintenance, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#endregion

    //#region イベントハンドラ

    /**
     * モード変更イベント
     */
    handleModeChanged = (value) => {
        if (value !== this.props.editControlCondition.mode) {
            this.props.setModeCondition(value, this.props.commandStatuses);
            this.props.setSearchCondition(null);    //検索条件クリア
            this.props.setControlCondition({ mode: value, statuses: [] },);   //検索条件クリア
            this.props.setDisplayState(null);
            this.props.setSearchResult(null);       //検索結果をクリアする
        }
    } 

    /**
     * 新規作成ボタンクリックイベント
     */
    handleRegistClick = () => {
        if (this.props.editControlCondition.mode === CONTROL_MODE.command) {
            this.props.requestGetConrtolCommands(null, true, this.transitionScreen );
        } else {
            this.props.requestGetTriggerConrtols(null, true, this.transitionScreen );
        }
    }
    
    /**
     * 編集ボタンクリックイベント
     * @param {array} ids 制御ID一覧
     */
    handleEditClick(ids) {
        if (this.props.controlCondition.mode === CONTROL_MODE.command) {
            this.props.requestGetConrtolCommands(ids, false, this.transitionScreen );
        } else {
            this.props.requestGetTriggerConrtols(ids, false, this.transitionScreen );
        }
    }

    /**
     * 削除ボタンクリックイベント
     * @param {array} ids 制御ID一覧
     */
    handleDeletelick(ids) {
        this.props.setDeleteControlIds(ids);
        this.props.confirmDelete({ targetName: '選択した制御', okOperation: OK_OPERATION_DELETE});
    }

    /**
     * メッセージモーダルの確認ボタンクリックイベント
     */
    handleOK() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === OK_OPERATION_DELETE) {
            if (this.props.controlCondition.mode === CONTROL_MODE.command) {
                this.props.requestDeleteConrtolCommands();
            } else {
                this.props.requestDeleteTriggerConrtols();
            }
        }
    }

    /**
     * メッセージモーダルの閉じる（キャンセル）ボタンクリックイベント
     */
    handleCloseModal() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === OK_OPERATION_DELETE) {
            this.props.setDeleteControlIds(null);       //クリア
        }
    }

    //#endregion

    //#region 検索関連

    /**
     * 検索条件を変更する
     * @param {object} target 検索条件
     */
    changeConditon(target) {
        var condition = _.cloneDeep(target);
        this.props.setEditingCondition(condition);
    }

    /**
     * 制御一覧を検索する
     * @param {*} condition 検索条件
     */
    searchControlList(condition) {
        this.props.setSearchCondition(condition);
        this.props.setControlCondition(this.props.editControlCondition);
        if (this.props.editControlCondition.mode === CONTROL_MODE.command) {
            this.props.requestGetControlCommandList(true);
        } else {
            this.props.requestGetTriggerControlList(true);
        }
    }

    /**
     * 検索条件をクリアする
     */
    clearCondition() {
        this.props.clearStatusesCondition(this.props.commandStatuses);
    }

    /**
     * 制御一覧を更新する
     */
    updateResult(mode) {
        if (mode === CONTROL_MODE.command) {
            this.props.requestGetControlCommandList(false);
        } else {
            this.props.requestGetTriggerControlList(false);
        }
    }

    //#endregion

    //#region 編集画面遷移

    /**
     * 画面遷移時の処理
     */
    transitionScreen = () => {
        browserHistory.push({ pathname: '/Maintenance/ControlSetting/Edit' });
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
        authentication: state.authentication,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        modalState: state.modalState,
        searchCondition: state.searchCondition,
        searchResult: state.searchResult,
        commandStatuses: state.commandStatuses,
        controlCondition: state.controlCondition,
        editControlCondition: state.editControlCondition
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
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        changeLoadState:() => dispatch(changeLoadState()),
        confirmDelete:(data) => dispatch(confirmDelete(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ControlSettingPanel);

/**
 * 制御モードスイッチ
 */
const ControlModeSwitch = ({mode, options, isReadOnly, onChange: handleChangeMode}) => {
    return <ToggleSwitch
                value={mode}
                name="controlMode"
                swichValues={options}
                disbled={isReadOnly}
                onChange={(value) => handleChangeMode(value)}
            />
}

/**
 * 実行ステータスドロップダウン 
 */
const StatusMultiSelectForm = ({ isReadOnly, options, statuses, validate, onChange: handleChangeStatuses }) => {
    return (
        <Row className="flex-center-left">
            <Col md={12}>
                <label>ステータス</label>
                <MultiSelectForm
                    disabled={isReadOnly}
                    value={statuses}
                    options={options}
                    validationState={validate.state}
                    helpText={validate.helpText}
                    onChange={(values) => handleChangeStatuses(values)}
                />
            </Col>
        </Row>
    );
}