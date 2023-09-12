'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';

import SoundForm from 'SoundSetting/SoundForm';
import SoundSelectModal from 'SoundSetting/SoundSelectModal';

export default class CommonSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * コンポーネントが新しくPropsを受け取るとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.systemSet !== nextProps.systemSet) {
            this.setState({ systemSet: nextProps.systemSet });
        }
        if (this.props.soundFileList !== nextProps.soundFileList) {
            this.unSelectNonExistingFile(nextProps.soundFileList);
        }
    }

    /**
     * render
     */
    render() {
        const { isLoading, soundFileList, checked, systemSet, isReadOnly } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>共通サウンド</Box.Title>
                </Box.Header>
                <Box.Body>
                {systemSet &&
                    <div>
                        <InputForm>
                            <InputForm.Row>
                                <InputForm.Col label="こじ開け発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.breakOpenSound}
                                        checked={checked.breakOpenSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('breakOpenSound')}
                                        onClearButtonClick={() => this.props.onClearClick('breakOpenSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="開錠超過発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.keyOpenOverSound}
                                        checked={checked.keyOpenOverSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('keyOpenOverSound')}
                                        onClearButtonClick={() => this.props.onClearClick('keyOpenOverSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="期限超過発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.expiredSound}
                                        checked={checked.expiredSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('expiredSound')}
                                        onClearButtonClick={() => this.props.onClearClick('expiredSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="期限超過前発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.beforeExpiredSound}
                                        checked={checked.beforeExpiredSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('beforeExpiredSound')}
                                        onClearButtonClick={() => this.props.onClearClick('beforeExpiredSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="荷重制限超過" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.loadOverSound}
                                        checked={checked.loadOverSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('loadOverSound')}
                                        onClearButtonClick={() => this.props.onClearClick('loadOverSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="荷重制限超過前" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.beforeLoadOverSound}
                                        checked={checked.beforeLoadOverSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('beforeLoadOverSound')}
                                        onClearButtonClick={() => this.props.onClearClick('beforeLoadOverSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="スレーブ機器異常発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.slaveTerminalErrorSound}
                                        checked={checked.slaveTerminalErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('slaveTerminalErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('slaveTerminalErrorSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="通信異常発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.connectionErrorSound}
                                        checked={checked.connectionErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('connectionErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('connectionErrorSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="トレンドファイルDL異常発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.downloadErrorSound}
                                        checked={checked.downloadErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('downloadErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('downloadErrorSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="データ収集異常（バッファ）発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.bRecErrorSound}
                                        checked={checked.bRecErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('bRecErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('bRecErrorSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="データ収集異常（瞬時）発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.rRecErrorSound}
                                        checked={checked.rRecErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('rRecErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('rRecErrorSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="データ収集異常（集計）発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.sRecErrorSound}
                                        checked={checked.sRecErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('sRecErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('sRecErrorSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                            <InputForm.Row>
                                <InputForm.Col label="メール送信異常発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.mailErrorSound}
                                        checked={checked.mailErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('mailErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('mailErrorSound')}
                                    />
                                </InputForm.Col>
                                <InputForm.Col label="レポート出力異常発生" columnCount={2}>
                                    <SoundForm
                                        isReadOnly={isReadOnly}
                                        name={systemSet.reportOutputErrorSound}
                                        checked={checked.reportOutputErrorSound}
                                        onCheckButtonClick={() => this.props.onCheckChange('reportOutputErrorSound')}
                                        onClearButtonClick={() => this.props.onClearClick('reportOutputErrorSound')}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        </InputForm>
                    </div>
                }
                </Box.Body>
            </Box>
        );
    }
}