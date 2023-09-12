/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Clearfix, Checkbox } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Icon from 'Common/Widget/Icon';
import NetworkList from 'NetworkConnection/List/NetworkList';
import Button from 'Common/Widget/Button';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { DeleteHotKeyButton, AddHotKeyButton, ExportReportHotKeyButton } from 'Assets/GarmitButton';

import { outputCSVFile } from 'exportUtility';
import { makePortNoCellString, makeUnitCellString, makeRackCellString } from 'assetUtility';

/**
 * ネットワーク一覧ボックスコンポーネント
 * @param {array} networkPathRows ネットワーク経路一覧
 * @param {object} selectedNetworkRow 選択中のネットワーク経路情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 権限レベル
 * @param {function} onSelect ネットワーク選択時に呼び出される
 * @param {function} onEdit 編集ボタン押下時に呼び出される
 * @param {function} onDelete 削除ボタン押下時に呼び出される
 * @param {function} onAdd 追加ボタン押下時に呼び出される
 * @param {function} onShowPath 経路表示ボタン押下時に呼び出される
 */
export default class NetworkListBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            isBothSearchTarget: false,
            checkedNetworkList: [],
            outputNetwokList: props.networkPathRows && this.filterNetworkPaths(_.cloneDeep(props.networkPathRows), false)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.networkPathRows !== this.props.networkPathRows) {
            this.setState({ 
                isBothSearchTarget : false, 
                checkedNetworkList: [],
                outputNetwokList: nextProps.networkPathRows && this.filterNetworkPaths(_.cloneDeep(nextProps.networkPathRows), false)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { networkPathRows, selectedNetworkRow, initialDisplayState, isLoading, isReadOnly, level } = this.props;
        const { isBothSearchTarget, checkedNetworkList, outputNetwokList } = this.state;
        const targetNetworkPaths = networkPathRows && this.filterNetworkPaths(_.cloneDeep(networkPathRows), isBothSearchTarget);
        return (
            <Box boxStyle="default"  isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>検索結果</Box.Title>
                </Box.Header >
                <Box.Body>
                    <Clearfix className="mb-05 networklist-control-button-row">
                        {!isReadOnly &&
                            <div className="ta-l pull-left">
                                <ButtonToolbar>
                                    { networkPathRows && !readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager) &&
                                        <DeleteHotKeyButton
                                            disabled={!(checkedNetworkList&&checkedNetworkList.length > 0)}
                                            onClick={() => this.onMultipleDelete(checkedNetworkList)} 
                                        />
                                    }
                                    {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator) &&
                                        <AddHotKeyButton
                                            disabled={isLoading}
                                            onClick={() => this.onAdd()}
                                        />
                                    }
                                </ButtonToolbar>
                            </div>
                        }
                        { networkPathRows &&
                            <div className="ta-r pull-right">
                                <ButtonToolbar>
                                    <Button bsStyle="primary" 
                                            disabled={!this.hasNetworkPath(selectedNetworkRow)}
                                            onClick={() => this.onShowPath()}>
                                        <Icon className="material-icons" >call_split</Icon>
                                        <span>経路表示</span>
                                    </Button>
                                    <ExportReportHotKeyButton onClick={() => this.outputReport(outputNetwokList)} />
                                </ButtonToolbar>
                            </div>
                        }
                    </Clearfix>
                    { networkPathRows &&
                        <div className="ta-r pull-right">
                            <Checkbox checked={isBothSearchTarget} onChange={(e) => this.setIsBothSearchTarget(e.target.checked)} >
                                接続先も一致するものを表示する
                            </Checkbox>
                        </div>
                    }
                    {targetNetworkPaths&&
                        <NetworkList selectedNetworkRow={selectedNetworkRow} 
                                     networkPathRows={targetNetworkPaths}
                                     initialDisplayState={initialDisplayState}
                                     isReadOnly={isReadOnly}
                                     level={level}
                                     onSelect={(networkRow, isClearChecked) => this.onSelect(networkRow, isClearChecked)} 
                                     onEdit={(networkRow) => this.onEdit(networkRow)}
                                     onDelete={(networkRow) => this.onDelete(networkRow)}
                                     onChangeChecked={(networkRows) => this.setCheckedNetworkList(networkRows)}
                                     onChangeDisplayState={(displayState, outputList) => this.handleDisplayStateChanged(displayState, outputList)}
                        />
                    }
                </Box.Body>
            </Box>            
        );
    }
    
    /**
     * ネットワーク一覧を絞り込む
     * @param {array} networkPathRows ネットワーク経路一覧
     * @param {boolean} isBothSearchTarget 接続先も一致するものを表示するかどうか
     */
    filterNetworkPaths(networkPathRows, isBothSearchTarget) {
        if (isBothSearchTarget) {
            return networkPathRows.filter((network) => network.isRackToAllowed && network.isBothSearchTarget === isBothSearchTarget);
        }
        return networkPathRows;        
    }

    /**
     * ネットワーク経路情報があるかどうか
     * @param {object} networkRow ネットワーク経路情報
     */
    hasNetworkPath(networkRow) {
        if (networkRow && networkRow.networkId && this.hasNetworkTo(networkRow)) {
            return true;
        }
        return false;
    }

    /**
     * ネットワーク接続先情報があるかどうか
     * @param {object} networkRow ネットワーク経路情報
     */
    hasNetworkTo(networkRow) {
        if (networkRow.rackIdTo &&
            networkRow.unitIdTo &&
            networkRow.portSeqNoTo &&
            networkRow.isRackToAllowed) {
            return true;
        }
        return false;
    }

    /********************************************
     * stateのセット
     ********************************************/

    /**
     * チェックされたネットワーク一覧をstateにセットする
     * @param {*} networkRows チェックされたネットワーク一覧
     */
    setCheckedNetworkList(networkRows) {
        this.setState({checkedNetworkList: networkRows});
    }

    /**
     * 接続先も一致するものを表示するかどうかを変更する
     * @param {boolean} isBothSearchTarget 接続先も一致するものを表示するかどうか
     */
    setIsBothSearchTarget(isBothSearchTarget) {
        const { networkPathRows } = this.props;
        this.onSelect(null);
        const outputList = networkPathRows && this.filterNetworkPaths(_.cloneDeep(networkPathRows), isBothSearchTarget);
        this.setState({
            isBothSearchTarget: isBothSearchTarget,
            outputNetwokList: outputList
        });
    }

    /********************************************
     * イベント呼び出し
     ********************************************/

    /**
     * 追加イベントを呼び出す
     */
    onAdd() {
        if (this.props.onAdd) {
            this.props.onAdd();
        }
    }
    
    /**
     * ネットワーク選択イベントを呼び出す
     * @param {object} networkRow 選択したネットワーク情報
     * @param {boolean} isClearChecked チェックをクリアするか
     */
    onSelect(networkRow, isClearChecked){
        if (isClearChecked) {
            this.setCheckedNetworkList([]);
        }

        if (this.props.onSelect){
            this.props.onSelect(networkRow);
        }
    }
    
    /**
     * 編集イベントを呼び出す
     * @param {object} networkRow 編集するネットワーク
     */
    onEdit(networkRow){
        if (this.props.onEdit) {
            this.props.onEdit(networkRow)            
        }
    }
    
    /**
     * 削除イベントを呼び出す
     * @param {object} networkRow 編集するネットワーク
     */
    onDelete(networkRow){
        if (this.props.onDelete) {
            this.props.onDelete(networkRow)            
        }
    }

    /**
     * 複数のネットワーク削除イベントを呼び出す
     * @param {array} networkRows チェックされたネットワーク一覧
     */
    onMultipleDelete(networkRows) {
        if (this.props.onDeleteMultiple) {
            this.props.onDeleteMultiple(networkRows)    
        }
    }

    /**
     * 経路表示イベントを呼び出す
     */
    onShowPath() {
        if (this.props.onShowPath) {
            this.props.onShowPath();
        }
    }
    
    /**
     * 一覧の表示設定状態変更イベント
     * @param {object} setting 設定情報
     */
    onChangeTableDisplayState(setting) {
        if (this.props.onChangeTableDisplayState) {
            this.props.onChangeTableDisplayState(setting);
        }
    }

    /********************************************
     * レポート出力
     ********************************************/

    /**
     * レポート出力する
     * @param {array} networkPathRows 出力するレポート
     */
    outputReport(networkPathRows) {
        const reportData = this.convertToNetwork2DStringArray(networkPathRows);
        outputCSVFile(reportData, 'NetworkListExport');
    }
    
    /**
     * ネットワーク情報を文字列に次元配列に変換する
     * @param {array} networkPathRows ネットワーク経路一覧
     * @param {array} 変換後の文字列2次元配列
     */
    convertToNetwork2DStringArray(networkPathRows) {
        const header = [['接続元ラック', '接続元ユニット', 'ポート', '接続先ラック', '接続先ユニット', 'ポート']];
        const rows = networkPathRows.map((network) => this.convertToNetworkRow(network));
        return header.concat(rows);
    }

    /**
     * ネットワーク情報を行に変換する
     * @param {object} networkRow ネットワーク情報
     * @returns {array} 変換後の行
     */
    convertToNetworkRow(networkRow) {
        var cells = [];
        cells.push(networkRow.rackNameFrom);
        cells.push(networkRow.unitNameFrom);
        cells.push(makePortNoCellString(networkRow.portNoFrom, networkRow.portIndexFrom));
        cells.push(makeRackCellString(networkRow.rackIdTo, networkRow.rackNameTo, networkRow.isRackToAllowed));
        cells.push(makeUnitCellString(networkRow.unitIdTo, networkRow.unitNameTo, networkRow.isRackToAllowed));
        cells.push(makePortNoCellString(networkRow.portNoTo, networkRow.portIndexTo, networkRow.isRackToAllowed));
        return cells;
    }

    /**
     * 表示設定情報が変更されたときのイベントハンドラ
     * @param {object} setting 設定情報
     * @param {array} outputList 出力するリスト
     */
    handleDisplayStateChanged(setting, outputList) {
        this.setState({
            outputNetwokList: outputList
            },
            () => this.onChangeTableDisplayState(setting)
        )
    }

}

