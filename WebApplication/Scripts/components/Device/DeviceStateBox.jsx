'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import { Grid, Row, Col, Label, Form, FormGroup, ControlLabel } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';


export default class DeviceStateBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        
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
            this.props.onSubmit();
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
     * render
     */
    render() {
        const { gateStatus, isLoading, isReadOnly, onUpdateClick, onResetClick } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading} >
                <Box.Header>
                    <Box.Title>
                        {gateStatus && gateStatus.isError && <span className="icon-garmit-error"></span>}
                        機器状態
                    </Box.Title>
                </Box.Header >
                <Box.Body>
                {gateStatus &&
                    <Grid fluid>
                    {gateStatus.errorStatusString && gateStatus.errorStatusString.length > 0 && !isReadOnly &&
                        <Row className="mb-05">
                            <div className="pull-right">
                                <Button
                                    bsStyle="danger"
                                    onClick={() => onResetClick()}
                                >
                                    エラーリセット
                            </Button>
                            </div>
                        </Row>
                    }
                        <Row>
                            <Form horizontal>
                                <StaticTextForm label='機器ID' value={gateStatus.gateId} />
                                <StaticTextForm label='機器名称' value={gateStatus.gateName} />
                                <StaticTextForm label="接続状態" value={<Label bsStyle={gateStatus.connection > 0 ? 'info' : 'lightgray'}>{gateStatus.connection > 0 ? '接続' : '未接続'}</Label>} />
                                <StaticMultipleValueFrom label="エラーステータス" values={gateStatus.errorStatusString} className="text-red" />
                                <StaticTextForm label='エラーアドレス数' value={gateStatus.errorAddressCount} />
                                {gateStatus.errorAddressCount != 0 &&
                                    <StaticMultipleValueFrom label="エラーアドレス一覧" values={gateStatus.convertedErrorAddresses.slice(0, gateStatus.errorAddressCount)} />
                                }
                            </Form>
                        </Row>
                    </Grid>   
                }                          
                </Box.Body>
                {gateStatus && gateStatus.latestDownloadDate &&
                    <Box.Footer>
                        <span>最終ダウンロード日時： {moment(gateStatus.latestDownloadDate).format('YYYY/MM/DD HH:mm:ss')}</span>
                    </Box.Footer>
                }
            </Box>
        );
    }
}

/**
 * ラベルフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 表示文字列
 */
class StaticTextForm extends Component {
    render() {
        const { label, value } = this.props;
        return (
            <HorizontalLabelForm label={label} value={value} labelCol={{ md: 5 }} valueCol={{ md: 7 }} />
        );
    }
}

/**
 * 複数のデータをもつものを表示するためのフォーム
 * @param {string} label フォームのタイトル
 * @param {array} values 値の配列
 */
class StaticMultipleValueFrom extends Component {
    render() {
        const { label, values, className } = this.props;
        return (
            <FormGroup>
                <Col componentClass={ControlLabel} md={5}>
                    {label}
                </Col>
                <Col md={7}>
                    <div className="form-control-static">
                        {values.map((value) => <li style={{ listStyle: 'none', marginBottom: 5 }} className={className}>{ value }</li>)}
                    </div>
                </Col>
            </FormGroup>
        );
    }
}