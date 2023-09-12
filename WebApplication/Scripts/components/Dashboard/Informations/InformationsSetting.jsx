/**
 * @license Copyright 2020 DENSO
 *
 * InformationsSetting Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import { Table } from "react-bootstrap";
import Button from "Common/Widget/Button";
import TextForm from "Common/Form/TextForm";
import DateTimeForm from "Common/Form/DateTimeForm";

import { AddCircleButton } from 'Assets/GarmitButton';

import { DATE_TIME_FORMAT } from "constant";

import { SettingWidget } from "Assets/Widget/Widget";

import {validateText, validateDate, successResult, VALIDATE_STATE, errorResult} from "inputCheck";

const MAXLENGTH_MESSAGE = 100;
const DATE_FORMAT = DATE_TIME_FORMAT.dateTime;

const NEW_ITEM_NO = -1;

/**
 * InformationsSetting
 * @param {string} title パネルタイトル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} informations お知らせのリスト
 * @param {function} onSave 保存時の関数
 */
export default class InformationsSetting extends Component {

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
        const informations = this.props.informations.slice(0).sort((a, b) => (a.no - b.no));
        const defaultFormValue = informations.map(item => this.getRowWithInputCheck(
            {
                no: item.no,
                message: item.message,
                startTime: moment(item.startTime).format(DATE_TIME_FORMAT.dateTime),
                endTime: moment(item.endTime).format(DATE_TIME_FORMAT.dateTime),
            }
        ));
        this.setState({currentFormValue: defaultFormValue});
    }

    /**
     * getEmptyInputValue
     * 1行分の空の入力値のセットを返す
     */
    getEmptyInputValue() {
        const startTime = moment().format(DATE_TIME_FORMAT.dateTime);
        const endTime = moment().add(7, 'd').format(DATE_TIME_FORMAT.dateTime);
        return {no: NEW_ITEM_NO, message: '', startTime: startTime, endTime: endTime};
    }

    /**
     * getRowWithInputCheck
     * 1行分の入力値を受け取り、入力値と入力チェック結果の構造を持ったオブジェクトを返す
     */
    getRowWithInputCheck(inputValue) {
        const validateMessageResult = validateText(inputValue.message, MAXLENGTH_MESSAGE);
        const validateStartTimeResult = validateDate(inputValue.startTime, DATE_FORMAT);
        let validateEndTimeResult = validateDate(inputValue.endTime, DATE_FORMAT);

        if (validateStartTimeResult.state == VALIDATE_STATE.success && validateEndTimeResult.state == VALIDATE_STATE.success && !moment(inputValue.endTime).isAfter(inputValue.startTime)) {
            validateEndTimeResult = errorResult('掲載終了は掲載開始以降となるように設定してください');
        }

        return {
            inputValue: inputValue,
            inputCheck: {
                message: validateMessageResult,
                startTime: validateStartTimeResult,
                endTime: validateEndTimeResult,
            },
            hasError: (
                validateMessageResult.state === VALIDATE_STATE.error
                || validateStartTimeResult.state === VALIDATE_STATE.error
                || validateEndTimeResult.state === VALIDATE_STATE.error
            )
        }
    }

    onRowChange(index, inputValue) {
        const newFormValue = this.state.currentFormValue.slice(0);
        const rowInputValue = Object.assign({}, this.state.currentFormValue[index].inputValue, inputValue);
        newFormValue.splice(index, 1, this.getRowWithInputCheck(rowInputValue));
        this.setState({currentFormValue: newFormValue});
    }

    onMessageValueChange(index, val) {
        this.onRowChange(index, { message: val });
    }

    onStartTimeValueChange(index, val) {
        this.onRowChange(index, { startTime: val });
    }

    onEndTimeValueChange(index, val) {
        this.onRowChange(index, { endTime: val });
    }

    /**
     * addRow
     * 1行を末尾に追加し、デフォルト値をセット
     */
    addRow() {
        const newFormValue = [ ...this.state.currentFormValue, this.getRowWithInputCheck(this.getEmptyInputValue()) ];
        this.setState({currentFormValue: newFormValue});
    }

    /**
     * deleteRow
     * 1行を削除
     */
    deleteRow(targetIndex) {
        const newFormValue = this.state.currentFormValue.filter((item, index) => index !== targetIndex);
        this.setState({currentFormValue: newFormValue});
    }

    /**
     * formatPostContent
     * 入力内容を POST データに変換する
     */
    formatPostContent() {
        return this.state.currentFormValue.map((item, index) => ({
            no: item.inputValue.no,
            message: item.inputValue.message,
            startTime: moment(item.inputValue.startTime).format(),
            endTime: moment(item.inputValue.endTime).format(),
        }));
    }

    /**
     * render
     */
    render() {
        const formValue = this.state.currentFormValue;

        const { isReadOnly } = this.props;
        const isEditable = !isReadOnly;

        const canSave = formValue ? !formValue.find(item => item.hasError) : false;

        const informations = formValue && formValue.map((item, index) => {
            return (
                <tr>
                    {
                        isEditable &&
                        <td className="text-center">
                            <Button isCircle={true} iconId="delete" className="btn-link" onClick={() => {
                                this.deleteRow(index)
                            }}></Button>
                        </td>
                    }
                    <td>
                        {
                            isEditable ?
                                <TextForm
                                    className="mb-0 normalText"
                                    maxlength={MAXLENGTH_MESSAGE}
                                    value={item.inputValue.message}
                                    validationState={item.inputCheck.message.state}
                                    helpText={item.inputCheck.message.helpText}
                                    placeholder=""

                                    onChange={val => { this.onMessageValueChange(index, val)} }
                                />
                                :<span>{item.inputValue.message}</span>
                        }


                    </td>
                    <td>
                        {
                            isEditable ?
                                <DateTimeForm
                                    className="mb-0 normalText"
                                    format={DATE_FORMAT}
                                    timePicker={true}

                                    value={item.inputValue.startTime}
                                    validationState={item.inputCheck.startTime.state}
                                    helpText={item.inputCheck.startTime.helpText}

                                    onChange={val => { this.onStartTimeValueChange(index, val) }}
                                />
                                : <span>{item.inputValue.startTime}</span>
                        }

                    </td>
                    <td>
                        {
                            isEditable ?

                                <DateTimeForm
                                    className="mb-0 normalText"
                                    format={DATE_FORMAT}
                                    timePicker={true}
                                    isReadOnly={false}

                                    value={item.inputValue.endTime}
                                    validationState={item.inputCheck.endTime.state}
                                    helpText={item.inputCheck.endTime.helpText}

                                    onChange={val => { this.onEndTimeValueChange(index, val) }}
                                />
                                : <span>{item.inputValue.endTime}</span>
                        }
                    </td>
                </tr>
            );
        });

        return (
            <div className="dashboard-item" data-dashboard-function-name="informations">
                <SettingWidget
                    title={this.props.title}
                    isReadOnly={isReadOnly}
                    canSave={canSave}
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
                            <th className="col-xs-6">メッセージ</th>
                            <th className="col-xs-3">掲載開始</th>
                            <th className="col-xs-3">掲載終了</th>
                        </tr>
                        </thead>
                        <tbody>
                        {informations}
                        </tbody>
                    </Table>
                    {
                        isEditable &&
                        <div className="text-right">
                            <AddCircleButton onClick={() => { this.addRow() }}/>
                        </div>
                    }

                </SettingWidget>
            </div>
        );
    }
}

InformationsSetting.defaultProps = {
    title: 'お知らせ',
    isReadOnly: false,
};