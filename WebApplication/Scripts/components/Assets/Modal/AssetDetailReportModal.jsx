/**
 * @license Copyright 2018 DENSO
 * 
 * AssetDetailReportModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import { Row, Col, Modal } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';
import SearchResultTable from 'Assets/SearchResultTable';
import Button from 'Common/Widget/Button';
import { outputSearchResult } from 'exportUtility';

/**
 * アセット詳細レポートモーダルコンポーネント
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {object} rackPowerReport ラック電源レポート一覧
 * @param {object} unitPowerReport ユニット電源レポート一覧
 * @param {object} unitNetworkReport ユニットネットワークレポート一覧
 * @param {object} lineResult 回線一覧
 * @param {function} onHide モーダルを閉じるときに呼び出す
 */
export default class AssetDetailReportModal extends Component {
    
    /**
     * render
     */
    render() {
        const { showModal, rackPowerReport, unitPowerReport, unitNetworkReport, lineResult } = this.props;
        return (
            <Modal bsSize="large" show={showModal} onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>詳細情報</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {rackPowerReport&&
                        <Box boxStyle='default'>
                            <Box.Header>
                                <Box.Title>ラック電源一覧</Box.Title>
                            </Box.Header >
                            <Box.Body>
                                <SearchResultTable 
                                    searchResult={rackPowerReport}
                                    exportButton
                                    exportName="RackPowerExport"
                                />
                            </Box.Body>
                        </Box>
                    }     
                    {unitPowerReport&&
                        <Box boxStyle='default'>
                            <Box.Header>
                                <Box.Title>電源一覧</Box.Title>
                            </Box.Header >
                            <Box.Body>
                                <SearchResultTable 
                                    searchResult={unitPowerReport}
                                    exportButton
                                    exportName="UnitPowerExport"
                                />
                            </Box.Body>
                        </Box>
                    }  
                    {unitNetworkReport&&
                        <Box boxStyle='default'>
                            <Box.Header>
                                <Box.Title>ネットワーク一覧</Box.Title>
                            </Box.Header >
                            <Box.Body>
                                <SearchResultTable 
                                    searchResult={unitNetworkReport}
                                    exportButton
                                    exportName="UnitNetworkExport"
                                />
                            </Box.Body>
                        </Box>
                    }
                    {lineResult&&
                        <Box boxStyle='default'>
                            <Box.Header>
                                <Box.Title>回線一覧</Box.Title>
                            </Box.Header >
                            <Box.Body>
                                <SearchResultTable 
                                    searchResult={lineResult}
                                    exportButton
                                    includeDateExportName
                                    striped={false}
                                    exportName="ProjectLineList"
                                />
                            </Box.Body>
                        </Box>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onHide()}>閉じる</Button>
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
}

AssetDetailReportModal.propTypes = {
    showModal: PropTypes.bool, 
    rackPowerReport: PropTypes.object,
    unitPowerReport: PropTypes.object,
    unitNetworkReport: PropTypes.object,
    lineResult: PropTypes.object,
    onHide: PropTypes.func
}