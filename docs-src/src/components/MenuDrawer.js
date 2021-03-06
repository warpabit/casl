import { LitElement, html, css } from 'lit-element';
import { Slideout } from 'menu-drawer.js';

export default class MenuDrawer extends LitElement {
  static cName = 'menu-drawer';
  static properties = {
    isOpen: { type: Boolean },
    disabled: { type: Boolean },
  };

  constructor() {
    super();
    this._drawer = null;
    this.isOpen = false;
    this.disabled = false;
    this._scrollTop = 0;
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  _createDrawer() {
    const [menu, panel] = this.shadowRoot.children;
    this._drawer = new Slideout({
      menu,
      panel,
      eventsEmitter: this,
      padding: 270,
      touch: false,
    });
    const close = () => this._drawer.close();
    this._drawer.on('beforeopen', () => {
      this.isOpen = true;
      this._scrollTop = window.pageYOffset;
      menu.classList.add('open');
      panel.style.top = `${-this._scrollTop}px`;
      panel.addEventListener('mousedown', close, false);
      panel.addEventListener('touchstart', close, false);
      window.scroll(0, 0);
    });
    this._drawer.on('close', () => {
      this.isOpen = false;
      menu.classList.remove('open');
      panel.style.top = '';
      window.scroll(0, this._scrollTop);
      panel.removeEventListener('mousedown', close, false);
      panel.removeEventListener('touchstart', close, false);
    });
  }

  updated(changed) {
    if (!this._drawer) {
      this._createDrawer();
    }

    if (this.isOpen !== this._drawer.isOpen()) {
      const toggle = this.isOpen ? 'open' : 'close';
      this._drawer[toggle]();
    }

    if (changed.has('disabled')) {
      const switchEnable = this.disabled ? 'disableTouch' : 'enableTouch';
      this._drawer[switchEnable]();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._drawer.destroy();
    this._drawer = null;
  }

  render() {
    return html`
      <div class="menu">
        <slot name="menu"></slot>
      </div>
      <div class="panel">
        <slot></slot>
      </div>
    `;
  }
}

MenuDrawer.styles = css`
  :host {
    display: block;
  }

  .menu {
    display: none;
    padding: 10px;
    width: 256px;
    min-height: 100vh;
    -webkit-overflow-scrolling: touch;
  }

  .panel {
    position: relative;
    z-index: 10;
    will-change: transform;
    min-height: 100vh;
    background: #fff;
  }

  .panel::before {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 6000;
    background-color: transparent;
    transition: background-color .2s ease-in-out;
  }

  .menu.open {
    display: block;
  }

  .menu.open + .panel {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    overflow: hidden;
    min-height: 100%;
    z-index: 10;
    box-shadow: 0 0 20px rgba(0,0,0,.5);
  }

  .menu.open + .panel::before {
    content: '';
    background-color: rgba(0, 0, 0, .5);
  }
`;
