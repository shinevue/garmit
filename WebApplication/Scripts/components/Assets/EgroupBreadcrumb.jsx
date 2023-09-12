/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーションのパンくずリスト Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Breadcrumb } from 'react-bootstrap';

/**
 * 電源系統のパンくずリストコンポーネント
 * 電源系統の配列を渡すこと。電源系統の配列がnullもしくはundefinedの場合は非表示。
 * @param {array} egroupList 電源系統の配列
 */
export default class EgroupBreadcrumb extends Component {
    /**
     * render
     */
    render() {
        const { egroupList, className } = this.props;
        return (
            <Breadcrumb className={classNames('location-breadcrumb', className)} >        
                {egroupList && egroupList.map((egroup) =>
                    <Breadcrumb.Item tag={egroup.id}>{egroup.text}</Breadcrumb.Item>
                )}
            </Breadcrumb>
        );
    }
}

EgroupBreadcrumb.propTypes = {
    egroupList: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    })
};