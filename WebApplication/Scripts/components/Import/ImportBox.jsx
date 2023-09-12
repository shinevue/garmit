'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ButtonToolbar, Grid, Row, Col, FormGroup, FormControl, Image } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';

import FileSelectForm from 'Import/FileSelectForm';

import { IMPORT_TYPE } from 'constant';

export default class ImportBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            importInfo: {},
            fileName: {}
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
        if (nextProps.importType !== this.props.importType) {
            this.setState({ importInfo: {}, fileName: {} });
        }
    }

    /**
     * ファイルが変更された時
     * @param {any} data
     * @param {any} name
     * @param {any} key
     */
    onChange(data, name, key) {
        const importInfo = Object.assign({}, this.state.importInfo);
        importInfo[key] = data;

        const fileName = Object.assign({}, this.state.fileName);
        fileName[key] = name;

        this.setState({ importInfo: importInfo, fileName: fileName });
    }

    /**
     * インポート可能かどうか
     */
    isEnableImport() {
        for (let key of Object.keys(this.state.fileName)) {
            if (this.state.fileName[key].length > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * クリアする
     */
    clear() {
        this.setState({ importInfo: {}, fileName: {} });
    }

    /**
     * render
     */
    render() {
        const { importType, isLoading } = this.props;
        const { fileName, importInfo } = this.state;

        return (
            <Box boxStyle='default' isLoading={isLoading} >
                <Box.Header>
                    <Box.Title>インポート</Box.Title>
                </Box.Header >
                <Box.Body>
                    <Grid fluid>
                    {importType === IMPORT_TYPE.point &&
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="ポイント情報" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_Point}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_Point')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    }
                    {importType === IMPORT_TYPE.rack &&
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="ラック情報" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_Rack}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_Rack')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="電源" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_RackPower}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_RackPower')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="アウトレット" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_RackOutlet}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_RackOutlet')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="リンク" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_RackLink}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_RackLink')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    }
                    {importType === IMPORT_TYPE.unit &&
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="ユニット情報" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_Unit}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_Unit')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="電源" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_UnitPower}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_UnitPower')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="リンク" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_UnitLink}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_UnitLink')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="ポート" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_UnitPort}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_UnitPort')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="IPアドレス" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_UnitIPAddress}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_UnitIPAddress')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    }
                    {importType === IMPORT_TYPE.icCard &&
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="ICカード情報" columnCount={1}>
                                    <FileSelectForm
                                        fileName={fileName.importData_ICCard}
                                        onChange={(data, name) => this.onChange(data, name, 'importData_ICCard')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    }
                    </Grid>
                </Box.Body>
                <Box.Footer>
                    <Button
                        bsStyle="danger"
                        className="pull-right"
                        disabled={!this.isEnableImport()}
                        onClick={() => this.props.onImportClick(importInfo)}
                    >
                        インポート
                    </Button>
                </Box.Footer>
            </Box>
        );
    }
}