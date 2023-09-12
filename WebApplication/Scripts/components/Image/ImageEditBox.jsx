'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import { ButtonToolbar, Grid, Row, Col, FormGroup, FormControl, Image } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import LabelForm from 'Common/Form/LabelForm';

import { validateText, validateSelect, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

let createObjectURL = (window.URL || window.webkitURL).createObjectURL || window.createObjectURL;

const ALLOW_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/bmp',
    'image/gif'
];

const MAX_LENGTH = {
    name: 64,
    fileName: 255
};

export default class ImageEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            unitImage: this.props.editedUnitImage,
            inputCheck: {
                name: {},
                type: {},
                rearFlg: {},
                fileName: {}
            }
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        this.initValidation();
    }

    /**
     * propsが変化したときの処理
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        
    }

    /**
     * 保存ボタンクリック時
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            if (!this.props.editedUnitImage.fileName
                || this.props.editedUnitImage.url != this.state.unitImage.url) {
                // 新規登録または画像が変更された場合
                const file = this.refs.file.files[0];
                const formData = new FormData();
                formData.append('File', file);
                this.props.onSubmit(this.state.unitImage, formData);
            } else {
                // 画像が変更されなかった場合
                this.props.onSubmit(this.state.unitImage, null);
            }
        }
    }

    /**
     * キャンセルボタンクリック時
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * 値が変更された時
     * @param {any} val 変更後の値
     * @param {any} key 変更されたプロパティのキー
     */
    onValueChange(val, key) {
        const unitImage = Object.assign({}, this.state.unitImage);
        unitImage[key] = val;

        this.setState({ unitImage: unitImage });

        if (key in this.state.inputCheck) {
            const inputCheck = Object.assign({}, this.state.inputCheck);
            inputCheck[key] = this.checkValidation(val, key);

            this.setState({ inputCheck: inputCheck });
        }
    }

    /**
     * 画像が変更された時
     */
    onImageChange() {
        const file = this.refs.file.files[0];
        const imageUrl = createObjectURL(file);

        const unitImage = Object.assign({}, this.state.unitImage);
        unitImage.url = imageUrl;
        unitImage.fileName = file.name;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.fileName = this.checkValidation(unitImage.fileName, 'fileName');

        if (ALLOW_FILE_TYPES.indexOf(file.type) < 0) {  // ファイル形式をチェック
            inputCheck.fileName = errorResult('選択したファイルの形式には対応していません。');
        } else if (file.size > 4194304) {               // ファイルサイズをチェック
            inputCheck.fileName = errorResult('ファイルサイズが4MBを超える画像は使用できません。');
        }

        this.setState({ unitImage: unitImage, inputCheck: inputCheck });
    }

    /**
     * 入力チェックをする
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key) {
        switch (key) {
            case 'type':
                return validateSelect(val && val.typeId);

            case 'name':
                return validateText(val, MAX_LENGTH.name, false);

            case 'rearFlg':
                return validateSelect(val.toString());

            case 'fileName':
                return validateText(val, MAX_LENGTH.fileName, false);
        }
    }

    /**
     * 初期の入力チェックをセットする
     */
    initValidation() {
        const inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(this.state.unitImage[key], key);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * エラーがあるか
     */
    hasError() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * render
     */
    render() {
        const { unitTypes, isLoading } = this.props;
        const { unitImage, inputCheck } = this.state;

        return (
            <div>
                <Grid fluid>
                    <Row className="mb-05">
                        <ButtonToolbar className="pull-right">
                            <Button
                                bsStyle="success"
                                onClick={() => this.handleSubmit()}
                                disabled={isLoading || this.hasError()}
                            >
                                <Icon className="fal fa-save mr-05" />
                                <span>保存</span>
                            </Button>
                            <Button
                                iconId="uncheck"
                                bsStyle="lightgray"
                                onClick={() => this.handleCancel()}
                            >
                                キャンセル
                            </Button>
                        </ButtonToolbar>
                    </Row>
                </Grid>
                <Box boxStyle='default' isLoading={isLoading} >
                    <Box.Header>
                        <Box.Title>画像編集</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="種別" columnCount={2} isRequired={true}>
                                    <SelectForm
                                        options={unitTypes.map((type) => ({ value: type.typeId, name: type.name }))}
                                        value={unitImage.type && unitImage.type.typeId}
                                        onChange={(val) => this.onValueChange(unitTypes.find((type) => type.typeId == val), 'type')}
                                        validationState={inputCheck.type.state}
                                        helpText={inputCheck.type.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="名称" columnCount={2} isRequired={true} >
                                    <TextForm
                                        value={unitImage.name}
                                        maxlength={MAX_LENGTH.name}
                                        onChange={(val) => this.onValueChange(val, 'name')}
                                        validationState={inputCheck.name.state}
                                        helpText={inputCheck.name.helpText}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="前面/背面" columnCount={2} isRequired={true} >
                                    <SelectForm
                                        options={[
                                            { value: 'false', name: '前面' },
                                            { value: 'true', name: '背面' },
                                        ]}
                                        value={unitImage.rearFlg.toString()}
                                        onChange={(val) => this.onValueChange(val, 'rearFlg')}
                                        validationState={inputCheck.rearFlg.state}
                                        helpText={inputCheck.rearFlg.helpText}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="画像ファイル" columnCount={2} isRequired={true}>
                                    <div className="mb-05">
                                    <LabelForm
                                        value={unitImage.fileName}
                                        addonButton={[
                                            {
                                                key: 'select',
                                                bsStyle: 'primary',
                                                label: (<i className="fal fa-folder-open"></i>),
                                                isCircle: true,
                                                tooltipLabel: '選択',
                                                onClick: () => { this.refs.file.click() }
                                            }
                                        ]}
                                        validationState={inputCheck.fileName.state}
                                        helpText={inputCheck.fileName.helpText}
                                    />
                                    <input
                                        ref="file"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={() => this.onImageChange()}
                                    />
                                    </div>
                                    <Image src={unitImage.url} thumbnail responsive />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    </Box.Body>
                </Box>
            </div>
        );
    }
}