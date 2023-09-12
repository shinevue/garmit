'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import MessageModal from 'Assets/Modal/MessageModal';

import ListTable from 'Tag/ListTable';
import UnitSelectModal from 'Tag/UnitSelectModal';

export default class UnitListBox extends Component {

    constructor() {
        super();
        this.state = {
            selectedId: null,
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
     * @param {any} unitIds
     */
    onDeleteClick(unitIds) {
        const units = this.props.units.filter((unit) => unitIds.indexOf(unit.unitId) < 0);
        this.props.onChange(units, this.props.racks);
    }

    /**
     * ユニットが追加された時
     * @param {any} addedUnits
     * @param {any} addedRacks
     */
    onAdd(addedUnits, addedRacks) {
        const racks = this.props.racks ? this.props.racks.slice() : [];

        if (addedRacks) {
            addedRacks.forEach((rack) => {
                if (!racks.some((r) => r.rackId === rack.rackId)) {
                    racks.push(rack);
                }
            });
        }

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
        this.props.onChange(units, racks);
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
        const { isLoading, isReadOnly, units, lookUp, enterprise, maxRackCount, maxUnitCount } = this.props;
        const { message } = this.state;
        const data = units && units.map((unit) => (
            { id: unit.unitId, cells: [unit.name, unit.rackName, this.createLocationsString(unit.location)] }
        ));

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ユニット一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    <ListTable
                        ref="table"
                        isReadOnly={isReadOnly}
                        showButton={true}
                        addButtonDisabled={!enterprise || units.length >= maxUnitCount}
                        headers={['ユニット名称', 'ラック名称', 'ロケーション']}
                        data={data}
                        noDataMessage="表示するユニットがありません"
                        onAddClick={() => this.setState({ showModal: true })}
                        onDeleteClick={(ids) => this.onDeleteClick(ids)}
                    />
                    <UnitSelectModal
                        showModal={this.state.showModal}
                        lookUp={lookUp}
                        onSubmit={(units, racks) => this.onAdd(units, racks)}
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