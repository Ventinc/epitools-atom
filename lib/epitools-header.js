'use babel';

import EpitoolsInput from './epitools-input-view';
import Commentary from './commentary.json';
import { CompositeDisposable } from 'atom';

export default class EpitoolsHeader{

    activate(state){
        this.input = new EpitoolsInput('Project name');

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'epitools-atom:header': () => this.askHeader(),
        }));

        atom.workspace.observeTextEditors((editor) => {
            let buffer = editor.getBuffer();
            buffer.onWillSave(() => this.updateHeader(editor, buffer));
        })
    }

    deactivate() {
        this.subscriptions.dispose();
    }

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
    }

    getRegexScope(editor){
        let scope = Commentary.scopes[editor.getRootScopeDescriptor().scopes[0]];
        if (scope == null) return null

        regexScope = {
            head: scope.head.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
            body: scope.body.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
            tail: scope.tail.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        }


        return regexScope
    }

    hasHeader(){
        let editor
        let scope
        let re
        if (editor = atom.workspace.getActiveTextEditor()){
            if (scope = this.getRegexScope(editor)){
                re = new RegExp(`${scope.head}\\n${scope.body} .* for .* in .*\\n${scope.body}\\n${scope.body} Made by .*\\n${scope.body} Login .*\\n${scope.body}\\n${scope.body} Started on .*\\n${scope.body} Last update .*\\n${scope.tail}`)
                text = editor.getText();
                return text.match(re) ? true : false
            }
        }
    }

    askHeader() {
        if (editor = atom.workspace.getActiveTextEditor()){
			filename = editor.getTitle();
			match = filename.match(/^(?:.*)\.(.*)$/);
			if ((!match || !Commentary.scopes[match[1]]) && !Commentary.scopes[filename.toLowerCase()]){
                atom.notifications.addWarning("This language is not supported")
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
    }

    insertHeader(projectname) {
        if (editor = atom.workspace.getActiveTextEditor()){
            path = editor.getPath()
			filename = editor.getTitle()
			match = filename.match(/^(?:.*)\.(.*)$/)
			if (!match){
				scope = Commentary.scopes[filename.toLowerCase()];
			} else {
				scope = Commentary.scopes[match[1]];
			}
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
    }

    updateHeader(editor, buffer){
        if (editor.isModified()){
            if (this.hasHeader()){
                regexScope = this.getRegexScope(editor);
                scope = Commentary.scopes[editor.getRootScopeDescriptor().scopes[0]];
                re = new RegExp(`${regexScope.body} Last update.*\\n`)
                currentdate = this.currentdate
                buffer.replace(re, `${scope.body} Last update ${currentdate} ${atom.config.get('epitools-atom.owner')}\n`)
            }
        }
    }
}
