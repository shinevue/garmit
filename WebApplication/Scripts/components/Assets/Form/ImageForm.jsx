/**
 * @license Copyright 2018 DENSO
 * 
 * ImageForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl, Image, ButtonToolbar, Button } from 'react-bootstrap';

import ImageSelectModal from 'Assets/Modal/ImageSelectModal';

/**
 * 画像選択フォームを表示する
 * <ImageForm label={} image={} isReadOnly={} unitImages={[]} onChange={} />
 * @param label フォームのタイトル
 * @param image 選択中の画像
 * @param isReadOnly 読取専用かどうか
 * @param unitImages ユニット画像リスト
 * @param onChange 画像変更イベント
 */
export default class ImageForm extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { showModal: false };
    }

    /**
     * render
     */
    render() {
        const { label, image, unitImages, isReadOnly } = this.props;
        const { showModal } = this.state;
        const imageUrl = (image && image.url) ? image.url : null;

        return (
            <FormGroup className='image-from'>
                {label&&<ControlLabel>{label}</ControlLabel>}
                {imageUrl ?
                    <Image src={imageUrl} alt={image?image.image:'背景画像なし'} responsive thumbnail />
                    :
                    <FormControl.Static className='pa-05'>画像なし</FormControl.Static>
                }
                {!(isReadOnly)&&
                    <ButtonToolbar className='pull-right mt-05' >
                        <Button bsStyle="info" onClick={() => this.showModal()} >選択</Button>
                        <Button bsStyle="lightgray" onClick={() => this.onChange(null)} >クリア</Button>
                    </ButtonToolbar>
                }
                <ImageSelectModal 
                    showModal={showModal} 
                    unitImages={unitImages} 
                    selectedImage={image}
                    onSelect={(image) => this.handleSelected(image)} 
                    onHide={() => this.hideModal()} 
                />
            </FormGroup>
        );
    }

    /**
     * 画像選択イベント
     * @param {object} image ユニット画像
     */
    handleSelected(image) {
        this.onChange(image);
        this.hideModal();
    }

    /**
     * 画像変更イベントを呼び出す
     * @param {object} image ユニット画像
     */
    onChange(image) {
        if (this.props.onChange) {
            this.props.onChange(image)
        }
    }
    
    /**
     * 画像選択モーダルを閉じる
     */
    hideModal(){
        var obj = Object.assign({}, this.state);
        obj.showModal = false;
        this.setState(obj);
    }
    
    /**
     * 画像選択モーダルを表示する
     */
    showModal(){
        var obj = Object.assign({}, this.state);
        obj.showModal = true;
        this.setState(obj);
    }
}

ImageForm.propTypes = {
    label : PropTypes.string.isRequired,
    image: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        unitType: PropTypes.shape({
            name: PropTypes.string
        })
    }),
    isReadOnly : PropTypes.bool.isRequired,
    unitImages: PropTypes.arrayOf( PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        unitType: PropTypes.shape({
            name: PropTypes.string
        })
    })),
    onChange : PropTypes.func
}