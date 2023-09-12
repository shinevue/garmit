/**
 * @license Copyright 2019 DENSO
 * 
 * OutputFileListBox Reactコンポーネン
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';
import { BUTTON_OPERATION_TYPE } from 'constant';

/**
 * 出力ファイル一覧ボックスコンポーネント
 * @param {number} scheduleId スケジュールID
 * @param {object} outputFileResult 出力ファイル一覧
 * @param {boolean} isLoading ロード中
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onDeleteFiles ファイル削除時に呼び出す
 */
export default class OutputFileListBox extends Component {
    
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
        const { outputFileResult, isLoading, isReadOnly } = this.props;
        const { displayState } = this.state;
        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = isReadOnly;

        return (
            <GarmitBox isLoading={isLoading} title="出力ファイル一覧">
                {outputFileResult?
                    <SearchResultTable deleteButton downloadButton useCheckbox
                                       searchResult={outputFileResult}
                                       initialState={displayState}
                                       buttonHidden={buttonReadOnly}
                                       onStateChange={(state) => this.changeTableSetting(state)}
                                       onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                       onDownloadClick={(parameterKeyPairList) => this.handleDownloadButtonClick(parameterKeyPairList)}
                                       onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                    />
                :
                    <div>表示可能なファイルはありません</div>
                }
                
            </GarmitBox>
        );
    }

    //#region 削除イベント

    /**
     * ホバーボタンがクリックイベントハンドラ
     * @param {object} hoverButton ホバーボタン情報
     */
    handleHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.delete) {   //削除
                const fileNo = this.getKey(hoverButton.parameterKeyPairs, 'FileNo');
                this.onDeleteFiles([fileNo]);
            }
        }
    }

    /**
     * 削除ボタンクリックベント
     *@param {array} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {
        const fileNos = this.getFileNos(parameterKeyPairList);
        this.onDeleteFiles(fileNos);
    }

    /**
     * ファイル削除イベントを発生させる
     * @param {array} fileNos ファイル番号リスト
     */
    onDeleteFiles(fileNos) {
        if (this.props.onDeleteFiles) {
            this.props.onDeleteFiles(this.props.scheduleId, fileNos);
        }
    }

    //#endregion

    //#region 一括ダウンロード

    /**
     * 一括ダウンロードボタンクリックのイベントハンドラ
     * @param {array} parameterKeyPairList キーペアリスト
     */
    handleDownloadButtonClick(parameterKeyPairList) {
        const urls = this.getFileUrls(parameterKeyPairList);
        if (urls && urls.length > 0) {
            this.downloadFiles(urls);
        }
    }

    /**
     * ファイルをダウンロードする
     * @param {array} urls URL一覧
     */
    downloadFiles(urls) {
        urls.forEach(url => {
            var link = document.createElement("a");
            document.body.appendChild(link);
            link.href = url;
            link.download = "";
            link.click();
            document.body.removeChild(link);
        });
    }

    //#endregion

    //#region その他関数
      
    /**
     * ParameterKeyPairsのリストからファイル番号のリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getFileNos(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getKey(pairs, 'FileNo');
        });
    }

    /**
     * ParameterKeyPairsのリストからURLのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getFileUrls(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getKey(pairs, 'Url');
        });
    }

    /**
     * ParameterKeyPairsからキーを取得する
     * @param {object} parameterKeyPairs キーペア
     * @param {string} parameter パラメータ
     */
    getKey(parameterKeyPairs, parameter) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === parameter);
        return target.key;
    }
     
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
}

OutputFileListBox.propsTypes = {
    scheduleId: PropTypes.number,
    outputFileResult: PropTypes.object,
    isLoading: PropTypes.bool,
    onDeleteFiles: PropTypes.func
}