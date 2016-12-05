'use babel';

import Commentary from './commentary.json';
import EpitoolsHeader from './epitools-header'
import EpitoolsNorm from './epitools-norm'
import { CompositeDisposable } from 'atom';


export default {

    subscriptions: null,
    config: {
        owner: {
            type: "string",
            default: "Vincent Dusautoir"
        },
        login: {
            type: "string",
            default: "dusaut_v"
        },
        domain: {
            type: "string",
            default: "epitech.eu"
        }
    },

    activate(state) {
        this.normByEditor = new WeakMap();
        this.epitoolsHeader = new EpitoolsHeader()
        this.epitoolsHeader.activate(state)
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view

        atom.workspace.observeTextEditors((editor) => {
            if (!editor){
                return false;
            }

            norm = new EpitoolsNorm(editor)
            this.normByEditor.set(editor, norm)
        })

        getNorm = (e) => {
            if (!e && !this.normByEditor){
                return null
            }
            return this.normByEditor.get(e);
        }

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'epitools-atom:indent': (e) => getNorm(atom.workspace.getActiveTextEditor()).indent(e),
            'epitools-atom:tab': (e) => getNorm(atom.workspace.getActiveTextEditor()).tab(e),
            'epitools-atom:new_line': (e) => getNorm(atom.workspace.getActiveTextEditor()).new_line(e)
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
        this.epitoolsHeader.deactivate()
    },


    serialize() {
    },

    toggle() {
        let editor, scope
        if (editor = atom.workspace.getActiveTextEditor()) {
            editor.insertText(atom.config.get("epitools-atom.login"))
        }
    },

};
