/**
 * @license Copyright 2021 DENSO
 * 
 * CardReadLogListBoxコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';

/**
 * カード読み取りログ一覧ボックスコンポーネント
 * @param {object} cardReadLogResult ICカード読み取りログ一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class CardReadLogListBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }


    /**
     * render
     */
    render() {
        const { cardReadLogResult, tableSetting, isLoading } = this.props;        
        return (
            <GarmitBox isLoading={isLoading} title="カード読み取りログ一覧">
                {cardReadLogResult &&                            
                    <SearchResultTable exportButton columnSettingButton
                                    searchResult={cardReadLogResult}
                                    initialState={tableSetting}
                                    onStateChange={(state) => this.onTableSettingChange(state)}
                                    exportName={'CardReadLogList'}
                                    includeDateExportName
                                    functionId={FUNCTION_ID_MAP.cardReadLog}
                                    gridNo={1}
                                    onColumnSettingChange={() => this.onColumnSettingChanged()}
                    />
                }
            </GarmitBox>
        );
    }
    
    //#region イベント呼び出し

    /**
     * 表の設定変更イベントを呼び出す
     * @param {object} setting 設定情報 
     */
     onTableSettingChange(setting) {
        if (this.props.onTableSettingChange) {
            this.props.onTableSettingChange(setting);
        }
    }
    
    /**
     * 表示設定変更イベントを呼び出す
     */
    onColumnSettingChanged() {
        if (this.props.onColumnSettingChanged) {
            this.props.onColumnSettingChanged();
        }
    }

    //#endregion
}

CardReadLogListBox.propTypes = {
    cardReadLogResult: PropTypes.object,
    tableSetting: PropTypes.object,
    isLoading: PropTypes.bool,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChanged: PropTypes.func
}