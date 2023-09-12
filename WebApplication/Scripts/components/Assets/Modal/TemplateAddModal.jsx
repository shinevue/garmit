/**
 * @license Copyright 2018 DENSO
 * 
 * TemplateAddModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Modal, Form } from 'react-bootstrap';
import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import { validateText, validateTextArea, VALIDATE_STATE } from 'inputCheck';

/**
 * テンプレート追加モーダルコンポーネント
 * @param {boolean} showModal モーダルを表示するか
 * @param {function} onSave 保存ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンクリックに呼び出す
 */
export default class TemplateAddModal extends Component {
    
    /**
     * 初期のstate
     */
    static get INITIAL_STATE() {
        return {
            templateName: '',
            templateMemo: ''
        }
    } 

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = TemplateAddModal.INITIAL_STATE
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.showModal) {
            this.setState(TemplateAddModal.INITIAL_STATE)
        }
    }

    /**
     * render
     */
    render() {
        const { showModal } = this.props;
        const { templateName, templateMemo } = this.state;
        const validate = {
            templateName: validateText(templateName, 32),
            templateMemo: validateTextArea(templateMemo, 100, true)
        }

        return (
            <Modal bsSize="sm" show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>テンプレート追加</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TextForm label='テンプレート名称' 
                              value={templateName} 
                              validationState={validate.templateName.state}
                              helpText={validate.templateName.helpText}
                              placeholder='テンプレート名称'
                              onChange={(v) => this.nameChanged(v)} 
                    />
                    <TextareaForm label='テンプレートメモ' 
                                  value={templateMemo} 
                                  validationState={validate.templateMemo.state}
                                  helpText={validate.templateMemo.helpText}
                                  placeholder='テンプレートメモ'  
                                  onChange={(v) => this.memoChanged(v)} 
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" disabled={this.invalid(validate)} onClick={() => this.handleSave()}>
                        <Icon className="fal fa-save" />
                        <span> 保存</span>
                    </Button>
                    <Button iconId="uncheck" bsStyle="lightgray" onClick={() => this.handleCancel()}>
                        <span> キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    /**
     * テンプレート名称を変更する
     * @param {string} value 変更後の値
     */
    nameChanged(value){
        this.setState({templateName : value});
    }

    /**
     * テンプレートメモを変更する
     * @param {string} value 変更後の値
     */
    memoChanged(value) {
        this.setState({templateMemo : value});
    }

    /**
     * 保存が無効かどうか
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか  
     */
    invalid(validate) {
        return !(validate.templateName.state === VALIDATE_STATE.success && validate.templateMemo.state === VALIDATE_STATE.success);
    }
    
    /**
     * 保存ボタンの押下イベント
     */
    handleSave() {
        if (this.props.onSave){
            this.props.onSave(Object.assign({}, this.state));
        }
    }

    /**
     * キャンセルボタンの押下イベント
     */
    handleCancel(){
        if (this.props.onCancel){
            this.props.onCancel();
        }
    }
}

TemplateAddModal.propTypes = {
    showModal: PropTypes.bool,
    onSave: PropTypes.func,
    onCancel: PropTypes.func
}