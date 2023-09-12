/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーション選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import LocationTreeView from 'Assets/TreeView/LocationTreeView';

export default class LocationSelectModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedLocation: props.selectedLocation,
            checkedLocations: props.checkedLocations
        };
    }

    /**
 * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
 * Componentがレンダリングされた直後に呼び出されるメソッドです。
 * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
 */
    componentDidMount() {
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.state.selectedLocation !== nextProps.selectedLocation) {
            this.setState({ selectedLocation: nextProps.selectedLocation });
        }
        if (this.props.checkedLocations !== nextProps.checkedLocations
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedLocations: nextProps.checkedLocations });
        }
    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {

    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            if (this.props.checkbox) {
                this.props.onSubmit(this.state.checkedLocations);
            } else {
                this.props.onSubmit(this.state.selectedLocation);
            }
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.setState({ selectedLocation: null });
    }

    render() {

        const { locationList, checkbox, separateCheckMode } = this.props;
        const { selectedLocation, checkedLocations } = this.state;
        return (
            <Modal show={this.props.showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>ロケーション選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LocationTreeView
                        locationList={locationList}
                        selectedLocation={selectedLocation}
                        onLocationSelect={(val) => this.setState({ selectedLocation: val })}
                        checkedLocations={checkedLocations}
                        onLocationChangeChecked={(val) => this.setState({ checkedLocations: val })}
                        onExpandedLocIdsChange={(val) => this.setState({ expandLocIds: val })}
                        showCheckbox={checkbox}
                        showAllExpandButton={true}
                        separateCheckMode={separateCheckMode}
                        maxHeight={500}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.handleSubmit()}
                        disabled={checkbox ? 
                                    (checkedLocations&&checkedLocations.length>0 ? false : true) 
                                 : 
                                    (selectedLocation ? (!selectedLocation.isAllowed) : true)
                                 }
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

LocationSelectModal.propTypes = {
    showModal: PropTypes.bool,
    checkbox: PropTypes.bool,
    separateCheckMode: PropTypes.bool,
    locationList: PropTypes.array,
    selectedLocation: PropTypes.object,
    checkedLocations: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

LocationSelectModal.defaultProps = {
    showModal: false,
    checkbox: false,
    locationList: [],
    selectedLocation: {},
    checkedLocations: [],
    onSubmit: () => { },
    onCancel: () => { }
}