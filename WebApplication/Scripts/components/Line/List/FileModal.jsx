/**
 * @license Copyright 2019 DENSO
 * 
 * ファイル一覧モーダル Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { CloseButton } from 'Assets/GarmitButton';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';
import MessageModal from 'Assets/Modal/MessageModal';

import { BUTTON_OPERATION_TYPE } from 'constant';

/**
 * 出力ファイル一覧モーダルコンポーネント
 * @param {boolean} show モーダルを表示するかどうか
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 * @param {object} fileResult 出力ファイル一覧
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onHide モーダルを閉じるときに呼びだす
 * @param {function} onDeleteFiles ファイル削除時に呼び出す
 * @param {function} onAddFile ファイルアップロード時に呼び出す
 */
export default class FileModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            modalInfo: {
                show: false,
                title: null,
                buttonStyle: 'message',
                message: null
            },
            displayState: null
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されれる
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps){
        if (nextProps.show !== this.props.show && nextProps.show) {
            this.setState({
                modalInfo: {
                    show: false,
                    title: null,
                    buttonStyle: 'message',
                    message: null
                },
                displayState: null
            });
        }
    }

    /**
     * render
     */
    render() {
        const { show, fileResult, isLoading, isReadOnly } = this.props;
        const { displayState, modalInfo } = this.state;
        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = isReadOnly;

        return (
            <Modal bsSize="large" show={show} onHide={() => this.onHide()} >
                <Modal.Header closeButton>
                    <Modal.Title>ファイル</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <GarmitBox isLoading={isLoading} title="ファイル一覧">
                        {fileResult?
                            <SearchResultTable useCheckbox downloadButton
                                deleteButton={!isReadOnly}
                                addButton={!isReadOnly}
                                searchResult={fileResult}
                                initialState={displayState}
                                buttonHidden={buttonReadOnly}
                                onStateChange={(state) => this.changeTableSetting(state)}
                                onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                onDownloadClick={(parameterKeyPairList) => this.handleDownloadButtonClick(parameterKeyPairList)}
                                onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                                onAddClick={() => this.onAdd()}
                            />
                        :
                            <div>表示可能なファイルはありません</div>
                        }
                    </GarmitBox>
                    <MessageModal show={modalInfo.show} 
                                title={modalInfo.title} 
                                bsSize="small"
                                buttonStyle={modalInfo.buttonStyle}
                                onOK={() => { modalInfo.callback && modalInfo.callback() }}
                                onCancel={() => this.hideMessageModal()}>
                        {modalInfo.message && modalInfo.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    </MessageModal>
                </Modal.Body>
                <Modal.Footer>
                    <CloseButton onClick={() => this.onHide()}>閉じる</CloseButton>
                </Modal.Footer>
            </Modal>
        );
    }
    
    //#region イベントハンドラ

    /**
     * ホバーボタンがクリックイベントハンドラ
     * @param {object} hoverButton ホバーボタン情報
     */
    handleHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.delete) {   //削除
                const fileNo = this.getKey(hoverButton.parameterKeyPairs, 'FileNo');
                const patchCableData = this.getPatchCableData(hoverButton.parameterKeyPairs);
                this.showDeleteConfirmModal(patchCableData, [fileNo], 'ファイル');
            }
        }
    }

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
     * 削除ボタンクリックベント
     *@param {array} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {
        const fileNos = this.getFileNos(parameterKeyPairList);
        const patchCableData = parameterKeyPairList ? this.getPatchCableData(parameterKeyPairList[0]) : { patchboardId: this.props.patchboardId, cableNo: this.props.cableNo };
        this.showDeleteConfirmModal(patchCableData, fileNos, '選択中のファイル');
    }

    //#endregion

    //#region イベントを呼び出す
    
    /**
     * 閉じるイベント発生
     */
    onHide() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    /**
     * ファイル削除イベントを発生させる
     * @param {object} patchCableData 配線盤ID/線番
     * @param {array} fileNos ファイル番号リスト
     */
    onDeleteFiles(patchCableData, fileNos) {
        if (this.props.onDeleteFiles) {
            this.props.onDeleteFiles(patchCableData, fileNos);
        }
    }

    /**
     * 追加イベントを発生させる
     */
    onAdd() {
        if (this.props.onAddFile) {
            const { patchboardId, cableNo } = this.props;
            this.props.onAddFile(patchboardId, cableNo);
        }
    }

    //#endregion

    //#region ダウンロード

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
    
    //#region 配線盤ID/線番取得

    /**
     * ParameterKeyPairsから配線盤ID/線番を取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getPatchCableData(parameterKeyPairs) {
        const patchboardId = this.getKey(parameterKeyPairs, 'PatchboardId');
        const cableNo = this.getKey(parameterKeyPairs, 'PatchCableNo');
        return {
            patchboardId,
            cableNo
        };
    }
    
    //#endregion
    
    //#region 確認モーダル

    /**
     * 削除確認モーダルを表示する
     * @param {object} patchCableData 配線盤ID/線番
     * @param {array} fileNos ファイル番号リスト
     * @param {string} targetName 削除対象の名称
     */
    showDeleteConfirmModal(patchCableData, fileNos, targetName) {
        this.setState({
            modalInfo: {
                show: true,
                title: '削除確認',
                buttonStyle: 'delete',
                message: targetName + 'を削除してもよろしいですか？',
                callback: () => { 
                    this.hideMessageModal();
                    this.onDeleteFiles(patchCableData, fileNos);
                }
            }
        })
    }
      
    /**
     * メッセージモダールを閉じる
     */
    hideMessageModal() {
        this.setState({            
            modalInfo: {
                show: false,
                title: null,
                buttonStyle: 'message',
                message: null
            }
        })
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

FileModal.propsTypes = {
    show: PropTypes.bool,
    outputFileResult: PropTypes.object,
    isLoading: PropTypes.bool,
    onHide: PropTypes.func,
    onDeleteFiles: PropTypes.func,
    onAddFile: PropTypes.func
}
