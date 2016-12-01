'use babel';

import EpitoolsAtomView from './epitools-atom-view';
import EpitoolsInput from './epitools-input-view';
import Commentary from './commentary.json';
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
        this.input = new EpitoolsInput('Project name');
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'epitools-atom:toggle': () => this.toggle(),
            'epitools-atom:header': () => this.askHeader()
        }));

        atom.workspace.observeTextEditors((editor) => {
            let buffer = editor.getBuffer();
            buffer.onWillSave(() => this.updateHeader(editor, buffer));
        })
    },

    deactivate() {
        this.subscriptions.dispose();
    },


    serialize() {
    },

    toggle() {
        let editor
        if (editor = atom.workspace.getActiveTextEditor()) {
            editor.insertText(atom.config.get("epitools-atom.login"))
        }
    },

    get currentdate(){
        let date = new Date();

        let monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        let hours = ('0'+date.getHours()).slice(-2);
        let minutes = ('0'+date.getMinutes()).slice(-2);
        let seconds = ('0'+date.getSeconds()).slice(-2);
        let year = date.getFullYear();
        let day = date.getDay();
        let number = (' '+date.getDate()).slice(-2);
        let month = date.getMonth();

        return `${dayName[day]} ${monthName[month]} ${number} ${hours}:${minutes}:${seconds} ${year}`;
    },

    hasHeader(){
        let editor
        let scope
        let re
        if (editor = atom.workspace.getActiveTextEditor()){
            if (scope = Commentary.scopes[editor.getRootScopeDescriptor().scopes[0]]){
                re = new RegExp(`${scope.head}\\n${scope.body} Makefile for.*in.*\\n${scope.body}\\n${scope.body} Made by.*\\n${scope.body} Login.*\\n${scope.body}\\n${scope.body} Started on.*\\n${scope.body} Last update.*\\n${scope.tail}`)
                text = editor.getText();
                return text.match(re) ? true : false
            }
        }
    },

    askHeader() {
        if (editor = atom.workspace.getActiveTextEditor()){
            if (!Commentary.scopes[editor.getRootScopeDescriptor().scopes[0]]){
                atom.notifications.addWarning("This language is not supported yet")
                return false;
            }
        }

        if (this.hasHeader()){
            atom.notifications.addInfo("You already have an header in this file")
            return false
        }

        this.input.setConfirm((projectname) => {
            this.insertHeader(projectname);
            this.input.detach();
        })
        this.input.setInput(this.input.text, true);
        this.input.attach();
    },

    insertHeader(projectname) {
        if (editor = atom.workspace.getActiveTextEditor()){
            path = editor.getPath()
            scope = Commentary.scopes[editor.getRootScopeDescriptor().scopes[0]];
            tmp = path.split("/")
            filename = tmp[tmp.length - 1]
            directory = path.split(filename)[0];
            date = new Date();
            currentdate = this.currentdate;
            let text = [
                ` ${filename} for ${projectname} in ${directory}`,
                ``,
                ` Made by ${atom.config.get('epitools-atom.owner')}`,
                ` Login   <${atom.config.get('epitools-atom.login')}@${atom.config.get('epitools-atom.domain')}>`,
                ``,
                ` Started on  ${currentdate} ${atom.config.get('epitools-atom.owner')}`,
                ` Last update ${currentdate} ${atom.config.get('epitools-atom.owner')}`,
            ];

            let header = `${scope.head}\n`;
            text.forEach((line, i) => {
                header += `${scope.body}${line}\n`
            })
            header += `${scope.tail}\n`

            editor.setTextInBufferRange([[0, 0], [0, 0]], header)
        }
    },

    updateHeader(editor, buffer){
        if (editor.isModified()){
            if (this.hasHeader()){
                scope = Commentary.scopes[editor.getRootScopeDescriptor().scopes[0]];
                re = new RegExp(`${scope.body} Last update.*\\n`)
                currentdate = this.currentdate
                buffer.replace(re, `${scope.body} Last update ${currentdate} ${atom.config.get('epitools-atom.owner')}\n`)
            }
        }
    }

};
