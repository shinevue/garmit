'use strict';

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { LAVEL_TYPE } from 'authentication';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';
import LocationForm from 'Assets/Condition/LocationForm';
import GarmitBox from 'Assets/GarmitBox';
import MessageModal from 'Assets/Modal/MessageModal';

import { MAXLENGTH_PATCHBOARD_NAME, MAXLENGTH_PATCHBOARD_MEMO } from 'patchboardUtility';
import ParentPatchboardForms from 'Patchboard/ParentPatchboardForms';

export default class PatchboardEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: {}
        };
    }

    /**
     * 配線盤種別
     * @param {any} patchboardType
     */
    onPatchboardTypeChange(patchboardType) {
        // 種別が「局入」に変更された場合
        if (patchboardType && patchboardType.typeId == 0) {
            if (this.props.bulk) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'confirm',
                        title: '確認',
                        message: '親配線盤の紐づけを解除します。\r\nよろしいですか？',
                        onOK: () => {
                            this.clearMessage();
                            this.props.onChange([
                                { key: 'patchboardType', value: patchboardType },
                                { key: 'pathsToRoot', value: [] },
                            ]);
                        },
                        onCancel: () => {
                            this.clearMessage();
                        }
                    }
                });
            } else {
                if (this.props.childrenPatchboards.length > 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: 'エラー',
                            message: '子配線盤が存在するため種別を「局入」に変更できません。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                    return;
                } else if (this.props.patchboard.pathsToRoot && this.props.patchboard.pathsToRoot.length > 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'confirm',
                            title: '確認',
                            message: '親配線盤の選択を解除します。\r\nよろしいですか？',
                            onOK: () => {
                                this.clearMessage();
                                this.props.onChange([
                                    { key: 'patchboardType', value: patchboardType },
                                    { key: 'pathsToRoot', value: [] },
                                ]);
                            },
                            onCancel: () => {
                                this.clearMessage();
                            }
                        }
                    });
                } else {
                    this.props.onChange([{ key: 'patchboardType', value: patchboardType }]);
                }
            }
        } else {
            this.props.onChange([{ key: 'patchboardType', value: patchboardType }]);
        }
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    render() {
        const { bulk, lookUp, level, patchboard, inputCheck, patchboards, checked } = this.props;
        const { message } = this.state;
        const patchboardTypes = (lookUp && lookUp.patchboardTypes) || [];
        const patchCableTypes = (lookUp && lookUp.patchCableTypes) || [];

        return (
            <GarmitBox title="配線盤情報">
                {bulk ?
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col
                                label="種別"
                                columnCount={1}
                                isRequired
                                checkbox={true}
                                checked={checked.patchboardType}
                                onCheckChange={() => this.props.onCheckChange([{ value: !checked.patchboardType, key: 'patchboardType' }])}
                            >
                                <SelectForm
                                    isReadOnly={!checked.patchboardType}
                                    value={patchboard.patchboardType && patchboard.patchboardType.typeId}
                                    options={patchboardTypes.map((type) => ({ value: type.typeId, name: type.name }))}
                                    onChange={(value) => {
                                        const patchboardType = patchboardTypes.find((type) => type.typeId == value);
                                        this.onPatchboardTypeChange(patchboardType);
                                    }}
                                    validationState={inputCheck.patchboardType.state}
                                    helpText={inputCheck.patchboardType.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col
                                label="ロケーション"
                                columnCount={1}
                                isRequired
                                checkbox={true}
                                checked={checked.location}
                                onCheckChange={() => this.props.onCheckChange([{ value: !checked.location, key: 'location' }])}
                            >
                                <LocationForm
                                    disabled={!checked.location}
                                    multiple={false}
                                    locationList={lookUp && lookUp.locations}
                                    selectedLocation={patchboard.location}
                                    onChange={(value) => this.props.onChange([{ key: 'location', value: value }])}
                                    validationState={inputCheck.location.state}
                                    helpText={inputCheck.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    :
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="種別" columnCount={2} isRequired >
                                <SelectForm
                                    value={patchboard.patchboardType && patchboard.patchboardType.typeId}
                                    options={patchboardTypes.map((type) => ({ value: type.typeId, name: type.name }))}
                                    onChange={(value) => {
                                        const patchboardType = patchboardTypes.find((type) => type.typeId == value);
                                        this.onPatchboardTypeChange(patchboardType);
                                    }}
                                    validationState={inputCheck.patchboardType.state}
                                    helpText={inputCheck.patchboardType.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="メタル/光" columnCount={2} isRequired >
                                <SelectForm
                                    value={patchboard.patchCableType && patchboard.patchCableType.id}
                                    options={patchCableTypes.map((type) => ({value: type.id, name: type.name }))}
                                    onChange={(value) => {
                                        const patchCableType = patchCableTypes.find((type) => type.id == value);
                                        this.props.onChange([{ key: 'patchCableType', value: patchCableType }]);
                                    }}
                                    validationState={inputCheck.patchCableType.state}
                                    helpText={inputCheck.patchCableType.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="名称" columnCount={2} isRequired >
                                <TextForm
                                    value={patchboard.patchboardName}
                                    onChange={(value) => this.props.onChange([{ key: 'patchboardName', value: value }])}
                                    maxlength={MAXLENGTH_PATCHBOARD_NAME}
                                    validationState={inputCheck.patchboardName.state}
                                    helpText={inputCheck.patchboardName.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="親配線盤" columnCount={2} isRequired={patchboard.patchboardType && patchboard.patchboardType.typeId != 0}>
                                <ParentPatchboardForms
                                    disabled={patchboard.patchboardType && patchboard.patchboardType.typeId == 0}   //「局入」の場合は編集不可
                                    pathsToRoot={patchboard.pathsToRoot}
                                    patchboard={patchboard}
                                    patchboards={patchboards}
                                    onChange={(value) => this.props.onChange([{ key: 'pathsToRoot', value: value }])}
                                    validation={inputCheck.pathsToRoot}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ロケーション" columnCount={1} isRequired >
                                <LocationForm
                                    multiple={false}
                                    locationList={lookUp && lookUp.locations}
                                    selectedLocation={patchboard.location}
                                    onChange={(value) => this.props.onChange([{ key: 'location', value: value }])}
                                    validationState={inputCheck.location.state}
                                    helpText={inputCheck.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="開始線番" columnCount={2} isRequired >
                                <TextForm
                                    value={patchboard.startNo}
                                    validationState={inputCheck.startNo.state}
                                    helpText={inputCheck.startNo.helpText}
                                    onChange={(value) => this.props.onChange([{ key: 'startNo', value: value }])}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="終了線番" columnCount={2} isRequired >
                                <TextForm
                                    value={patchboard.endNo}
                                    validationState={inputCheck.endNo.state}
                                    helpText={inputCheck.endNo.helpText}
                                    onChange={(value) => this.props.onChange([{ key: 'endNo', value: value }])}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="備考" columnCount={1} >
                                <TextareaForm
                                    value={patchboard.memo}
                                    validationState={inputCheck.memo.state}
                                    helpText={inputCheck.memo.helpText}
                                    onChange={(value) => this.props.onChange([{ key: 'memo', value: value }])}
                                    maxlength={MAXLENGTH_PATCHBOARD_MEMO}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                }
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
            </GarmitBox>
        );
    }
}

PatchboardEditBox.propTypes = {
    bulk: PropTypes.bool,                       //一括編集かどうか
    patchboard: PropTypes.object,               //編集対象の配線盤
    patchboards: PropTypes.array,               //親配線盤選択画面用の全配線盤
    lookUp: PropTypes.object,                   //配線盤種別、ケーブル種別セット用
    onChange: PropTypes.func,                   //入力値変更イベント
    level: PropTypes.number,
    inputCheck: PropTypes.object,
    checked: PropTypes.object,
    onCheckChange: PropTypes.func,
    childrenPatchboards: PropTypes.array
};