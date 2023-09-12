/**
 * @license Copyright 2019 DENSO
 * 
 * 分割ラック選択モーダル Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';
import ListDisplayTable, { makeComponentColumn } from 'Assets/ListDisplayTable';
import EnterpriseCellDisplay from 'ElectricLockMap/EnterpriseCellDisplay';
import MultipleLineCellDisplay from 'ElectricLockMap/MultipleLineCellDisplay';
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';
import { makeLockStatusName } from 'electricLockUtility';

/**
 * 分割ラック選択モーダルコンポーネント
 * @param {boolean} show モーダルを表示する
 * @param {array} electricLockRacks 電気錠ラックリスト
 * @param {function} onSelect 選択する
 * @param {function} onCancel キャンセルする
 */
export default class MultiERackSelectModel extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            checkedRowIndex :  this.getCheckedRowIndex(props.electricLockRacks)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { show } = this.props;
        const { show: nextShow, electricLockRacks } = nextProps;
        if (show !== nextShow && nextShow === true) {
            this.setState({ checkedRowIndex: this.getCheckedRowIndex(electricLockRacks) });
        } 
    }

    /**
     * render
     */
    render() {
        const { show, electricLockRacks, isReadOnly } = this.props;
        const { checkedRowIndex } = this.state;
        const headers = this.getHeader();
        const rows = this.getTableData(electricLockRacks);
        const enableApply = checkedRowIndex && checkedRowIndex.length > 0;
        return (
            <Modal bsSize="large" show={show} backdrop="static" onHide={this.handleCancel}>
                <Modal.Header>
                    <Modal.Title>分割ラック選択</Modal.Title>
                </Modal.Header >
                <Modal.Body>
                    <ListDisplayTable id="selectMultiRackTable" 
                        data={rows} 
                        headerSet={headers} 
                        selectable={false} 
                        useCheckbox={true}
                        headerCheckbox={true}
                        order={[[1, 'asc']]}
                        checkRow={checkedRowIndex}
                        onChangeCheckState={this.handleChangeCheck}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton
                        onClick={this.handleSubmit}
                        disabled={isReadOnly||!enableApply}
                    >
                    </ApplyButton>
                    <CancelButton
                        onClick={this.handleCancel}
                    >
                    </CancelButton>
                </Modal.Footer>
            </Modal>
        );
    }

    //#region イベントハンドラ

    handleChangeCheck = (checked) => {
        this.setState({ checkedRowIndex: checked })
    }

    /**
     * 適用ボタンクリックイベント
     */
    handleSubmit = () => {
        let racks = [];
        racks = this.props.electricLockRacks.filter((rack, index) => {
            return _.includes(this.state.checkedRowIndex, index);
        });
        if (this.props.onSelect) {
            this.props.onSelect(_.cloneDeep(racks));
        }
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    //#endregion

    //#region 一覧表示

    /**
     * ヘッダを取得する
     */
    getHeader() {
        return　['ラック', '状態', '所属'];
    }

    /**
     * 一覧のデータを作成する
     * @param {array} electricLockRacks 電気錠ラックリスト
     */
    getTableData(electricLockRacks) {
        return electricLockRacks ? electricLockRacks.map((rack) => {
            return {
                alarmCssClassName: rack.electricLocks.some((lock) => lock.isError) ? 'error' : '',
                cells: [
                    { value: rack.locationName, foreColor: "black" }, 
                    { Component: LockStatusColumn, values: makeLockStatusName(rack.electricLocks) }, 
                    { Component: EnterpriseColumn, enterpriseNames: rack.enterpriseNames }
                ]
            };
        }) : [] ;
    }

    //#endregion

    //#region その他
    
    /**
     * チェックする行インデックスを取得する
     * @param {*} electricLockRacks 電気錠ラックリスト
     */
    getCheckedRowIndex(electricLockRacks) {
        let checkedRowIndex = [];
        electricLockRacks && electricLockRacks.forEach((rack, index) => {
            if (rack.checked) {
                checkedRowIndex.push(index);
            }
        });
        return checkedRowIndex;
    }

    //#endregion
}

MultiERackSelectModel.propTypes = {
    show: PropTypes.bool,
    electricLockRacks: PropTypes.array,
    onSelect: PropTypes.func,
    onCancel: PropTypes.func
};

/**
 * 電気錠ステータスカラム
 */
const LockStatusColumn = makeComponentColumn(MultipleLineCellDisplay);

/**
 * 所属カラム
 */
const EnterpriseColumn = makeComponentColumn(EnterpriseCellDisplay);
