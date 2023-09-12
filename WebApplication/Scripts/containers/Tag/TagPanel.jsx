/**
 * @license Copyright 2017 DENSO
 * 
 * タグ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import BoxGroup from 'Common/Layout/BoxGroup';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import TagListBox from 'Tag/TagListBox';
import TagInfoBox from 'Tag/TagInfoBox';
import PointListBox from 'Tag/PointListBox';
import RackListBox from 'Tag/RackListBox';
import UnitListBox from 'Tag/UnitListBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setTags, setLookUp, setLookUpOfEnterprise } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateText, validateSelect, validateInteger, validateReal, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

const MAX_LENGTH = {
    name: 32
};

const MAX_COUNT = {
    point: application.appSettings ? parseInt(application.appSettings.tagMaxPointCount) : 100,
    rack: application.appSettings ? parseInt(application.appSettings.tagMaxRackCount) : 20,
    unit: application.appSettings ? parseInt(application.appSettings.tagMaxUnitCount) : 800
};

class TagPanel extends Component {

    constructor(){
        super();
        this.state = {
            editMode: false,
            message: {},
            inputCheck: {
                name: {},
                enterprise: {}
            }
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadLookUp(() => {
            this.loadTagInfo(() => {
                this.loadAuthentication();
            });
        });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication(callback) {
        this.props.setLoadState(true);
        getAuthentication(FUNCTION_ID_MAP.tagEdit, (auth) => {
            this.props.setLoadState(false);
            this.props.setAuthentication(auth);
            if (callback) {
                callback();
            }
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/tag/getLookUp', null, (lookUp, networkError) => {
            this.props.setLoadState(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(lookUp);
            }
        });
    }

    /**
     * 所属に対応するマスタデータを読み込む
     * @param {any} enterpriseId
     */
    loadLookUpOfEnterprise(enterpriseId) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/tag/getLookUpByEnterpriseId?enterpriseId=' + enterpriseId, null, (lookUp, networkError) => {
            this.props.setLoadState(false);
            if (lookUp) {
                this.props.setLookUpOfEnterprise(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * タグ情報を読み込む
     */
    loadTagInfo(callback) {
        const { selectedTag, editedTag } = this.state;

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/tag/getTagInfo', null, (info, networkError) => {
            this.props.setLoadState(false);
            if (info) {
                this.props.setTags(info.tags.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    }
                    if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                }));
                if (selectedTag) {
                    this.loadTagDetail(selectedTag.tagId, (tag) => {
                        this.setState({
                            selectedTag: tag,
                            editedTag: tag
                        })
                    });
                }
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info, networkError);
            }
        });
    }

    /**
     * タグ詳細を読み込む
     * @param {any} tagId
     * @param {any} callback
     */
    loadTagDetail(tagId, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/tag/getTagDetail?tagId=' + tagId, null, (tag, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            }            
            if (callback) {
                callback(tag);
            }
        });
    }

    /**
     * タグの所属する所属で使えるメンバーのみに絞り込む
     * @param {any} tag
     */
    narrowTagMember(tag, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/tag/narrowTagMember', Object.assign({}, tag, { enterprise: Object.assign({}, tag.enterprise, {children: null}) }), (narrowedTag, networkError) => {
            this.props.setLoadState(false);

            const newTag = narrowedTag || Object.assign({}, tag, { enterprise: null, points: [], racks: [], units: [] });
            this.setState({ editedTag: newTag }, () => {
                this.initValidation();
            });
            
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(newTag);
            }
        });
    }

    /**
     * タグが選択された時
     * @param {any} tag
     */
    onSelectTag(tag) {
        if (this.state.editMode) {
            return;
        }

        this.loadTagDetail(tag.tagId, (tagDetail) => {
            this.setState({ selectedTag: tagDetail, editedTag: tagDetail });
            this.initValidation();
        });

        // データテーブルの表示を初期化
        this.refs.pointList.initDisplayState();
        this.refs.rackList.initDisplayState();
        this.refs.unitList.initDisplayState();
    }

    /**
     * 編集ボタンがクリックされた時
     */
    onEditClick() {
        this.setState({ editMode: true });
        this.loadLookUpOfEnterprise(this.state.editedTag.enterprise.enterpriseId);
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        const newTag = {
            tagId: -1,
            name: '',
            enterprise: null,
            points: [],
            racks: [],
            units: []
        }

        this.setState({ editMode: true, selectedTag: null, editedTag: newTag }, () => {
            this.initValidation();
        });
    }

    /**
     * 編集された時
     * @param {any} val
     * @param {any} key
     */
    onEdit(val, key) {
        const editedTag = Object.assign({}, this.state.editedTag);
        editedTag[key] = val;

        // 所属が変更されるとき
        if (key === "enterprise") {
            if (val) {
                this.narrowTagMember(editedTag, () => {
                    this.loadLookUpOfEnterprise(val.enterpriseId);
                });
            } else {
                editedTag.points = [];
                editedTag.racks = [];
                editedTag.units = [];
                this.setState({ editedTag: editedTag });
                this.props.setLookUpOfEnterprise(null);
            }     
        } else {
            this.setState({ editedTag: editedTag });
        }

        if (key in this.state.inputCheck) {
            const inputCheck = Object.assign({}, this.state.inputCheck);
            inputCheck[key] = this.checkValidation(val, key);
            this.setState({ inputCheck: inputCheck });
        }
    }

    /**
     * ラック一覧が変更された時
     * @param {any} racks 変更後のラック一覧
     * @param {any} units 変更後のユニット一覧
     */
    onRacksChange(racks, units) {
        const editedTag = Object.assign({}, this.state.editedTag, { racks: racks, units: units || [] });
        this.setState({ editedTag: editedTag });
    }

    /**
     * ユニット一覧が変更された時
     * @param {any} units 変更後のユニット一覧
     * @param {any} racks 追加するラック一覧
     */
    onUnitsChange(units, racks) {
        const editedTag = Object.assign({}, this.state.editedTag, { units: units, racks: racks || [] });
        this.setState({ editedTag: editedTag });
    }

    /**
     * 保存ボタンクリック
     */
    onSaveClick() {
        this.setState({
            message: {
                show: true,
                title: '保存',
                message: '編集内容を保存しますか？',
                buttonStyle: 'save',
                onOK: () => this.saveTag(),
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * キャンセルボタンクリック
     */
    onCancelClick() {
        this.setState({ editedTag: this.state.selectedTag, editMode: false }, () => {
            this.initValidation();
        });
    }

    /**
     * 削除ボタンクリック
     */
    onDeleteClick() {
        this.setState({
            message: {
                show: true,
                title: '削除',
                message: '選択中のタグを削除しますか？',
                buttonStyle: 'delete',
                onOK: () => this.deleteTag(),
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * タグを保存する
     */
    saveTag() {
        this.props.setWaitingState(true, 'save');
        const postData = this.createPostData(this.state.editedTag);
        sendData(EnumHttpMethod.post, '/api/tag/setTag', postData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
                this.loadTagInfo();
                this.setState({
                    editMode: false,
                    message: {
                        show: true,
                        title: '保存',
                        message: '編集内容を保存しました。',
                        buttonStyle: 'message',
                        onCancel: () => this.clearMessage()
                    },
                    editedTag: null
                });

            } else {
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else {
                    this.setState({
                        message: {
                            show: true,
                            title: '保存',
                            message: '編集内容の保存に失敗しました。',
                            buttonStyle: 'message',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            }
        })
    }

    /**
     * タグを削除する
     */
    deleteTag() {
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '/api/tag/deleteTag', this.state.selectedTag, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
                this.setState({ editedTag: null, selectedTag: null }, () => {
                    this.loadTagInfo();
                });
            }
            this.setState({
                message: {
                    show: true,
                    title: '削除',
                    message: result ? 'タグを削除しました。' : 'タグの削除に失敗しました。',
                    buttonStyle: 'message',
                    onCancel: () => this.clearMessage()
                }
            });
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 入力チェックする
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key) {
        switch (key) {
            case 'name':
                const result = validateText(val, MAX_LENGTH.name, false);
                if (result.state == VALIDATE_STATE.success && val.match(/\//)) {
                    return errorResult('使用不可文字が含まれています');
                }
                return result;

            case 'enterprise':
                return val ? successResult : errorResult('必須項目です');
        }
    }

    /**
     * 入力チェックを初期化する
     */
    initValidation() {
        const newInputCheck = {};
        for (let key of Object.keys(this.state.inputCheck)) {
            newInputCheck[key] = this.checkValidation(this.state.editedTag && this.state.editedTag[key], key);
        }
        this.setState({ inputCheck: newInputCheck });
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
     * エラーがあるか
     */
    hasError() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state == VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * 送信するデータを生成する
     * @param {any} tag
     */
    createPostData(tag) {
        const postData = Object.assign({}, tag);
        postData.points = tag.points.map((point) => ({ systemId: point.systemId, pointNo: point.pointNo, pointName: point.pointName }));
        postData.racks = tag.racks.map((rack) => ({ systemId: rack.systemId, rackId: rack.rackId, location: this.createPostLocation(rack.location) }));
        postData.units = tag.units.map((unit) => ({ systemId: unit.systemId, unitId: unit.unitId, location: this.createPostLocation(unit.location), name: unit.name }));
        return postData;
    }

    /**
     * 送信するロケーションデータを生成する
     * @param {any} location
     */
    createPostLocation(location) {
        return { systemId: location.systemId, locationId: location.locationId, name: location.name, parent: location.parent && this.createPostLocation(location.parent) };
    }

    /**
     * render
     */
    render() {
        const { isLoading, tags, lookUp, lookUpOfEnterprise, waitingInfo } = this.props;
        const { editMode, selectedTag, editedTag, message, inputCheck } = this.state;
        const { isReadOnly, level } = this.props.authentication;

        return (
            <Content>
                <Row className="mb-2">
                    <Col sm={3}>
                        <TagListBox
                            isLoading={isLoading}
                            tagList={tags}
                            selectedTag={selectedTag}
                            onSelect={(tag) => this.onSelectTag(tag)}
                        />
                    </Col>
                    <Col sm={9}>
                        {!isReadOnly && (editMode ?
                            <div className="mb-05 clearfix">
                                <ButtonToolbar className="pull-right">
                                    <Button
                                        bsStyle="success"
                                        onClick={() => this.onSaveClick()}
                                        disabled={isLoading || this.hasError()}
                                    >
                                        <Icon className="fal fa-save mr-05" />
                                        <span>保存</span>
                                    </Button>
                                    <Button
                                        iconId="uncheck"
                                        bsStyle="lightgray"
                                        onClick={() => this.onCancelClick()}
                                        disabled={isLoading}
                                    >
                                        キャンセル
                                    </Button>
                                </ButtonToolbar>
                            </div>
                            :
                            <div className="mb-05 clearfix">
                                {level <= LAVEL_TYPE.manager &&
                                    <Button
                                        iconId="add"
                                        onClick={() => this.onAddClick()}
                                        disabled={isLoading}
                                    >
                                        追加
                                    </Button>
                                }
                                <ButtonToolbar className="pull-right">
                                    {level <= LAVEL_TYPE.operator &&
                                        <Button
                                            iconId="edit"
                                            disabled={!this.state.selectedTag || isLoading}
                                            onClick={() => this.onEditClick()}
                                        >
                                            編集
                                        </Button>
                                    }
                                    {level <= LAVEL_TYPE.manager &&
                                        <Button
                                            iconId="delete"
                                            disabled={!this.state.selectedTag || isLoading}
                                            onClick={() => this.onDeleteClick()}
                                        >
                                            削除
                                        </Button>
                                    }                                    
                                </ButtonToolbar>
                            </div>
                        )}
                        <BoxGroup>
                            <TagInfoBox
                                isLoading={isLoading}
                                isReadOnly={!this.state.editMode}
                                lookUp={lookUp}
                                tag={editedTag}
                                maxlength={MAX_LENGTH}
                                onChange={(val, key) => this.onEdit(val, key)}
                                inputCheck={inputCheck}
                            />
                            <PointListBox
                                ref="pointList"
                                isLoading={isLoading}
                                isReadOnly={!this.state.editMode}
                                lookUp={lookUpOfEnterprise}
                                enterprise={editedTag && editedTag.enterprise}
                                points={editedTag && editedTag.points}
                                onChange={(points) => this.onEdit(points, 'points')}
                                maxCount={MAX_COUNT.point}
                            />
                            <RackListBox
                                ref="rackList"
                                isLoading={isLoading}
                                isReadOnly={!this.state.editMode}
                                lookUp={lookUpOfEnterprise}
                                enterprise={editedTag && editedTag.enterprise}
                                racks={editedTag && editedTag.racks}
                                units={editedTag && editedTag.units}
                                onChange={(racks, units) => this.onRacksChange(racks, units)}
                                maxRackCount={MAX_COUNT.rack}
                                maxUnitCount={MAX_COUNT.unit}
                            />
                            <UnitListBox
                                ref="unitList"
                                isLoading={isLoading}
                                isReadOnly={!this.state.editMode}
                                lookUp={lookUpOfEnterprise}
                                enterprise={editedTag && editedTag.enterprise}
                                racks={editedTag && editedTag.racks}
                                units={editedTag && editedTag.units}
                                onChange={(units, racks) => this.onUnitsChange(units, racks)}
                                maxRackCount={MAX_COUNT.rack}
                                maxUnitCount={MAX_COUNT.unit}
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
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        isLoading: state.isLoading,
        tags: state.tags,
        lookUp: state.lookUp,
        lookUpOfEnterprise: state.lookUpOfEnterprise,
        waitingInfo: state.waitingInfo
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setTags: (tags) => dispatch(setTags(tags)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setLookUpOfEnterprise: (lookUp) => dispatch(setLookUpOfEnterprise(lookUp)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(TagPanel);

 