/**
 * @license Copyright 2020 DENSO
 * 
 * 帳票出力フォーマット登録モーダル Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Checkbox } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';
import LabelForm from 'Common/Form/LabelForm';
import Icon from 'Common/Widget/Icon';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import FileSelectForm from 'Common/Form/FileSelectForm/';

import { validateSelect, isIllegalStringError, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const MAX_FILENAME_LENGTH = 20;
const ACCEPT_FILETYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const ACCEPT_FILE_EXTENSION = 'xlsx';
/**
 * 帳票フォーマット登録モーダル
 * @param {boolean} show モーダルを表示するかどうか
 */
export default class EmbeddedReportFormatRegisterModal extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            message: {},
            isSaving: false,
            enterprise: props.mainEnterprise,
            file: null,
            allowOverwriting: false,
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        //モーダルが表示されるとき
        if (nextProps.show != this.props.show && nextProps.show) {
            this.setState({
                enterprise: nextProps.mainEnterprise,
                file: null,
                allowOverwriting: false,
            });
        }
    }

    /**
     * 所属が変更された時
     */
    onChangeEnterprise(enterprise) {
        this.setState({ enterprise: enterprise });
    }

    /**
     * ファイルが変更された時
     */
    onChangeFile(file) {
        this.setState({ file: file });
    }

    /**
     * 保存ボタンクリック
     */
    onSave() {
        const { file, enterprise, allowOverwriting } = this.state;

        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '帳票フォーマットを保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.readFile(file, (dataString) => {
                        const data = {
                            embeddedReportFormat: {
                                fileName: file.name,
                                enterprise: enterprise,
                                formatNo: -1
                            },
                            dataString: dataString,
                            allowOverwriting: allowOverwriting,
                        };
                        this.saveFormat(data);
                    });
                }
            }
        });
    }

    /**
     * キャンセルボタンクリック
     */
    onCancel() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    /**
     * フォーマットを保存する
     * @param {any} data
     */
    saveFormat(data) {
        const { apiUrl } = this.props;
        apiUrl && apiUrl.setFormat &&
            this.setState({ isSaving: true }, () => {
                sendData(EnumHttpMethod.post, apiUrl.setFormat, data, (result, networkError) => {
                    this.setState({ isSaving: false });
                    if (networkError) {
                        this.showNetWorkErrorMessage();
                    }
                    if (result) {
                        if (result.isSuccess && this.props.onSaved) {
                            this.props.onSaved();
                        }
                        this.setState({
                            message: {
                                show: true,
                                buttonStyle: 'message',
                                title: result.isSuccess ? '保存' : 'エラー',
                                message: result.message,
                                onCancel: () => {
                                    this.clearMessage();
                                    if (result.isSuccess) {
                                        this.props.onHide();
                                    }
                                }
                            }
                        });
                    }
                });
            });
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
                let base64String = btoa(String.fromCharCode(...new Uint8Array(reader.result)));
                callback(base64String);
            }
        };
    }

    /**
     * 入力の検証を行う
     */
    validateInput() {
        const { enterprise, file } = this.state;

        return {
            enterprise: validateSelect(enterprise && enterprise.enterpriseId),
            file: this.validateFormatFile(file)
        };
    }

    /**
     * フォーマットファイルの入力チェック
     * @param {any} file
     */
    validateFormatFile(file) {
        if (file) {
            if (this.getExtension(file.name) != ACCEPT_FILE_EXTENSION) {
                return errorResult('選択したファイルの形式には対応していません');
            } else if (file.size > 2000000) {
                return errorResult('ファイルサイズが2MBを超えるファイルは登録できません');
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
     * 保存可能かどうか
     * @param {any} inputCheck
     */
    canSave(inputCheck) {
        for (let k of Object.keys(inputCheck)) {
            if (inputCheck[k].state == VALIDATE_STATE.error) {
                return false;
            }
        }
        return true;
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
        const { show, enterprises } = this.props;
        const { file, enterprise, allowOverwriting, message, isSaving } = this.state;

        const inputCheck = this.validateInput();
        const canSave = this.canSave(inputCheck);

        return (
            <Modal show={show} backdrop="static" onHide={() => this.onCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>帳票フォーマット登録</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SelectForm
                        label="所属"
                        value={enterprise && enterprise.enterpriseId}
                        options={enterprises && enterprises.map((ent) => ({ value: ent.enterpriseId, name: ent.enterpriseName }))}
                        onChange={(val) => this.onChangeEnterprise(enterprises.find((ent) => ent.enterpriseId == val))}
                        validationState={inputCheck.enterprise.state}
                        helpText={inputCheck.enterprise.helpText}
                    />
                    <FileSelectForm
                        title="フォーマット"
                        acceptFileType={ACCEPT_FILETYPE} 
                        file={this.state.file}
                        onChangeFile={(file) => this.onChangeFile(file)}                        
                        validationState={inputCheck.file.state}
                        helpText={inputCheck.file.helpText}
                    />
                    <Checkbox
                        checked={allowOverwriting}
                        onClick={() => this.setState({ allowOverwriting: !allowOverwriting })}
                    >
                        同じ名前のファイルが存在する場合は上書きする
                    </Checkbox>
                    <MessageModal
                        show={message.show}
                        title={message.title}
                        bsSize="small"
                        buttonStyle={message.buttonStyle}
                        onOK={message.onOK}
                        onCancel={message.onCancel}
                    >
                        {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    </MessageModal>
                    <WaitingMessage show={isSaving} type="save" />
                </Modal.Body>
                <Modal.Footer>
                    <SaveButton
                        disabled={!canSave}
                        onClick={() => this.onSave()}
                    />
                    <CancelButton
                        onClick={() => this.onCancel()}
                    />
                </Modal.Footer>
            </Modal>
        );
    }

}

EmbeddedReportFormatRegisterModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onSaved: PropTypes.func,
    enterprises: PropTypes.array,
    mainEnterprise: PropTypes.object,
};
