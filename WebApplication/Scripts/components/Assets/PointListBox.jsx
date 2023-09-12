/**
 * Copyright 2017 DENSO Solutions
 * 
 * PointListBox Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Checkbox, Modal, Form, FormControl } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import Icon from 'Common/Widget/Icon';
import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';

import { getCurrentPageRows } from 'dataTableUtility';

/**
 * PointListBox
 */
export default class PointListBox extends Component {

    /**
     * @constructor
     */
    constructor(props) {
        super(props)
        this.state = {
            selectedPoint: this.props.selectedPoint,
            checkedPoints: this.props.checkedPoints,
            currentPage: 1,
            pageSize: 10
        }
    }

    /**
     * 新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.points) !== JSON.stringify(this.props.points)) {
            this.setCheckedPoints([]);

            if (!nextProps.points) {
                this.setState({ currentPage: 1 });
            } else if (nextProps.points.length <= (this.state.currentPage - 1) * this.state.pageSize) {
                this.setState({ currentPage: Math.max(1, Math.ceil(nextProps.points.length / this.state.pageSize)) })
            }
        }
        if (JSON.stringify(nextProps.checkedPoints) !== JSON.stringify(this.props.checkedPoints)) {
            this.setState({ checkedPoints: nextProps.checkedPoints });
        }
    }

    /**
     * 行の選択イベント
     * @param {any} point
     */
    handleSelect(point) {
        this.setState({ selectedPoint: point });

        if (this.props.onSelectedPointChange) {
            this.props.onSelectedPointChange(point);
        }
    }

    /**
     * チェックボックスのチェック状態変更イベント
     * @param {any} checked
     * @param {any} point
     */
    handleChecked(checked, point) {
        const points = this.state.checkedPoints.slice();
        if (checked) {
            points.push(point);
        } else {
            const index = points.findIndex((p) => p.pointNo === point.pointNo);
            points.splice(index, 1);
        }
        this.setCheckedPoints(points);
    }

    /**
     * チェックされているポイントを更新する
     * @param {any} points
     */
    setCheckedPoints(points) {
        this.setState({ checkedPoints: points });
        if (this.props.onCheckedPointsChange) {
            this.props.onCheckedPointsChange(points);
        }
    }


    /**
     * headerを生成する
     */
    makeHeader() {
        const { points } = this.props;
        const { checkedPoints, pageSize, currentPage } = this.state;

        const currentPagePoints = getCurrentPageRows(points, currentPage, pageSize);
        const allChecked = currentPagePoints.length !== 0 && currentPagePoints.length === checkedPoints.length;
        
        return (
            <DataTable.Header>
                <DataTable.Row style={{ whiteSpace: 'nowrap' }}>
                    {this.props.checkbox &&
                        <DataTable.HeaderCell invalidSorting>
                            <Checkbox
                                className="pa-0 mtb-0"
                                checked={allChecked}
                                onClick={() => this.setCheckedPoints(allChecked ? [] : points)}
                            />
                        </DataTable.HeaderCell>}
                    <DataTable.HeaderCell invalidSorting>ポイントNo</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>ポイント名称</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>ロケーション</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>アラーム監視</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>閾値（上限異常）</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>閾値（上限注意）</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>閾値（下限注意）</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>閾値（下限異常）</DataTable.HeaderCell>
                </DataTable.Row>
            </DataTable.Header>
        );

    }

    /**
     * bodyを生成する
     */
    makeBody() {
        const { checkbox, points } = this.props;
        const { selectedPoint, checkedPoints, currentPage, pageSize } = this.state;

        const currentRows = getCurrentPageRows(points, currentPage, pageSize);

        if (checkedPoints.some((point) => !currentRows.some((p) => p.pointNo == point.pointNo))) {
            this.setCheckedPoints(checkedPoints.filter((point) => currentRows.some((p) => p.pointNo == point.pointNo)));
        }

        return (
            <DataTable.Body>
                {currentRows.length > 0 ? currentRows.map((point) =>
                    <PointRow
                        point={point}
                        checkbox={checkbox}
                        selected={selectedPoint && selectedPoint.pointNo === point.pointNo}
                        onSelect={() => this.handleSelect(point)}
                        checked={checkedPoints && checkedPoints.some((p) => p.pointNo === point.pointNo)}
                        onCheckChanged={(checked) => this.handleChecked(checked, point)}
                    />) :
                    <DataTable.Row>
                        <DataTable.Cell colspan={checkbox ? 10 : 9} style={{ textAlign: 'center' }}>
                            表示するデータがありません
                        </DataTable.Cell>
                    </DataTable.Row>
                }
            </DataTable.Body>
        );
    }

