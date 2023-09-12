/**
 * @license Copyright 2017 DENSO
 * 
 * PowerSystem画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';

import { Grid, ButtonToolbar, Row, Col } from 'react-bootstrap';

import { validateText, validateSelect, validateInteger, validateReal, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { compareAscending } from 'sortCompare';

import Content from 'Common/Layout/Content';
import BoxGroup from 'Common/Layout/BoxGroup';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import PointSelectModal from 'Assets/Modal/PointSelectModal';
import EgroupOverlaySelector from 'Assets/Overlay/EgroupOverlaySelector';
import PowerSystemListBox from 'PowerSystem/PowerSystemListBox';
import PowerSystemInfoBox from 'PowerSystem/PowerSystemInfoBox';
import ElecFacilityInfoBox from 'PowerSystem/ElecFacilityInfoBox';
import BreakerInfoBox from 'PowerSystem/BreakerInfoBox';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { setAuthentication } from 'Authentication/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setEditMode, setLookUp, setEgroups } from './actions.js';

const maxlength = {
    egroupName: 32
};

/**
 * 電源系統編集画面のコンポーネント
 */
class PowerSystemPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            inputCheck: {
                parent: {},
                connectedBreaker: {},
                egroupName: {},
                distributionSystem: {},
                ratedCurrent: {},
                ratedVoltage: {},
                ratedFrequency: {},
                rowCount: {},
                colCount: {}
            },
            isEgroupLink: false,
            message: {}
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        // 権限取得
        this.loadAuthentication();

        // 電源系統表示画面から渡されたegroupId取得
        const egroupId = getSessionStorage(STORAGE_KEY.egroupId);
        this.loadInfo(egroupId);
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.eGroupEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * 画面の初期データを非同期で読み込む
     */
    loadInfo(egroupId) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/power', null, (data, networkError) => {
            this.props.changeLoadState();
            if (data) {
                this.props.setEgroups(data.egroups);
                if (egroupId) {
                    const nodes = this.refs.tree.getEnableNode();   // treeviewの有効なノード取得
                    const target = nodes.find((node) => node.id == egroupId);   // egoupIdが一致するノードを探す
                    if (target) {
                        // 一致するノードがあれば、選択状態にする
                        this.refs.tree.selectNode(target.nodeId);
                        this.refs.tree.revealNode();
                    }
                }
                if (this.state.selectedEgroup) {
                    this.setState({ selectedEgroup: this.findEgroup(this.state.selectedEgroup.egroupId, data.egroups) });
                }

                if (this.state.editedEgroup) {
                    this.setState({ editedEgroup: this.findEgroup(this.state.editedEgroup.egroupId, data.egroups) });
                }
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 空のEgroupを取得する
     */
    loadNewEgroup(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/power/newEgroup', null, (egroup, networkError) => {
            this.props.changeLoadState();
            if (egroup) {
                this.initValidation(egroup);
                this.setState({ editedEgroup: egroup, isEgroupLink: false }, () => {
                    if (callback) {
                        callback();
                    }
                });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 編集した電源系統を保存する
     */
    saveEgroup() {
        this.props.setWaitingState(true, 'save');
        const postData = this.getProcessedEgroup(this.state.editedEgroup);

        sendData(EnumHttpMethod.post, '/api/power/setEgroup', postData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.changeEditMode(false);
                if (this.state.editedEgroup.egroupId >= 0) {
                    this.loadInfo(this.state.editedEgroup.egroupId);
                } else {
                    this.setState({ editedEgroup: this.state.selectedEgroup }, () => {
                        this.loadInfo();
                    });
                }
            }
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: '保存',
                    message: result ? '電源系統を保存しました。' : '電源系統の保存に失敗しました。',
                    onCancel: () => this.clearMessage()
                }
            });
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 並び順を保存する
     */
    saveSortedEgroups(egroups) {
        this.props.setWaitingState(true, 'save');

        const postData = egroups.map((egroup) => ({
            systemId: egroup.systemId,
            egroupId: egroup.egroupId,
            dispIndex: egroup.dispIndex
        }));

        sendData(EnumHttpMethod.post, '/api/power/setSortOrder', postData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
                this.loadInfo();
                this.setState({ sortedEgroups: null, isSortMode: false });
            }
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: '保存',
                    message: result ? '電源系統の並び順を保存しました。' : '電源系統の並び順の保存に失敗しました。',
                    onCancel: () => this.clearMessage()
                }
            });
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 選択中の電源系統を削除する
     */
    deleteEgroup() {
        const { editedEgroup } = this.state;

        // 子系統がある場合
        if (editedEgroup.children && editedEgroup.children.length > 0) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: '削除',
                    message: '子系統が存在するため削除できません。',
                    onCancel: () => this.clearMessage()
                }
            });
            return;
        }

        // ラック電源に紐づく分岐電源がある場合
        if (editedEgroup.breakers && editedEgroup.breakers.some((breaker) => breaker.rackPowers.length > 0)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: '削除',
                    message: 'ラック電源に紐づく分岐電源があるため削除できません。',
                    onCancel: () => this.clearMessage()
                }
            });
            return;
        }

        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '/api/power/deleteEgroup', editedEgroup, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
                this.setState({ selectedEgroup: null, editedEgroup: null });
                this.loadInfo();
            }
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: '削除',
                    message: result ? '電源系統を削除しました。' : '電源系統の削除に失敗しました。',
                    onCancel: () => this.clearMessage()
                }
            });
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 編集モードを変更する
     * @param {*} isEditMode 編集モードかどうか
     */
    changeEditMode(isEditMode) {
        const { editedEgroup } = this.state;
        this.props.setEditMode(isEditMode);
        this.setState({ isEgroupLink: editedEgroup.connectedBreaker != null });
    }

    /**
     * 電源系統表示画面へ遷移
     */
    moveToPowerConnectionPage() {
        const { selectedEgroup } = this.state;

        if ((selectedEgroup.breakers && selectedEgroup.breakers.length > 0)
            || (selectedEgroup.elecFacilities && selectedEgroup.elecFacilities.length > 0)) {
            setSessionStorage(STORAGE_KEY.egroupId, this.state.selectedEgroup.egroupId);
            window.location.href = '/PowerConnection';
        } else {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'エラー',
                    message: '電源系統計測ポイントおよび分岐電源が設定されていません。',
                    onCancel: () => this.clearMessage()
                }
            });
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        this.changeEditMode(false);
        this.setState({ editedEgroup: this.state.selectedEgroup, isEgroupLink: this.state.selectedEgroup && this.state.selectedEgroup.connectedBreaker != null });
        this.initValidation(this.state.selectedEgroup);
    }

    /**
     * 電源系統が選択された時
     * @param {any} egroup
     * @param {any} position
     */
    handleSelectEgroup(egroup, position) {
        this.setState({
            selectedEgroup: egroup,
            editedEgroup: egroup,
            selectedEgroupPosition: position,
            isEgroupLink: egroup.connectedBreaker != null
        });
        this.initValidation(egroup);
    }

    /**
     * 並び替えボタンクリック
     */
    handleClickSort() {
        this.setState({ isSortMode: true });
    }

    /**
     * 並び替えキャンセルボタンクリック
     */
    handleCancelSort() {
        this.setState({ isSortMode: false });
    }

    /**
     * 系統追加ボタン押下
     */
    handleAdd(isChildEgroup) {
        this.loadNewEgroup(() => {
            const egroup = Object.assign({}, this.state.editedEgroup);
            if (isChildEgroup) {
                egroup.parent = this.state.selectedEgroup;
            } else {
                egroup.parent = (this.state.selectedEgroup && this.state.selectedEgroup.parent) || null;
            }
            this.setState({ editedEgroup: egroup, isAddMode: true, isEgroupLink: false });
            this.initValidation(egroup);
            this.changeEditMode(true);
        });
    }

    /**
     * 編集された時
     * @param {any} keyValueArray
     */
    handleEdit(keyValueArray) {
        const editedEgroup = Object.assign({}, this.state.editedEgroup);
        const inputCheck = Object.assign({}, this.state.inputCheck);
        let isEgroupLink = this.state.isEgroupLink;
        keyValueArray.forEach((item) => {
            editedEgroup[item.key] = item.value;
            inputCheck[item.key] = this.validateValue(item.value, item.key);
            if (item.key == 'parent') {
                isEgroupLink = false;
            } else if (item.key == 'breakers') {
                inputCheck.rowCount = this.validateRowCount(editedEgroup.rowCount, editedEgroup);
                inputCheck.colCount = this.validateColCount(editedEgroup.colCount, editedEgroup);
            }
        });
        this.setState({ editedEgroup: editedEgroup, inputCheck: inputCheck, isEgroupLink: isEgroupLink });
    }

    /**
     * 削除ボタンがクリックされた時
     */
    onDeleteClick() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message: '選択中の電源系統を削除しますか？',
                onOK: () => {
                    this.clearMessage();
                    this.deleteEgroup();
                },
                onCancel: () => this.clearMessage()
            }
        })
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
                message: '編集内容を保存しますか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveEgroup();
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 並び順保存ボタンをクリックした時
     * @param {any} egroups
     */
    onSaveSortClick(egroups) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '並び順を保存しますか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveSortedEgroups(egroups);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * egroupを保存用のオブジェクトに加工する
     * @param {any} egroup
     */
    getProcessedEgroup(egroup) {
        const obj = Object.assign({}, egroup);
        if (obj.breakers) {
            obj.breakers = obj.breakers.map((bk, i) =>
                Object.assign({}, bk,
                    { egroup: { systemId: egroup.systemId, egroupId: egroup.egroupId } }
                )
            );
        }
        return obj;
    }

    /**
     * egroupIdからegroupを探す
     * @param {any} egroupId
     * @param {any} egroups
     */
    findEgroup(egroupId, egroups) {
        for (let i = 0; i < egroups.length; i++) {
            if (egroups[i].egroupId === egroupId) {
                return egroups[i];
            } else if (egroups[i].children && egroups[i].children.length) {
                const egroup = this.findEgroup(egroupId, egroups[i].children);
                if (egroup) {
                    return egroup;
                }
            }
        }
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     */
    validateValue(val, key) {
        const { editedEgroup, isEgroupLink } = this.state;

        switch (key) {
            case 'egroupName':
                return validateText(val, maxlength.egroupName, false);

            case 'parent':
                if (val && val.egroupId === editedEgroup.egroupId) {
                    return errorResult('自身を親電源系統に設定することはできません');
                }
                return successResult;

            case 'connectedBreaker':
                return validateSelect(val && val.breakerNo);

            case 'distributionSystem':
                return validateSelect(val);

            case 'ratedCurrent':
            case 'ratedVoltage':
            case 'ratedFrequency':
                return validateInteger(val, 0, 10000, true);

            case 'rowCount':
                return this.validateRowCount(val);

            case 'colCount':
                return this.validateColCount(val);

            default:
                return successResult;
        }
    }

    /**
     * 行の入力チェックを返します
     * @param {any} val
     * @param {any} key
     */
    validateRowCount(val, egroup = this.state.editedEgroup) {
        let result = validateInteger(val, 1, 100, false);
        if (result.state == VALIDATE_STATE.error
            || (!egroup || !egroup.breakers || egroup.breakers.length === 0)) {
            return result;
        }
        const yMax = Math.max(...egroup.breakers.map((b) => b.position.y));
        if (yMax > val) {
            return errorResult("行が登録中の分岐電源の行位置よりも小さい値になっています");
        }
        return successResult;        
    }

    /**
     * 列の入力チェックを返します
     * @param {any} val
     * @param {any} key
     */
    validateColCount(val, egroup = this.state.editedEgroup) {
        let result = validateInteger(val, 1, 100, false);
        if (result.state == VALIDATE_STATE.error
            || (!egroup || !egroup.breakers || egroup.breakers.length === 0)) {
            return result;
        }
        const xMax = Math.max(...egroup.breakers.map((b) => b.position.x));
        if (xMax > val) {
            return errorResult("列が登録中の分岐電源の列位置よりも小さい値になっています");
        }
        return successResult;  
    }

    /**
     * 初期入力チェック
     */
    initValidation(egroup) {
        if (egroup) {
            const inputCheck = Object.assign({}, this.state.inputCheck);
            for (let key of Object.keys(inputCheck)) {
                inputCheck[key] = this.validateValue(egroup[key], key);
            }
            this.setState({ inputCheck: inputCheck });
        }
    }

    /**
     * 保存ボタンが使用可かどうか判定
     */
    isEnableSave() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state === VALIDATE_STATE.error) {
                if (key == 'connectedBreaker' && !this.state.isEgroupLink) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }

    /**
     * ソート対象の電源系統を取得
     */
    getSortTargetEgroups() {
        const { selectedEgroup } = this.state;

        if (selectedEgroup){
            if (selectedEgroup.parent) {
                const parent = this.getEgroup(selectedEgroup.parent.egroupId, this.props.egroups);
                return parent.children.slice().sort((current, next) => compareAscending(current.dispIndex, next.dispIndex));
            }
            return this.props.egroups.slice().sort((current, next) => compareAscending(current.dispIndex, next.dispIndex));
        }
        return [];
    }

    /**
     * egroupIdから電源系統を取得する
     * @param {any} egroupId
     * @param {any} egroups
     */
    getEgroup(egroupId, egroups) {
        if (!egroups || egroups.length === 0) {
            return;
        }

        for (let i = 0; i < egroups.length; i++){
            if (egroups[i].egroupId == egroupId) {
                return egroups[i];
            }
            if (egroups[i].children) {
                const egroup = this.getEgroup(egroupId, egroups[i].children);
                if (egroup) {
                    return egroup;
                }
            }
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
     * メッセージを消去する
     */
    clearMessage() {
        const message = Object.assign({}, this.state.message);
        message.show = false;

        this.setState({ message: message });
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, level } = this.props.authentication;

        const { isEditMode, egroups, lookUp, isLoading, waitingInfo } = this.props;
        const { editedEgroup, inputCheck, selectedEgroup, selectedEgroupPosition, isSortMode, message, isEgroupLink } = this.state;

        return (
            <Content>
                <Row>
                    <Col sm={3}>
                        <PowerSystemListBox
                            isLoading={isLoading}
                            isReadOnly={isReadOnly || level === LAVEL_TYPE.normal}
                            disabled={isEditMode}
                            ref="tree"
                            egroups={egroups}
                            selectedEgroup={selectedEgroup}
                            selectedEgroupPosition={selectedEgroupPosition}
                            isSortMode={isSortMode}
                            sortTargetEgroups={this.getSortTargetEgroups() || []}
                            onClickSort={() => this.handleClickSort()}
                            onClickSave={(egroups) => this.onSaveSortClick(egroups)}
                            onClickCancel={() => this.handleCancelSort()}
                            onSelectEgroup={(egroup, position) => this.handleSelectEgroup(egroup, position)}
                        />
                    </Col>
                    <Col sm={9}>
                        <Grid fluid>
                            <Row className="mb-05">
                                <Button
                                    bsStyle="link"
                                    className='pull-right'
                                    disabled={!selectedEgroup || isEditMode || isSortMode || isLoading}
                                    onClick={() => this.moveToPowerConnectionPage()}
                                >
                                    <Icon className='fa fa-angle-double-right mr-05' />
                                    <span>電源系統表示へ</span>
                                </Button>
                            </Row>
                            {(!isReadOnly && level !== LAVEL_TYPE.normal) &&
                                <Row className="mb-05">
                                    {level !== LAVEL_TYPE.operator &&
                                        <ButtonToolbar className="pull-left" >
                                            <Button
                                                iconId="add"
                                                bsStyle="primary"
                                                disabled={isEditMode || isSortMode || isLoading}
                                                onClick={() => this.handleAdd(false)}
                                            >
                                                <span>系統追加</span>
                                            </Button>
                                            <Button
                                                iconId="add"
                                                bsStyle="primary"
                                                disabled={!selectedEgroup || isEditMode || isSortMode || isLoading}
                                                onClick={() => this.handleAdd(true)}
                                            >
                                                <span>子系統追加</span>
                                            </Button>
                                        </ButtonToolbar>
                                    }
                                    {!isEditMode &&
                                        <ButtonToolbar className='pull-right' >
                                            <Button
                                                iconId="edit"
                                                disabled={!selectedEgroup || isSortMode || isLoading}
                                                onClick={() => this.changeEditMode(true)}
                                            >
                                                編集
                                            </Button>
                                            {level !== LAVEL_TYPE.operator &&
                                                <Button
                                                    iconId="delete"
                                                    disabled={!selectedEgroup || isSortMode || isLoading}
                                                    onClick={() => this.onDeleteClick()}
                                                >
                                                    削除
                                                </Button>
                                            }
                                        </ButtonToolbar>
                                    }
                                    {isEditMode &&
                                        <ButtonToolbar className='pull-right' >
                                            <Button
                                                bsStyle="success"
                                                disabled={!this.isEnableSave()}
                                                onClick={() => this.onSaveClick()}
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
                                        </ButtonToolbar>}
                                </Row>
                            }
                        </Grid>
                        <BoxGroup>
                            <PowerSystemInfoBox
                                isLoading={isLoading}
                                isReadOnly={!isEditMode}
                                level={level}
                                egroupList={egroups}
                                egroup={editedEgroup}
                                maxlength={maxlength}
                                onChange={(array) => this.handleEdit(array)}
                                inputCheck={inputCheck}
                                isEgroupLink={isEgroupLink}
                                onIsEgroupLinkChange={(checked) => {
                                    this.setState({ isEgroupLink: checked });
                                    if (!checked) {
                                        this.setState({
                                            editedEgroup: Object.assign({}, this.state.editedEgroup, {
                                                connectedBreaker: null
                                            }),
                                            inputCheck: Object.assign({}, this.state.inputCheck, {
                                                connectedBreaker: errorResult('必須項目です')
                                            })
                                        });
                                    }
                                }}
                            />
                            <ElecFacilityInfoBox
                                isLoading={isLoading}
                                isReadOnly={!isEditMode}
                                elecFacilities={editedEgroup && editedEgroup.elecFacilities}
                                egroup={editedEgroup}
                                onChange={(val) => this.handleEdit([{ value: val, key: 'elecFacilities' }])} />
                            <BreakerInfoBox
                                isLoading={isLoading}
                                isReadOnly={!isEditMode}
                                level={level}
                                egroup={editedEgroup}
                                breakers={editedEgroup && editedEgroup.breakers}
                                onChange={(val) => this.handleEdit([{ value: val, key: 'breakers'}])}
                            />
                        </BoxGroup>
                    </Col>
                </Row>
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

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        isEditMode: state.isEditMode,
        lookUp: state.lookUp,
        egroups: state.egroups,
    }
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        changeLoadState: () => dispatch(changeLoadState()),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setEditMode: (isEditMode) => dispatch(setEditMode(isEditMode)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEgroups: (egroups) => dispatch(setEgroups(egroups)),
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(PowerSystemPanel);

 