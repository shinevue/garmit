/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Jake Ginnivan
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

 /**
  * react-popup ver 1.0.1
  * https://github.com/JakeGinnivan/react-popout
  */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const DEFAULT_OPTIONS = {
    toolbar: 'no',
    location: 'no',
    directories: 'no',
    status: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'yes',
    width: 500,
    height: 400,
    top: (o, w) => (w.innerHeight - o.height) / 2 + w.screenY,
    left: (o, w) => (w.innerWidth - o.width) / 2 + w.screenX
};

const ABOUT_BLANK = 'about:blank';

/**
 * @class PopoutWindow
 */
export default class PopoutWindow extends React.Component {
    static defaultProps = {
        url: ABOUT_BLANK,
        containerId: 'popout-content-container'
    };

    /**
     *
     * @type {{title: *, url: *, onClosing: *, options: *, window: *, containerId: *}}
     */
    static propTypes = {
        title: PropTypes.string.isRequired,
        url: PropTypes.string,
        onClosing: PropTypes.func,
        options: PropTypes.object,
        window: PropTypes.object,
        containerId: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    };

    /**
     * @constructs PopoutWindow
     * @param props
     */
    constructor(props) {
        super(props);

        this.mainWindowClosed = this.mainWindowClosed.bind(this);
        this.popoutWindowUnloading = this.popoutWindowUnloading.bind(this);
        this.popoutWindowLoaded = this.popoutWindowLoaded.bind(this);

        this.state = {
            openedWindowComponent: null,
            popoutWindow: null,
            container: null
        };
    }

    createOptions(ownerWindow) {
        const mergedOptions = Object.assign({}, DEFAULT_OPTIONS, this.props.options);

        return Object.keys(mergedOptions)
        .map(
            key =>
                key +
                '=' +
                (typeof mergedOptions[key] === 'function'
                    ? mergedOptions[key].call(this, mergedOptions, ownerWindow)
                    : mergedOptions[key])
        )
        .join(',');
    }

    componentDidMount() {
        const ownerWindow = this.props.window || window;

        // May not exist if server-side rendering
        if (ownerWindow) {
            this.openPopoutWindow(ownerWindow);

            // Close any open popouts when page unloads/refreshes
            ownerWindow.addEventListener('unload', this.mainWindowClosed);
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.title !== this.props.title && this.state.popoutWindow) {

            this.state.popoutWindow.document.title = newProps.title;
        }
    }

    componentDidUpdate() {
        this.renderToContainer(this.state.container, this.state.popoutWindow, this.props.children);
    }

    componentWillUnmount() {
        this.mainWindowClosed();
    }

    popoutWindowLoaded(popoutWindow) {
        if (!this.state.container) {
            // Popout window is passed from openPopoutWindow if no url is specified.
            // In this case this.state.popoutWindow will not yet be set, so use the argument.
            popoutWindow = this.state.popoutWindow || popoutWindow;
            popoutWindow.document.title = this.props.title;
            let container = popoutWindow.document.createElement('div');
            container.id = this.props.containerId;
            popoutWindow.document.body.appendChild(container);

            this.setState({ container });
            this.renderToContainer(container, popoutWindow, this.props.children);
        }
    }

    openPopoutWindow(ownerWindow) {
        const popoutWindow = ownerWindow.open(this.props.url, this.props.name || this.props.title, this.createOptions(ownerWindow));
        this.setState({ popoutWindow });

        popoutWindow.addEventListener('load', this.popoutWindowLoaded);
        popoutWindow.addEventListener('beforeunload', this.popoutWindowUnloading);

        // If they have no specified a URL, then we need to forcefully call popoutWindowLoaded()
        if (this.props.url === ABOUT_BLANK) {
            popoutWindow.document.readyState === 'complete' && this.popoutWindowLoaded(popoutWindow);
        }
    }

    /**
     * API method to close the window.
     */
    closeWindow() {
        this.mainWindowClosed();
    }

    mainWindowClosed() {
        this.state.popoutWindow && this.state.popoutWindow.close();
        (this.props.window || window).removeEventListener('unload', this.mainWindowClosed);
    }

    popoutWindowUnloading() {
        ReactDOM.unmountComponentAtNode(this.state.container);
        this.props.onClosing && this.props.onClosing();
    }

    renderToContainer(container, popoutWindow, children) {
        // For SSR we might get updated but there will be no container.
        if (container) {
            let renderedComponent = children;
            if (typeof children === 'function') {
                renderedComponent = children(popoutWindow);
            }
            ReactDOM.render(renderedComponent, container);
        }
    }

    render() {
        return null;
    }
}
