/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import CommonSettingBox from 'SoundSetting/CommonSettingBox';
import DataTypeSettingBox from 'SoundSetting/DataTypeSettingBox';
import SoundSelectModal from 'SoundSetting/SoundSelectModal';

import { setAuthentication } from 'Authentication/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setSystemSet, setDataTypes, setSoundDirectory, setSoundFileList } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, sendAjax, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const COMMON_KEYS = [
    'breakOpenSound',
    'keyOpenOverSound',
    'expiredSound',
    'beforeExpiredSound',
    'loadOverSound',
    'beforeLoadOverSound',
    'slaveTerminalErrorSound',
    'connectionErrorSound',
    'downloadErrorSound',
    'bRecErrorSound',
    'rRecErrorSound',
    'sRecErrorSound',
    'mailErrorSound',
    'reportOutputErrorSound'
];
const DATATYPE_KEYS = [
    'upperErrorSound',
    'upperAlarmSound',
    'lowerAlarmSound',
    'lowerErrorSound'
];

const ALLOW_FILE_TYPES = [
    'audio/mp3',
    'audio/wav',
    'audio/mpeg'
];

class SoundSettingPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            checked: {
                systemSet: {},
                dataTypes: []
            },
            systemSet: null,
            dataTypes: null
        };
    }

    componentDidMount() {
        this.loadAuthentication(() => {
            this.loadSetting(() => {
                this.loadSoundDirectory(() => {
                    this.loadSoundFileList();
                });
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.systemSet !== this.props.systemSet) {
            this.setState({ systemSet: nextProps.systemSet });
        }
        if (nextProps.dataTypes !== this.props.dataTypes) {
            this.setState({ dataTypes: nextProps.dataTypes });
        }
        if (nextProps.soundFileList.length < this.props.soundFileList.length) {
            this.unSelectNonExistingFile(nextProps.soundFileList);
        }
    }

    /**
     * 保存ボタンがクリックされた時
     */
    onSaveClick() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: 'サウンド設定を保存します。よろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveSetting();
                },
                onCancel: () => this.clearMessage()
            }
        })
    }

    /**
     * サウンドが選択された時
     * @param {any} val
     */
    onEdit(val) {
        const checked = this.state.checked;

        const systemSet = Object.assign({}, this.state.systemSet);
        for (let key of Object.keys(checked.systemSet)) {
            if (checked.systemSet[key]) {
                systemSet[key] = val;
            }
        }
        const dataTypes = this.state.dataTypes.slice();
        dataTypes.forEach((dataType, i, self) => {
            if (checked.dataTypes[i]) {
                const obj = Object.assign({}, dataType);
                for (let key of Object.keys(checked.dataTypes[i])) {
                    if (checked.dataTypes[i][key]) {
                        obj[key] = val;
                    }
                }
                self[i] = obj;
            }
        });

        this.setState({ systemSet: systemSet, dataTypes: dataTypes, showModal: false });
    }

    /**
     * クリアボタンがクリックされた時
     */
    onClearClick() {
        this.onEdit(null);
    }

    /**
     * 個別クリアボタンがクリックされた時（共通）
     * @param {any} key
     */
    onClearClickCommon(key) {
        const systemSet = Object.assign({}, this.state.systemSet);
        systemSet[key] = null;
        this.setState({ systemSet: systemSet });
    }

    /**
     * 個別クリアボタンがクリックされた時（データ種別毎）
     * @param {any} i
     * @param {any} key
     */
    onClearClickDataType(i, key) {
        const dataTypes = this.state.dataTypes.slice();
        const dataType = Object.assign({}, dataTypes[i]);
        dataType[key] = null;
        dataTypes[i] = dataType;
        this.setState({ dataTypes: dataTypes });
    }

    /**
     * 共通サウンドのチェックが変更された時
     * @param {any} key
     */
    onSystemSetCheckChange(key) {
        const checked = Object.assign({}, this.state.checked);
        const systemSet = Object.assign({}, checked.systemSet);

        systemSet[key] = !systemSet[key];
        checked.systemSet = systemSet;

        this.setState({ checked: checked });
    }

    /**
     * データ種別毎サウンドのチェックが変更された時
     * @param {any} index
     * @param {any} key
     */
    onDataTypeCheckChange(index, key) {
        const checked = Object.assign({}, this.state.checked);
        const dataTypes = checked.dataTypes.slice();

        const dataType = Object.assign({}, dataTypes[index]);
        dataType[key] = !dataType[key];
        dataTypes[index] = dataType;
        checked.dataTypes = dataTypes;

        this.setState({ checked: checked });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication(callback) {
        this.props.changeLoadState();
        getAuthentication(FUNCTION_ID_MAP.soundSetting, (auth) => {
            this.props.changeLoadState();
            this.props.setAuthentication(auth);
            if (callback) {
                callback(auth);
            }
        });
    }

    /**
     * 設定をロードする
     */
    loadSetting(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/setting/getSetting', null, (info, networkError) => {
            this.props.changeLoadState();
            if (info) {
                this.props.setSystemSet(info.systemSet);
                this.props.setDataTypes(info.dataTypes);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info);
            }
        });
    }

    /**
     * サウンドファイル格納ディレクトリを取得する
     */
    loadSoundDirectory(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/setting/getSoundDirectory', null, (path, networkError) => {
            this.props.changeLoadState();
            if (path) {
                this.props.setSoundDirectory(path);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(path);
            }
        });
    }

    /**
     * サウンドファイルのリストを読み込む
     */
    loadSoundFileList(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/setting/getSoundList', null, (data, networkError) => {
            this.props.changeLoadState();
            if (data) {
                this.props.setSoundFileList(data);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(data);
            }
        });
    }

    /**
     * 設定を保存する
     */
    saveSetting() {
        const sendingData = { systemSet: this.state.systemSet, dataTypes: this.state.dataTypes };
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/setting/setSoundSetting', sendingData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (!networkError) {
                if (result) {
                    this.loadSetting();
                }
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '保存',
                        message: result ? 'サウンド設定を保存しました。' : 'サウンド設定の保存に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
            } else {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * サウンドファイルを保存する
     * @param {any} file
     */
    saveSoundFile(file) {
        if (this.props.soundFileList.indexOf(file.name) >= 0) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'サウンド追加エラー',
                    message: '同じ名前のファイルが存在するため保存できません。',
                    onCancel: () => this.clearMessage()
                }
            });
        } else if (ALLOW_FILE_TYPES.indexOf(file.type) < 0) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'サウンド追加エラー',
                    message: '選択されたファイルの形式には対応していません。',
                    onCancel: () => this.clearMessage()
                }
            });
        } else if (file.name.length > 30) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'サウンド追加エラー',
                    message: 'ファイル名が30文字を超えるファイルは保存できません。',
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            const formData = new FormData();
            formData.append('FileName', file.name);
            formData.append('MediaType', file.type);
            formData.append('Buffer', file);
            this.props.setWaitingState(true, 'save');
            sendAjax('/api/setting/setSoundFile', formData, (result, networkError) => {
                this.props.setWaitingState(false, null);
                if (!networkError) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: 'サウンド追加',
                            message: result ? 'サウンドファイルを追加しました。' : 'サウンドファイルの追加に失敗しました。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                    if (result) {
                        this.loadSoundFileList();
                    }
                } else {
                    this.showNetWorkErrorMessage();
                }
            });
        }
    }

    /**
     * サウンドファイルを削除する
     * @param {any} fileName
     */
    deleteSoundFile(fileName) {
        if (this.isFileUsed(fileName)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'サウンド削除エラー',
                    message: 'ファイルが使用中のため削除できません。',
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            this.props.setWaitingState(true, 'delete');
            sendData(EnumHttpMethod.get, '/api/setting/deleteSoundFile' + '?fileName=' + fileName, null, (result, networkError) => {
                this.props.setWaitingState(false, null);
                if (!networkError) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: 'サウンド削除',
                            message: result ? 'サウンドファイルを削除しました。' : 'サウンドファイルの削除に失敗しました。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                    if (result) {
                        this.loadSoundFileList();
                    }
                } else {
                    this.showNetWorkErrorMessage();
                }
            });
        }
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージを消す
     */
    clearMessage() {
        const message = Object.assign({}, this.state.message);
        message.show = false;
        this.setState({ message: message });
    }

    /**
     * ファイルが使用中かどうか
     * @param {any} fileName
     */
    isFileUsed(fileName) {
        const { systemSet, dataTypes } = this.props;

        if (systemSet) {
            for (let i = 0; i < COMMON_KEYS.length; i++){
                if (systemSet[COMMON_KEYS[i]] === fileName) {
                    return true;
                }
            }
        }

        if (dataTypes) {
            for (let i = 0; i < dataTypes.length; i++) {
                for (let j = 0; j < DATATYPE_KEYS.length; j++) {
                    if (dataTypes[i][DATATYPE_KEYS[j]] === fileName) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * 存在しないファイルの選択を解除する
     */
    unSelectNonExistingFile(fileList) {
        if (this.state.systemSet) {
            const systemSet = Object.assign({}, this.state.systemSet);
            COMMON_KEYS.forEach((key) => {
                if (fileList.indexOf(systemSet[key]) < 0) {
                    systemSet[key] = null;
                }
            });
            this.setState({ systemSet: systemSet });
        }

        if (this.state.dataTypes) {
            const dataTypes = this.state.dataTypes.map((type) => {
                const obj = Object.assign({}, type);
                DATATYPE_KEYS.forEach((key) => {
                    if (fileList.indexOf(obj[key]) < 0) {
                        obj[key] = null;
                    }
                });
                return obj;
            });

            this.setState({ dataTypes: dataTypes });
        }
    }

    /**
     * 全てチェックする
     */
    checkAll() {
        const systemSet = {};
        COMMON_KEYS.forEach((key) => {
            systemSet[key] = true;
        });

        const dataTypes = [];
        const dataType = {};
        DATATYPE_KEYS.forEach((key) => {
            dataType[key] = true;
        });

        for (let i = 0; i < this.state.dataTypes.length; i++) {
            dataTypes.push(dataType);
        }

        this.setState({ checked: { systemSet: systemSet, dataTypes: dataTypes } });
    }

    /**
     * 全てチェック解除する
     */
    uncheckAll() {
        this.setState({ checked: { systemSet: {}, dataTypes: [] } });
    }

    /**
     * すべてチェックされていないか
     */
    isAllUnchecked() {
        const { systemSet, dataTypes } = this.state.checked;

        for (let key of Object.keys(systemSet)) {
            if (systemSet[key]) {
                return false;
            } 
        }

        for (let i = 0; i < dataTypes.length; i++) {
            if (dataTypes[i] != null) {
                for (let key of Object.keys(dataTypes[i])) {
                    if (dataTypes[i][key]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * render
     */
    render() {
        const { authentication, isLoading, waitingInfo, soundFileList, soundDirectory } = this.props;
        const { message, checked, showModal, systemSet, dataTypes } = this.state;

        const isReadOnly = authentication.isReadOnly || authentication.level !== LAVEL_TYPE.administrator;

        return (
            <Content>
                {!isReadOnly &&
                    <div>
                        <div className="mb-05 clearfix">
                            <ButtonToolbar className="pull-right">
                                <Button
                                    bsStyle="success"
                                    onClick={() => this.onSaveClick()}
                                    disabled={isLoading}
                                >
                                    <Icon className="fal fa-save mr-05" />
                                    <span>保存</span>
                                </Button>
                            </ButtonToolbar>
                        </div>
                        <div className="mb-05 clearfix">
                            <ButtonToolbar className="pull-right">
                                <Button
                                    iconId="check"
                                    onClick={() => this.checkAll()}
                                    disabled={isLoading}
                                >
                                    すべてチェック
                                </Button>
                                <Button
                                    iconId="uncheck"
                                    onClick={() => this.uncheckAll()}
                                    disabled={isLoading}
                                >
                                    すべて解除
                                </Button>
                                <Button
                                    bsStyle="primary"
                                    onClick={() => this.setState({ showModal: true })}
                                    disabled={this.isAllUnchecked() || isLoading}
                                >
                                    <Icon className="fal fa-music mr-05" />
                                    <span>選択</span>
                                </Button>
                                <Button
                                    iconId="erase"
                                    bsStyle="lightgray"
                                    onClick={() => this.onClearClick()}
                                    disabled={this.isAllUnchecked() || isLoading}
                                >
                                    <span>クリア</span>
                                </Button>
                            </ButtonToolbar>
                        </div>
                    </div>
                }
                <CommonSettingBox
                    isLoading={isLoading}
                    isReadOnly={isReadOnly}
                    systemSet={systemSet}
                    checked={checked.systemSet}
                    onCheckChange={(key) => this.onSystemSetCheckChange(key)}
                    onClearClick={(key) => this.onClearClickCommon(key)}
                />
                <DataTypeSettingBox
                    isLoading={isLoading}
                    isReadOnly={isReadOnly}
                    dataTypes={dataTypes}
                    checked={checked.dataTypes}
                    onCheckChange={(i, key) => this.onDataTypeCheckChange(i, key)}
                    onClearClick={(i, key) => this.onClearClickDataType(i, key)}
                />
                <SoundSelectModal
                    showModal={showModal}
                    directory={soundDirectory}
                    fileList={soundFileList}
                    onSelect={(val) => this.onEdit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                    onAddFile={(file) => this.saveSoundFile(file)}
                    onDeleteFile={(fileName) => this.deleteSoundFile(fileName)}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        systemSet: state.systemSet,
        dataTypes: state.dataTypes,
        soundDirectory: state.soundDirectory,
        soundFileList: state.soundFileList
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        changeLoadState: () => dispatch(changeLoadState()),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setSystemSet: (systemSet) => dispatch(setSystemSet(systemSet)),
        setDataTypes: (dataTypes) => dispatch(setDataTypes(dataTypes)),
        setSoundDirectory: (path) => dispatch(setSoundDirectory(path)),
        setSoundFileList: (list) => dispatch(setSoundFileList(list))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(SoundSettingPanel);

 