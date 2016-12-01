'use babel';

import EpitoolsAtomView from './epitools-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  epitoolsAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.epitoolsAtomView = new EpitoolsAtomView(state.epitoolsAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.epitoolsAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'epitools-atom:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.epitoolsAtomView.destroy();
  },

  serialize() {
    return {
      epitoolsAtomViewState: this.epitoolsAtomView.serialize()
    };
  },

  toggle() {
    console.log('EpitoolsAtom was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
