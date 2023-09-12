/**
 * Copyright 2017 DENSO Solutions
 * 
 * 分岐電源情報ボックス Reactコンポーネント
 * <BranchPowerInfoBox />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';
import ListTable from 'PowerSystem/ListTable';
import BreakerEditModal from 'PowerSystem/BreakerEditModal';

import { BREAKER_STATUS } from 'constant';
import { LAVEL_TYPE } from 'authentication';　　

/**
 * 分岐電源情報ボックス
 * <BranchPowerInfoBox layoutInfo={}></BranchPowerInfoBox>
 * @param {object} layoutInfo レイアウト情報
 */
export default class BreakerInfoBox extends Component {

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
        if (this.props.breakers != nextProps.breakers) {
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
                message: '分岐電源を削除します。よろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.deleteBreaker(val);
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
     * 適用ボタンクリック
     * @param {any} breaker
     */
    onSubmit(breaker) {
        const breakers = this.props.breakers ? this.props.breakers.slice() : [];

        if (this.state.editedIndex >= 0) {
            breakers[this.state.editedIndex] = breaker;
        } else {
            breakers.push(breaker);
        }

        this.setState({ showModal: false }, () => {
            setTimeout(() => {
                this.props.onChange(breakers);
            }, 500);
        });
    }

    /**
     * キャンセルボタンクリック
     */
    onCancel() {
        this.setState({ showModal: false });
    }

    /**
     * ブレーカーを削除する
     * @param {any} val
     */
    deleteBreaker(val) {
        let breakers;

        if (Array.isArray(val)) {
            if (val.some((idx) => this.props.breakers[idx].rackPowers && this.props.breakers[idx].rackPowers.length > 0)) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '削除',
                        message: 'ラック電源に紐づく分岐電源があるため削除できません。',
                        onCancel: () => this.clearMessage()
                    }
                });
                return;
            }
            breakers = this.props.breakers.filter((b, i) => val.indexOf(i) < 0);
        } else {
            if (this.props.breakers[val].rackPowers && this.props.breakers[val].rackPowers.length > 0) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '削除',
                        message: 'ラック電源に紐づく分岐電源は削除できません。',
                        onCancel: () => this.clearMessage()
                    }
                });
                return;
            }
            breakers = this.props.breakers.slice();
            breakers.splice(val, 1);
        }

        this.props.onChange(breakers);
    }


    /**
     * ブレーカーのステータスの表示名を取得
     * @param {any} statusValue
     */
    getBreakerStatusName(statusValue) {
        const status = BREAKER_STATUS.find((status) => status.value == statusValue);
        if (status) {
            return status.name;
        }
        return '';
    }

    /**
     * 表示用のデータを生成する
     * @param {any} breakers
     */
    makeTableData(breakers) {
        if (breakers) {
            return breakers.map((breaker) => [
                breaker.breakerNo,
                breaker.breakerName,
                breaker.ratedCurrent,
                breaker.ratedVoltage,
                breaker.position && breaker.position.y,
                breaker.position && breaker.position.x,
                this.getBreakerStatusName(breaker.breakerStatus),
                breaker.points && this.makePointNamesString(breaker.points),
                breaker.connectedEgroup && breaker.connectedEgroup.egroupName
            ]);
        }

        return [];
    }

    /**
     * 空のBreakerを生成する
     */
    makeEmptyBreaker() {
        let breakerNo = 1;
        while (this.props.breakers && this.props.breakers.some((b) => b.breakerNo == breakerNo)) {
            breakerNo++;
        }

        return {
            systemId: this.props.egroup && this.props.egroup.systemId,
            egroup: this.props.egroup,
            breakerNo: breakerNo,
            breakerName: '',
            ratedCurrent: null,
            ratedVoltage: null,
            ratedPower: null,
            breakerStatus: -1,
            position: { x: null, y: null },
            points: [],
            connectedEgroup: null
        }
    }

    /**
     * ポイント名称の文字列を生成する
     * @param {any} points
     */
    makePointNamesString(points) {
        let str = '';

        for (let i = 0; i < points.length; i++) {
            str += points[i].pointName + '\r\n';    
        }

        // 末尾の[, ]を削除
        return str.slice(0, -2);
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
     * render
     */
    render() {
        const { isLoading, isReadOnly, level, breakers, egroup } = this.props;
        const { editedIndex, message } = this.state;

        return (
            <Box boxStyle='default' defaultClose={true} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>分岐電源</Box.Title>
                </Box.Header >
                <Box.Body>
                    <ListTable
                        ref="table"
                        editButton={true}
                        deleteButton={level !== LAVEL_TYPE.operator}
                        addButton={level !== LAVEL_TYPE.operator}
                        headers={['回路番号', '名称', '定格電流値（A）', '定格電圧値（V）', '行', '列', 'ステータス', 'ポイント', '子電源系統']}
                        data={this.makeTableData(breakers)}
                        isReadOnly={isReadOnly}
                        noDataMessage="分岐電源がありません"
                        onAddClick={() => this.onAddClick()}
                        onEditClick={(v) => this.onEditClick(v)}
                        onDeleteClick={(v) => this.onDeleteClick(v)}
                        maxCount={egroup && egroup.maxBreakerCount}
                    />
                    <BreakerEditModal
                        level={level}
                        showModal={this.state.showModal}
                        onSubmit={(breaker) => this.onSubmit(breaker)}
                        onCancel={() => this.onCancel()}
                        breaker={editedIndex >= 0 ? breakers[editedIndex] : this.makeEmptyBreaker()}
                        breakers={breakers}
                        egroup={egroup}
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

BreakerInfoBox.propTypes = {
    
};

