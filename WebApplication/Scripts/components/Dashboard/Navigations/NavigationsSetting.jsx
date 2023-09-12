/**
 * @license Copyright 2020 DENSO
 *
 * NavigationsSetting Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import { SettingWidget } from "Assets/Widget/Widget";
import {Table} from "react-bootstrap";

import TextForm from "Common/Form/TextForm";
import SelectForm from "Common/Form/SelectForm";
import Button from "Common/Widget/Button";

import { validateText, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';

const MAXLENGTH_TITLE = 20;

/**
 * NavigationsSetting
 * @param {string} title パネルタイトル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} functions 機能リスト
 * @param {object} navigations ナビゲーションのリスト
 * @param {function} onSave 保存時の関数
 */
export default class NavigationsSetting extends Component {

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

        if (this.props.navigations) {
            this.props.navigations.forEach(item => {
                defaultFormValue.splice(
                    item.no - 1,
                    1,
                    this.getRowWithInputCheck({functionId: item.function.functionId, title: item.title}))
            });
        }
        this.setState({currentFormValue: defaultFormValue});
    }

    /**
     * getEmptyInputValue
     * 1行分の空の入力値のセットを返す
     */
    getEmptyInputValue() {
        return {functionId: '', title: ''};
    }

    /**
     * getRowWithInputCheck
     * 1行分の入力値を受け取り、入力値と入力チェック結果の構造を持ったオブジェクトを返す
     */
    getRowWithInputCheck(inputValue) {
        let validateFunctionIdResult, validateTitleResult;
        if (inputValue.functionId === '' && inputValue.title === '') {
            validateFunctionIdResult = validateTitleResult = successResult;
        } else {
            validateFunctionIdResult = this.props.functions.find(item => item.functionId == inputValue.functionId) ?
                successResult : errorResult('正しく選択してください。');
            validateTitleResult = validateText(inputValue.title, MAXLENGTH_TITLE);
        }
        return {
            inputValue: {
                functionId: inputValue.functionId,
                title: inputValue.title,
            },
            inputCheck: {
                functionId: validateFunctionIdResult,
                title: validateTitleResult,
            },
            hasError: (validateFunctionIdResult.state === VALIDATE_STATE.error || validateTitleResult.state === VALIDATE_STATE.error)
        }
    }

    onRowChange(index, inputValue) {
        const newFormValue = this.state.currentFormValue.slice(0);
        newFormValue.splice(index, 1, this.getRowWithInputCheck(inputValue));
        this.setState({currentFormValue: newFormValue});
    }

    onFunctionIdValueChange(index, val) {
        const selectedFunction = this.props.functions.find(item => item.functionId == val);
        if (selectedFunction) {
            this.onRowChange(index, { functionId: val, title: selectedFunction.name.replace('＞', ': ') });
        } else {
            this.clearRow(index);
        }
    }

    onTitleValueChange(index, val) {
        this.onRowChange(index, { functionId: this.state.currentFormValue[index].inputValue.functionId, title: val});
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
            item.inputValue.functionId ? {
                no: index + 1,
                title: item.inputValue.title,
                function: this.props.functions.find(
                    func => (func.functionId === parseInt(item.inputValue.functionId, 10))
                ),
            } : null
        )).filter(item => item)
    }

    onSaveComplete(result) {
        this.setState({saveResult: result});
    }

    /**
     * render
     */
    render() {
        const formValue = this.state.currentFormValue;

        const { isReadOnly } = this.props;
        const isEditable = !isReadOnly;

        const canSave = formValue ? !formValue.find(item => item.hasError) : false;
        const functionOptions = this.props.functions.map(item => ({
            name: item.name,
            value: item.functionId
        }));

        const navigations = formValue && formValue.map((item, index) => {
            let functionName;
            if (isReadOnly) {
                const func = functionOptions.find(f => f.value === item.inputValue.functionId);
                functionName = func ? func.name : '　';
            }
            return (
                <tr>
                    { isEditable &&
                        <td className="text-center">
                            <Button isCircle={true} iconId="erase" className="btn-link" onClick={() => {
                                this.clearRow(index);
                            }}></Button>
                        </td>
                    }

                    <td>
                        {
                            isEditable ?
                                <SelectForm
                                    className="mb-0"
                                    value={item.inputValue.functionId}
                                    options={functionOptions}
                                    placeholder=""
                                    validationState={item.inputCheck.functionId.state}
                                    helpText={item.inputCheck.functionId.helpText}
                                    onChange={(val) => { this.onFunctionIdValueChange(index, val)} }
                                />
                                : <span>{functionName}</span>
                        }
                    </td>
                    <td>
                        {
                            isEditable ?
                                <TextForm
                                    className="mb-0 normalText"
                                    maxlength={MAXLENGTH_TITLE}
                                    value={item.inputValue.title}
                                    validationState={item.inputCheck.title.state}
                                    helpText={item.inputCheck.title.helpText}
                                    placeholder=""
                                    onChange={(val) => { this.onTitleValueChange(index, val)} }
                                />
                                : <span>{item.inputValue.title}</span>
                        }

                    </td>
                </tr>
            );
        });
        return (
            <div className="dashboard-item" data-dashboard-function-name="navigations">
                <SettingWidget
                    title={this.props.title}
                    modalSize="lg"
                    isReadOnly={isReadOnly}
                    canSave={canSave}
                    onShow={() => { this.initModalContent(); }}
                    onSaveButtonClick={(callback) => { this.props.onSave(this.formatPostContent(), { onComplete: result => { callback && callback(result); }})}}
                    saveResult = { this.state.saveResult }
                >
                    <Table striped bordered>
                        <thead>
                        <tr>
                            {
                                isEditable &&
                                <th className="single-action"></th>
                            }
                            <th className="col-xs-6">メニュー</th>
                            <th className="col-xs-6">表示</th>
                        </tr>
                        </thead>
                        <tbody>
                        {navigations}
                        </tbody>
                    </Table>
                </SettingWidget>
            </div>
        );
    }
}


NavigationsSetting.defaultProps = {
    title: 'ナビゲーション',
    isReadOnly: false,
};