/**
 * @license Copyright 2020 DENSO
 * 
 * 配電盤編集画面
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
import { setWaitingState } from 'WaitState/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';

import Content from 'Common/Layout/Content';
import BoxGroup from 'Common/Layout/BoxGroup';

import { SaveHotKeyButton, CancelButton } from 'Assets/GarmitButton';
import AssetDetailBox from 'Assets/AssetDetailBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import PatchboardEditBox from 'Patchboard/PatchboardEditBox';

import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { errorResult, VALIDATE_STATE } from 'inputCheck';
import { validatePatchboardName, validateStartNo, validateEndNo, validatePatchboardType, validatePatchCableType, validatePatchboardMemo, validateLocation, validateParent } from 'patchboardUtility';
import { convertNumberExtendedData } from 'assetUtility';

/**
 * PatchboardEdit画面のコンポーネント
 */
class PatchboardEditPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(props){
        super(props);
        this.state = {
            message: {},
            targetPatchboard: props.patchboardForm ?
                props.patchboardForm.patchboard : { patchboardType: null, location: null },
            targetExtendedPages: props.patchboardForm && props.patchboardForm.extendedPages,
            inputCheck: {
                patchboardName: {},
                startNo: {},
                endNo: {},
                patchboardType: {},
                patchCableType: {},
                location: {},
                memo: {},
                pathsToRoot: {}
            },
            checked: {
                patchboardType: false,
                location: false,
            },
            isExtendedPageError: false
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     */
    componentWillMount() {
        this.setValidation();
    }

    /**
     * コンポーネントがマウントされた後の処理
     */
    componentDidMount() {
        if (!this.props.bulkMode) {
            this.loadChildrenPatchboards(this.state.targetPatchboard.patchboardId);
        }

        garmitFrame.refresh();
    }

    /**
     * 保存ボタンクリック
     */
    handleSubmit() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '編集内容を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveData();
                }
            }
        });
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        this.props.setPatchboardForm(null);
        this.props.setPatchboards([]);
        browserHistory.goBack();
    }

    /**
     * 編集された時
     */
    handleEdit(keyValuePairs) {
        const patchboard = Object.assign({}, this.state.targetPatchboard);
        const inputCheck = Object.assign({}, this.state.inputCheck);

        keyValuePairs.forEach((pair) => {
            patchboard[pair.key] = pair.value;
            if (pair.key in inputCheck) {
                inputCheck[pair.key] = this.checkValidation(pair.value, pair.key, patchboard);

                switch (pair.key) {
                    case 'patchboardType':
                        inputCheck.pathsToRoot = this.checkValidation(patchboard.pathsToRoot, 'pathsToRoot', patchboard);
                        break;

                    case 'startNo':
                        inputCheck.endNo = this.checkValidation(patchboard.endNo, 'endNo', patchboard);
                        break;

                    case 'endNo':
                        inputCheck.startNo = this.checkValidation(patchboard.startNo, 'startNo', patchboard);
                        break;
                }
            }
        });

        this.setState({ targetPatchboard: patchboard, inputCheck: inputCheck });
    }

    /**
     * 詳細項目が編集された時
     * @param {any} pages
     * @param {any} isErr
     */
    handleDetailItemEdit(pages, isErr) {
        this.setState({ targetExtendedPages: pages, isExtendedPageError: isErr });
    }

    /**
     * チェックボックスのチェック状態が変更された時
     * @param {any} keyValuePairs
     */
    handleCheckChange(keyValuePairs) {
        const checked = Object.assign({}, this.state.checked);

        keyValuePairs.forEach((item) => {
            checked[item.key] = item.value;
        });

        this.setState({ checked: checked }, () => {
            this.setValidation();
        });
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     * @param {any} patchboard
     */
    checkValidation(val, key, patchboard) {
        switch (key) {
            case 'patchboardName':
                return validatePatchboardName(val);

            case 'startNo':
                return validateStartNo(val, patchboard.endNo);
                
            case 'endNo':
                return validateEndNo(val, patchboard.startNo);

            case 'patchboardType':
                return validatePatchboardType(val && val.typeId);

            case 'patchCableType':
                return validatePatchCableType(val && val.id);

            case 'location':
                return validateLocation(val);

            case 'memo':
                return validatePatchboardMemo(val);

            case 'pathsToRoot': {
                const validation = {};
                validation.state = VALIDATE_STATE.success;
                val && val.forEach((p, i) => {
                    validation[i] = validateParent(p, val);
                    if (validation[i].state === VALIDATE_STATE.error) {
                        validation.state = VALIDATE_STATE.error;
                    }
                });
                if ((patchboard.patchboardType && patchboard.patchboardType.typeId != 0) && (!val || val.length == 0)) {
                    Object.assign(validation, errorResult('必須項目です'));
                }
                return validation;
            }
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { bulkMode } = this.props;
        const { targetPatchboard, checked } = this.state;
        let inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = (bulkMode && !checked[key]) ?
                {} : this.checkValidation(targetPatchboard[key], key, targetPatchboard);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 子配線盤を読み込む
     * @param {any} patchboardId
     * @param {any} callback
     */
    loadChildrenPatchboards(patchboardId, callback) {
        const postData = { patchboardId: patchboardId };

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/children', postData, (children, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setChildrenPatchboards(children);
            }
            if (callback) {
                callback(children);
            }
        });
    }

    /**
     * 編集内容を保存する
     */
    saveData() {
        const { bulkMode } = this.props;
        const postData = this.createPostData();
        const url = '/api/patchboard/' + (bulkMode ? 'bulkSet' : 'set');
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, postData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '保存',
                        message: result && result.message,
                        onCancel: () => {
                            this.clearMessage();
                            if (result && result.isSuccess) {
                                browserHistory.push('/Patchboard');
                                this.props.setPatchboardForm(null);
                                this.props.setPatchboards(null);
                                this.props.setDisplayState(null);
                            }
                        }
                    }
                });
            }
        });
    }

    /**
     * POSTするデータを生成する
     */
    createPostData() {
        if (this.props.bulkMode) {
            // 一括編集の場合
            const common = {};
            for (let key of Object.keys(this.state.targetPatchboard)) {
                if (this.state.checked[key]) {
                    //チェックされている項目のみ置き換える
                    common[key] = this.state.targetPatchboard[key];
                }
            }
            const patchboards = this.props.patchboards.map((p) => Object.assign({}, p, common));
            return patchboards;
        } else {
            // 個別編集の場合
            const patchboardForm = {
                patchboard: this.state.targetPatchboard,
                extendedPages: convertNumberExtendedData(this.state.targetExtendedPages)
            };
            return patchboardForm;
        }
    }

    /**
     * 保存ボタンを使用可能かどうか
     */
    isEnableSave() {
        const { bulkMode } = this.props;
        const { inputCheck, isExtendedPageError } = this.state;

        for (let k of Object.keys(inputCheck)) {
            if (inputCheck[k].state == VALIDATE_STATE.error) {
                return false;
            }
        }
        return bulkMode ? true : !isExtendedPageError;
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { bulkMode, searchCondition, patchboardList, waitingInfo, isLoading, childrenPatchboards } = this.props;
        const { message, targetPatchboard, targetExtendedPages, inputCheck, checked } = this.state;

        return (
            <Content>
                {targetPatchboard &&
                    <div className="mb-2">
                        <SaveCancelButton
                            canSave={this.isEnableSave()}
                            onClickSave={() => this.handleSubmit()}
                            onClickCancel={() => this.handleCancel()}
                        />
                        <BoxGroup>
                        <PatchboardEditBox
                            bulk={bulkMode}
                            lookUp={searchCondition.lookUp}
                            patchboard={targetPatchboard}
                            patchboards={patchboardList}
                            inputCheck={inputCheck}
                            onChange={(pairs) => this.handleEdit(pairs)}
                            checked={checked}
                            onCheckChange={(pairs) => this.handleCheckChange(pairs)}
                            childrenPatchboards={childrenPatchboards}
                        />
                        {targetExtendedPages &&
                            <AssetDetailBox
                                title="詳細情報"
                                id={targetPatchboard.patchboardId}
                                pages={targetExtendedPages}
                                defaultClose={false}
                                isReadOnly={readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator)}
                                isSysAdmin={level === LAVEL_TYPE.administrator}
                                level={level}
                                onChange={(pages, isError) => this.handleDetailItemEdit(pages, isError)}
                            />
                        }
                        </BoxGroup>                        
                    </div>
                }
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                    disabled={isLoading.result}
                >
                    {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        searchCondition: state.searchCondition,
        searchResult: state.searchResult,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        patchboardList: state.patchboardList,
        patchboardForm: state.patchboardForm,
        patchboards: state.patchboards,
        bulkMode: state.bulkMode,
        childrenPatchboards: state.childrenPatchboards
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(PatchboardEditPanel);

/**
* 保存キャンセルボタン
*/
const SaveCancelButton = ({ canSave, disabled, onClickSave: handleClickSave, onClickCancel: handleClickCancel }) => {
    return (
        <div className="flex-center-right mb-05">
            <SaveHotKeyButton
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
};


 