NetworkListBox.propTypes = {    
    networkPathRows: PropTypes.arrayOf(PropTypes.shape({
        networkId: PropTypes.number,
        networkName: PropTypes.string,
        rackIdFrom: PropTypes.string,
        rackNameFrom: PropTypes.string,
        locationNameFrom: PropTypes.string,
        unitIdFrom: PropTypes.string,
        unitNameFrom: PropTypes.string,
        portSeqNoFrom: PropTypes.number,
        portNoFrom: PropTypes.number,
        portIndexFrom: PropTypes.number,
        portNameFrom: PropTypes.string,
        rackIdTo: PropTypes.string,
        rackNameTo: PropTypes.string,
        locationNameTo: PropTypes.string,
        unitIdTo: PropTypes.string,
        unitNameTo: PropTypes.string,
        portSeqNoTo: PropTypes.number,
        portNoTo: PropTypes.number,
        portIndexTo: PropTypes.number,
        portNameTo: PropTypes.string,
        isRackToAllowed: PropTypes.bool.isRequired,
        isBothSearchTarget: PropTypes.bool.isRequired
    })),
    selectedNetworkRow: PropTypes.object,
    initialDisplayState: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    level: PropTypes.number,
    onSelect: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onDeleteMultiple: PropTypes.func,
    onAdd: PropTypes.func,
    onShowPath: PropTypes.func
}