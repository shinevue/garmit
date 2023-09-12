/**
 * @license Copyright 2019 DENSO
 * 
 * OutputFileModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { CloseButton } from 'Assets/GarmitButton';
import OutputFileListBox from 'ReportSchedule/List/OutputFileListBox';

/**
 * 出力ファイル一覧モーダルコンポーネント
 * @param {boolean} show モーダルを表示するかどうか
 * @param {number} scheduleId スケジュールID
 * @param {object} outputFileResult 出力ファイル一覧
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onHide モーダルを閉じるときに呼びだす
 */
export default class OutputFileModal extends Component {
    
    /**
     * render
     */
    render() {
        const { show, scheduleId, outputFileResult, isLoading, isReadOnly } = this.props;
        return (
            <Modal bsSize="large" show={show} onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>出力結果</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <OutputFileListBox scheduleId={scheduleId} 
                                       outputFileResult={outputFileResult} 
                                       isLoading={isLoading}
                                       isReadOnly={isReadOnly}
                                       onDeleteFiles={(scheduleId, fileNos) => this.onDeleteFiles(scheduleId, fileNos)} 
                    />
                </Modal.Body>
                <Modal.Footer>
                    <CloseButton onClick={() => this.onHide()}>閉じる</CloseButton>
                </Modal.Footer>
            </Modal>
        );
    }
    
    /**
     * 閉じるイベント発生
     */
    onHide() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    /**
     * ファイル削除イベント発生
     * @param {number} scheduleId スケジュールID
     * @param {array} fileNos ファイル番号リスト
     */
    onDeleteFiles(scheduleId, fileNos) {
        if (this.props.onDeleteFiles) {
            this.props.onDeleteFiles(scheduleId, fileNos);
        }
    }

}

OutputFileModal.propsTypes = {
    show: PropTypes.bool,
    outputFileResult: PropTypes.object,
    isLoading: PropTypes.bool,
    onHide: PropTypes.func,
    onDeleteFiles: PropTypes.func
}