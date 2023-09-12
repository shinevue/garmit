/**
 * Copyright 2017 DENSO Solutions
 * 
 * PatchCableTypeSelectModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList';


export default class PatchCableTypeSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checkedPatchCableTypes: this.props.checkedPatchCableTypes
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedPatchCableTypes !== nextProps.checkedPatchCableTypes
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedPatchCableTypes: nextProps.checkedPatchCableTypes });
        }
    }

    /**
     * 選択肢を生成する
     */
    makeOptions() {
        const options = this.props.patchCableTypeList.map((type) => {
            return { key: type.id, name: type.name};
        });
        return options;
    }

    render() {
        return (
            <Modal show={this.props.showModal} backdrop="static" onHide={() => this.props.onCancel()} bsSize="sm">
                <Modal.Header closeButton>
                    <Modal.Title>ケーブル種別選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxList
                        items={this.makeOptions()}
                        checkedItems={this.state.checkedPatchCableTypes.map((type) => type.id)}
                        onChange={(val) => this.onHandleChange(val)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.props.onSubmit(this.state.checkedPatchCableTypes)}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.props.onCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    onHandleChange(val){
        const checkedTypes = val.map((key) => {
            return this.props.patchCableTypeList.find((type) => type.id == key);
        });
        this.setState({ checkedPatchCableTypes: checkedTypes })
    }
}

PatchCableTypeSelectModal.propTypes = {
    showModal: PropTypes.bool,
    checkedPatchCableTypes: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

PatchCableTypeSelectModal.defaultProps = {
    showModal: false,
    checkedPatchCableTypes: [],
    onSubmit: () => { },
    onCancel: () => { }
}