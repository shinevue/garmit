/**
 * @license Copyright 2020 DENSO
 * 
 * FileSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Checkbox } from 'react-bootstrap';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import FileSelectForm from 'Common/Form/FileSelectForm/';

import { isIllegalStringError, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';

const MAX_FILENAME_LENGTH = 100;
const ACCEPT_FILETYPE = 'application/pdf';        //pdfを許可
const ACCEPT_FILE_EXTENSION = 'pdf';

/**
 * ファイル選択モーダルコンポーネント
 * @param {boolean} show モーダルを表示するかどうか
 * @param {number} patchCableDataList 配線盤ID/線番リスト
 * @param {function} onSave 保存時に呼び出す
 * @param {function} onCancel キャンセル時に呼び出す
 */
export default class FileSelectModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            modalInfo: {
                show: false,
                title: null,
                buttonStyle: 'message',
                message: null
            },
            file: null,
            overwrite: false
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されれる
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps){
        if (nextProps.show !== this.props.show) {
            this.setState({
                modalInfo: {
                    show: false,
                    title: null,
                    buttonStyle: 'message',
                    message: null
                },
                file: null,
                overwrite: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { show } = this.props;
        const { file, overwrite, modalInfo } = this.state;
        const validate = this.validateFormatFile(file);
        return (            
            <Modal show={show} backdrop="static" onHide={this.handleCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>ファイル選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FileSelectForm
                        title="ファイル"
                        acceptFileType={ACCEPT_FILETYPE} 
                        file={this.state.file}
                        onChangeFile={this.handleChangeFile}                        
                        validationState={validate.state}
                        helpText={validate.helpText}
                    />
                    <Checkbox
                        checked={overwrite}
                        onClick={() => this.setState({ overwrite: !overwrite })}
                    >
                        同じファイル名がある場合は上書きする
                    </Checkbox>              
                    <MessageModal show={modalInfo.show} 
                                title={modalInfo.title} 
                                bsSize="small"
                                buttonStyle={modalInfo.buttonStyle}
                                onOK={() => { modalInfo.callback && modalInfo.callback() }}
                                onCancel={() => this.hideMessageModal()}>
                        {modalInfo.message && modalInfo.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    </MessageModal>
                </Modal.Body>                
                <Modal.Footer>
                    <SaveButton
                        disabled={this.invalid(validate)}
                        onClick={this.handleSave}
                    />
                    <CancelButton
                        onClick={this.handleCancel}
                    />
                </Modal.Footer>
            </Modal>
        );
    }
    
    /**
     * ファイル変更時
     */
    handleChangeFile = (file) => {
        this.setState({ file: file });
    }

    
    /**
     * 保存ボタンクリック
     */
    handleSave = () => {
        const { patchCableDataList } = this.props;
        const { file, overwrite } = this.state; 
        this.readFile(file, (dataString) => {
            this.showSaveConfirmModal(_.cloneDeep(patchCableDataList), file.name, dataString, overwrite);
        });
    }

    
    /**
     * キャンセルボタンクリック
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }
    
    //#region 確認モーダル

    /**
     * 削除確認モーダルを表示する
     * @param {object} patchCableData 配線盤ID/線番
     * @param {array} fileNos ファイル番号リスト
     * @param {string} targetName 削除対象の名称
     * @param {boolean} overwrite 上書きするか
     */
    showSaveConfirmModal(PatchCableDataList, fileName, dataString, overwrite) {
        const { onSave } = this.props;
        this.setState({
            modalInfo: {
                show: true,
                title: '保存確認',
                buttonStyle: 'save',
                message: 'ファイルを保存してもよろしいですか？',
                callback: () => {
                    this.hideMessageModal();
                    onSave(PatchCableDataList, fileName, dataString, overwrite)
                }
            }
        })
    }
      
    /**
     * メッセージモダールを閉じる
     */
    hideMessageModal() {
        this.setState({            
            modalInfo: {
                show: false,
                title: null,
                buttonStyle: 'message',
                message: null
            }
        })
    }

    //#endregion

    /**
     * フォーマットファイルの入力チェック
     * @param {any} file
     */
    validateFormatFile(file) {
        if (file) {
            if (this.getExtension(file.name) !== ACCEPT_FILE_EXTENSION) {
                return errorResult('選択したファイルの形式には対応していません');
            } else if (file.size > 7340032) {
                return errorResult('ファイルサイズが7MBを超えるファイルは登録できません');
            } else if (file.name.length > MAX_FILENAME_LENGTH) {
                return errorResult(`ファイル名が（拡張子を含めて）${MAX_FILENAME_LENGTH}文字を超えるファイルは登録できません`);
            } else if (isIllegalStringError(file.name, false)) {
                return errorResult('ファイル名に使用不可文字が含まれています');
            }
            return successResult;
        } else {
            return errorResult('必須項目です');
        }
    }

    /**
     * 拡張子を取得する
     * @param {any} fileName
     */
    getExtension(fileName) {
        return fileName.split('.').pop();
    }

    /**
     * ファイルを読む
     * @param {any} file
     * @param {any} callback
     */
    readFile(file, callback) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            if (callback) {
                const APPLY_MAX = 1024;     //1024個ごとに変換
                let uint8Arr = new Uint8Array(reader.result)
                let encodedStr = '';
                for(var i = 0; i < uint8Arr.length; i+=APPLY_MAX){
                    encodedStr += String.fromCharCode(...uint8Arr.slice(i, i+APPLY_MAX));
                }
                let base64String = btoa(encodedStr);
                callback(base64String);
            }
        };
    }

    /**
     * 保存可能かどうか
     * @param {any} inputCheck
     */
    invalid(validate) {
        return validate.state !== VALIDATE_STATE.success;
    }

}

FileSelectModal.propTypes = {
    show: PropTypes.bool,
    patchCableDataList: PropTypes.array,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
};