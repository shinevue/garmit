/**
 * Copyright 2017 DENSO Solutions
 * 
 * 並べ替えオブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

/**
 * 並べ替えオブジェクト
 */
export default class SortableObject extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    //#region render
    /**
     * render
     */
    render() {
        const { data } = this.props;
        let indent = [];
        for (let i = 0; i < data.level; i++) {
            indent.push(<span className="mlr-1" />);    //レベル分インデントを作成する
        }

        if (data.sortable) {    //並べ替え可能ロケーション用オブジェクト
            return (
                <SortableList indent={indent} data={data} />
            );
        }
        else {                   //並べ替え不可ロケーション用オブジェクト
            return (
                <List indent={indent} data={data} />
            );
        }
    }
    //#endregion

}

SortableObject.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.string,
        level: PropTypes.number,
        text: PropTypes.string,
        sortable:PropTypes.bool
    })
};

//#region SortableObjectコンポーネント
/**
 * 並べ替え可能オブジェクト
 */
function SortableList({ indent, data }) {
    return (
        <li className="sortable-list-item" id={data.id}>
            {indent}
            <span className="handle">
                <span><i className="fa fa-bars" /></span>
                <span> {data.text}</span>
            </span>
        </li>
    );
}
//#endregion

//#region SortableObjectコンポーネント
/**
 * 並べ替え不可オブジェクト
 */
function List({ indent, data }) {
    return (
        <li class="ui-state-disabled list-group-item">
            {indent}
            <span>{data.text}</span>
        </li>
    );
}
//#endregion


