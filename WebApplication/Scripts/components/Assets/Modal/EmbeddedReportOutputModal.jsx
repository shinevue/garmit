/**
 * @license Copyright 2020 DENSO
 *
 * 帳票出力モーダル Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Checkbox } from 'react-bootstrap';
import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';
import SelectForm from 'Common/Form/SelectForm';
import Button from 'Common/Widget/Button';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { CancelButton } from 'Assets/GarmitButton';

import {validateSelect, validateFileName, VALIDATE_STATE, validateTextArea} from 'inputCheck';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const MAX_TITLE_LENGTH = 1000;

/**
 * 帳票出力モーダルモーダル
 * @param {boolean} show モーダルを表示するかどうか
 */
export default class EmbeddedReportOutputModal extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            idProcessing: false,
            message: {},
            enterprise: null,
            format: null,
            allowOverwriting: false,
            formats: null,
            title: '',
            isConvert: false,
        };
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.loadFormats();
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        //モーダルが表示されるとき
        if (nextProps.show != this.props.show && nextProps.show) {
            this.loadFormats((formats) => {
                const { mainEnterprise, condition } = nextProps;
                this.setState({
                    enterprise: mainEnterprise,
                    format: this.findDefaultFormat(formats, mainEnterprise),
                    title: this.props.defaultReportTitle.substr(0, MAX_TITLE_LENGTH)
                });
            });
        }
    }

    /**
     * 選択した所属のフォーマットで最も小さい番号のフォーマットを選択する
     * 存在しなかった場合は false を返す
     */
    findDefaultFormat(formats, enterprise) {
        if (!formats || !Array.isArray(formats)) {
            return undefined;
        }
        let formatList = formats.filter(f => f.enterprise.enterpriseId == enterprise.enterpriseId);
        if (!formatList.length) {
            return undefined;
        }
        formatList.sort((a, b) => a.formatNo - b.formatNo);
        return formatList[0];
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
     * 所属が変更された時
     * @param {any} enterprise
     */
    onChangeEnterprise(enterprise) {
        const { formats } = this.state;
        const { mainEnterprise } = this.props;
        this.setState({ enterprise: enterprise, format: enterprise && enterprise.enterpriseId && this.findDefaultFormat(formats, enterprise) });
    }

    /**
     * フォーマットが変更された時
     * @param {any} format
     */
    onChangeFormat(format) {
        this.setState({ format: format });
    }

    /**
     * タイトルが変更された時
     * @param {any} title
     */
    onChangeTitle(title) {
        this.setState({ title: title });
    }

    /**
     * 出力ボタンがクリックされたとき
     */
    onOutputClick() {
        this.output();
    }

    /**
     * フォーマットリストを読み込む
     * @param {any} callback
     */
    loadFormats(callback) {
        const { apiUrl } = this.props;
        apiUrl && apiUrl.getFormats &&
            this.setState({ isLoading: true }, () => {
                sendData(EnumHttpMethod.get, apiUrl.getFormats, null, (formats, networkError) => {
                    this.setState({ isLoading: false });
                    if (networkError) {
                        this.showNetWorkErrorMessage();
                    } else if (formats) {
                        this.setState({ formats: formats });
                    }
                    if (callback) {
                        callback(formats);
                    }
                });
            });
    }

    /**
     * 出力する
     */
    output() {
        const { title, format } = this.state;
        const { condition, apiUrl } = this.props;
        console.log(condition);
        const data = Object.assign({}, condition, {
            title: title,
            embeddedReportFormat: format,
        });

        apiUrl && apiUrl.output &&
            this.setState({ isProcessing: true }, () => {
                sendData(EnumHttpMethod.post, apiUrl.output, data, (info, networkError) => {
                    this.setState({ isProcessing: false });
                    if (networkError) {
                        this.showNetWorkErrorMessage();
                    } else if (info) {
                        if (info.outputFileUrl) {
                            if (this.props.onHide) {
                                this.props.onHide();
                            }
                            let a = document.createElement('a');
                            a.href = info.outputFileUrl;
                            a.target = '_blank';
                            a.download = '';
                            a.click();
                        }
                        if (info.requestResult && !info.requestResult.isSuccess) {
                            this.showErrorMessage(info.requestResult.message);
                        }
                    }
                });
            });
    }

    /**
     * 入力の検証を行う
     */
    validateInput() {
        const { enterprise, format, title } = this.state;
        return {
            enterprise: validateSelect(enterprise && enterprise.enterpriseId),
            format: validateSelect(format && format.formatNo),
            title: validateTextArea(title, MAX_TITLE_LENGTH, true)
        };
    }

    /**
     * 出力可能かどうか
     * @param {any} inputCheck
     */
    canOutput(inputCheck) {
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
        const { isLoading, message, isProcessing, formats, enterprise, format, title, isConvert, allowOverwriting } = this.state;

        const formatList = (formats && enterprise) && formats.filter((f) => f.enterprise.enterpriseId === enterprise.enterpriseId);
        const inputCheck = this.validateInput();
        const canOutput = this.canOutput(inputCheck);

        return (
            <Modal show={show} bsSize="lg" backdrop="static" onHide={() => this.onCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>帳票出力確認</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SelectForm
                        label="所属"
                        value={enterprise && enterprise.enterpriseId}
                        options={enterprises && enterprises.map((ent) => ({ value: ent.enterpriseId, name: ent.enterpriseName }))}
                        validationState={inputCheck.enterprise.state}
                        helpText={inputCheck.enterprise.helpText}
                        onChange={(val) => this.onChangeEnterprise(enterprises.find((ent) => ent.enterpriseId == val))}
                    />
                    <SelectForm
                        label="フォーマット"
                        value={format && format.formatNo}
                        options={formatList && formatList.map((f) => ({value: f.formatNo, name: f.fileName }))}
                        validationState={inputCheck.format.state}
                        helpText={inputCheck.format.helpText}
                        onChange={(val) => this.onChangeFormat(formatList.find((f) => f.formatNo == val))}
                    />
                    <TextareaForm
                        label="タイトル"
                        maxlength={MAX_TITLE_LENGTH}
                        value={title}
                        validationState={inputCheck.title.state}
                        helpText={inputCheck.title.helpText}
                        onChange={(val) => this.onChangeTitle(val)}
                    >
                    </TextareaForm>
                    <MessageModal
                        show={message.show}
                        title={message.title}
                        bsSize="small"
                        buttonStyle={message.buttonStyle}
                        onOK={message.onOK}
                        onCancel={message.onCancel}
                        disabled={isLoading}
                    >
                        {message.message}
                    </MessageModal>
                    <WaitingMessage show={isProcessing} type="export" />

                </Modal.Body>
                <Modal.Footer>
                    <Button
                        iconId="report-output"
                        disabled={!canOutput}
                        onClick={() => this.onOutputClick()}
                    >
                        出力
                    </Button>
                    <CancelButton
                        onClick={() => this.onCancel()}
                    />
                </Modal.Footer>
            </Modal>
        );
    }

}

EmbeddedReportOutputModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    enterprises: PropTypes.array,
    mainEnterprise: PropTypes.object,
    rack: PropTypes.object
};
