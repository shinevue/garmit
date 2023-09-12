'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import PointSelectModal from 'Assets/Modal/PointSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';

import ListTable from 'Tag/ListTable';

export default class PointListBox extends Component {

    constructor() {
        super();
        this.state = {
            selectedId: null
        };
    }

    /**
     * ロケーションの表示文字列を生成する
     * @param {any} locations
     */
    createLocationsString(point) {
        const { locations, fullLocations } = point;

        if (fullLocations) {
            let str = '';
            fullLocations.forEach((fullLoc) => {
                let locStr = '';
                fullLoc.forEach((loc) => {
                    locStr = loc.name + ' ' + locStr;
                });
                str += locStr + '\r\n';
            });
            return str.slice(0, -2);
        }

        if (locations) {
            let str = '';
            locations.forEach((location) => {
                let tmpLoc = location;
                let locStr = '';
                while (tmpLoc) {
                    locStr = tmpLoc.name + ' ' + locStr;
                    tmpLoc = tmpLoc.parent;
                }
                str += locStr + '\r\n';
            });
            return str.slice(0, -2);
        }
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} pointNos
     */
    onDeleteClick(pointNos) {
        const points = this.props.points.filter((point) => pointNos.indexOf(point.pointNo) < 0);
        this.props.onChange(points);
    }

    /**
     * ポイントが選択された時
     * @param {any} points
     */
    onSubmit(points) {
        const newPoints = this.props.points.slice();
        points.forEach((point) => {
            if (!newPoints.some((p) => p.pointNo == point.pointNo)) {
                newPoints.push(point);
            }
        })

        if (newPoints.length > this.props.maxCount) {
            this.setState({ showError: true });
            return;
        }

        this.setState({ showModal: false });
        this.props.onChange(newPoints);
    }

    /**
     * 表示を初期化する
     */
    initDisplayState() {
        this.refs.table.initDisplayState();
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, points, lookUp, enterprise, maxCount } = this.props;
        const { currentPage, pageSize, showError } = this.state;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ポイント一覧</Box.Title>
                </Box.Header>
                <Box.Body>
                    <ListTable
                        ref="table"
                        headers={['ポイント名称', 'ロケーション']}
                        data={points && points.map((point) => ({ id: point.pointNo, cells: [point.pointName, this.createLocationsString(point)] }))}
                        isReadOnly={isReadOnly}
                        showButton={true}
                        addButtonDisabled={!enterprise || points.length >= maxCount}
                        noDataMessage="表示するポイントがありません"
                        onAddClick={() => this.setState({ showModal: true })}
                        onDeleteClick={(pointNos) => this.onDeleteClick(pointNos)}
                    />
                    <PointSelectModal multiSelect
                        showModal={this.state.showModal}
                        lookUp={lookUp || {}}
                        targets={['locations', 'tags', 'egroups', 'hashTags']}
                        additionalCondition={{ enterprises: [enterprise] }}
                        onSubmit={(points) => this.onSubmit(points)}
                        onCancel={() => this.setState({ showModal: false })}
                    />
                    <MessageModal
                        show={showError}
                        title="エラー"
                        bsSize="small"
                        buttonStyle="message"
                        onCancel={() => this.setState({ showError: false })}
                    >
                        {maxCount + 'を超えるポイントは登録できません。'} 
                    </MessageModal>
                </Box.Body>
            </Box>
        );
    }
}