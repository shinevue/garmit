/**
 * @license Copyright 2020 DENSO
 * 
 * 案件編集画面
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
import { closeModal, confirmSave, changeModalState, confirmOverwrite, showErrorMessage } from 'ModalState/actions.js';

import { ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import { SaveHotKeyButton, CancelButton } from 'Assets/GarmitButton';
import AssetDetailBox from 'Assets/AssetDetailBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ProjectBox from 'Project/Edit/ProjectBox';
import ProjectBulkBox from 'Project/Edit/ProjectBulkBox';
import LineBox from 'Project/Edit/LineBox';

import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { PROJECT_TYPE, PROJECT_TYPE_OPTIONS } from 'constant';
import { canSaveFixed, isRequiredOverwriteMessages, OPENDATE_PROJECT_TYPES, isErrorProject } from 'projectUtility.js';
import { isSearchable, isFixProjectType } from 'projectLineUtility';

/**
 * ProjectEdit画面のコンポーネント
 */
class ProjectEditPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }
    
    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        garmitFrame.refresh();
    }
    
    /**
     * render
     */
    render() {
        const { editProjectForm, editProjects, editBulkKeys, bulkProject, linePatchCableSelections, beforeLinePatchCableSelections, editSearchedLine, invalid, isLoading, isSaveFixed } = this.props;
        const { modalState, waitingInfo } = this.props;
        const { lookUp } = this.props.searchCondition;
        if (lookUp) {
            var { locations, lineTypes, wiringTypes } = lookUp;
        }        
        const { isReadOnly, level } = this.props.authentication;
        const isRegister = editProjectForm && editProjectForm.project.projectId > 0 ? false : true;
        const isSysAdmin = (level === LAVEL_TYPE.administrator);
        const readOnlyNormal = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        const isBulk = editProjects ? true : false
        return (
            <Content>
                <div className={classNames("mb-05", editProjectForm?"flex-center-between":"flex-center-right")}>
                    {editProjectForm&&
                        <span className="ml-1">
                            <label>工事種別：</label>
                            <ProjectTypeSwitch 
                                type={editProjectForm.project.projectType}
                                isReadOnly={!isRegister || isLoading}
                                options={PROJECT_TYPE_OPTIONS} 
                                onChange={(value) => this.props.changeEditProject('projectType', value, isErrorProject(editProjectForm.project, 'projectType', value))} 
                            />
                        </span>
                    }
                    <ButtonToolbar>
                        {!isReadOnly&&
                            <SaveHotKeyButton
                                disabled={!this.canSave(invalid)}
                                className="mr-05"
                                onClick={() => this.showSaveConfirmModel(isBulk)}
                            />
                        }
                        <CancelButton
                            onClick={this.handleCancelClick}
                        />
                    </ButtonToolbar>
                </div>
                {editProjectForm&&
                    <ProjectBox
                        project={editProjectForm.project}
                        isLoading={isLoading}
                        fixedflg={editProjectForm.project.fixedflg||readOnlyNormal}
                        isReadOnly={isReadOnly}
                        onChange={(key, value, isError) => this.props.changeEditProject(key, value, isError)}
                    />
                }
                {editProjects&&
                    <ProjectBulkBox
                        editKeys={editBulkKeys} 
                        project={bulkProject}
                        isLoading={isLoading}
                        onChange={(keys, value, isError) => this.props.changeEditBulkProject(keys, value, isError)}                    
                    />
                }                
                {editProjectForm&&
                 editProjectForm.extendedPages.length>0&&
                 this.isShowDetailBox(editProjectForm.extendedPages, isSysAdmin)&&
                    <div className="mb-2">
                        <AssetDetailBox
                            title="詳細情報"
                            id={editProjectForm.project.projectId}
                            pages={editProjectForm.extendedPages}
                            isSysAdmin={isSysAdmin}
                            defaultClose={false}
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                            level={level}
                            onChange={(pages, isError) => this.props.changeEditExtendedPages(pages, isError)}
                        />
                        
                    </div>
                }
                {editProjectForm&&
                    <LineBox
                        project={editProjectForm.project}
                        lines={editProjectForm.lines}
                        lineTypes={lineTypes}
                        locations={locations}
                        linePatchCableSelections={linePatchCableSelections}
                        beforeLinePatchCableSelections={beforeLinePatchCableSelections}
                        searchedLine={editSearchedLine}
                        wiringTypes={wiringTypes}
                        isLoading={isLoading}
                        fixedflg={editProjectForm.project.fixedflg||readOnlyNormal}
                        isReadOnly={isReadOnly}
                        onChange={(key, value, isError) => this.props.changeEditProjectLine(key, value, isError)}
                        onChangeLines={(lines) => this.props.changeEditLines(lines)}
                        onInitLineSelect={(projectType, isEdit, line) => this.handleInitLineSelect(projectType, isEdit, line)}
                        onSelectInPatchboard={(seriesNo, patchboardId) => this.props.requestSetFirstIdfPatchCableSelection(seriesNo, patchboardId)}
                        onSelectInPatchCable={() => this.resetInOnlySelections()}
                        onSelectIdfPatchCable={() => this.resetPremiseOnlySelections()}
                        onAddPatchCable={(seriesNo, patchboardId, callback) => this.props.requestAddPatchCableSelection(seriesNo, patchboardId, callback)}
                        onClearPatchCables={(seriesNo, seqNo) => this.props.clearIdfPatchCableSelections(seriesNo, seqNo)}
                        onClearLinePatchCables={(seriesNo) => this.props.clearLinePatchCableSelections(seriesNo)}
                        onClearAllLinePatchCables={() => this.props.clearAllLinePatchCableSelections()}
                        onAddLinePatchCables={(seriesNo, tempType) => this.props.addLinePatchCableSelections(seriesNo, tempType)}    
                        onSearchLine={(patchboardId, patchCableNo, projectType, tempType, searchType) => this.props.requestSearchLine(patchboardId, patchCableNo, projectType, tempType, searchType) }
                        onChangeTempType={(projectType, tempType, hasTemp, hasWireType) => this.changeTempType(projectType, tempType, hasTemp, hasWireType)}
                        onChangeSearchType={(projectType, searchType, hasWireType) => this.changeSearchType(projectType, searchType, hasWireType)}
                        onSelectBeforePatchCable={() => this.props.setEditSearchedLine(null)}
                    />
                }
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onOK={() => this.handleOK()}
                              onCancel={() => this.handleCancelModal()}
                              onHide={() => this.handleCloseModal()}>
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    {this.isShowFixedFlgSwitch(readOnlyNormal, isRegister, editProjectForm, modalState)&&
                        <div className="mt-2">
                            <FixedFlgSwitch                                
                                isFixed={isSaveFixed}
                                onChange={(checked) =>this.props.setIsSaveFixed(checked)}
                            />
                        </div>
                    }
                    {this.isShowFixedFlgSwitch(readOnlyNormal, isRegister, editProjectForm, modalState)&&isSaveFixed&&
                        <div className="mt-05"><strong>※確定保存すると元に戻せません。</strong></div>
                    }
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }  
        
    //#region 共通

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancelClick = () => {
        this.props.clearEditInfo();
        this.transitionScreen();
    }

    /**
     * 画面遷移
     */
    transitionScreen() {
        browserHistory.push({ pathname: '/Project' });
    }

    /**
     * 保存可能か
     * @param {object} invalid 無効状態
     */
    canSave(invalid) {
        return !(invalid.project || invalid.projectLine || invalid.lines || invalid.extendedPages);
    }

    /**
     * 回線選択画面初期化
     * @param {boolean} projectType 工事種別
     * @param {boolean} isEdit 編集かどうか
     * @param {object} line 編集する回線情報
     */
    handleInitLineSelect (projectType, isEdit, line) {
        if (isSearchable(projectType, line.hasTemp) && isEdit) {
            if (isFixProjectType(projectType)) {
                this.props.setEditSearchedLine({ lineConnections: _.cloneDeep(line.beforeLineConnections) });
            } else {
                this.props.setEditSearchedLine(line);
            }
        }        
        this.props.requestInitLinePatchCableSelections(projectType, line.tempType, line.hasTemp, line.searchType, isEdit, line.lineConnections)
    }
    
    /**
     * 局入のみの選択肢関連をリセットする
     */
    resetInOnlySelections() {
        this.props.clearIdfPatchCableSelections()
        this.props.setEditSearchedLine(null);           //検索済み回線をクリア
    }

    /**
     * 構内のみの選択肢関連をリセットする
     */
    resetPremiseOnlySelections() {
        this.props.reestIdfPatchCableSelections();
        this.props.clearInPatchCableSelections();
        this.props.setEditSearchedLine(null);           //検索済み回線をクリア
    }

    /**
     * 仮登録方法を変更する
     * @param {number} projectType 工事種別
     * @param {number} tempType 仮登録方法
     * @param {boolean} hasTemp 仮登録ありか
     * @param {boolean} hasWireType ワイヤありか
     */
    changeTempType(projectType, tempType, hasTemp, hasWireType) {
        this.props.requestChangeTempType(projectType, tempType, hasTemp, hasWireType);
        this.props.setEditSearchedLine(null);           //検索済み回線をクリア
    }
    
    /**
     * 仮登録方法を変更する
     * @param {number} projectType 工事種別
     * @param {number} searchType 検索方法
     * @param {boolean} hasWireType ワイヤありか
     */
    changeSearchType(projectType, searchType, hasWireType) {
        this.props.requestChangeSearchType(projectType, searchType, hasWireType)
        this.props.setEditSearchedLine(null);           //検索済み回線をクリア
    }

    //#endregion

    //#region 確定保存

    /**
     * 確定保存する
     */
    saveFixedProject() {
        const projectForm = _.cloneDeep(this.props.editProjectForm);
        var canSave = canSaveFixed(projectForm);
        if (canSave) {
            const { project, lines } = projectForm;
            const isOpenDate = OPENDATE_PROJECT_TYPES.includes(project.projectType);
            const key = isOpenDate ? 'openDate' : 'closeDate';
            if (project.projectType !== PROJECT_TYPE.change && isRequiredOverwriteMessages(project, lines, key)) {
                this.showOverwriteConfirmModel(isOpenDate);
            } else {
                this.props.requestSaveProjectForm();
            }
        } else {
            this.showSaveFixedErrorMessage(projectForm.project.projectType)
        }
    }

    /**
     * 確定保存エラーメッセージを表示する
     * @param {number} projectType 工事種別
     */
    showSaveFixedErrorMessage(projectType) {
        var message = '確定保存時は下記の項目が必須項目です。全て入力してください。\r\n\r\n'
        + '・工事完了希望日\r\n';

        if (projectType === PROJECT_TYPE.new) {
        message += '・開通年月日\r\n';
        } else if (projectType === PROJECT_TYPE.remove) {
        message += '・廃止年月日\r\n';
        }
        if (!([PROJECT_TYPE.fix_temp, PROJECT_TYPE.fix_left].includes(projectType))) {
        message += '・工事立会日\r\n';
        }
        message += '・回線一覧';
        this.props.showErrorMessage({ message: message });
    }

    //#endregion

    //#region メッセージモーダル

    /**
     * 確定保存スイッチを表示するかどうか
     * @param {boolean} readOnlyNormal オペレータ権限で読み取り専用かどうか
     * @param {boolean} isRegister 新規作成か
     * @param {object} projectForm 編中中の案件情報
     * @param {object} modalState モーダルの状態
     * @returns 
     */
    isShowFixedFlgSwitch(readOnlyNormal, isRegister, projectForm, modalState) {
        return !readOnlyNormal&&!isRegister&&!projectForm.project.fixedflg&&modalState.okOperation==='save';
    }
    
    /**
     * 保存確認モーダルを表示
     */
    showSaveConfirmModel(isBulk) {
        var okOperation = 'save'
        if (isBulk) {
            okOperation = 'saveBulk';
        }
        this.props.confirmSave({ targetName: '編集内容', okOperation: okOperation});
    }
    
    /**
     * 上書き保存確認モーダルを表示
     */
    showOverwriteConfirmModel(isOpenDate) {
        const message = (isOpenDate ? '開通年月日' : '廃止年月日')
                      + 'が既に登録済みの回線があります。\r\n'
                      + '上書きしてもよろしいですか？'
        this.props.confirmOverwrite({ message: message, okOperation: 'overwrite'});
    }

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK() {
        this.props.closeModal();
        if (this.props.modalState.okOperation === 'overwrite') {
            this.props.setIsDateOverwrit(true);
            this.props.requestSaveProjectForm();
        } else if (this.props.modalState.okOperation === 'saveBulk') {
            this.props.requestSaveProjects();
        } else {
            if (this.props.isSaveFixed) {
                this.saveFixedProject();
            } else {
                this.props.requestSaveProjectForm();        //通常保存
            }           
        }
    }

    /**
     * 確認モーダルのキャンセル（いいえ）ボタン/メッセージモーダルの「OK」ボタン押下イベント
     */
    handleCancelModal() {
        if (this.props.modalState.okOperation === 'overwrite') {
            this.props.setIsDateOverwrit(false);
            this.props.requestSaveProjectForm();
        }
        this.handleCloseModal();
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

    //#region 詳細情報

    /**
     * 詳細情報ボックスを表示するかどうか
     * @param {array} extendedPages 詳細情報ページ情報
     * @param {boolean} isSysAdmin システム管理者かどうか
     */
    isShowDetailBox(extendedPages, isSysAdmin) {
        return extendedPages.some((page) => page.extendedItems.some((item) => item.enable && (!item.isSysAdmin || isSysAdmin)));
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
        editProjectForm: state.editProjectForm,
        editProjects: state.editProjects,
        editBulkKeys: state.editBulkKeys,
        bulkProject: state.bulkProject,
        linePatchCableSelections: state.linePatchCableSelections,
        beforeLinePatchCableSelections: state.beforeLinePatchCableSelections,
        invalid: state.invalid,
        isSaveFixed: state.isSaveFixed,
        isDateOverwrite: state.isDateOverwrite,
        editSearchedLine: state.editSearchedLine
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
        confirmSave:(data) => dispatch(confirmSave(data)),
        changeModalState:(data) => dispatch(changeModalState(data)),
        confirmOverwrite: (data) => dispatch(confirmOverwrite(data)),
        showErrorMessage: (data) => dispatch(showErrorMessage(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ProjectEditPanel);

/**
 * 工事種別スイッチ
 */
const ProjectTypeSwitch = ({type, options, isReadOnly, onChange: handleChangeType}) => {
    return <ToggleSwitch
                value={type}
                name="projectType"
                swichValues={options}
                disbled={isReadOnly}
                onChange={(value) => handleChangeType(parseInt(value))}
            />
}

/**
 * 確定保存スイッチ
 */
const FixedFlgSwitch = ({isFixed, className, onChange: handleChange}) => {
    return <CheckboxSwitch
                text="確定保存する"
                checked={isFixed}
                onChange={(checked) => handleChange(checked)}
           />;
}