/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント一覧テーブル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Table } from 'react-bootstrap';

import PointValueDispLabel from 'Assets/PointValueDispLabel.jsx';

/**
 * ポイント一覧テーブル
 */
export default class PointListTable extends Component {

    constructor() {
        super();
        this.state = {
        };
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * ポイントチェック状態変更イベントハンドラ
     */
    handleChangeCheck(value, pointNo) {
        if (this.props.onCheck) {
            this.props.onCheck(value, pointNo)
        }
    }
    /**
    * ポイント詳細表示ボタン押下イベントハンドラ
    */
    handleClickPointDetail(pointno) {
        if (this.props.onClickPointDetail) {
            this.props.onClickPointDetail(pointno)
        }
    }

    /**
     * render
     */
    render() {
        const { pointInfo, dispOnly, useCheck, checkPointList } = this.props;

        return (
            <Table>
                <tbody>
                    {pointInfo && pointInfo.length >0 ?
                        pointInfo.map((info) => {
                            return this.makeDataRow(info, checkPointList, dispOnly);
                        })
                        : "ポイント情報がありません。"
                    }
                </tbody>
            </Table>
        );
    }

    /**
     * データ一行を作成する
     * @param {object} dataRow
     * @param {object} checkPointList チェック状態一覧
     * @param {bool} dispOnly 読み取り専用かどうか
     */
    makeDataRow(dataRow, checkPointList, dispOnly) {
        return (
            <tr>
                {!dispOnly &&
                    <td>
                        <Checkbox
                            className="ellipsis-container"
                            checked={this.isChecked(_.get(dataRow, ["point", "pointNo"]), checkPointList)}
                            onChange={(e) => this.handleChangeCheck(e.target.checked, _.get(dataRow, ["point", "pointNo"]))}
                        >
                        </Checkbox>
                    </td>
                }
                <td className="va-m">
                    <span>{dataRow.point.pointName}</span>
                </td>
                <td>
                    <PointValueDispLabel
                        dispOnly={dispOnly}
                        displayString={_.get(dataRow, "dateValuePairs[0].displayString")}
                        scaledValue={_.get(dataRow, "dateValuePairs[0].scaledValue")}
                        format={_.get(dataRow, "format")}
                        unit={_.get(dataRow, "unit")}
                        valueClassName="ellipsis-container"
                        alarmClassName={_.get(dataRow, "alarmClassName")}
                        onClick={() => this.handleClickPointDetail(_.get(dataRow, ["point", "pointNo"]))} />
                </td>
            </tr>
        );
    }

    /**
     * チェックされているかどうか
     * @param {number} pointNo ポイント番号
     * @param {array} checkPointList チェックされているポイント番号一覧
     */
    isChecked(pointNo, checkPointList) {
        for (let i = 0; checkPointList.length > i; i++) {
            if (checkPointList[i] === pointNo) {
                return true;
            }
        }
        return false;
    }
}

PointListTable.propTypes = {
    pointInfo: PropTypes.object,
    dispOnly: PropTypes.bool,
    checkPointList:PropTypes.array,
    onCheck: PropTypes.func,
    onClickPointDetail: PropTypes.func
};

