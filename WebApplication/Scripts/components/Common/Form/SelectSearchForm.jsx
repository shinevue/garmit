/**
 * @license Copyright 2020 DENSO
 * 
 * SelectSearchForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, Dropdown, MenuItem, HelpBlock } from 'react-bootstrap';

/**
 * 検索機能付きセレクトボックスフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 選択した値
 * @param {array} options 選択肢リスト（value、nameのリスト）
 * @param {string} placeholder プレースフォルダに表示する文字列
 * @param {oneOf} validationState 検証結果（success, warning, error, null）
 * @param {string} helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {function} onChange 選択変更イベント
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {string} className className
 * @param {boolean} isRequired 必須項目かどうか（「選択してください」を出すかどうか決める）
 */
export default class SelectSearchForm extends Component {
        
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.dropdownRef = null;
        this.state = { 
            searchText: '',
            items: this.getAllOptions(props.options, props.isRequired, props.placeholder),
            open: false
        };

        
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount(){
        if (this.dropdownRef) {
            this.setReaveEvent(this.dropdownRef);
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(this.props.options) !== JSON.stringify(nextProps.options)) {
            this.setState({
                searchText: '',
                items: this.getAllOptions(nextProps.options, nextProps.isRequired, nextProps.placeholder),
                open: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { label, value, options, helpText, validationState, className, style, isReadOnly } = this.props;
        const { items, open, searchText, autoFocus } = this.state;
        const selectItem = (value || value === 0) ? options.find((o) => o.value === value) : null ;
        return (
            <FormGroup validationState={validationState} className={className} style={style}>
                {label && <ControlLabel>{label}</ControlLabel>}
                <div ref={(ref) => { this.dropdownRef = ref }}>
                    <Dropdown className='dropdown-select' open={open} disabled={isReadOnly}  onSelect={(v) => this.handleChanged(v)} rootCloseEvent="click" >
                        <Dropdown.Toggle className={selectItem?'flex-center-between':'ta-r'} onClick={() => this.setOpenState(!open)}>
                            {selectItem&&selectItem.name}
                        </Dropdown.Toggle>
                        <DropdownMenu bsRole="menu" value={searchText} open={open} onChangeText={(value) => this.searchOptions(value)} >
                            {items&&items.map((i) => 
                                <DropdownItem 
                                    {...i} 
                                    isActive={selectItem?selectItem.value ===i.value:false} 
                                    onSelect={(v) => this.handleChanged(v)} 
                                />
                            )} 
                        </DropdownMenu>
                    </Dropdown>
                </div>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    
    /**
     * 値変更イベント
     * @param {*} value 変更後の値
     */
    handleChanged(value) {
        if ( this.props.onChange ) {
            this.setState({ open: false }, () => {
                this.props.onChange( value )
            });
        }
    }
    
    /**
     * ドロップダウンからのReaveイベントをセットする
     */
    setReaveEvent(element) {
        const changeOpenState = this.setOpenState;

        $(document).on('click',function(e) {
            if (element) {
                if(!$(e.target).closest(element).length) {
                        changeOpenState(false)  // ターゲット要素の外側をクリックした時の操作
                }
            }
        });
    }
    
    /**
     * 全オプションを取得する
     * @param {array} options オプション一覧
     * @param {boolean} isRequired 必須かどうか
     * @param {string} placeholder 
     */
    getAllOptions(options, isRequired, placeholder) {
        var items = options ? _.cloneDeep(options) : []
        if (!isRequired && (options.length <= 0||options[0].value !== -1)) {
            items.unshift({
                value: -1,
                name: placeholder
            });
        }
        return items;
    }

    /**
     * Open状態をセットする
     * @param {*} isOpen 
     * @param {*} callback 
     */
    setOpenState = (isOpen, callback) => {
        const currentIsOpen = this.state.open;
        const openChanged = isOpen !== currentIsOpen
        const searchText =  openChanged ? '' : this.state.searchText;
        openChanged && this.searchOptions(searchText, () => {
            this.setState({ open: isOpen }, () => {            
                callback && callback();
            })
        });
    }

    /**
     * オプションの絞り込み
     * @param {array} target 絞り込みする文字列
     */
    searchOptions(target, callback) {
        const { options, isRequired, placeholder } = this.props;
        const updateList = target ? options.filter((item) => {
            return !item.notSearched &&  item.name.toLowerCase().indexOf(target.toLowerCase()) >= 0;
        }) : _.cloneDeep(options);

        if (updateList.length === options.length) {
            if (!isRequired) {
                updateList.unshift({
                    value: -1,
                    name: placeholder
                });
            }
        }

        this.setState({items: updateList, searchText: target }, () => {
            callback && callback();
        })
    }
}

/**
 * ドロップダウンアイテム
 */
const DropdownItem = ({value, name, isActive, onSelect: handleSelect}) => {
    return (
        <MenuItem eventKey={value} active={isActive} onSelect={() => handleSelect(value)}>
            {name}
        </MenuItem>
    )
}

/**
 * ドロップダウンメニューコンポーネント
 */
class DropdownMenu extends React.Component {
    constructor(props, context) {
      super(props, context);  
      this.inputText = null;
    }
    
    /**
     * Componentがマウントされるときに1度だけ呼び出される
     */
    componentDidMount(){
        this.focusNext();
    }

    /**
     * Componentが更新されるときに呼び出される
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.open && prevProps.open !== this.props.open) {
            this.focusNext();
        }
    }
  
    /**
     * 絞り込みテキスト変更イベント
     */
    handleChange = (e) => {
        this.props.onChangeText(e.target.value);
    }

    /**
     * focusNext
     */
    focusNext() {
      const inputText = ReactDOM.findDOMNode(this.inputText);  
      if (this.inputText) {
        inputText.focus();
      }
    }
      
    /**
     * render
     */
    render() {
      const { children, value } = this.props;  
      return (
            <div className="dropdown-menu">
                <FormControl
                    ref={ref => { this.inputText = ref; }}
                    autoFocus
                    type="text"
                    onChange={this.handleChange}
                    value={value}
                />
                <div className="dropdown-menu-options">
                    {children}
                </div>
            </div>
      );
    }
  }


SelectSearchForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf( PropTypes.shape({
        value: PropTypes.string,
        name: PropTypes.string,
        notSearched: PropTypes.bool,        //検索対象でない
        disabled:PropTypes.string
    })),
    placeholder: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    helpText: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    className: PropTypes.string,
    addonButton : PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.number.isRequired,           //任意のキー 配列の中では重複なしとする
        label: PropTypes.string,
        buttonIconClass : PropTypes.string,
        tooltipLabel : PropTypes.string,
        onClick : PropTypes.func,
        bsStyle: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'default', 'primary', 'link', null]),
        isCircle: PropTypes.bool,
        iconId: PropTypes.string
    })),
    onButtonClick: PropTypes.func,
    isButtonOnlyControl: PropTypes.bool,
    isRequired : PropTypes.bool
}

SelectSearchForm.defaultProps = {
    placeholder: '選択してください'
}
