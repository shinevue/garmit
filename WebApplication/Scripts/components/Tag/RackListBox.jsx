'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import MessageModal from 'Assets/Modal/MessageModal';

import ListTable from 'Tag/ListTable';
import RackSelectModal from 'Tag/RackSelectModal';

export default class RackListBox extends Component {

    constructor() {
        super();
        this.state = {
            message: {}
        };
    }

    /**
     * 表示を初期化する
     */
    initDisplayState() {
        this.refs.table.initDisplayState();
    }

    /**
     * ロケーションの表示文字列を生成する
     * @param {any} location
     */
    createLocationsString(location) {
        let tmpLoc = location;
        let locStr = '';
        while (tmpLoc) {
            locStr = tmpLoc.name + ' ' + locStr;
            tmpLoc = tmpLoc.parent;
        }
        return locStr;
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} rackIds
     */
    onDeleteClick(rackIds) {
        const racks = this.props.racks.filter((rack) => rackIds.indexOf(rack.rackId) < 0);
        this.props.onChange(racks, this.props.units);
    }

    /**
     * ラックが追加された時
     * @param {any} addedRacks
     * @param {any} addedUnits
     */
    onAdd(addedRacks, addedUnits) {
        const racks = this.props.racks ? this.props.racks.slice() : [];
        addedRacks.forEach((rack) => {
            if (!racks.some((r) => r.rackId === rack.rackId)) {
                racks.push(rack);
            }
        });

        if (racks.length > this.props.maxRackCount) {
            this.setState({
                message: {
                    show: true,
                    message: this.props.maxRackCount + 'を超えるラックは登録できません。'
                }
            });
            return;
        }

        const units = this.props.units ? this.props.units.slice() : [];
        if (addedUnits) {
            addedUnits.forEach((unit) => {
                if (!units.some((u) => u.unitId === unit.unitId)) {
                    units.push(unit);
                }
            });
        }

        if (units.length > this.props.maxUnitCount) {
            this.setState({
                message: {
                    show: true,
                    message: this.props.maxUnitCount + 'を超えるユニットは登録できません。'
                }
            });
            return;
        }

        this.setState({ showModal: false });
        this.props.onChange(racks, units);
    }

    /**
     * メッセージを消す
     */
    clearMessage() {
        const message = Object.assign({}, this.state.message);
        message.show = false;
        this.setState({ message: message });
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, racks, enterprise, lookUp, onChange, maxRackCount, maxUnitCount } = this.props;
        const { message } = this.state;

        const data = racks && racks.map((rack) => (
            { id: rack.rackId, cells: [rack.rackName, this.createLocationsString(rack.location)] }
        ));

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ラック一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    <ListTable
                        ref="table"
                        isReadOnly={isReadOnly}
                        showButton={true}
                        addButtonDisabled={!enterprise || racks.length >= maxRackCount}
                        headers={['ラック名称', 'ロケーション']}
                        data={data}
                        noDataMessage="表示するラックがありません"
                        onAddClick={() => this.setState({ showModal: true })}
                        onDeleteClick={(ids) => this.onDeleteClick(ids)}
                    />
                    <RackSelectModal
                        showModal={this.state.showModal}
                        lookUp={lookUp}
                        onSubmit={(racks, units) => this.onAdd(racks, units)}
                        onHide={() => this.setState({ showModal: false })}
                        enterprise={enterprise}
                    />
                    <MessageModal
                        show={message.show}
                        title="エラー"
                        bsSize="small"
                        buttonStyle="message"
                        onCancel={() => this.clearMessage()}
                    >
                        {message.message}
                    </MessageModal>
                </Box.Body>
            </Box>
        );
    }
}