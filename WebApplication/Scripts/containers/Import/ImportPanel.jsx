/**
 * @license Copyright 2017 DENSO
 * 
 * インポート画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Checkbox, Grid, Row } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import SpecificationCondition from 'Assets/Condition/SpecificationCondition/SpecificationCondition';
import ICCardCondition from 'Assets/Condition/ICCardCondition';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ImportBox from 'Import/ImportBox';
import ExportColumnSettingModal from 'Import/ExportColumnSettingModal';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition, setICCardType } from 'SearchCondition/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setImportType, setSearchDisabled, setExportSet, setPrevExportSet, setFormatOnly, setExportTypes } from './actions.js';
import { setICCardSearchCondition, setEditingICCardCondition, setValidateICCardCondition } from 'ICCardSearchCondition/actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { createInitSearchConditionWithAsset, clearSearchConditionAssetOnly, updateAssetEditingCondition, filterSearchCondition, replaceLocationConditionTargets } from 'searchConditionUtility';
import { outputCSVRows } from 'exportUtility';
import { ASSET_REPORT_TYPE, IMPORT_TYPE, EXPORT_TYPE, EXPORT_TYPE_OPTIONS } from 'constant';
import { successResult, VALIDATE_STATE } from 'inputCheck';
import { getICCardType } from 'iccardUtility';

const SEARCH_CONDITION_TYPES = ['locations', 'enterprises', 'tags', 'egroups', 'hashTags'];
const SEARCH_CONDITION_TYPES_ICCARD = ['cardIds', 'cardNames', 'enterprises', 'enterpriseNames', 'loginUsers', 'userNames', 'userKanas', 'allowLocations'];

class ImportPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {}
        };
    }

    componentDidMount() {
        //検索条件の初期化
        this.props.setEditingCondition(createInitSearchConditionWithAsset(SEARCH_CONDITION_TYPES));
        
        //ICカード条件の初期化
        this.setDefaultICCardSearchCondition();     
        
        this.loadLookUp(() => {
            this.loadExportSet(() => {
                this.loadICCardType(() => {
                    this.loadAuthentication();
                });
            });
        });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        this.props.setLoadState(true);
        getAuthentication(FUNCTION_ID_MAP.importExport, (auth) => {
            this.props.setLoadState(false);
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/import/getLookUp', null, (lookUp, networkError) => {
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
     * エクスポートセットを読み込む
     */
    loadExportSet(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/import/getExportSet', null, (exportSet, networkError) => {
            this.props.setLoadState(false);
            if (exportSet) {
                this.props.setExportSet(exportSet);
                this.props.setPrevExportSet(exportSet);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(exportSet);
            }
        });
    }

    /**
     * ICカード種別を読み込む
     */
    loadICCardType(callback) {
        this.props.setLoadState(true);
        getICCardType((isSuccess, icCardType, networkError) => {
            this.props.setLoadState(false);
            if (isSuccess) {
                this.props.setICCardType(icCardType);
            } else {
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else {                    
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: 'エラー',
                            message: 'ICカード種別取得に失敗しました。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            }

            if (callback) {
                callback();
            }
        });
        
    }

    /**
     * エクスポートするデータを読み込んでエクスポートする
     * @param {any} searchCondition 検索条件（lookUP）
     * @param {boolean} withoutSave 項目選択を保存するか
     * @param {any} icCardSearchCondition ICカード検索条件
     */
    export(searchCondition, withoutSave, icCardSearchCondition) {
        const sendingData = {
            lookUp: searchCondition,
            exportSet: this.props.exportSet,
            exportTypes: this.getFilteredExportTypes(),
            isFormatOnly: this.props.isFormatOnly,
            withoutSave: withoutSave,
            iCCardCondition: Object.assign({}, icCardSearchCondition, {
                cardIds: searchCondition.cardIds ? _.cloneDeep(searchCondition.cardIds) : [],
                cardNames: searchCondition.cardNames ? _.cloneDeep(searchCondition.cardNames) : [],
                enterpriseNames: searchCondition.enterpriseNames ? _.cloneDeep(searchCondition.enterpriseNames) : [],
                userNames: searchCondition.userNames ? _.cloneDeep(searchCondition.userNames) : [],
                userKanas: searchCondition.userKanas ? _.cloneDeep(searchCondition.userKanas) : []
            })
        };
        if (icCardSearchCondition.dateSpecified) {
            sendingData.lookUp.startDate = icCardSearchCondition.dateFrom.format('YYYY-MM-DD') + ' 00:00:00';
            sendingData.lookUp.endDate = icCardSearchCondition.dateTo.format('YYYY-MM-DD') + ' 23:59:59';
        }

        this.props.setWaitingState(true, 'export');
        sendData(EnumHttpMethod.post, '/api/import/export', sendingData, (exportInfo, networkError) => {
            this.props.setWaitingState(false);
            if (exportInfo) {
                this.exportData(exportInfo);
            }
            if (!withoutSave) {
                this.props.setPrevExportSet(this.props.exportSet);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * ファイルをインポートする
     * @param {any} formData
     * @param {any} callback
     */
    importData(importInfo) {
        this.props.setWaitingState(true, 'import');
        sendData(EnumHttpMethod.post, '/api/import/import', importInfo, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        size: result.isSuccess ? 'sm' : 'lg',
                        title: 'インポート' + (result.isSuccess ? '成功' : '失敗'),
                        message: result.message && result.message.split(/\r\n|\r|\n/).map((line) => <div>{line}</div>),
                        onCancel: () => {
                            this.clearMessage();
                            if (result.isSuccess) {
                                this.refs.importBox.clear();
                            }
                        }
                    }
                });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }


    /**
     * データをエクスポートする
     * @param {any} exportInfo
     */
    exportData(exportInfo) {
        let exported = false
        if (exportInfo.exportData_Rack) {
            outputCSVRows(exportInfo.exportData_Rack, 'RackListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_RackPower) {
            outputCSVRows(exportInfo.exportData_RackPower, 'RackPowerListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_RackOutlet) {
            outputCSVRows(exportInfo.exportData_RackOutlet, 'RackOutletListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_RackLink) {
            outputCSVRows(exportInfo.exportData_RackLink, 'RackLinkListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_Unit) {
            outputCSVRows(exportInfo.exportData_Unit, 'UnitListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_UnitPower) {
            outputCSVRows(exportInfo.exportData_UnitPower, 'UnitPowerListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_UnitLink) {
            outputCSVRows(exportInfo.exportData_UnitLink, 'UnitLinkListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_UnitPort) {
            outputCSVRows(exportInfo.exportData_UnitPort, 'UnitPortListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_UnitIPAddress) {
            outputCSVRows(exportInfo.exportData_UnitIPAddress, 'UnitIPAddressListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_Point) {
            outputCSVRows(exportInfo.exportData_Point, 'PointListExport', true);
            exported = true;
        }
        if (exportInfo.exportData_ICCard) {
            outputCSVRows(exportInfo.exportData_ICCard, 'ICCardListExport', true);
            exported = true;
        }

        if (!exported) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'エラー',
                    message: '該当するデータがありません。',
                    onCancel: () => this.clearMessage()
                }
            });
        }
    }

    /**
     * エクスポートがクリックされた時
     * @param {any} searchCondition
     */
    onExportClick(searchCondition) {
        const { editingCondition: icCardEditingCondition  } = this.props.icCardSearchCondition;
        if (JSON.stringify(this.props.exportSet) !== JSON.stringify(this.props.prevExportSet)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'yesNo',
                    title: 'エクスポート項目保存',
                    message: '今回のエクスポート項目を保存しますか？',
                    onOK: () => {
                        this.clearMessage();
                        this.export(searchCondition, false, icCardEditingCondition);
                    },
                    onCancel: () => {
                        this.clearMessage();
                        this.export(searchCondition, true, icCardEditingCondition);
                    }
                }
            })
        } else {
            this.export(searchCondition, true, icCardEditingCondition);
        }
    }

    /**
     * インポートボタンのクリックイベント
     */
    onImportClick(importInfo) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'confirm',
                title: 'インポート確認',
                message: '選択中のファイルをインポートします。よろしいですか？',
                onOK: () => {
                    this.importData(importInfo);
                    this.clearMessage();
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 検索条件が変更された時
     * @param {any} condition
     */
    onConditionChange(condition) {
        this.props.setEditingCondition(condition);
    }

    /**
     * アセットの検索条件が変更された時
     * @param {any} conditions
     * @param {any} isError
     */
    onAssetConditionChange(conditions, isError) {
        this.props.setEditingCondition(conditions, isError);
    }

    /**
     * エクスポート種別のチェック状態が変更された時
     * @param {any} exportType
     */
    onCheckChange(exportType) {
        const exportTypes = this.props.exportTypes.slice();
        const index = exportTypes.indexOf(exportType);

        if (index >= 0) {
            exportTypes.splice(index, 1);
        } else {
            exportTypes.push(exportType);
        }

        this.props.setExportTypes(exportTypes);
    }


    /**
     * アセットの検索条件をセットする
     * @param {any} conditions
     * @param {any} isError
     */
    setAssetEditingCondition(conditions, isError) {
        let { editingCondition } = this.props.searchCondition;

        if (this.props.importType === IMPORT_TYPE.rack) {
            editingCondition = updateAssetEditingCondition(editingCondition, SEARCH_CONDITION_TYPES, conditions, []);
        } else {
            editingCondition = updateAssetEditingCondition(editingCondition, SEARCH_CONDITION_TYPES, [], conditions);
        }

        this.props.setEditingCondition(editingCondition);
        this.props.setSearchDisabled(isError, this.props.importType);
    }

    /**
     * エクスポート種別のオプションを取得する
     */
    getExportTypeOptions() {
        return EXPORT_TYPE_OPTIONS.filter((option) => option.type === this.props.importType);
    }

    /**
     * 出力するエクスポートタイプ一覧を取得する
     */
    getFilteredExportTypes() {
        const exportTypes = [];

        EXPORT_TYPE_OPTIONS.forEach((option) => {
            if (option.type === this.props.importType && this.props.exportTypes.indexOf(option.value) >= 0) {
                exportTypes.push(option.value);
            }
        });

        return exportTypes;
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
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * インポート種別が「ラック」もしくは「ユニット」かどうか
     * @param {number} importType インポート種別
     */
    isAssetImportType(importType) {
        return importType === IMPORT_TYPE.rack || importType === IMPORT_TYPE.unit;
    }

    /**
     * 条件クリア
     */
    clearEditingCondition() {
        this.setDefaultICCardSearchCondition();
        this.props.setSearchDisabled(false);
    }

    /**
     * インポート種別変更
     * @param {number} type インポート種別
     */
    changeImportType(type, beforeType) {
        this.props.setImportType(type);
        this.clearEditingCondition();

        //検索条件名：ロケーション⇔操作可能ラックに変換
        if (type !== beforeType) {
            var editingCondition = _.cloneDeep(this.props.searchCondition.editingCondition);
            if (type === IMPORT_TYPE.icCard) {
                editingCondition.targets = replaceLocationConditionTargets(editingCondition.targets, true);
                editingCondition = filterSearchCondition(editingCondition, SEARCH_CONDITION_TYPES_ICCARD);
            } else if (beforeType === IMPORT_TYPE.icCard) {
                editingCondition.targets = replaceLocationConditionTargets(editingCondition.targets, false);
                editingCondition = filterSearchCondition(editingCondition, SEARCH_CONDITION_TYPES);
            }
            this.props.setEditingCondition(editingCondition);
        }
    }

    /**
     * エクスポートボタン操作不可かどうかを取得する
     * @param {object} disabled 操作不可かどうか
     * @param {number} importType インポート種別
     * @returns 
     */
    getSearchDisabled(disabled, importType) {
        switch (importType) {
            case IMPORT_TYPE.rack:
                return disabled.rack;
            case IMPORT_TYPE.unit:
                return disabled.unit;
            case IMPORT_TYPE.point:
                return disabled.point;
            case IMPORT_TYPE.icCard:
                return disabled.icCard;
        }
        return false;
    }

    //#region ICカード関連

    /**
     * ICカード検索条件を変更する
     * @param {object} target 検索条件（IOカード）
     * @param {object} validate 入力検証結果
     */
     changeICCardCondition(target, validate) {        
        var condition = _.cloneDeep(target);
        this.props.setEditingICCardCondition(condition, validate);
        if (this.hasError(validate, condition.dateSpecified)) {
            this.props.setSearchDisabled(true, IMPORT_TYPE.icCard);
        } else { 
            this.props.setSearchDisabled(false, IMPORT_TYPE.icCard);            
        }
    }
    
    /**
     * 日付範囲のデフォルト値を返す（初期描画時と条件クリア時に使用）
     */
     getDefaultDateTimeSpan() {
        const t = moment().startOf('date');
        return {
            dateFrom: t.clone().subtract(3, 'months'),
            dateTo: t.clone().add(3, 'months'),
        };
    }

    /**
     * ICカード検索条件をデフォルトを返す
     */
    setDefaultICCardSearchCondition() {
        const condition = Object.assign({
                                dateSpecified: true,
                                isAdmin: true,
                                isNonAdmin: true,
                                isValid: true,
                                isInvalid: true,
                            }, this.getDefaultDateTimeSpan())
        this.props.setEditingICCardCondition(condition, { dateFrom: successResult, dateTo: successResult });
    }

    /**
     * 入力エラーがあるか
     * @param {object} validate 検証結果
     * @param {boolean} dateSpecified 日付期間を使用しているかどうか
     */
     hasError(validate, dateSpecified) {
        for (let key of Object.keys(validate)) {
            if (!dateSpecified && (key === 'dateFrom' || key === 'dateTo')) {
                continue;
            }
            if (validate[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    //#endregion


    /**
     * render
     */
    render() {
        const { isReadOnly, level } = this.props.authentication;
        const { searchCondition, icCardSearchCondition, isLoading, waitingInfo, importType, searchDisabled, exportSet, prevExportSet, isFormatOnly, exportTypes } = this.props;
        const { lookUp, editingCondition, icCardType } = searchCondition;
        const { message } = this.state;

        let searchItems = [];
        if (lookUp && this.isAssetImportType(importType)) {
            searchItems = (importType === IMPORT_TYPE.rack) ? lookUp.rackConditionItems : lookUp.unitConditionItems;
        }
        let assetConditions;
        if (editingCondition && this.isAssetImportType(importType)) {
            assetConditions = (importType === IMPORT_TYPE.rack) ? editingCondition.rackConditionItems : editingCondition.unitConditionItems;
        }

        const exportTypeOptions = this.getExportTypeOptions();
        const isEnableExport = exportTypeOptions.some((option) => exportTypes.indexOf(option.value) >= 0);

        return (
            <Content>
                <Grid fluid>
                    <Row className="mb-1">
                        <ToggleSwitch
                            value={importType}
                            name="importType"
                            swichValues={[
                                { value: IMPORT_TYPE.point, text: 'ポイント' },
                                { value: IMPORT_TYPE.rack, text: 'ラック' },
                                { value: IMPORT_TYPE.unit, text: 'ユニット' },
                                { value: IMPORT_TYPE.icCard, text: 'ICカード' }
                            ]}
                            onChange={(v) => this.changeImportType(v, importType)}
                        />
                    </Row>
                    <Row className="mb-1">
                        <div className="pull-left mt-1">
                            {exportTypeOptions.length > 1 && exportTypeOptions.map((option) =>
                                <Checkbox inline
                                    checked={exportTypes.indexOf(option.value) >= 0}
                                    onClick={() => this.onCheckChange(option.value)}
                                >
                                    {option.name}
                                </Checkbox>)
                            }
                        </div>
                        <Button
                            className="pull-right"
                            bsStyle="primary"
                            onClick={() => this.setState({ showModal: true })}
                            disabled={isLoading || !exportSet}
                        >項目選択</Button>
                    </Row>
                    <Row>
                        <SearchConditionBox exportMode
                            isLoading={isLoading}
                            targets={importType !== IMPORT_TYPE.icCard ? SEARCH_CONDITION_TYPES : SEARCH_CONDITION_TYPES_ICCARD}
                            icCardType={icCardType}
                            lookUp={lookUp}
                            searchCondition={editingCondition}
                            searchButtonDisabled={this.getSearchDisabled(searchDisabled, importType) || !isEnableExport || !exportSet}
                            onChange={(condition) => this.onConditionChange(condition)}
                            onSearchClick={(condition) => this.onExportClick(Object.assign({}, editingCondition, {
                                locations: condition.locations,
                                enterprises: condition.enterprises,
                                tags: condition.tags,
                                egroups: condition.egroups,
                                hashTags: condition.hashTags,
                                loginUsers: condition.loginUsers
                            }))}
                            onClear={() => this.clearEditingCondition()}
                        >
                            {this.isAssetImportType(importType) &&
                                <SpecificationCondition
                                    reportType={importType == IMPORT_TYPE.rack ? ASSET_REPORT_TYPE.rack : ASSET_REPORT_TYPE.unit}
                                    searchItems={searchItems}
                                    conditionItems={assetConditions}
                                    onChange={(conditions, isError) => this.setAssetEditingCondition(conditions, isError)}
                                />
                            }
                            {importType === IMPORT_TYPE.icCard &&
                                <ICCardCondition
                                    condition={icCardSearchCondition.editingCondition}
                                    validate={icCardSearchCondition.validate}
                                    onChange={(condition, validate) => this.changeICCardCondition(condition, validate)}
                                />
                            }
                            <Grid fluid>
                                <Checkbox
                                    checked={isFormatOnly}
                                    onClick={() => this.props.setFormatOnly(!isFormatOnly)}
                                >
                                    フォーマットのみ
                                </Checkbox>
                            </Grid>
                        </SearchConditionBox>
                    </Row>
                    {!isReadOnly && level != LAVEL_TYPE.normal &&
                        <Row>
                            <ImportBox
                                ref="importBox"
                                isLoading={isLoading}
                                importType={importType}
                                onImportClick={(importInfo) => this.onImportClick(importInfo)}
                            />
                        </Row>
                    }
                </Grid>
                <ExportColumnSettingModal
                    showModal={this.state.showModal}
                    onSubmit={(columns) => {
                        this.setState({ showModal: false });
                        this.props.setExportSet(Object.assign({}, exportSet, { exportColumns: columns }));
                    }}
                    onCancel={() => this.setState({ showModal: false })}
                    target={importType}
                    exportColumns={exportSet && exportSet.exportColumns}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize={message.size || 'sm'}
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
        searchCondition: state.searchCondition,
        icCardSearchCondition: state.icCardSearchCondition,
        isLoading: state.isLoading,
        importType: state.importType,
        searchDisabled: state.searchDisabled,
        exportSet: state.exportSet,
        prevExportSet: state.prevExportSet,
        isFormatOnly: state.isFormatOnly,
        exportTypes: state.exportTypes,
        waitingInfo: state.waitingInfo
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setICCardType: (icCardType) => dispatch(setICCardType(icCardType)),
        setICCardSearchCondition: (condition) => dispatch(setICCardSearchCondition(condition)),
        setEditingICCardCondition: (condition, validate) => dispatch(setEditingICCardCondition(condition, validate)),
        setValidateICCardCondition: (validate) => dispatch(setValidateICCardCondition(validate)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setImportType: (type) => dispatch(setImportType(type)),
        setSearchDisabled: (disabled, type) => dispatch(setSearchDisabled(disabled, type)),
        setExportSet: (exportSet) => dispatch(setExportSet(exportSet)),
        setPrevExportSet: (exportSet) => dispatch(setPrevExportSet(exportSet)),
        setFormatOnly: (isFormatOnly) => dispatch(setFormatOnly(isFormatOnly)),
        setExportTypes: (exportTypes) => dispatch(setExportTypes(exportTypes)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ImportPanel);

 