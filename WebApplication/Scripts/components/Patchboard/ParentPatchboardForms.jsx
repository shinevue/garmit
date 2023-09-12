/**
 * Copyright 2020 DENSO
 * 
 * ParentPatchboardForms Reactコンポーネント
 * 親配線盤情報をPatchboard.pathsToRoot分と新規追加ボタンを持つフォーム
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, HelpBlock } from 'react-bootstrap';

import { AddCircleButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';

import ParentPatchboardSelectModal from 'Patchboard/ParentPatchboardSelectModal';
import ParentPatchboardSingleForm from 'Patchboard/ParentPatchboardSingleForm';

export default class ParentPatchboardForms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            message: {}
        };
    }

    render() {
        const { patchboards, pathsToRoot, validation, disabled } = this.props;
        const { showModal, message } = this.state;

        return (
            <div>
                <ParentPatchboardSelectModal
                    show={showModal}
                    patchboardList={patchboards}
                    onSubmit={(pathToRoot) => this.onAdditionModalSubmit(pathToRoot)}
                    onCancel={() => this.onModalCancel()}
                />
                {this.createParentPatchboardlForm(pathsToRoot, validation)}
                <div className="mt-05">
                    <AddCircleButton
                        disabled={disabled || pathsToRoot && pathsToRoot.length >= 100}
                        onClick={() => this.onParentAddClick()}
                    />
                </div>
                <FormGroup validationState={validation.state}>
                    {validation.helpText &&
                        <HelpBlock>{validation.helpText}</HelpBlock>
                    }
                </FormGroup>
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
            </div>
        );
    }

    /**
     * 親配線盤選択フォームを生成する
     * @param {any} pathsToRoot
     * @param {any} inputCheck
     */
    createParentPatchboardlForm(pathsToRoot, validation){
        return pathsToRoot && pathsToRoot.map((pathToRoot, i) =>     
            <ParentPatchboardSingleForm
                key={i}
                index={i}
                patchboards={this.props.patchboards}                        
                pathToRoot={pathToRoot}
                pathsToRoot={pathsToRoot}
                validationState={validation[i].state}
                helpText={validation[i].helpText}
                onChange={(pathToRoot) =>this.onParentChange(pathToRoot, i)}
                onClear={() => this.onParentClear(i)}
                disabled={this.props.disabled}
            />
        );
    }

    /**
     * 新規PathNoを採番する
     */
    getNewPathNo() {
        const { pathsToRoot } = this.props;
        return Math.max(...(pathsToRoot ? pathsToRoot.map((p) => p.pathNo) : []), 0) + 1;
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
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * 追加用モーダル適用ボタンクリックイベント
     *
     * @param {*} path
     * @memberof ParentPatchboardForms
     */
    onAdditionModalSubmit(path) {
        const { patchboard } = this.props;

        const pathToRoot = {
            patchboardId: patchboard.patchboardId,
            patchboardName: patchboard.patchboardName,
            pathNo: this.getNewPathNo(),   //採番
            parents: [path]
        };

        const pathsToRoot = this.props.pathsToRoot ? this.props.pathsToRoot.slice() : [];

        if (pathsToRoot.some((p) => p.parents[0].patchboardId == path.patchboardId && p.parents[0].pathNo == path.pathNo)) {
            this.showErrorMessage('既に同じ経路が選択されているため、選択できません。');
        } else {
            this.setState({ showModal: false });
            pathsToRoot.push(pathToRoot);
            this.props.onChange(pathsToRoot);
        }
    }

    /**
     * 親配線盤が変更された時
     * @param {any} pathToRoot
     * @param {any} i
     */
    onParentChange(pathToRoot, i) {
        const pathsToRoot = this.props.pathsToRoot.slice();
        pathsToRoot[i] = pathToRoot;
        this.props.onChange(pathsToRoot);
    }

    /**
     * 親配線盤がクリアされた時
     * @param {any} i
     */
    onParentClear(i) {
        const pathsToRoot = this.props.pathsToRoot.slice();
        pathsToRoot.splice(i, 1);
        this.props.onChange(pathsToRoot);
    }
    
    /**
     * 親配線盤追加ボタンクリックイベント
     *
     * @memberof ParentPatchboardForms
     */
    onParentAddClick(){
        this.setState({ showModal: true });
    }
        
    /**
     * モーダルキャンセルボタンクリックイベント
     *
     * @memberof ParentPatchboardForms
     */
    onModalCancel(){
        this.setState({ showModal: false });
    }
}

ParentPatchboardForms.propTypes = {
    patchboard: PropTypes.object,
    patchboards: PropTypes.array,       //配線盤選択画面に表示する配線盤一覧
    pathsToRoot: PropTypes.pathsToRoot, //このフォームで表示する親配線盤情報一覧
    onChange: PropTypes.func,
    validation: PropTypes.array,
    disabled: PropTypes.bool
};