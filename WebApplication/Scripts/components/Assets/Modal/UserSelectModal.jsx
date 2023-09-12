/**
 * Copyright 2017 DENSO Solutions
 * 
 * ユーザー選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal, FormControl, ControlLabel, FormGroup, Checkbox, Grid, Row, Col } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList';
import RadioButtonList from 'Common/Widget/RadioButtonList';

export default class UserSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchID: "",
            searchName: "",
            checkedLoginUsers: this.props.checkedLoginUsers,
            selectedLoginUser: this.props.selectedLoginUser
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedLoginUsers !== nextProps.checkedLoginUsers
            || this.props.selectedLoginUser !== nextProps.selectedLoginUser
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedLoginUsers: nextProps.checkedLoginUsers, selectedLoginUser: nextProps.selectedLoginUser });
        }
        if (this.props.showModal !== nextProps.showModal && nextProps.showModal == false) {
            this.clearSearchCondition();
        }
    }

    /**
     * IDの検索ワードが変更された時
     * @param {any} val
     */
    onSearchIDChange(val) {     
        this.setState({ searchID: val }, () => {
            this.uncheckHiddenUsers();
        });
    }

    /**
     * ユーザー名の検索ワードが変更された時
     * @param {any} val
     */
    onSearchNameChange(val) {
        this.setState({ searchName: val }, () => {
            this.uncheckHiddenUsers();
        });
    }

    /**
     * すべてチェックがクリックされた時
     */
    onAllCheckboxClick() {
        let checkedLoginUsers = [];

        if (!this.isAllChecked()) {
            checkedLoginUsers = this.getFilteredUsers();
        }  

        this.setState({ checkedLoginUsers: checkedLoginUsers });
    }
    
    /**
     * フィルター後のユーザー一覧を取得する
     */
    getFilteredUsers() {
        const { loginUserList } = this.props;
        const { searchName, searchID } = this.state;

        return loginUserList ? loginUserList.filter((item) => item.userName.indexOf(searchName) >= 0 && item.userId.indexOf(searchID) >= 0) : [];
    }

    /**
     * チェックボックスのアイテムを生成する
     */
    createCheckboxItems() {
        const filteredLoginUsers = this.getFilteredUsers();
        return filteredLoginUsers.map((user) => ({ key: user.userId, name: `${user.userName}（ ID: ${user.userId} ）` }));
    }

    /**
     * 検索条件をクリアする
     */
    clearSearchCondition() {
        this.setState({ searchID: '', searchName: '' });
    }

    /**
     * 非表示のユーザーのチェックを外す
     */
    uncheckHiddenUsers() {
        const filteredLoginUsers = this.getFilteredUsers();
        const checkedLoginUsers = this.state.checkedLoginUsers.filter((user) => filteredLoginUsers.some((u) => u.userId === user.userId));
        const selectedLoginUser = this.state.selectedLoginUser && filteredLoginUsers.find((user) => user.userId === this.state.selectedLoginUser.userId); 
        this.setState({ checkedLoginUsers: checkedLoginUsers, selectedLoginUser });
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            if (this.props.checkbox) {
                this.props.onSubmit(this.state.checkedLoginUsers);
            } else {
                this.props.onSubmit(this.state.selectedLoginUser);
            }
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
        this.setState({ selectedLoginUser: null });
    }

    /**
     * チェックボックスのチェックが変化したとき
     * @param {any} checkedItems
     */
    checkChanged(checkedItems) {
        const { loginUserList } = this.props

        const checkedLoginUsers = loginUserList.filter((user) => {
            return (checkedItems.indexOf(user.userId) >= 0);
        })

        this.setState({ checkedLoginUsers: checkedLoginUsers });
    }

    /**
     * すべてチェックされているか
     */
    isAllChecked() {
        const filteredLoginUsers = this.getFilteredUsers();
        return !filteredLoginUsers.some((user) => !this.state.checkedLoginUsers.some((u) => u.userId === user.userId));
    }

    /**
     * ラジオボタンの選択が変化したとき
     * @param {*} targetUserId 
     */
    selectChanged(targetUserId) {
        const { loginUserList } = this.props;
        const selectedLoginUser = loginUserList.find((user) => user.userId === targetUserId);
        this.setState({ selectedLoginUser });
    }

    render() {
        const { showModal, loginUserList, checkbox } = this.props
        const { checkedLoginUsers, selectedLoginUser } = this.state

        const checkboxItems = this.createCheckboxItems();

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>ユーザー選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                <FormGroup>
                                    <ControlLabel>検索:</ControlLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="ユーザーID"
                                        onChange={(e) => this.onSearchIDChange(e.target.value)}
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
                                <FormGroup>
                                    <FormControl
                                        type="text"
                                        placeholder="ユーザー名称"
                                        onChange={(e) => this.onSearchNameChange(e.target.value)}
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
                                    (checkbox?
                                        <div>
                                            <Checkbox
                                                checked={this.isAllChecked()}
                                                onClick={() => this.onAllCheckboxClick()}
                                            >
                                                <b>すべて</b>
                                            </Checkbox>
                                            <CheckboxList
                                                items={checkboxItems}
                                                checkedItems={checkedLoginUsers.map((user) => user.userId)}
                                                onChange={(keys) => this.checkChanged(keys)}
                                                maxHeight={500}
                                            />
                                        </div>
                                        :
                                        <RadioButtonList
                                            items={checkboxItems}
                                            selectedItem={selectedLoginUser && selectedLoginUser.userId}
                                            onChange={(key) => this.selectChanged(key)}
                                        />
                                    )
                                    :
                                    <div>該当するユーザーがありません</div>}
                            </Col>
                        </Row>
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        disabled={ checkbox ? false : !selectedLoginUser }
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

UserSelectModal.propTypes = {
    showModal: PropTypes.bool,
    loginUserList: PropTypes.array,
    checkedLoginUsers: PropTypes.array,
    checkbox: PropTypes.bool,
    selectedLoginUser: PropTypes.object,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

UserSelectModal.defaultProps = {
    showModal: false,
    loginUserList: [],
    checkedLoginUsers: [],
    checkbox: true,
    selectedLoginUser: null,
    onSubmit: () => { },
    onCancel: () => { }
}