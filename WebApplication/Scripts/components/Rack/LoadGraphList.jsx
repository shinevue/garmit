/**
 * @license Copyright 2018 DENSO
 * 
 * LoadGraphList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';
import LoadBarGraph from 'Assets/Graph/LoadBarGraph';

/**
 * 荷重バーグラフリストコンポーネント
 * @param {string} title バーグラフのタイトル
 * @param {number} max バーグラフの最大値
 * @param {string} maxNowValueString バーグラフの説明
 * @param {object} barGraphItems バーグラフのアイテムリスト
 */
export default class LoadGraphList extends Component {
    
    /**
     * render
     */
    render() {
        const { className } = this.props;        
        return (
            <Form className={classNames(className, {'rack-bargraph-from': true})} >
                <LoadBarGraph title='荷重' {...this.props} />
            </Form>
        );
    }
}

LoadGraphList.propTypes = {
    max: PropTypes.number.isRequired,
    maxNowValueString: PropTypes.string.isRequired,
    barGraphItems: PropTypes.arrayOf(PropTypes.shape({
        usage: PropTypes.number.isRequired,
        percentage: PropTypes.string.isRequired,
        alarmName: PropTypes.string.isRequired
    }))
}