/**
 * @license Copyright 2020 DENSO
 *
 * OperationLogSetting Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';
import { Button, Table, Form, FormGroup, Col, ControlLabel, FormControl } from "react-bootstrap";
import { SettingWidget } from "Assets/Widget/Widget";
import SelectForm from "../../Common/Form/SelectForm";
import {errorResult, successResult, VALIDATE_STATE, validateInteger} from "../../../javascripts/inputCheck";

const MAX_DISP_COUNT_LENGTH = 10;

/**
 * LinksSetting
 * @param {string} title パネルタイトル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} setting オペレーションログ設定
 * @param {object} functions 機能リスト
 * @param {function} onSave 保存時の関数
 */
export default class OperationLogSetting extends Component {

    constructor() {
        super();
        this.state = {
            inputValue: null,
            inputCheck: null,
            hasError: false,
        };
    }

    /**
     * setDefaultFormValue
     * props をデータ元とし、フォームのデフォルト構造をセットする
     */
    setDefaultFormValue() {
        this.setValue({ functionId: this.props.setting.functionId, maxDispCount: this.props.setting.maxDispCount });
    }

    /**
     * setValue
     * 値をセットしつつバリデーションを行う
     */
    setValue(inputValue) {
        const functionId = inputValue.functionId ? parseInt(inputValue.functionId, 10) : -1;
        const validateFunctionIdResult =
            functionId === -1 || this.props.functions.find(
                        item => item.functionId === functionId
                ) ? successResult : errorResult('正しく選択してください。');
        const validateDispCountResult = validateInteger(inputValue.maxDispCount, 1, MAX_DISP_COUNT_LENGTH);
        this.setState({
            inputValue: inputValue,
            inputCheck: {
                functionId: validateFunctionIdResult,
                maxDispCount: validateDispCountResult
            },
            hasError: (validateFunctionIdResult.state === VALIDATE_STATE.error || validateDispCountResult.state === VALIDATE_STATE.error)
        });
    }

    onFunctionIdValueChange(val) {
        this.setValue({ functionId: val, maxDispCount: this.state.inputValue.maxDispCount });
    }

    onMaxDispCountChange(val) {
        this.setValue({ functionId: this.state.inputValue.functionId, maxDispCount: val });
    }

    formatPostContent() {
        const { inputValue } = this.state;
        const content = {};
        if (inputValue.functionId > 0) {
            content['functionId'] = inputValue.functionId;
        }
        content['maxDispCount'] = inputValue.maxDispCount;
        return content;
    }

    /**
     * render
     */
    render() {
        const { inputValue, inputCheck, hasError } = this.state;

        const { isReadOnly } = this.props;
        const isEditable = !isReadOnly;

        const functionOptions = this.props.functions.map(item => ({
            name: item.name,
            value: item.functionId
        }));
        const maxDispCountOptions = Array(MAX_DISP_COUNT_LENGTH).fill(0).map((item, i) => ({
            name: i+1,
            value: i+1
        }));

        let functionName;
        if (isReadOnly && inputValue) {
            const func = functionOptions.find(f => f.value === inputValue.functionId);
            functionName = func ? func.name : '';
        }

        return (
            <div className="dashboard-item" data-dashboard-function-name="operationLog">
                <SettingWidget
                    title="オペレーションログ"
                    modalSize="md"
                    isReadOnly={isReadOnly}
                    hasSetting={true}

                    canSave={!hasError}
                    onShow={() => { this.setDefaultFormValue(); }}
                    onSaveButtonClick={(callback) => { this.props.onSave(this.formatPostContent(), { onComplete: result => { callback && callback(result); }})}}
                >
                    {
                        inputValue && (
                            <Form>
                                <FormGroup className="row">
                                    <Col componentClass={ControlLabel} className={isEditable && 'mt-05'} xs={4} sm={3}>
                                        機能絞り込み
                                    </Col>
                                    <Col xs={8} sm={9}>
                                        { isEditable ?
                                            <SelectForm
                                                className="mb-0"
                                                value={inputValue.functionId}
                                                options={functionOptions}
                                                placeholder=""
                                                validationState={inputCheck.functionId.state}
                                                helpText={inputCheck.functionId.helpText}
                                                onChange={(val) => {
                                                    this.onFunctionIdValueChange(val)
                                                }}
                                            />
                                            : <span>{functionName}</span>
                                        }
                                    </Col>
                                </FormGroup>
                                <FormGroup className="row">
                                    <Col componentClass={ControlLabel} className={isEditable && 'mt-05'} xs={4} sm={3}>
                                        <ControlLabel>表示件数</ControlLabel>
                                    </Col>
                                    <Col xs={8} sm={9}>
                                        { isEditable ?
                                            <SelectForm
                                                className="mb-0"
                                                value={inputValue.maxDispCount}
                                                options={maxDispCountOptions}
                                                isRequired={true}
                                                validationState={inputCheck.maxDispCount.state}
                                                helpText={inputCheck.maxDispCount.helpText}
                                                onChange={(val) => {
                                                    this.onMaxDispCountChange(val)
                                                }}
                                            />
                                            : <span>{inputValue.maxDispCount}</span>
                                        }
                                    </Col>
                                </FormGroup>
                            </Form>
                        )
                    }
                </SettingWidget>
            </div>
        );
    }
}

OperationLogSetting.defaultProps = {
    title: 'お知らせ',
    isReadOnly: false,
};