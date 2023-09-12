/**
 * Copyright 2017 DENSO Solutions
 * 
 * 並べ替え可能リスト Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap';

import SortableObject from 'Assets/SortableObject';

import { validateText } from 'inputCheck.js';
import { comparePositionAscending } from 'sortCompare';
import { COLUMN_INDEX } from 'extendedDataUtility';

export default class SortableList extends Component {

    constructor(props) {
        super(props)
        this.state = {
        };
    }

    //#region ライフサイクル関数
    /**
      * DOM作成後にjquery-uiのsortable設定
      */
    componentDidMount() {
        $('.sortable-list').sortable({
            placeholder: 'move-target',
            handle: '.handle',
            forcePlaceholderSize: true,
            zIndex: 999999,
            items: "li:not(.ui-state-disabled)"
        });
    }

    //#region render
    /**
     * render
     */
    render() {
        const { show, items  } = this.props;
        return (
            <ul id="itemSort" className="sortable-list">
                {items &&
                    items.map((data) => {
                    return <SortableObject
                        data={{
                            id: data.itemId.toString(),
                            level: 0,
                            text: data.columnInfo[COLUMN_INDEX.itemName].value,
                            sortable: true
                        }}
                    />;
                    })
                }
            </ul>
        );
    }
    //#endregion
}

SortableList.propTypes = {
    items:PropTypes.array      //項目一覧
}
