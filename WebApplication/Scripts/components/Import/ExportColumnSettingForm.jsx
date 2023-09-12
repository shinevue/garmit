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

import { REQUIRED_TYPE } from 'constant';

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
     * 固定の表示項目のアイテムリストを生成する
     */
    makeFixedColumnList() {
        if (!this.props.exportColumns) {
            return;
        }

        const objects = [];

        this.props.exportColumns.forEach((col) => {
            if (col.requiedType === REQUIRED_TYPE.requiredAtUpdate) {
                objects.push(<FixedObject id={col.elementName} name={col.dispName} />);
            }
        });

        return objects;
    }

    /**
     * 表示項目のアイテムリストを生成する
     */
    makeDisplayedColumnList() {
        if (!this.props.exportColumns) {
            return;
        }

        const columns = this.props.exportColumns.filter((col) => col.columnNo && col.requiedType !== REQUIRED_TYPE.requiredAtUpdate);
        columns.sort((current, next) => {
            if (current.columnNo < next.columnNo) return -1;
            if (current.columnNo > next.columnNo) return 1;
            return 0;
        });

        return columns.map((col) => <SortableObject id={col.elementName} name={col.dispName} required={col.requiedType === REQUIRED_TYPE.requiredAtCreate} sort />);
    }

    /**
     * 非表示項目のアイテムリストを生成する
     */
    makeHiddenColumnList() {
        if (!this.props.exportColumns) {
            return;
        }

        let columns = this.props.exportColumns.filter((col) => !col.columnNo && col.requiedType !== REQUIRED_TYPE.requiredAtUpdate);

        return columns.map((col) => <SortableObject id={col.elementName} name={col.dispName} required={col.requiedType === REQUIRED_TYPE.requiredAtCreate} />);
    }

    /**
     * 表示項目が変更された時
     */
    handleChange() {
        const array = $('#displayColumns').sortable('toArray');
        this.cancelSortable();  // 変更をキャンセルする

        const columns = [];
        const first = this.getFirstColumnNo();

        this.props.exportColumns.forEach((col) => {
            const column = Object.assign({}, col);
            const index = array.indexOf(col.elementName);

            // 固定カラム以外は並び順を変更
            if (col.requiedType !== REQUIRED_TYPE.requiredAtUpdate) {
                if (index >= 0) {
                    column.columnNo = first + index;
                } else {
                    column.columnNo = null;
                }
            }

            columns.push(column);
        });

        this.props.onChange(columns);
    }

    /**
     * 必須カラムを除いたカラムの最初のColumnNoを取得する
     */
    getFirstColumnNo() {
        return Math.max.apply(null, this.props.exportColumns.map((col) => col.requiedType === REQUIRED_TYPE.requiredAtUpdate ? col.columnNo : -1)) + 1;
    }

    /**
     * render
     */
    render() {
        const style = {
            minHeight: 100,
            maxHeight: 550,
            overflow: 'auto',
            paddingRight: 10,
            paddingLeft: 10            
        };

        return (
            <Grid fluid>
                <Row>
                    <Col md={6}>
                        <div className="block-list-title">非選択項目</div>
                        <ul id="hiddenColumns" className="sortable-list connectedSortable" style={style}>
                            {this.makeHiddenColumnList()}
                        </ul>
                    </Col>
                    <Col md={6}>
                        <div className="block-list-title">選択項目</div>
                        <div style={style}>
                            <ul className="sortable-list">
                                {this.makeFixedColumnList()}
                            </ul>
                            <ul style={{ minHeight: 100 }} id="displayColumns" className="sortable-list connectedSortable">
                                {this.makeDisplayedColumnList()}
                            </ul>
                        </div>
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
            className="sortable-list-item block-list-item"
            style={{ cursor: 'move' }}
        >
            <span className="mlr-1">
                {props.sort && <i className="fal fa-sort" />}
                <span className="mlr-1">{props.name}{props.required && <span style={{ color: 'red' }}>*</span>}</span>
            </span>
        </li>
    );
}

function FixedObject(props) {
    return (
        <li
            id={props.id}
            style={{ cursor: 'no-drop' }}
            className="sortable-list-item fixed"
        >
            <span className="mlr-1">
                <span className="mlr-1">{props.name}</span>
            </span>
        </li>
    );
}