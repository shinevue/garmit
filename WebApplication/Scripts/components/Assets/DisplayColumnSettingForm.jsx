/**
 * Copyright 2017 DENSO Solutions
 * 
 * DisplayColumnSettingForm Reactコンポーネント
 * 
 */

'use strict'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Grid, Row, Col } from 'react-bootstrap'

/**
 * DisplayColumnSettingForm
 * @param {object} allColumns すべての項目
 * @param {object} userColumns 表示する項目
 * @param {func} onChange 表示設定変更時に呼ぶ関数
 */
export default class DisplayColumnSettingForm extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.setSortable();
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {

    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
     * Componentがアップデートされる前に呼ばれます。
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    componentWillUpdate(nextProps, nextState) {
        this.destroySortable();
    }

    /**
     * Componentがアップデートさえたときに呼ばれます。
     * 
     * @param prevProps アップデート前のprops
     * @param prevState アップデート前のstate
     */
    componentDidUpdate(prevProps, prevState) {
        this.setSortable();
    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {

    }

    /**
     * sortableをセットする
     */
    setSortable() {
        $('#displayColumns, #hiddenColumns').sortable({
            connectWith: '.connectedSortable',
            placeholder: 'move-target',
            forcePlaceholderSize: false,
            zIndex: 999999
        }).disableSelection();

        // 表示項目が変化したときに呼び出す関数をセット
        $('#displayColumns, #hiddenColumns').on('sortupdate', () => this.handleChange());
    }

    /**
     * sortableを解除する
     */
    destroySortable() {
        $('#displayColumns, #hiddenColumns').sortable("destroy");
    }

    /**
     * ソートをキャンセルする
     */
    cancelSortable() {
        $('#displayColumns, #hiddenColumns').sortable('cancel');
    }

    /**
     * 表示項目のアイテムリストを生成する
     * @param {any} userColumns
     */
    makeDisplayedColumnList(userColumns) {
        if (!userColumns || !userColumns.columnHeaders) {
            return;
        }

        const columnHeaders = userColumns.columnHeaders.slice();
        columnHeaders.sort((current, next) => {
            if (current.index < next.index) return -1;
            if (current.index > next.index) return 1;
            return 0;
        });

        return columnHeaders.map((col) => 
            <SortableObject 
                id={col.columnNo} 
                name={col.columnName} 
                rackItemId={col.rackItemId} 
                unitItemId={col.unitItemId}
                consumerItemId={col.consumerItemId}
                eLockOpLogOpenItemId={col.eLockOpLogOpenExtendedItemId}
                eLockOpLogCloseItemId={col.eLockOpLogCloseExtendedItemId}
                patchboardItemId={col.patchboardItemId}
                patchCableItemId={col.patchCableItemId}
                projectItemId={col.projectItemId}
                sort 
            />
        );
    }

    /**
     * 非表示項目のアイテムリストを生成する
     * @param {any} allColumns
     * @param {any} userColumns
     */
    makeHiddenColumnList(allColumns, userColumns) {
        if (!userColumns || !userColumns.columnHeaders || !allColumns || !allColumns.columnHeaders) {
            return;
        }

        let columnHeaders = allColumns.columnHeaders.slice();

        if (userColumns && userColumns.columnHeaders) {
            columnHeaders = columnHeaders.filter((column) => {
                return !userColumns.columnHeaders.some((col) => {
                    if (column.columnNo) {
                        return col.columnNo === column.columnNo;
                    } else if (column.rackItemId) {
                        return col.rackItemId === column.rackItemId;
                    } else if (column.unitItemId) {
                        return col.unitItemId === column.unitItemId;
                    } else if (column.consumerItemId) {
                        return col.consumerItemId === column.consumerItemId;
                    } else if (column.eLockOpLogOpenExtendedItemId) {
                        return col.eLockOpLogOpenExtendedItemId === column.eLockOpLogOpenExtendedItemId;
                    } else if (column.eLockOpLogCloseExtendedItemId) {
                        return col.eLockOpLogCloseExtendedItemId === column.eLockOpLogCloseExtendedItemId;
                    } else if (column.patchboardItemId) {
                        return col.patchboardItemId === column.patchboardItemId;
                    } else if (col.patchCableItemId) {
                        return col.patchCableItemId === column.patchCableItemId;
                    } else if (col.projectItemId) {
                        return col.projectItemId === column.projectItemId;
                    }
                });
            })
        }

        return columnHeaders.map((col) => 
            <SortableObject 
                id={col.columnNo} 
                rackItemId={col.rackItemId} 
                unitItemId={col.unitItemId}
                consumerItemId={col.consumerItemId}
                eLockOpLogOpenItemId={col.eLockOpLogOpenExtendedItemId}
                eLockOpLogCloseItemId={col.eLockOpLogCloseExtendedItemId}
                patchboardItemId={col.patchboardItemId}
                patchCableItemId={col.patchCableItemId}
                projectItemId={col.projectItemId}
                name={col.columnName}
            />
        );
    }

    /**
     * 表示項目が変更された時
     */
    handleChange() {
        const array = $('#displayColumns').sortable('toArray');
        const arrayRackItems = $('#displayColumns').sortable('toArray', { attribute: 'rackItemId' });
        const arrayUnitItems = $('#displayColumns').sortable('toArray', { attribute: 'unitItemId' });
        const arrayConsumerItems = $('#displayColumns').sortable('toArray', { attribute: 'consumerItemId' });
        const arrayELockOpLogOpenItems = $('#displayColumns').sortable('toArray', { attribute: 'eLockOpLogOpenItemId' });
        const arrayELockOpLogCloseItems = $('#displayColumns').sortable('toArray', { attribute: 'eLockOpLogCloseItemId' });
        const arrayPatchboardItems = $('#displayColumns').sortable('toArray', { attribute: 'patchboardItemId' });
        const arrayPatchCableItemId = $('#displayColumns').sortable('toArray', { attribute: 'patchCableItemId' });
        const arrayProjectItemId = $('#displayColumns').sortable('toArray', { attribute: 'projectItemId' });
        this.cancelSortable();  // 変更をキャンセルする

        const newUserColumns = Object.assign({}, this.props.allColumns);
        const columnHeaders = [];
        this.props.allColumns.columnHeaders.forEach((col) => {
            var index = -1;
            if (col.columnNo) {
                index = array.indexOf(col.columnNo.toString());
            } else if (col.rackItemId) {
                index = arrayRackItems.indexOf(col.rackItemId.toString());
            } else if (col.unitItemId) {
                index = arrayUnitItems.indexOf(col.unitItemId.toString());
            } else if (col.consumerItemId) {
                index = arrayConsumerItems.indexOf(col.consumerItemId.toString());
            } else if (col.eLockOpLogOpenExtendedItemId) {
                index = arrayELockOpLogOpenItems.indexOf(col.eLockOpLogOpenExtendedItemId.toString());
            } else if (col.eLockOpLogCloseExtendedItemId) {
                index = arrayELockOpLogCloseItems.indexOf(col.eLockOpLogCloseExtendedItemId.toString());
            } else if (col.patchboardItemId) {
                index = arrayPatchboardItems.indexOf(col.patchboardItemId.toString());
            } else if (col.patchCableItemId) {
                index = arrayPatchCableItemId.indexOf(col.patchCableItemId.toString());
            } else if (col.projectItemId) {
                index = arrayProjectItemId.indexOf(col.projectItemId.toString());
            }

            // 表示項目の場合
            if (index >= 0) {
                const column = Object.assign({}, col);
                column.index = index + 1;   //並び順を変更
                columnHeaders.push(column);
            }
        });

        newUserColumns.columnHeaders = columnHeaders;   // 新しいカラム情報を入れる
        this.props.onChange(newUserColumns);
    }

    /**
     * render
     */
    render() {
        const style = {
            minHeight: 40,
            maxHeight: 550,
            overflow: 'auto',
            paddingRight: 10,
            paddingLeft: 10            
        };

        return (
            <Grid fluid>
                <Row>
                    <Col md={6}>
                        <div className="block-list-title">非表示項目</div>
                        <ul id="hiddenColumns" className="sortable-list connectedSortable" style={style}>
                            {this.makeHiddenColumnList(this.props.allColumns, this.props.userColumns)}
                        </ul>
                    </Col>
                    <Col md={6}>
                        <div className="block-list-title">表示項目</div>
                        <ul id="displayColumns" className="sortable-list connectedSortable" style={style}>
                            {this.makeDisplayedColumnList(this.props.userColumns)}
                        </ul>
                    </Col>
                </Row>
            </Grid>

        )
    }
}

DisplayColumnSettingForm.propTypes = {
    allColumns: PropTypes.object,
    userColumns: PropTypes.object,
    onChange: PropTypes.func
}

/**
 * SortableObject
 * @param {any} props
 */
function SortableObject(props) {
    return (
        <li
            id={props.id}
            rackItemId={props.rackItemId}
            unitItemId={props.unitItemId}
            consumerItemId={props.consumerItemId}
            eLockOpLogOpenItemId={props.eLockOpLogOpenItemId}
            eLockOpLogCloseItemId={props.eLockOpLogCloseItemId}
            patchboardItemId={props.patchboardItemId}
            patchCableItemId={props.patchCableItemId}
            projectItemId={props.projectItemId}
            className="sortable-list-item block-list-item"
            style={{ cursor: 'move' }}
        >
            <span className="mlr-1">
                {props.sort && <i className="fal fa-sort" />}
                <span className="mlr-1">{props.name}</span>
            </span>
        </li>
    );
}