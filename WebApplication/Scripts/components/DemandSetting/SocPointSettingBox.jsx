'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Checkbox } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import InputTable from 'Common/Form/InputTable';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import Button from 'Common/Widget/Button';

import MessageModal from 'Assets/Modal/MessageModal';

import { LAVEL_TYPE } from 'authentication';　

export default class SocPointSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkedPointNos: [],
            message: {}
        };
    }

    /**
     * 行を生成する
     */
    makeRows() {
        const { triggerThresholds, points, inputCheck, triggerTypes } = this.props;
        const { checkedPointNos } = this.state;

        const pointNos = triggerThresholds.map((tt) => tt.pointNo).filter((pointNo, i, self) => self.indexOf(pointNo) == i);
        const rows = [];

        pointNos.forEach((pointNo) => {
            const availablePoints = points.filter((p) => p.pointNo == pointNo || !triggerThresholds.some((tt) => tt.pointNo == p.pointNo));
            const checked = checkedPointNos.indexOf(pointNo) >= 0;
            const triggerIds = triggerTypes.map((type) => type.triggerId);
            const ttsIndexes = triggerIds.map((id) => triggerThresholds.findIndex((tt) => tt.pointNo == pointNo && tt.triggerType.triggerId == id));

            const columnInfo = [
                {
                    bsClass: "flex-center",
                    checked: checked,
                    onChange: () => this.onCheckChange(!checked, pointNo)
                },
                {
                    isReadOnly: ttsIndexes.some((index) => triggerThresholds[index].inUseTriggerControl),
                    pointNo: pointNo,
                    points: availablePoints,
                    onChange: (val) => this.onPointChange(parseInt(val), pointNo, checked),
                    validationState: inputCheck[ttsIndexes[0]].pointNo.state,
                    helpText: inputCheck[ttsIndexes[0]].pointNo.helpText
                }
            ];

            ttsIndexes.forEach((index) => {
                columnInfo.push({
                    value: triggerThresholds[index].threshold,
                    onChange: (val) => this.onThresholdChange(val, pointNo, triggerThresholds[index].triggerType.triggerId),
                    validationState: inputCheck[index].threshold.state,
                    helpText: inputCheck[index].threshold.helpText,
                    unit: triggerThresholds[index].triggerType.unit
                });
            });

            rows.push({
                id: pointNo,
                columnInfo: columnInfo
            });
        });

        return rows;
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onClickAdd() {
        const { triggerThresholds, triggerTypes } = this.props;
        const newTriggerThresholds = [...triggerThresholds.slice(), ...triggerTypes.map((type) => ({ pointNo: -1, triggerType: type }))];
        this.props.onEdit(newTriggerThresholds);
    }

    /**
     * 削除ボタンがクリックされた時
     */
    onClickDelete() {
        const { checkedPointNos } = this.state;
        const inUsePoints = checkedPointNos
            .filter((pointNo) => this.props.triggerThresholds.some((tt) => tt.pointNo == pointNo && tt.inUseTriggerControl))
            .map((pointNo) => this.props.points.find((p) => p.pointNo == pointNo));

        if (inUsePoints.length > 0) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: '削除エラー',
                    message:
                        <div>
                            <div>制御設定でトリガーに設定されているポイントを含むため、削除できません。</div>
                            <div>【対象ポイント】</div>
                            {inUsePoints.map((p) => <div>・{p.pointName}</div>)}
                        </div>,
                    bsSize: 'sm',
                    onCancel: () => this.clearMessage()
                }
            });
            return;
        } else {
            const triggerThresholds = this.props.triggerThresholds.filter((tt) => checkedPointNos.indexOf(tt.pointNo) < 0);
            this.props.onEdit(triggerThresholds);
            this.setState({ checkedPointNos: [] });
        }
    }

    /**
     * 全チェックのチェック状態が変更された時
     * @param {any} checked
     */
    onAllCheckChange(checked) {
        const { triggerThresholds } = this.props;
        let checkedPointNos = [];

        if (checked) {
            checkedPointNos = triggerThresholds.map((tt) => tt.pointNo).filter((pointNo, i, self) => self.indexOf(pointNo) === i); 
        }

        this.setState({ checkedPointNos: checkedPointNos });
    }

    /**
     * チェック状態が変更された時
     * @param {any} checked
     * @param {any} pointNo
     */
    onCheckChange(checked, pointNo) {
        const checkedPointNos = this.state.checkedPointNos.slice();
        if (checked) {
            checkedPointNos.push(pointNo);
        } else {
            checkedPointNos.splice(checkedPointNos.indexOf(pointNo), 1);
        }
        this.setState({ checkedPointNos: checkedPointNos });
    }

    /**
     * ポイントが変更された時
     * @param {any} after
     * @param {any} before
     * @param {any} checked
     */
    onPointChange(after, before, checked) {
        const { triggerThresholds } = this.props;
        const checkedPointNos = this.state.checkedPointNos.slice();
        let tts;
        if (after < 0) {
            tts = triggerThresholds.filter((tt) => tt.pointNo != before);
            if (checked) {
                checkedPointNos.splice(checkedPointNos.indexOf(before), 1);
            }
        } else {
            tts = triggerThresholds.map((tt) => tt.pointNo != before ? tt : Object.assign({}, tt, { pointNo: after }));
            if (checked) {
                checkedPointNos.splice(checkedPointNos.indexOf(before), 1, after);
            }
        }

        this.setState({ checkedPointNos: checkedPointNos }, () => {
            this.props.onEdit(tts);
        });
    }

    /**
     * 閾値が変更された時
     * @param {any} val
     * @param {any} pointNo
     * @param {any} triggerId
     */
    onThresholdChange(val, pointNo, triggerId) {
        const triggerThresholds = this.props.triggerThresholds.slice();
        const index = triggerThresholds.findIndex((tt) => tt.pointNo == pointNo && tt.triggerType.triggerId == triggerId);
        triggerThresholds[index] = Object.assign({}, triggerThresholds[index], { threshold: val });
        this.props.onEdit(triggerThresholds);
    }

    /**
     * 使用可能なポイントが存在するか
     */
    existAvailablePoint() {
        const { points, triggerThresholds } = this.props;
        return points.some((p) => !triggerThresholds.some((tt) => tt.pointNo == p.pointNo));
    }

    /**
     * 全てチェック状態かどうか
     */
    isAllChecked() {
        const { triggerThresholds } = this.props;
        const { checkedPointNos } = this.state;
        return triggerThresholds.length > 0 && !triggerThresholds.some((tt) => checkedPointNos.indexOf(tt.pointNo) < 0);
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
        const { triggerThresholds, points, isLoading, triggerTypes } = this.props;
        const { checkedPointNos, message } = this.state

        return (
            <Box boxStyle="default" isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>SOCポイント設定</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputTable
                        headerInfo={[
                            {
                                label: '削除',
                                columnSize: 1,
                                showCheckBox: true,
                                checkBoxDisabled: !(triggerThresholds && triggerThresholds.length > 0),
                                checked: this.isAllChecked(),
                                onChangeChecked: () => this.onAllCheckChange(!this.isAllChecked())
                            },
                            { label: 'ポイント', columnSize: 3 },
                            ...triggerTypes.map((type) => ({ label: type.triggerName, columnSize: 2 }))
                        ]}
                        inputComponentList={[Checkbox, PointSelectForm, TextForm, TextForm, TextForm, TextForm]}
                        data={this.makeRows()}
                    />
                        <Button
                            className="mt-05"
                            iconId="delete"
                            bsSize="sm"
                            disabled={!(checkedPointNos && checkedPointNos.length > 0)}
                            onClick={() => this.onClickDelete()}
                        >
                            削除
                        </Button>
                        <Button
                            className="ml-05 mt-05"
                            iconId="add"
                            bsSize="sm"
                            disabled={!this.existAvailablePoint() || triggerThresholds.some((tt) => tt.pointNo < 0 )}
                            onClick={() => this.onClickAdd()}
                        >
                            追加
                        </Button>
                        <MessageModal
                            show={message.show}
                            title={message.title}
                            bsSize={message.bsSize}
                            buttonStyle={message.buttonStyle}
                            onOK={message.onOK}
                            onCancel={message.onCancel}
                        >
                            {message.message}
                        </MessageModal>
                </Box.Body>
            </Box>
        );
    }
}

/**
* ポイント選択フォーム
*/
const PointSelectForm = ({ isBlank, isReadOnly, pointNo, points, onChange, validationState, helpText }) => {
    if (isBlank) {
        return <div />
    }
    return (
        <SelectForm
            isReadOnly={isReadOnly}
            value={pointNo}
            options={points && points.map((p) => ({ value: p.pointNo, name: p.pointName }))}
            onChange={(val) => onChange(val)}
            validationState={validationState}
            helpText={helpText}
        />
    );
}