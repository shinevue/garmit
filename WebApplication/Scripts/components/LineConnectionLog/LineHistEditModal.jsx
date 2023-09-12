/**
 * @license Copyright 2017 DENSO
 * 
 * LineHistEditModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import InputForm from 'Common/Form/InputForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch'
import TextareaForm from 'Common/Form/TextareaForm';

import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import { validateTextArea, VALIDATE_STATE } from 'inputCheck';

const MEMO_MAX_LENGTH = 1000;

/**
 * 回線接続履歴編集モーダル
 * @param {boolean} show モーダルを表示するか
 * @param {string} initMemo 初期表示のメモ
 * @param {string} initMisReg 初期表示の誤登録フラグ
 * @param {function} onSave 保存ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンクリックに呼び出す
 * @param {boolean} isBulk 一括編集であるか
 */
export default class LineHistEditModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            memo: '' ,
            misReg: '',
            isSaveAppendix: false,
            isSaveMisReg: false,
        };
    }
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.show && nextProps.show !== this.props.show) {
            this.setState({ memo: nextProps.initMemo,  misReg: nextProps.initMisReg, isSaveAppendix: false, isSaveMisReg: false });
        }
    }

    /**
     * render
     */
    render() {
        const { show, isBulk } = this.props;
        const { memo, misReg, isSaveAppendix, isSaveMisReg } = this.state;
        const validate = validateTextArea(memo, MEMO_MAX_LENGTH, true);
        const isReadOnly = isBulk && !isSaveAppendix;
        return (
            <Modal show={show} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col
                                label="メモ" 
                                columnCount={1}
                                checkbox={isBulk}
                                checked={isSaveAppendix}
                                onCheckChange={() => this.changeAppendixChecked()}
                            >
                                <TextareaForm
                                            value={memo} 
                                            maxlength={MEMO_MAX_LENGTH}
                                            validationState={isReadOnly ? null : validate.state}
                                            helpText={isReadOnly ? null : validate.helpText}
                                            onChange={(v) => this.memoChanged(v)} 
                                            isReadOnly={isReadOnly}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col
                                label="誤登録" 
                                columnCount={1}
                                checkbox={isBulk}
                                checked={isSaveMisReg}
                                onCheckChange={() => this.changeMisRegChecked()}
                            >
                                <CheckboxSwitch
                                    text={misReg ? "ON": "OFF"} 
                                    checked={misReg} 
                                    onChange={() => this.misRegChanged()}
                                    disabled={isBulk && !isSaveMisReg}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Modal.Body>
                <Modal.Footer>
                    <SaveButton disabled={isBulk ? this.isBulkInvalid(isSaveAppendix, isSaveMisReg, validate) : this.invalid(validate) }
                                onClick={() => this.handleSave(isBulk)} />
                    <CancelButton onClick={() => this.handleCancel()} />
                </Modal.Footer>
            </Modal>
        );
    }
    
    /**
     * テンプレートメモを変更する
     * @param {string} value 変更後の値
     */
    memoChanged(value) {
        this.setState({ memo : value });
    }

    /**
     * 誤登録の値を変更する
     */
    misRegChanged(){
        this.setState({ misReg : !this.state.misReg });
    }

    /**
     * メモ選択状態を変更する
     */
    changeAppendixChecked(){
        this.setState({ isSaveAppendix: !this.state.isSaveAppendix });
    }
    
    /**
     * 誤登録選択状態を変更する
     */
    changeMisRegChecked(){
        this.setState({ isSaveMisReg: !this.state.isSaveMisReg });
    }

    /**
     * 一括編集のとき保存が無効かどうか
     * @param {boolean} isSaveAppendix メモ選択チェック状態
     * @param {boolean} isSaveMisReg 誤登録選択チェック状態
     * @param {Object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか 
     */
    isBulkInvalid(isSaveAppendix, isSaveMisReg, validate){
        let invalid = !(isSaveAppendix || isSaveMisReg);
        if(!isSaveAppendix && validate.state === "error"){
            validate.state = "success";
            validate.helpText = "";
        }
        if(!invalid){
            invalid = this.invalid(validate);
        }
        return invalid;
    }

    /**
     * 保存が無効かどうか
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか  
     */
    invalid(validate) {
        return !(validate.state === VALIDATE_STATE.success);
    }

    
    /**
     * 保存ボタンの押下イベント
     * @param {boolean} isBulk 一括編集であるか
     */
    handleSave(isBulk) {
        const { memo, misReg, isSaveAppendix, isSaveMisReg } = this.state;
        let saveData = {};
        if(isBulk){
            saveData = { appendix:memo, misReg:misReg, isSaveAppendix:isSaveAppendix, isSaveMisReg:isSaveMisReg };
        }else{
            saveData = { appendix:memo, misReg:misReg };
        }
        if (this.props.onSave){
            this.props.onSave(saveData);
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