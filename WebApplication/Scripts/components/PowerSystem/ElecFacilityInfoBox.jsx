/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源系統計測ポイント設定ボックス Reactコンポーネント
 * <PointSettingBox />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, ButtonToolbar, Button, FormControl, Row, Col, InputGroup, InputGroupButton, Panel, FormGroup } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';
import ListTable from 'PowerSystem/ListTable';
import ElecFacilityEditModal from 'PowerSystem/ElecFacilityEditModal';

/**
 * 電源系統計測ポイント設定ボックス
 * <PointSettingBox layoutInfo={}></PointSettingBox>
 * @param {object} layoutInfo レイアウト情報
 */
export default class ElecFacilityInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editedIndex: -1,
            showModal: false,
            message: {}
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.elecFacilities) != JSON.stringify(this.props.elecFacilities)) {
            this.setState({ editedIndex: -1 });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.egroup || !this.props.egroup || prevProps.egroup.egroupId !== this.props.egroup.egroupId) {
            this.refs.table.initDisplayState();
        }
    }

    /**
     * 削除ボタンクリック
     * @param {any} val
     */
    onDeleteClick(val) {
        this.setState({
            message: {
                show: true,
                title: '削除',
                buttonStyle: 'confirm',
                message: '電源計測ポイントを削除します。よろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.deleteElecFacility(val);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 編集ボタンクリック
     * @param {any} i
     */
    onEditClick(i) {
        this.setState({ editedIndex: i, showModal: true });
    }

    /**
     * 追加ボタンクリック
     * @param {any} breaker
     */
    onAddClick(breaker) {
        this.setState({ editedIndex: -1, showModal: true });
    }

    /**
     * 適用ボタン
     * @param {any} elecFacility
     */
    onSubmit(elecFacility) {
        const elecFacilities = this.props.elecFacilities ? this.props.elecFacilities.slice() : [];
        if (this.state.editedIndex >= 0) {
            elecFacilities[this.state.editedIndex] = elecFacility;
        } else {
            elecFacilities.push(elecFacility);
        }

        this.setState({ showModal: false }, () => {
            this.props.onChange(elecFacilities);
        });
    }

    /**
     * キャンセルボタンクリック
     */
    onCancel() {
        this.setState({ showModal: false });
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        const message = Object.assign({}, this.state.message);
        message.show = false;
        this.setState({ message: message });
    }

    /**
     * 削除する
     * @param {any} val
     */
    deleteElecFacility(val) {
        let elecFacilities;
        if (Array.isArray(val)) {
            elecFacilities = this.props.elecFacilities.filter((b, i) => val.indexOf(i) < 0);
        } else {
            elecFacilities = this.props.elecFacilities.slice();
            elecFacilities.splice(val, 1);
        }

        this.props.onChange(elecFacilities);
    }

    /**
     * 表示用のデータを生成する
     * @param {any} elecFacilities
     */
    makeTableData(elecFacilities) {
        if (elecFacilities) {
            return elecFacilities.map((elecFacility) => [
                elecFacility.index,
                elecFacility.elementName,
                elecFacility.point && elecFacility.point.pointName
            ]);
        }

        return [];
    }

    /**
     * 空のElecFacilityを生成
     */
    makeEmptyElecFacility() {
        return {
            systemId: this.props.egroup ? this.props.egroup.systemId : null,
            egroupId: this.props.egroup ? this.props.egroup.egroupId : null,
            point: null,
            elementName: '',
            index: null
        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, elecFacilities, egroup } = this.props;
        const { editedIndex, message } = this.state;

        return (
            <Box boxStyle='default' defaultClose={true} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>電源系統計測ポイント</Box.Title>
                </Box.Header >
                <Box.Body>
                    <ListTable
                        ref="table"
                        editButton deleteButton addButton
                        headers={['インデックス', '表示名称', 'ポイント']}
                        data={this.makeTableData(elecFacilities)}
                        isReadOnly={isReadOnly}
                        noDataMessage="計測ポイントがありません"
                        maxCount={18}
                        onAddClick={() => this.onAddClick()}
                        onEditClick={(v) => this.onEditClick(v)}
                        onDeleteClick={(i) => this.onDeleteClick(i)}
                    />
                    <ElecFacilityEditModal
                        showModal={this.state.showModal}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.onCancel()}
                        elecFacility={editedIndex >= 0 ? elecFacilities[editedIndex] : this.makeEmptyElecFacility()}
                        elecFacilities={elecFacilities}
                    />
                    <MessageModal
                        show={message.show}
                        title={message.title}
                        bsSize="small"
                        buttonStyle={message.buttonStyle}
                        onOK={message.onOK}
                        onCancel={message.onCancel}
                    >
                        {message.message}
                    </MessageModal>
                </Box.Body>
            </Box>
        );
    }
}

ElecFacilityInfoBox.propTypes = {
    
};

