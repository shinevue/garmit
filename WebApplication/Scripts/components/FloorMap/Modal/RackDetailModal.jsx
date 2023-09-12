/**
 * Copyright 2017 DENSO Solutions
 * 
 * ラック詳細情報モーダル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, Row, Col, OverlayTrigger, Tooltip, Panel } from 'react-bootstrap';

import { locationTreeToArray } from 'locationBreadcrumb';

import PointValueDispLabel from 'Assets/PointValueDispLabel.jsx';

import RackTable from 'Assets/RackView/RackTable';
import PointListTable from 'FloorMap/PointListTable';

/**
 * ラック詳細情報モーダル
 * <RackDetailModal show={true} rackInfo={rackInfo} pointInfo={pointInfo} />
 * @param {bool} show モーダルを表示するかどうか
 * @param {object} rackInfo 選択中のラックの情報
 * @param {object} pointInfo 選択中ラックに紐づくポイントの情報
 */
export default class RackDetailModal extends Component {

    constructor() {
        super();
        this.state = {
            selectedUnit: null,
            unitPointNoList:null
        };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.show !== nextProps.show) {
            return true;    //表示状態が変更された場合
        }
        if (this.props.show) {
            if (this.props.rackInfo !== nextProps.rackInfo || this.props.pointInfo !== nextProps.pointInfo) {
                return true;    //計測値の定期更新
            }
            if (this.state.unitPointNoList !== nextState.unitPointNoList) {                
                return true;    //ユニット選択状態変更時
            }
            if (this.props.isLoading !== nextProps.isLoading) {
                return true;    //ロード状態変更時
            }
        }
    }

    /**
     * モーダルクローズイベントハンドラ
     */
    handleCloseModal() {
        this.setState({ selectedUnit: null, unitPointNoList: null });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    /**
     * ユニット選択イベントハンドラ
     * @param selectedUnit 選択されたユニット情報(dispSetIdとposition)
     * @param unitInfo ユニット情報
     */
    handleSelectUnit(selectedUnit, unitInfo) {
        this.setState({ selectedUnit: selectedUnit});
        if (selectedUnit.id) {
            //選択中ユニットに紐づくポイント番号リストをセットする
            this.setState({ unitPointNoList: this.getUnitPointsNoList(selectedUnit, unitInfo) });
        }
    }

    
    /**
     * render
     */
    render() {
        const { show, rackInfo, pointInfo, isLoading } = this.props;
        const { selectedUnit } = this.state;
        const unitInfo = rackInfo && rackInfo.unitDispSettings;

        return (
            <Modal bsSize="lg" show={show} onHide={() => this.handleCloseModal()}>
                <Modal.Header closeButton>
                    <Modal.Title>ラック詳細　{rackInfo && "【"+rackInfo.rackName+"】"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs={5}>
                            <RackTable
                                rack={rackInfo}
                                selectedUnit={selectedUnit}
                                showQuickLauncher={false}
                                showUnitQuickLauncher={false}
                                isReadOnly={false}
                                isUnitReadOnly={false}
                                showLocation={true}
                                location={rackInfo && rackInfo.location && locationTreeToArray(rackInfo.location, [])}
                                isLoading={isLoading}
                                onSelectUnit={(selectedUnit) => this.handleSelectUnit(selectedUnit, unitInfo)}
                            />
                        </Col>
                        <Col xs={7}>
                            <Panel header="ポイント情報(ラック)">
                                <div className="scroll-y panell" style={{ maxHeight: '500px' }}>
                                    <PointListTable pointInfo={pointInfo} dispOnly={true} />
                                </div>
                            </Panel>
                            <Panel header="ポイント情報(ユニット)">
                                <div className="scroll-y panell" style={{ maxHeight: "280px" }}>
                                    {selectedUnit ?
                                        <PointListTable pointInfo={this.getUnitPointInfo(pointInfo)} dispOnly={true} />
                                        :
                                        <span>ユニットが選択されていません。</span>
                                    }
                                </div>
                            </Panel>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.handleCloseModal() }>閉じる</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    /**
     * 選択されたユニットに紐づくポイントのポイント番号リストを取得する
     * @param selectedUnit 選択されたユニット情報
     * @param unitInfo ラックに紐づくユニットの情報
     */
    getUnitPointsNoList(selectedUnit, unitInfo) {
        const selectUnit =
            unitInfo.find((info) => {
                return info.dispSetId === selectedUnit.id
            })

        var unitPointNoList = [];
        selectUnit.units.forEach((unit) => {
            if (unit.points && unit.points.length > 0) {
                unit.points.forEach((unitPoint) => {
                    unitPointNoList.push(unitPoint.point.pointNo);
                })
            }
        })
        return unitPointNoList;
    }

    /**
     * ラックに紐づくポイント一覧からユニットに紐づくポイント一覧を取り出す
     * @param pointInfo ラックに紐づくポイント一覧
     */
    getUnitPointInfo(pointInfo) {
        const { unitPointNoList } = this.state;
        if (!unitPointNoList) {
            return null;
        }

        var unitPointInfo = [];
        unitPointNoList.forEach((pointno) => {
            let info = pointInfo.find((targetPoint) => {
                return targetPoint.point.pointNo === pointno;
            });
            if (info) {
                unitPointInfo.push(info);
            }
        })
        return unitPointInfo.length !== 0 ? unitPointInfo:null;
    }

}

RackDetailModal.propTypes = {
    show: PropTypes.bool,
    rackInfo: PropTypes.object,
    pointInfo: PropTypes.object,
    onClose: PropTypes.func
};