'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, Form, Panel, Table, ControlLabel } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';

import MailPreviewModal from 'MailTemplate/MailPreviewModal';

const CONTROL_STRINGS_NAME = {
    $a: 'アラーム種別',
    $y: 'データ種別',
    $d: '発生日時',
    $r: '復旧日時',
    $l: 'ロケーション',
    $n: 'アラーム対象',
    $v: '発生値',
    $t: 'アラーム値',
    $c: 'コメント',
    $x: 'アラーム詳細'
};

export default class TemplateSettingBox extends Component {

    constructor() {
        super();
        this.state = {
            dummyValues: {
                $a: '上限異常',
                $y: '電流',
                $d: '2018/01/01 00:00:00',
                $r: '2018/01/01 00:00:00',
                $l: '東京第一センター > A棟 > 1階 > 1列 > Rack1101',
                $n: 'P-MCCB-A01-01',
                $v: '28.5',
                $t: '28.0',
                $c: '',
                $x: ''
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        const dummyValues = Object.assign({}, this.state.dummyValues);
        if (nextProps.mailTemplate) {
            if (!this.props.mailTemplate || nextProps.mailTemplate.alarmCategory.alarmType !== this.props.mailTemplate.alarmCategory.alarmType) {
                dummyValues.$a = nextProps.mailTemplate.alarmCategory.name;
            }
            if (!this.props.mailTemplate || JSON.stringify(nextProps.mailTemplate.datatype) !== JSON.stringify(this.props.mailTemplate.datatype)) {
                dummyValues.$y = nextProps.mailTemplate.datatype ? nextProps.mailTemplate.datatype.name : '';
            }
        }
        this.setState({ dummyValues: dummyValues });
    }

    /**
     * プレビュー表示用文字列を生成する
     * @param {any} string
     */
    createPreviewString(string) {
        const { dummyValues } = this.state;

        let tmpStr = string;

        for (let key of Object.keys(dummyValues)) {
            const reg = new RegExp('\\' + key, 'g');
            tmpStr = tmpStr.replace(reg, dummyValues[key]);
        }

        return tmpStr;
    }

    /**
     * 制御文字列の行を生成する
     */
    makeControlStringRows() {
        const rows = [];
        for (let key of Object.keys(CONTROL_STRINGS_NAME)) {
            rows.push(
                <tr>
                    <td>{key}</td>
                    <td>{CONTROL_STRINGS_NAME[key]}</td>
                    <td>
                        <TextForm
                            className="mb-0"
                            bsSize="sm"
                            value={this.state.dummyValues[key]}
                            onChange={(val) => this.onDummyValueChange(val, key)}
                        />
                    </td>
                </tr>
            );
        }
        return rows;
    }

    /**
     * ダミー値が変更された時
     * @param {any} val
     * @param {any} key
     */
    onDummyValueChange(val, key) {
        const obj = Object.assign({}, this.state.dummyValues);
        obj[key] = val;
        this.setState({ dummyValues: obj });
    }

    /**
     * イベント種別の表示名称を取得
     * @param {any} eventType
     */
    getEventTypeName(eventType) {
        switch (eventType) {
            case 1:
                return "発生";
            case 2:
                return "復旧";
            case 3:
                return "継続";
            default:
                return "";
        }
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, mailTemplate, onEdit, inputCheck } = this.props;
        const { dummyValues } = this.state;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>メールテンプレート</Box.Title>
                </Box.Header >
                <Box.Body>
                    <Row>
                        <Col sm={9}>
                        {mailTemplate ?
                            <div>
                                <InputForm>
                                    <InputForm.Row>
                                        <InputForm.Col label="アラーム種別" columnCount={3}>
                                            <LabelForm value={mailTemplate.alarmCategory && mailTemplate.alarmCategory.name} />
                                        </InputForm.Col>
                                        <InputForm.Col label="データ種別" columnCount={3}>
                                            <LabelForm value={mailTemplate.datatype ? mailTemplate.datatype.name : "―"} />
                                        </InputForm.Col>
                                        <InputForm.Col label="イベント種別" columnCount={3}>
                                            <LabelForm value={this.getEventTypeName(mailTemplate.eventType)} />
                                        </InputForm.Col>
                                    </InputForm.Row>
                                    <InputForm.Row>
                                        <InputForm.Col label="件名" columnCount={1} isRequired={true}>
                                            <TextForm
                                                isReadOnly={isReadOnly}
                                                value={mailTemplate.subject}
                                                maxlength={128}
                                                onChange={(val) => onEdit(val, 'subject')}
                                                validationState={!isReadOnly && inputCheck.subject.state}
                                                helpText={!isReadOnly && inputCheck.subject.helpText}
                                            />
                                            <input style={{ display: 'none' }} />
                                        </InputForm.Col>
                                    </InputForm.Row>
                                    <InputForm.Row>
                                        <InputForm.Col label="本文" columnCount={1} isRequired={true}>
                                            <TextareaForm
                                                isReadOnly={isReadOnly}
                                                style={{ minHeight: 295 }}
                                                value={mailTemplate.body}
                                                maxlength={4000}
                                                onChange={(val) => onEdit(val, 'body')}
                                                validationState={!isReadOnly && inputCheck.body.state}
                                                helpText={!isReadOnly && inputCheck.body.helpText}
                                            />
                                        </InputForm.Col>
                                    </InputForm.Row>
                                </InputForm>
                                <MailPreviewModal
                                    showModal={this.state.showModal}
                                    onHide={() => this.setState({ showModal: false })}
                                    body={this.createPreviewString(mailTemplate.body)}
                                    subject={this.createPreviewString(mailTemplate.subject)}
                                />
                            </div>
                            :
                            <div>テンプレートが選択されていません</div>
                        }
                        </Col>
                        <Col sm={3}>
                            <Table className="mb-0" style={{ fontSize: 12 }} condensed bordered>
                                <thead>
                                    <tr>
                                        <th style={{ whiteSpace: 'nowrap' }}>制御文字</th>
                                        <th>置換内容</th>
                                        <th>プレビュー表示用データ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.makeControlStringRows()}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Box.Body>
                {mailTemplate &&
                    <Box.Footer>
                        <Button
                            className="pull-right"
                            bsStyle="primary"
                            onClick={() => this.setState({ showModal: true })}
                        >
                            <Icon className="fal fa-search mr-05" />
                            <span>プレビュー</span>
                        </Button>
                    </Box.Footer>
                }
            </Box>
        );
    }
}