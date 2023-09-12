/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源系統選択フォーム Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Col, Overlay, Grid, Row, ButtonToolbar } from 'react-bootstrap';

import EgroupTreeView from 'Assets/TreeView/EgroupTreeView';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

/**
 * 電源系統選択フォーム
 */
export default class EgroupSelectForm extends Component {

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
        if (this.props.selectEgroup !== nextProps.selectEgroup) {
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
     * 電源系統選択イベント
     */
    handleSelectEgroup=(egroup)=> {
        if (this.props.onSelectEgroup) {
            this.props.onSelectEgroup(egroup);
        }      
        this.setState({ show: false });
    }


    /**
     * render
     */
    render() {
        const { egroupList, selectedEgroup, isReadOnly } = this.props;
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
                <span className='ml-05'>電源系統選択 :</span>
                <label className="ml-1">{_.get(selectedEgroup, "egroupName", "未選択")}</label>
                <Overlay
                    show={show}
                    target={this.refs.target}
                    container={this}
                    rootClose={true}
                    placement="right"
                    onHide={() => this.setState({ show: false })}
                >
                    <div className='overlay-right-panel'>
                        <EgroupTreeView
                            searchable={true}
                            showAllExpandButton={true}
                            egroupList={egroupList}
                            selectedEgroup={selectedEgroup}
                            disabled={isReadOnly}
                            onEgroupSelect={this.handleSelectEgroup}
                        />
                    </div>
                </Overlay>
            </div>
        );
    }
}

EgroupSelectForm.propTypes = {
    egroupList: PropTypes.array,
    selectedEgroup: {
        egroupId: PropTypes.number,
        egroupName: PropTypes.string
    },
    isReadOnly:PropTypes.bool,
    onEgroupSelect: PropTypes.func
};