/**
 * @license Copyright 2020 DENSO
 *
 * LinksSetting Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import { SettingWidget } from "Assets/Widget/Widget";
import { Table} from "react-bootstrap";
import Button from "Common/Widget/Button";
import TextForm from "Common/Form/TextForm";
import { validateText, validateUrl, VALIDATE_STATE, successResult } from 'inputCheck';

const MAXLENGTH_URL = 100;
const MAXLENGTH_TITLE = 20;

/**
 * LinksSetting
 * @param {string} title パネルタイトル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} link 外部リンクのリスト
 * @param {function} onSave 保存時の関数
 */
export default class LinksSetting extends Component {

    constructor() {
        super();
        this.state = {
            currentFormValue: null,
        };
    }

    /**
     * initModalContent
     * モーダル内のフォーム等を初期化する
     */
    initModalContent() {
        this.setDefaultFormValue();
    }

    /**
     * setDefaultFormValue
     * props をデータ元とし、フォームのデフォルト構造をセットする
     */
    setDefaultFormValue() {
        const defaultFormValue = Array(5).fill(this.getRowWithInputCheck(this.getEmptyInputValue()));

        if (this.props.links) {
            this.props.links.forEach(item => {
                defaultFormValue.splice(item.no - 1, 1, this.getRowWithInputCheck(item))
            });
        }
        this.setState({currentFormValue: defaultFormValue});
    }

    /**
     * getEmptyInputValue
     * 1行分の空の入力値のセットを返す
     */
    getEmptyInputValue() {
        return {title: '', url: ''};
    }

    /**
     * getRowWithInputCheck
     * 1行分の入力値を受け取り、入力値と入力チェック結果の構造を持ったオブジェクトを返す
     */
    getRowWithInputCheck(inputValue) {
        let validateTitleResult, validateUrlResult;
        if (inputValue.title === '' && inputValue.url === '') {
            validateTitleResult = validateUrlResult = successResult;
        } else {
            validateTitleResult = validateText(inputValue.title, MAXLENGTH_TITLE);
            validateUrlResult = validateUrl(inputValue.url, MAXLENGTH_URL);
        }
        return {
            inputValue: inputValue,
            inputCheck: {
                title: validateTitleResult,
                url: validateUrlResult,
            },
            hasError: (validateTitleResult.state === VALIDATE_STATE.error || validateUrlResult.state === VALIDATE_STATE.error)
        }
    }

    onRowChange(index, inputValue) {
        const newFormValue = this.state.currentFormValue.slice(0);
        newFormValue.splice(index, 1, this.getRowWithInputCheck(inputValue));
        this.setState({currentFormValue: newFormValue});
    }

    onTitleValueChange(index, val) {
        this.onRowChange(index, { title: val, url: this.state.currentFormValue[index].inputValue.url});
    }

    onUrlValueChange(index, val) {
        this.onRowChange(index, { title: this.state.currentFormValue[index].inputValue.title, url: val});
    }

    clearRow(index) {
        this.onRowChange(index, this.getEmptyInputValue());
    }

    /**
     * formatPostContent
     * 入力内容を POST データに変換する
     */
    formatPostContent() {
        return this.state.currentFormValue.map((item, index) => (
                item.inputValue.url !== '' ? {
                    no: index + 1,
                    title: item.inputValue.title,
                    url: item.inputValue.url,
                } : null
            )).filter(item => item)
    }

    /**
     * render
     */
    render() {
        const formValue = this.state.currentFormValue;

        const { isReadOnly } = this.props;
        const isEditable = !isReadOnly;

        const canSave = formValue ? !formValue.find(item => item.hasError) : false;

        const linksHTML = formValue && formValue.map((item, index) => {
            let title = "";
            let url = "";
            if (item && item.inputValue) {
                title = item.inputValue.title;
                url = item.inputValue.url;
            }
            return (
                <tr>
                    {
                        isEditable &&
                        <td className="text-center">
                            <Button isCircle={true} iconId="erase" className="btn-link" onClick={() => {
                                this.clearRow(index);
                            }}></Button>
                        </td>
                    }
                    <td>
                        {
                            isEditable ?
                            <TextForm
                                className="mb-0 normalText"
                                value={title}
                                maxlength={MAXLENGTH_TITLE}
                                onChange={(val) => { this.onTitleValueChange(index, val) }}
                                validationState={item.inputCheck.title.state}
                                helpText={item.inputCheck.title.helpText}
                                placeholder=""
                                isReadOnly={isReadOnly}
                            />
                            : <span>{title || "　"}</span>
                        }
                    </td>
                    <td>
                        {
                            isEditable ?
                                <TextForm
                                    className="mb-0 normalText"
                                    value={url}
                                    maxlength={MAXLENGTH_URL}
                                    onChange={(val) => { this.onUrlValueChange(index, val)} }
                                    validationState={item.inputCheck.url.state}
                                    helpText={item.inputCheck.url.helpText}
                                    placeholder=""
                                    isReadOnly={isReadOnly}
                                />
                                : <span>{url || "　"}</span>
                        }
                    </td>
                </tr>
            );
        });

        return (
            <div className="dashboard-item" data-dashboard-function-name="links">
                <SettingWidget
                    title={this.props.title}
                    hasSetting={true}
                    canSave={canSave}
                    isReadOnly={isReadOnly}

                    onShow={() => { this.initModalContent(); }}
                    onSaveButtonClick={(callback) => { this.props.onSave(this.formatPostContent(), { onComplete: result => { callback && callback(result); }})}}
                >
                    <Table striped bordered>
                        <thead>
                        <tr>
                            {
                                isEditable &&
                                <th className="single-action"></th>
                            }
                            <th className="col-xs-4">リンク名</th>
                            <th className="col-xs-8">URL</th>
                        </tr>
                        </thead>
                        <tbody>
                        {linksHTML}
                        </tbody>
                    </Table>
                </SettingWidget>
            </div>
        );
    }
}

LinksSetting.defaultProps = {
    title: '外部リンク',
    isReadOnly: true,
};