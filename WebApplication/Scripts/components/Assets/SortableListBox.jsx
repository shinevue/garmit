/**
 * Copyright 2017 DENSO Solutions
 * 
 * 並べ替えリストボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import GarmitBox from 'Assets/GarmitBox';
import SortableObject from 'Assets/SortableObject';

/**
 * 並べ替えリストボックス
 */
export default class SortableListBox extends Component {

    constructor(props) {
        super(props);
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
        $('.sortable-list').disableSelection();
    }

    /**
     * アップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.isLoading !== nextProps.isLoading;
    }

    //#endregion

    //#region イベントハンドラ
    /**
     * 並べ替え保存ボタン押下イベント
     */
    handleClickSave() {
        if (this.props.onClickSave) {
            this.props.onClickSave();
        }
    }

    /**
     * キャンセルボタン押下イベントハンドラ
     */
    handleClickCancel() {
        if (this.props.onClickCancel) {
            this.props.onClickCancel();
        }
    }

    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { boxTitle, sortList, isLoading } = this.props;
       
        return (
            <GarmitBox isLoading={isLoading} title={boxTitle}>
                <ul className="sortable-list">
                    {sortList &&
                        sortList.map((data) => {
                            return <SortableObject data={data} />;
                        })
                    }
                </ul>
                <div className="pull-right mt-1">
                    <Button bsStyle="success" className="mr-05" onClick={() => { this.handleClickSave() }}>
                        <Icon className="fal fa-save mr-05" />
                        保存
                        </Button>
                    <Button className="btn-garmit-uncheck" bsStyle="lightgray" onClick={() => { this.handleClickCancel() }}>キャンセル</Button>
                </div>
            </GarmitBox>
        );
    }
    //#endregion
}

SortableListBox.propTypes = {
    sortList: PropTypes.array,              //並べ替え表示用データ
    isLoading: PropTypes.bool,              //ロード中かどうか
    onClickSave: PropTypes.func,            //並べ替え保存クリックイベント関数
    onClickCancel: PropTypes.func           //並べ替えキャンセルクリックイベント関数
};



