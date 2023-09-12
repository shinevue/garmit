/**
 * Copyright 2020 DENSO
 * 
 * ParentPatchboardSingleForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LabelForm from 'Common/Form/LabelForm';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ParentPatchboardSelectModal from 'Patchboard/ParentPatchboardSelectModal';
import { getRouteNameUsingParent } from 'patchboardUtility';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

export default class ParentPatchboardSingleForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isWaiting: false,
            showModal: false,
            message: {},
        };
    }

    /**
     * 削除可能かチェックする
     * @param {any} pathToRootTree
     * @param {any} callback
     */
    checkDeleteEnable(pathToRoot, callback) {
        const postData = {
            patchboardId: pathToRoot.patchboardId,
            pathNo: pathToRoot.pathNo
        };
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/patchboard/check/parentDelete', postData, (result, networkError) => {
                this.setState({ isLoading: false });
                if (networkError) {
                    this.showErrorMessage();
                } else {
                    if (result && !result.isSuccess) {
                        this.setState({
                            message: {
                                show: true,
                                title: 'エラー',
                                buttonStyle: 'message',
                                message: result.message,
                                onCancel: () => {
                                    this.clearMessage();
                                }
                            }
                        });
                    }
                }
                if (callback) {
                    callback(result && result.isSuccess);
                }
            });
        });
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

    render() {
        const { patchboards, pathToRoot, validationState, helpText, disabled } = this.props;
        const { isWaiting, showModal, message } = this.state;

        return (
            <div>
                <ParentPatchboardSelectModal
                    show={showModal}
                    patchboardList={patchboards}
                    selectedPatchboard={this.getSelectedPatchboard(pathToRoot, patchboards)}
                    selectedPath={pathToRoot.parents[0]}
                    onSubmit={(path) => this.onModalSubmit(path)}
                    onCancel={() => this.onModalCancel()}
                />
                <LabelForm
                    value={getRouteNameUsingParent(pathToRoot, true)}
                    onClick={() => this.setState({ showModal: true })}
                    validationState={validationState}
                    helpText={helpText}
                    addonButton={!disabled && [
                        {
                            key: 'select',
                            bsStyle: 'primary',
                            iconId: 'category-setting',
                            isCircle: true,
                            tooltipLabel: '配線盤選択',
                            onClick: () => this.setState({ showModal: true })
                        },
                        {
                            key: 'clear',
                            iconId: 'erase',
                            bsStyle: 'lightgray',
                            isCircle: true,
                            tooltipLabel: 'クリア',
                            onClick: () => this.onParentClearClick(pathToRoot)
                        }
                    ]}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message && message.message.split(/\r\n|\n/).map((str, i) => <div key={i}>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={isWaiting} />
            </div>
        );
    }

    /**
     * クリアボタンクリックイベント
     *
     * @param {*} pathToRoot
     * @memberof ParentPatchboardSingleForm
     */
    onParentClearClick(pathToRoot) {
        this.checkDeleteEnable(pathToRoot, (enable) => {
            if (enable) {
                this.props.onClear();
            }
        });
    }

    /**
     * 親配線盤選択モーダル適用ボタンクリックイベント
     *
     * @param {*} path
     * @memberof ParentPatchboardSingleForm
     */
    onModalSubmit(path) {
        const pathToRoot = Object.assign({}, this.props.pathToRoot);
        pathToRoot.parents = [path];

        const { pathsToRoot, index } = this.props;

        if ((pathsToRoot || []).some((p, i) => p.parents[0].patchboardId == path.patchboardId && p.parents[0].pathNo == path.pathNo && i != index)) {
            this.showErrorMessage('既に同じ経路が選択されているため、選択できません。');
        } else {
            this.setState({ showModal: false });
            this.props.onChange(pathToRoot);
        }
    }

    /**
     * モーダルキャンセルボタンクリックイベント
     *
     * @memberof ParentPatchboardSingleForm
     */
    onModalCancel(){
        this.setState({ showModal: false });
    }

    /**
     * 選択中配線盤を返却する
     *
     * @param {*} pathToRoot
     * @param {*} patchboards
     * @returns
     * @memberof ParentPatchboardSingleForm
     */
    getSelectedPatchboard(pathToRoot, patchboards) {
        const parent = pathToRoot.parents[0];
        return patchboards.find(item => item.patchboardId === parent.patchboardId);
    }
}

ParentPatchboardSingleForm.propTypes = {
    patchboards: PropTypes.array,           //配線盤選択画面に表示する配線盤一覧
    pathToRoot: PropTypes.object,               //このフォームで表示する経路情報
    onChange: PropTypes.function,
    onClear: PropTypes.function,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    disabled: PropTypes.bool,
    pathsToRoot: PropTypes.array,
    index: PropTypes.number
};