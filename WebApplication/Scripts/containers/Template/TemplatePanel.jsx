/**
 * @license Copyright 2017 DENSO
 * 
 * Template画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setTemplateType, setDeleteTemplateIds, setLoadState, changeModalState } from './actions.js';

import Content from 'Common/Layout/Content';
import MessageModal from 'Assets/Modal/MessageModal';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import TemplateListBox from 'Template/TemplateListBox';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { FUNCTION_ID_MAP, getAuthentication } from 'authentication';
import { TEMPLATE_TYPE } from 'constant';

/**
 * Template画面のコンポーネント
 */
class TemplatePanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            searchResult: null,
            templateType: 'rack'
        };
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
    }

    /**
     * render
     */
    render() {
        const { templateType, searchCondition, searchResult, isLoading, modalState, waitingInfo } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        return (
            <Content>
                <SearchConditionBox
                    isLoading={loading}
                    topConditions={this.topConditions()}
                    targets={['templateName', 'templateMemo']}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.props.setEditingCondition(condition)}
                    onSearchClick={(condition) => this.searchTemplates(condition)} 
                    useHotKeys
                />
                <TemplateListBox
                    isLoading={loading}
                    templateType={templateType}
                    templateList={searchResult&&searchResult.result}
                    tableSetting={searchResult&&searchResult.displayState}
                    onDelete={(ids) => this.handleDeleteTemplate(ids)}
                    isReadOnly={isReadOnly}
                    level={level}
                    onChangeTableSetting={(setting) => this.props.setDisplayState(setting)}
                    onChangeColumnSetting={() => this.searchTemplates(searchCondition.conditions, false)}
                />
                <MessageModal show={modalState.show}
                              title={modalState.title}
                              bsSize="small"
                              buttonStyle={modalState.type}
                              onOK={() => {modalState.callback ? modalState.callback() : this.props.changeModalState(false) }}
                              onCancel={() => this.props.changeModalState(false)}
                >
                    {modalState.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }

    /**
     * 検索条件の上部に表示する条件
     */
    topConditions(){
        const { templateType } = this.props;
        return (
            <Form inline className='ml-2 mb-1'>
                <FormGroup >
                    <ControlLabel>出力対象</ControlLabel>{' '}
                    <FormControl className='ml-1' 
                                 componentClass='select' 
                                 value={templateType} 
                                 onChange={(e)=>this.templateTypeChanged(e.target.value)}>
                                 <option value={TEMPLATE_TYPE.rack}>ラック</option>
                                 <option value={TEMPLATE_TYPE.unit}>ユニット</option>
                    </FormControl>
                </FormGroup>
            </Form>
        );
    }
    
    /********************************************
     * 認証情報取得
     ********************************************/

    /**
     * 認証情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.template, (auth, networkError) => {
            this.props.setAuthentication(auth);
            if (networkError) {
                this.props.changeModalState(true, 'エラー', NETWORKERROR_MESSAGE, 'message');
            }
        });
    }

    /********************************************
     * データ読み込み、保存、削除
     ********************************************/

    /**
     * テンプレートを取得する
     * @param {object} condition 検索条件（テンプレート名称とメモ）
     * @param {string} url データ取得するURL
     * @param {boolean} isUpdate 更新かどうか（デフォルト値：false）
     */
    getTemplates(condition, url, isUpdate = false) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, url, condition, (result, networkError) => {
            this.props.setSearchResult(result);
            this.props.setLoadState(false);
            if (networkError) {
                this.props.changeModalState(true, 'エラー', NETWORKERROR_MESSAGE, 'message');
            } else if (!result) {
                this.props.changeModalState(true, 'エラー', 'データ取得に失敗しました', 'message');
            } else if (!isUpdate && result.rows && result.rows.length === 0) {
                this.props.changeModalState(true, '検索', '検索条件に該当するテンプレートがありません。', 'message');
            }
        });
    }

    /**
     * テンプレートを削除する
     * @param {array} ids 削除対象のテンプレートID
     * @param {string} url データ削除用のURL
     */
    deleteTemplate(ids, url) {
        this.props.changeModalState(false);
        this.props.setWaitingState(true, 'delete');        
        sendData(EnumHttpMethod.post, url, ids, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeModalState(true, 'エラー', NETWORKERROR_MESSAGE, 'message');
            } else if (result) {
                this.props.setLoadState(true);
                this.searchTemplates(this.props.searchCondition.conditions, false);
            } else {
                this.props.changeModalState(true, 'エラー', 'テンプレート削除に失敗しました。', 'message');
            }
        });
    }

    /********************************************
     * イベント
     ********************************************/

    /**
     * テンプレート種別変更イベント
     * @param {string} type テンプレート種別
     */
    templateTypeChanged(type){
        this.props.setTemplateType(type);
        this.props.setSearchResult(null);
    }

    /**
     * テンプレートを検索する
     * @param {object} condition 検索条件
     * @param {boolean} isConditionUpdate 検索条件の更新をするかどうか（デフォルト値：true）
     */
    searchTemplates(condition, isConditionUpdate = true){
        var url = '/api/template/';
        if (this.props.templateType === TEMPLATE_TYPE.rack) {
            url += 'getRackTemplates';
        } else {
            url += 'getUnitTemplates';
        }

        if (isConditionUpdate) {
            this.props.setSearchCondition(condition);
        }
        this.getTemplates(condition, url, !isConditionUpdate);
    }

    /**
     * テンプレート削除イベント
     * @param {array} ids 削除するテンプレートID
     */
    handleDeleteTemplate(ids) {
        var url = '/api/template/';
        if (this.props.templateType === TEMPLATE_TYPE.rack) {
            url += 'deleteRackTemplates';
        } else {
            url += 'deleteUnitTemplates';
        }

        this.props.changeModalState(true, 
                                    '削除', 
                                    '選択したテンプレートを削除してもよろしいですか？', 
                                    'delete', 
                                    () => this.deleteTemplate(ids, url)
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
        searchCondition: state.searchCondition,
        searchResult: state.searchResult,
        templateType: state.templateType,
        deleteTemplateIds: state.deleteTemplateIds,
        modalState: state.modalState,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication:(auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setTemplateType: (templateType) => dispatch(setTemplateType(templateType)),
        setDeleteTemplateIds: (templateIds) => dispatch(setDeleteTemplateIds(templateIds)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        changeModalState: (show, title, message, modalType, callback) => dispatch(changeModalState(show, title, message, modalType, callback)),
        setWaitingState:(isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(TemplatePanel);

 