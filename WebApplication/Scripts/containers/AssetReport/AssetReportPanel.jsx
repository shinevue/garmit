/**
 * @license Copyright 2018 DENSO
 * 
 * AssetReport画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Form, FormGroup, FormControl, ControlLabel,  } from 'react-bootstrap';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setReportType, setSearchDisabled, setMessageModalState } from './actions.js';

import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import SpecificationCondition from 'Assets/Condition/SpecificationCondition/SpecificationCondition';
import AssetReportListBox from 'AssetReport/AssetReportListBox';
import MessageModal from 'Assets/Modal/MessageModal';

import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { ASSET_REPORT_TYPE } from 'constant';
import { createInitSearchConditionWithAsset, clearSearchConditionAssetOnly, updateAssetEditingCondition } from 'searchConditionUtility';

const SEARCH_CONDITION_TYPES = ['locations', 'enterprises', 'tags', 'egroups', 'hashTags'];

/**
 * AssetReport画面のコンポーネント
 */
class AssetReportPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    //#region ライフサイクルメソッド
    
    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.props.setEditingCondition(createInitSearchConditionWithAsset(SEARCH_CONDITION_TYPES));
        this.loadAuthentication();
        this.loadInfo();
    }
    
    /**
     * render
     */
    render() {
        const { reportType, searchCondition, searchResult, isLoading, searchDisabled, messageModal } = this.props;
        const { lookUp, editingCondition } = searchCondition;
        const { loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        var searchItems = [];
        if (lookUp) {
            searchItems = (reportType === ASSET_REPORT_TYPE.rack) ? lookUp.rackConditionItems : lookUp.unitConditionItems;
        }
        var assetConditions;
        if (editingCondition) {
            assetConditions =  (reportType === ASSET_REPORT_TYPE.rack) ? editingCondition.rackConditionItems : editingCondition.unitConditionItems;
        }

        return (
            <Content>
                <SearchConditionBox
                    isLoading={loading}
                    topConditions={this.topConditions(reportType)}
                    targets={SEARCH_CONDITION_TYPES}
                    lookUp={lookUp}
                    searchCondition={editingCondition}
                    searchButtonDisabled={searchDisabled}
                    onChange={(condition) => this.setEditingCondition(condition)}
                    onSearchClick={(condition) => this.searchAssetReport(condition)} 
                    onClear={() => this.clearEditingCondition()}
                    useHotKeys
                >
                    <SpecificationCondition 
                        reportType={reportType}
                        searchItems={searchItems} 
                        conditionItems={assetConditions}
                        onChange={(conditions, isError) => this.setAssetEditingCondition(reportType, conditions, isError)}             //コンディションを変更する
                    />
                </SearchConditionBox>
                <AssetReportListBox 
                    isLoading={loading}
                    reportType={reportType}
                    reportList={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.changeTableSetting(setting)}
                    onColumnSettingChanged={() => this.loadAssetReport(searchCondition.conditions, reportType, true)}
                    onApplyLocationCondition={(locationIds) => this.applyLocationCondition(locationIds)}
                />
                <MessageModal show={messageModal.show} 
                              title={messageModal.title} 
                              bsSize="small"
                              buttonStyle="message" 
                              onCancel={() => {this.props.setMessageModalState(false)}} >
                              {messageModal.show&&messageModal.message}
                </MessageModal>
            </Content>
        );
    }    
    
    /**
     * 検索条件の上部に表示する条件
     * @param {string} reportType 出力対象（ラックorユニット）
     */
    topConditions(reportType){
        return (
            <Form inline className='ml-2 mb-1'>
                <FormGroup >
                    <ControlLabel>出力対象</ControlLabel>{' '}
                    <FormControl className='ml-1' 
                                 componentClass='select' 
                                 value={reportType} 
                                 onChange={(e)=>this.changeReportType(e.target.value)}>
                                 <option value={ASSET_REPORT_TYPE.rack}>ラック</option>
                                 <option value={ASSET_REPORT_TYPE.unit}>ユニット</option>
                    </FormControl>
                </FormGroup>
            </Form>
        );
    }

    //#endregion

    //#region データ取得

    /********************************************
     * データ取得
     ********************************************/

    /**
     * 認証情報取得
     */
     loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.assetReport, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * 画面の初期データを非同期で読み込む
     */
    loadInfo () {     
        this.props.changeLoadState();   
        sendData(EnumHttpMethod.get, '/api/report/asset/lookUp', null, (info, networkError) => {
            if (networkError) {
                this.props.setMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (info) {
                this.props.setLookUp(info.lookUp);
            } else {
                this.props.setMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.changeLoadState();
        });
    }

    /**
     * アセットレポートを取得する
     * @param {object} condition 検索条件
     * @param {number} reportType 出力対象
     * @param {boolean} isUpdate 更新かどうか（デフォルト値：false）
     */
    loadAssetReport(condition, reportType, isUpdate = false) {
        this.props.changeLoadState();

        var url = '/api/report/asset/';
        if (reportType === ASSET_REPORT_TYPE.rack) {
            url += 'rackResult';
        } else {
            url += 'unitResult';
        }

        sendData(EnumHttpMethod.post, url, condition, (info, networkError) => {
            if (networkError) {
                this.props.setMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (info) {                
                this.props.setSearchResult(info.reportResult);
                if (!isUpdate && info.reportResult.rows && info.reportResult.rows.length === 0) {
                    let typeName = (reportType === ASSET_REPORT_TYPE.rack) ? 'ラック' : 'ユニット';
                    this.props.setMessageModalState(true, '検索', '検索条件に該当する' + typeName + 'がありません。');
                }
            } else {
                this.props.setMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.changeLoadState();
        });
    }

    //#endregion

    //#region 検索条件
    
    /********************************************
     * 検索条件
     ********************************************/

    /**
     * 出力対象を変更する
     * @param {string} type 出力対象種別
     */
    changeReportType(type) {
        this.props.setReportType(parseInt(type));        
        var { editingCondition } = this.props.searchCondition;
        editingCondition = clearSearchConditionAssetOnly(editingCondition);
        this.props.setEditingCondition(editingCondition);
        this.props.setSearchResult(null);
        this.props.setDisplayState(null);
        this.props.setSearchDisabled(false);
    }

    /**
     * 編集中の検索条件をセットする
     * @param {object} condition 検索条件
     */
    setEditingCondition(condition) {
        const { editingCondition } = this.props.searchCondition;
        const rackConditionItems = editingCondition && editingCondition.rackConditionItems;
        const unitConditionItems = editingCondition && editingCondition.unitConditionItems;
        condition = updateAssetEditingCondition(condition, SEARCH_CONDITION_TYPES, rackConditionItems, unitConditionItems);
        this.props.setEditingCondition(condition);
    }

    /**
     * 編集中のアセット検索条件をセットする
     * @param {number} reportType 出力対象種別
     * @param {array} conditions 検索条件
     */
    setAssetEditingCondition(reportType, conditions, isError) {
        var { editingCondition } = this.props.searchCondition;
        if (reportType === ASSET_REPORT_TYPE.rack) {
            editingCondition = updateAssetEditingCondition(editingCondition, SEARCH_CONDITION_TYPES, conditions, []);
        } else {
            editingCondition = updateAssetEditingCondition(editingCondition, SEARCH_CONDITION_TYPES, [], conditions);
        }
        this.props.setEditingCondition(editingCondition);
        this.props.setSearchDisabled(isError);
    }

    /**
     * 条件をクリアする
     */
    clearEditingCondition() { 
        this.props.setEditingCondition(createInitSearchConditionWithAsset(SEARCH_CONDITION_TYPES));
        this.props.setSearchDisabled(false);
    }

    /**
     * 検索結果をロケーション条件に適用する
     * @param {array} locationIds ロケーションIDリスト
     */
    applyLocationCondition(locationIds) {
        const alllocations = this.props.searchCondition.lookUp && this.props.searchCondition.lookUp.locations;
        var condition = { targets: ['locations'] };
        SEARCH_CONDITION_TYPES.forEach((target) => {
            condition[target] = [];
        });        
        if (alllocations) {
            condition.locations = this.getLocations(locationIds, alllocations);
        }
        this.props.setEditingCondition(condition);
        this.props.setSearchDisabled(false);
    }
    
    /**
     * ロケーションを取得する
     * @param {array} locationIds ロケーションIDリスト
     * @param {array} locations ロケーション一覧
     * @returns {array} ロケーション一覧
     */
    getLocations(locationIds, locations) {
        var retLocations = [];
        locations.forEach((location) => {
            if (locationIds.includes(location.locationId)) {
                retLocations.push(Object.assign({}, location));
            }

            const { children } = location;
            if (children && children.length > 0) {
                retLocations = retLocations.concat(this.getLocations(locationIds, children));      //再帰処理
            }
        });
        return retLocations;
    }

    //#endregion
    
    
    //#region 検索

    /********************************************
     * 検索
     ********************************************/

    /**
     * アセットレポートを検索する
     * @param {object} condition 検索条件
     */
    searchAssetReport(condition) {
        const { rackConditionItems, unitConditionItems } = this.props.searchCondition.editingCondition;
        const searchCondition = _.cloneDeep(condition)
        searchCondition.rackConditionItems = rackConditionItems && _.cloneDeep(rackConditionItems);
        searchCondition.unitConditionItems = unitConditionItems && _.cloneDeep(unitConditionItems);
        this.props.setSearchCondition(searchCondition);
        this.loadAssetReport(searchCondition, this.props.reportType);
    }

    //#endregion

    //#region 検索結果

    /********************************************
     * 検索結果
     ********************************************/

    /**
     * 表示設定を変更する
     * @param {any} setting 表示設定情報
     */
    changeTableSetting(setting) {
        this.props.setDisplayState(setting);
    }

    //#endregion

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
        isLoading: state.isLoading,
        reportType: state.reportType,
        searchDisabled: state.searchDisabled,
        messageModal: state.messageModal
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
        changeLoadState:() => dispatch(changeLoadState()),
        setReportType:(type) => dispatch(setReportType(type)),
        setSearchDisabled:(disabled) => dispatch(setSearchDisabled(disabled)),
        setMessageModalState:(show, title, message) => dispatch(setMessageModalState(show, title, message))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(AssetReportPanel);

 