    /**
     * render
     */
    render() {
        const { points, isLoading } = this.props;
        const { currentPage, pageSize } = this.state;

        return (
            <Box boxStyle='default' isLoading={isLoading} >
                <Box.Header>
                    <Box.Title>検索結果</Box.Title>
                </Box.Header >
                <Box.Body>
                    {points &&
                        <div>
                            <Grid fluid>
                                <Row>
                                    <Form inline className="pull-right">
                                        <FormControl
                                            bsSize="sm"
                                            componentClass="select"
                                            value={pageSize}
                                            onChange={(e) => this.setState({ pageSize: e.target.value, currentPage: 1 })}
                                        >
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </FormControl> 件を表示
                                    </Form>
                                </Row>
                                <Row>
                                    <Col sm={12}>
                                        <DataTable responsive hover
                                            currentPage={currentPage}
                                            pageSize={pageSize}
                                            totalItemCount={(points && points.length) ? points.length : 0}
                                            onPageClick={(page) => this.setState({ currentPage: page })}
                                        >
                                            {this.makeHeader()}
                                            {this.makeBody()}
                                        </DataTable>
                                    </Col>
                                </Row>
                            </Grid>
                        </div>   
                    }
                </Box.Body>
            </Box>
        )
    }
}

PointListBox.propTypes = {
    
};

class PointRow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        }
    }

    /**
     * ロケーション表示文字列を生成する
     * @param {any} fullLocations
     */
    createLocationStrings(fullLocations)
    {
        if (!fullLocations) {
            return [];
        }

        let strings = [];
        fullLocations.forEach((fullLoc) => {
            let locStr = '';
            fullLoc.forEach((loc) => {
                locStr = loc.name + ' ' + locStr;
            });
            strings.push(locStr);
        });
        return strings;
    }

    /**
     * render
     */
    render() {
        const { point, selected, checked, checkbox, onSelect, onCheckChanged } = this.props;

        const locationStrings = this.createLocationStrings(point.fullLocations);
    
        return (
            <DataTable.Row
                onClick={!checkbox && (() => onSelect())}
                className={selected && "datatable-select-row"}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
                {(checkbox) &&
                    <DataTable.Cell>
                        <Checkbox
                            className="pa-0 mtb-0"
                            checked={checked} onClick={() => onCheckChanged(!checked)} />
                    </DataTable.Cell>
                }
                <DataTable.Cell>{point.pointNo}</DataTable.Cell>
                <DataTable.Cell>{point.pointName}</DataTable.Cell>
                <DataTable.Cell>
                    <div className="pull-left">{locationStrings[0]}</div>
                    {locationStrings.length > 1 &&
                        <div>
                            <Icon
                                className="icon-garmit-detail pull-right hover-icon"
                                onClick={() => this.setState({ showModal: true })} 
                            />
                            <MessageModal
                                bsSize="sm"
                                buttonStyle="message"
                                show={this.state.showModal}
                                title="ロケーション"
                                onCancel={() => this.setState({ showModal: false })}
                            >
                                {locationStrings.map((str) => <div>{str}</div>)}
                            </MessageModal>
                        </div>
                    }
                </DataTable.Cell>
                <DataTable.Cell>{point.maintMode ? 'しない' : 'する'}</DataTable.Cell>
                <DataTable.Cell>{point.upperError}</DataTable.Cell>
                <DataTable.Cell>{point.upperAlarm}</DataTable.Cell>
                <DataTable.Cell>{point.lowerAlarm}</DataTable.Cell>
                <DataTable.Cell>{point.lowerError}</DataTable.Cell>
            </DataTable.Row>
        );
    }
}
