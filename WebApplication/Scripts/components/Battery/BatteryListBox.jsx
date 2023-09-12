/**
 * @license Copyright 2019 DENSO
 * 
 * BatteryListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';
import { ExportReportButton } from 'Assets/GarmitButton';
import { BUTTON_OPERATION_TYPE } from 'constant';

/**
 * バッテリー一覧コンポーネントを定義します。
 * @param {object} batteryList バッテリ一覧情報
 * @param {number} selectedGateId 選択中の機器ID
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onReportButtonClick レポートボタンのクリック時に呼び出す
 * @param {function} onDetailButtonClick 詳細ボタンのクリック時に呼び出す
 * @param {function} onMeasureButtonClick 再測定ボタンのクリック時に呼び出す
 */
export default class BatteryListBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            displayState: null
        };
    }

    /**
     * render
     */
    render() {
        const { batteryList, selectedGateId, isLoading } = this.props;
        const { displayState } = this.state;
        
        const displaySearchResult = _.clone(batteryList);
        if (displaySearchResult && displaySearchResult.rows) {
            displaySearchResult.rows = displaySearchResult.rows.slice();
            const selectedIndex = displaySearchResult.rows.findIndex((row) =>
                row.parameterKeyPairs && row.parameterKeyPairs.some((pair) => pair.paramater == "GateId" && pair.key == selectedGateId)
            );
            displaySearchResult.rows[selectedIndex] = Object.assign({}, displaySearchResult.rows[selectedIndex], { className: 'datatable-select-row' });
        }

        return (
            <GarmitBox title="機器一覧" isLoading={isLoading}>
                <div>
                    <div className="mb-05 clearfix">
                        <div className="ta-r pull-right">
                            <ExportReportButton onClick={() => this.onReportButtonClick()} />
                            <div>※計測値を含めた一覧を出力します</div>
                        </div>
                    </div>
                    <div >
                        {batteryList ?
                            <SearchResultTable 
                                searchResult={displaySearchResult}
                                initialState={displayState}
                                striped={false}
                                onStateChange={(state) => this.changeTableSetting(state)}
                                onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                onCellButtonClick={(parameters) => this.handleMeasureButtonClick(parameters)}
                            />
                        :
                            <div>表示可能な機器がありません</div>
                        }
                    </div>
                </div>
            </GarmitBox>
        );
    }

    //#region クリックイベント

    /**
     * ホバーボタンがクリックイベント
     * @param {any} hoverButton
     */
    handleHoverButtonClick(hoverButton) {
        if (hoverButton && hoverButton.operationType === BUTTON_OPERATION_TYPE.detail) {
            const gateId = this.getGateId(hoverButton.parameterKeyPairs);
            this.onDetailButtonClick(gateId);
        }
    }

    /**
     * 再測定ボタンのクリックイベント
     * @param {any} parameterKeyPairs キーペア
     */
    handleMeasureButtonClick(parameterKeyPairs) {
        const gateId = this.getGateId(parameterKeyPairs);
        this.onMeasureButtonClick(gateId);
    }

    //#endregion

    //#region 一覧関連

    /**
     * 表の設定を変更する
     * @param {object} setting 設定情報 
     * @param {*} outputList 
     */
    changeTableSetting(setting) {
        this.setState({
            displayState: setting
        });        
    }

    //#endregion

    //#region 関数呼び出し

    /**
     * レポート出力ボタンクリック関数を呼び出す
     */
    onReportButtonClick() {
        if (this.props.onReportButtonClick) {
            this.props.onReportButtonClick();
        }
    }

    /**
     * 詳細ボタンクリック関数を呼び出す
     */
    onDetailButtonClick(gateId) {
        if (this.props.onDetailButtonClick) {
            this.props.onDetailButtonClick(gateId);
        }

    }

    /**
     * 再測定ボタンクリック関数を呼び出す
     */
    onMeasureButtonClick(gateId) {
        if (this.props.onMeasureButtonClick) {
            this.props.onMeasureButtonClick(gateId);
        }
    }

    //#endregion

    //#region その他
    
    /**
     * ParameterKeyPairsからgateIdを取得する
     * @param {any} parameterKeyPairs
     */
    getGateId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === "GateId");
        return target.key;
    }

    //#endregion

}

BatteryListBox.propsTypes = {
    batteryList: PropTypes.object,
    selectedGateId: PropTypes.number,
    isLoading: PropTypes.bool,
    onReportButtonClick: PropTypes.func,
    onDetailButtonClick: PropTypes.func,
    onMeasureButtonClick: PropTypes.func
}