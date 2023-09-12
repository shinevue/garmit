/**
 * Copyright 2017 DENSO Solutions
 * 
 * TagForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';

import TagSelectModal from 'Assets/Modal/TagSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

export default class TagForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * チップのリストを生成する
     * @param {any} tags
     */
    createChipList(tags) {
        return tags.map((tag) => { return { id: tag.tagId, name: tag.name } })
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let tags = this.props.checkedTags.slice();
            for (let i = 0; i < tags.length; i++) {
                if (tags[i].tagId === id) {
                    tags.splice(i, 1);
                    this.props.onChange(tags);
                    return;
                }
            }
        }
    }

    /**
     * 適用ボタンクリックイベント
     * @param {any} val
     */
    handleSubmit(val) {
        this.setState({ showModal: false });

        if (this.props.onChange) {
            this.props.onChange(val);
        }
    }

    /**
     * render
     */
    render() {
        const { showModal } = this.state
        const { tagList, checkedTags, validationState, helpText, disabled, search } = this.props

        return (
            <div>
                <TagSelectModal
                    showModal={showModal}
                    tagList={tagList}
                    checkedTags={checkedTags}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedTags)}
                    removeButton={true}
                    onRemoveClick={(id) => this.handleRemoveChip(id)}
                    onClick={search && (() => this.setState({showModal: true }))}
                    validationState={validationState}
                    helpText={helpText}
                    addonButton={!search && {
                        buttonIconClass: 'fal fa-tag',
                        bsStyle: 'primary',
                        isCircle: true,
                        tooltipLabel: 'タグ選択',
                        onClick: () => this.setState({ showModal: true })
                    }}
                />
            </div>
        )
    }
}

TagForm.propTypes = {
    tagList: PropTypes.array,
    checkedTags: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string
}

TagForm.defaultProps = {
    tagList: [],
    checkedTags: [],
    onChange: () => { },
}