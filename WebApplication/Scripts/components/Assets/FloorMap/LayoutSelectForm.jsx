/**
 * Copyright 2017 DENSO Solutions
 * 
 * レイアウト選択フォーム Reactコンポーネント
 * <LayoutSelectForm />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Col, Overlay, Grid, Row, ButtonToolbar } from 'react-bootstrap';

import LayoutTreeView from 'Assets/TreeView/LayoutTreeView';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

/**
 * レイアウト選択フォーム
 * <LayoutSelectForm layoutInfo={}></LayoutSelectForm>
 * @param {array} layoutList レイアウト一覧
 * @param {object} selectLayout 選択中レイアウト情報
 */
export default class LayoutSelectForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
        };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.selectLayout !== nextProps.selectLayout) {
            return true;
        }
        if (this.props.isReadOnly !== nextProps.isReadOnly) {
            return true;
        }
        if (this.state !== nextState) {
            return true;
        }
        return false;
    }

    /**
     * レイアウト選択イベント
     */
    handleSelectLayout=(layout)=> {
        if (this.props.onChangeSelectLayout) {
            this.props.onChangeSelectLayout(layout);
        }      
        this.setState({ show: false });
    }


    /**
     * render
     */
    render() {
        const { layoutList, selectLayout, isReadOnly, isShowEgroupMap, isAddMode, treeViewMaxHeight } = this.props;
        const { show } = this.state;

        return (
            <div className="mb-05 layout-select" style={{position:"relative"}}>
                <Button
                    ref='target'
                    disabled={isReadOnly}
                    onClick={() => this.setState({ show: !this.state.show })}
                >
                    <Icon className='fas fa-play' />
                </Button>
                <span className='ml-05'>レイアウト選択 :</span>
                <label className="ml-1">{isAddMode ? "新規レイアウト" :_.get(selectLayout, "layoutName", "未選択")}</label>
                <Overlay
                    show={show}
                    target={this.refs.target}
                    container={this}
                    rootClose={true}
                    placement="right"
                    onHide={() => this.setState({ show: false })}
                >
                    <div className='overlay-right-panel'>
                        <LayoutTreeView
                            layoutList={layoutList}
                            selectLayout={selectLayout}
                            isGetDuplicateSelectEvent={isShowEgroupMap ? true : false}
                            maxHeight={treeViewMaxHeight}
                            disabled={isReadOnly}
                            onSelectLayout={this.handleSelectLayout}
                        />
                    </div>
                </Overlay>
            </div>
        );
    }
}

LayoutSelectForm.propTypes = {
    layoutList: PropTypes.array,
    selectLayout: {
        layoutId: PropTypes.number,
        layoutName: PropTypes.string
    },
    isAddMode:PropTypes.bool,
    isReadOnly:PropTypes.bool,
    isShowEgroupMap: PropTypes.bool,  //分電盤図表示中かどうか
    onChangeSelectLayout: PropTypes.func
};

/**
 * レイアウトのパンくずリストコンポーネント
 */
const LayoutBreadcrumb = ({ layoutList, className }) => { 
    if(!layoutList || layoutList.length ===0 ){ return <div/> }
    return(
        <ol className={classNames('layout-breadcrumb', className)} >
            {layoutList && layoutList.map((layout) =>
                <li>{layout}</li>
            )}
        </ol>
    )
}