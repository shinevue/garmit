/**
 * Copyright 2017 DENSO Solutions
 * 
 * HashTagForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';

import TextForm from 'Common/Form/TextForm';

import { getHashTagsAndError } from 'searchConditionUtility';

export default class HashTagForm extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    /**
     * 値が変更された時
     * @param {any} value
     */
    onChange(value) {
        const info = getHashTagsAndError(value);
        this.props.onChange(info.hashTags, value, info.hasError);
    }

    /**
     * render
     */
    render() {
        return (
             <TextForm
                value={this.props.value}
                validationState={this.props.hasError && 'error'}
                helpText={this.props.hasError && (this.props.value.length > 100 ? '100文字以下で入力してください' : 'ハッシュタグの形式になっていません')}
                placeholder="#ハッシュタグ"
                onChange={(val) => this.onChange(val)}
                disabled={this.props.disabled}
            />
        )
    }
}