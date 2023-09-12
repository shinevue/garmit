/**
 * Copyright 2017 DENSO Solutions
 * 
 * タグ選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal, FormControl, FormGroup, ControlLabel, Grid, Row, Col } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList'

export default class TagSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchWord: "",
            checkedTags: this.props.checkedTags
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedTags !== nextProps.checkedTags
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedTags: nextProps.checkedTags });
        }

        if (this.props.showModal !== nextProps.showModal && nextProps.showModal == false) {
            this.setState({ searchWord: "" });
        }
    }

    /**
     * 検索ワード変更イベント
     * @param {any} e
     */
    onSearchWordChange(e) {
        this.setState({ searchWord: e.target.value });
    }

    /**
     * チェックボックスのアイテムを生成する
     */
    createCheckboxItems() {
        const filteredTags = this.props.tagList ? this.props.tagList.filter((item) => {
            return (item.name.indexOf(this.state.searchWord) >= 0);
        }) : [];

        filteredTags.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        const checkboxItems = filteredTags.map((tag) => {
            return { key: tag.tagId, name: tag.name };
        })
        return checkboxItems;
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.checkedTags);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * チェックボックスのチェックが変化したとき
     * @param {any} checkedItems
     */
    checkChanged(checkedItems) {
        const checkedTags = this.props.tagList.filter((tag) => {
            return (checkedItems.indexOf(tag.tagId) >= 0);
        })

        this.setState({ checkedTags: checkedTags });
    }

    render() {
        const { showModal, tagList } = this.props;
        const { checkedTags } = this.state;

        const checkboxItems = this.createCheckboxItems();

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>タグ選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                <FormGroup>
                                    <ControlLabel>検索:</ControlLabel>
                                    <FormControl
                                        type="text"
                                        onChange={(e) => this.onSearchWordChange(e)}
                                        placeholder="search"
                                    />
                                    <FormControl.Feedback >
                                        <span>
                                            <Icon className="fal fa-search" />
                                        </span>
                                    </FormControl.Feedback>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                {(checkboxItems.length != 0) ?
                                    <CheckboxList
                                        items={checkboxItems}
                                        checkedItems={checkedTags.map((tag) => tag.tagId)}
                                        onChange={(keys) => this.checkChanged(keys)}
                                        maxHeight={500}
                                    /> :
                                    <div>該当するタグがありません</div>
                                }
                            </Col>
                        </Row>
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.handleSubmit()}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.handleCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

TagSelectModal.propTypes = {
    showModal: PropTypes.bool,
    tagList: PropTypes.array,
    checkedTags: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

TagSelectModal.defaultProps = {
    showModal: false,
    tagList: [],
    checkedTags: [],
    onSubmit: () => { },
    onCancel: () => { }
}