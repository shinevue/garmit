'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LabelForm from 'Common/Form/LabelForm';

import MessageModal from 'Assets/Modal/MessageModal';

export default class FileSelectForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileName: '',
            message: {}
        };
    }

    /**
     * ファイル選択が変更されたとき
     */
    onFileChange() {
        if (this.props.onChange) {
            const file = this.refs.file.files[0];
            if (!file.name.match(/.csv$/)) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: 'ファイル形式エラー',
                        message: '選択したファイルの形式には対応していません。',
                        onCancel: () => this.setState({ message: Object.assign({}, this.state.message, { show: false }) })
                    }
                });
            } else {
                let reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = () => {
                    const unicode_array = Encoding.convert(new Uint8Array(reader.result), "UNICODE");   //文字コードを自動判別でUnicodeに変換
                    const text = Encoding.codeToString(unicode_array);  // 文字列型に変換
                    const rows = this.csvToArray(text);
                    this.props.onChange(rows, file.name);
                    this.refs.file.value = '';
                };
            }
        }
    }

    /**
     * クリアボタンのクリックイベント
     */
    onClearClick() {
        if (this.props.onChange) {
            this.props.onChange(null, '');
        }
    }

    csvToArray(csvString) {
        var separator = ",";
        var columnSize = csvString.split(/\r\n|\r|\n/)[0].split(separator).length;
        var chars = Array.from(csvString);
        var rows = [];
        var row = "";
        var queteOpenFlg = false;

        // 先頭にBOMがある場合はBOMを削除
        if (chars[0].charCodeAt(0) == 0xFEFF) {
            chars.shift();
        }

        for (var i = 0; i < chars.length; i++) {
            if (!queteOpenFlg && (chars[i] == '\n' || (chars[i] == '\r' && chars[i + 1] != '\n'))) {
                rows.push(row);
                row = "";
            } else {
                if (!queteOpenFlg && (chars[i] == '\r' && chars[i + 1] == '\n')) {
                    continue;
                }

                if (chars[i] == '"') {
                    queteOpenFlg = !queteOpenFlg;
                }

                row += chars[i];
            }
        }
        return rows;
    }


    /**
     * render
     */
    render() {
        const { fileName, onChange } = this.props;
        const { message } = this.state;
        return (
            <span>
                <LabelForm
                    value={fileName}
                    addonButton={[
                        {
                            key: 'select',
                            bsStyle: 'primary',
                            buttonIconClass: 'fal fa-folder-open',
                            label: '選択',
                            onClick: () => this.refs.file.click()
                        },
                        {
                            key: 'clear',
                            iconId: 'uncheck',
                            bsStyle: 'lightgray',
                            label: 'クリア',
                            onClick: () => this.onClearClick()
                        }
                    ]}
                />
                <input
                    ref="file"
                    type="file"
                    accept=".csv"
                    pattern=".+\c"
                    style={{ display: 'none' }}
                    onChange={() => this.onFileChange()}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
            </span>
        );
    }
}